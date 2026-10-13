import { API_ENDPOINTS } from '../config/apiConfig.js';

/**
 * Custom error class for API failures containing HTTP status and field-level error mappings.
 */
export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Safely parses the response body into JSON or string.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
      return await response.json();
    }
    const text = await response.text();
    // Sometimes JSON is returned without application/json header
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

/**
 * Extracts a user-friendly message and field errors from backend error responses.
 * Supports Spring Boot standard errors, RFC 7807 ProblemDetail, and validation error arrays.
 *
 * @param {number} status - HTTP status code
 * @param {any} body - Parsed response body
 * @returns {{ message: string, fieldErrors: Record<string, string> }}
 */
export function extractErrorMessage(status, body) {
  const fieldErrors = {};
  let message = '';

  if (typeof body === 'string' && body.trim().length > 0) {
    message = body.trim();
  } else if (body && typeof body === 'object') {
    // ProblemDetail or Spring Boot DefaultErrorAttributes
    if (typeof body.detail === 'string' && body.detail.trim().length > 0) {
      message = body.detail.trim();
    } else if (typeof body.message === 'string' && body.message.trim().length > 0) {
      message = body.message.trim();
    } else if (typeof body.error === 'string' && body.error.trim().length > 0) {
      message = body.error.trim();
    }

    // Process field validation errors array if present
    if (Array.isArray(body.errors)) {
      const errorSummaries = [];
      for (const err of body.errors) {
        if (err && typeof err === 'object') {
          const field = err.field;
          const msg = err.defaultMessage || err.message || 'Invalid value';
          if (field) {
            // Map backend field names to frontend form fields
            const frontendField = field === 'name' ? 'fullName' : field;
            fieldErrors[frontendField] = msg;
          }
          errorSummaries.push(msg);
        } else if (typeof err === 'string') {
          errorSummaries.push(err);
        }
      }
      if (!message && errorSummaries.length > 0) {
        message = errorSummaries.join(', ');
      }
    }
  }

  // Handle specific backend error messages and map to field errors
  const lowerMessage = (message || '').toLowerCase();

  if (status === 409) {
    if (lowerMessage.includes('email already registered')) {
      fieldErrors.email = 'This email is already registered. Please log in or use another email.';
      message = 'An account with this email already exists.';
    } else if (lowerMessage.includes('mobile') || lowerMessage.includes('phone')) {
      fieldErrors.mobile = 'This mobile number is already registered. Please use another number.';
      message = 'An account with this mobile number already exists.';
    } else {
      message = 'An account with this email or mobile number already exists.';
    }
  } else if (status === 400) {
    if (lowerMessage.includes('confirm password') || lowerMessage.includes('do not match')) {
      fieldErrors.confirmPassword = 'Passwords do not match.';
      message = 'Password and confirm password do not match.';
    } else if (!message) {
      message = 'Please check your inputs and try again.';
    }
  } else if (status === 401) {
    message = message || 'Unauthorized request. Please check your credentials.';
  } else if (status === 403) {
    message = message || 'Access denied. You do not have permission to perform this action.';
  } else if (status === 422) {
    message = message || 'Invalid registration details submitted. Please review your entries.';
  } else if (status >= 500) {
    message = 'Server encountered an error while creating your account. Please try again later.';
  } else if (!message) {
    message = 'Registration failed. Please check your connection and try again.';
  }

  return { message, fieldErrors };
}

/**
 * Registers a new user with the backend API.
 *
 * Maps frontend fields:
 * - fullName -> name
 * - email -> email
 * - mobile -> mobile (10 digits)
 * - password -> password
 * - confirmPassword -> confirmPassword
 *
 * @param {Object} formData
 * @param {string} formData.fullName
 * @param {string} formData.email
 * @param {string} formData.mobile
 * @param {string} formData.password
 * @param {string} formData.confirmPassword
 * @returns {Promise<{ success: boolean, message: string, data?: any }>}
 * @throws {ApiError}
 */
export async function registerUser({ fullName, email, mobile, password, confirmPassword }) {
  // Construct payload mapping to backend API DTO contract (RegisterRequest)
  const payload = {
    name: (fullName || '').trim(),
    email: (email || '').trim().toLowerCase(),
    mobile: (mobile || '').trim(),
    password: password || '',
    confirmPassword: confirmPassword || '',
  };

  let response;
  try {
    response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure (CORS blockage, backend down, or offline)
    // Never log sensitive data such as password
    throw new ApiError(
      'Unable to connect to the registration server. Please check your network connection or ensure the backend service is running.',
      0,
      {}
    );
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const { message, fieldErrors } = extractErrorMessage(response.status, responseBody);
    throw new ApiError(message, response.status, fieldErrors);
  }

  return {
    success: true,
    message: typeof responseBody === 'string' && responseBody ? responseBody : 'User registered successfully',
    data: responseBody,
  };
}
