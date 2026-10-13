import test from 'node:test';
import assert from 'node:assert/strict';
import { extractErrorMessage, ApiError, registerUser } from './authService.js';
import { API_ENDPOINTS } from '../config/apiConfig.js';

test('API_ENDPOINTS contains correct registration URL', () => {
  assert.match(API_ENDPOINTS.REGISTER, /\/api\/auth\/register$/);
});

test('extractErrorMessage handles 409 duplicate email', () => {
  const result = extractErrorMessage(409, {
    status: 409,
    message: 'Email already registered',
  });
  assert.equal(result.message, 'An account with this email already exists.');
  assert.equal(result.fieldErrors.email, 'This email is already registered. Please log in or use another email.');
});

test('extractErrorMessage handles 409 duplicate mobile number', () => {
  const result = extractErrorMessage(409, {
    status: 409,
    detail: 'Mobile number already registered',
  });
  assert.equal(result.message, 'An account with this mobile number already exists.');
  assert.equal(result.fieldErrors.mobile, 'This mobile number is already registered. Please use another number.');
});

test('extractErrorMessage handles 400 password mismatch', () => {
  const result = extractErrorMessage(400, 'Password and confirm password do not match');
  assert.equal(result.message, 'Password and confirm password do not match.');
  assert.equal(result.fieldErrors.confirmPassword, 'Passwords do not match.');
});

test('extractErrorMessage handles Spring Boot validation errors array', () => {
  const result = extractErrorMessage(400, {
    status: 400,
    errors: [
      { field: 'name', defaultMessage: 'Name is required' },
      { field: 'email', defaultMessage: 'Invalid email format' },
      { field: 'mobile', defaultMessage: 'Mobile number must be 10 digits' },
    ],
  });
  assert.equal(result.fieldErrors.fullName, 'Name is required');
  assert.equal(result.fieldErrors.email, 'Invalid email format');
  assert.equal(result.fieldErrors.mobile, 'Mobile number must be 10 digits');
  assert.match(result.message, /Name is required/);
});

test('extractErrorMessage handles 500 server error', () => {
  const result = extractErrorMessage(500, {
    status: 500,
    error: 'Internal Server Error',
  });
  assert.equal(result.message, 'Server encountered an error while creating your account. Please try again later.');
});

test('extractErrorMessage handles 422 unprocessable entity', () => {
  const result = extractErrorMessage(422, {});
  assert.equal(result.message, 'Invalid registration details submitted. Please review your entries.');
});

test('registerUser sends correct payload and handles success', async () => {
  // Mock global fetch
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h === 'content-type' ? 'text/plain' : null),
      },
      text: async () => 'User registered successfully',
    };
  };

  try {
    const res = await registerUser({
      fullName: '  Jane Doe  ',
      email: '  Jane@Example.COM  ',
      mobile: '9876543210',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    assert.equal(res.success, true);
    assert.equal(res.message, 'User registered successfully');
    assert.match(capturedUrl, /\/api\/auth\/register$/);
    assert.equal(capturedOptions.method, 'POST');

    const parsedBody = JSON.parse(capturedOptions.body);
    assert.equal(parsedBody.name, 'Jane Doe');
    assert.equal(parsedBody.email, 'jane@example.com');
    assert.equal(parsedBody.mobile, '9876543210');
    assert.equal(parsedBody.password, 'Password123');
    assert.equal(parsedBody.confirmPassword, 'Password123');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('registerUser handles network error without leaking sensitive credentials', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  try {
    await assert.rejects(
      async () => {
        await registerUser({
          fullName: 'Test User',
          email: 'test@example.com',
          mobile: '9876543210',
          password: 'SecretPassword123',
          confirmPassword: 'SecretPassword123',
        });
      },
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 0);
        assert.match(err.message, /Unable to connect to the registration server/);
        // Ensure sensitive password is not exposed in error object
        assert(!JSON.stringify(err).includes('SecretPassword123'));
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
