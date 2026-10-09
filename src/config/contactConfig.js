/**
 * Centralized Contact Configuration for ShopEase.
 * US1 ST02: Configure Indian Customer Care Number
 * 
 * Requirement:
 * - Country code must strictly be +91 (India).
 * - Phone number must contain exactly 10 digits (excluding +91).
 * - Clickable via tel: URI on Android and iOS.
 */

export const CUSTOMER_CARE = Object.freeze({
  countryCode: '+91',
  phoneNumber: '9876543210', // Approved 10-digit Indian customer care mobile number
});

/**
 * Validates a customer care configuration or backend API payload.
 * 
 * @param {{ countryCode?: string, phoneNumber?: string }} config 
 * @returns {{ isValid: boolean, error: string | null, sanitizedNumber: string | null }}
 */
export function validateCustomerCareConfig(config) {
  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      error: 'Customer care configuration is missing or invalid.',
      sanitizedNumber: null,
    };
  }

  const { countryCode, phoneNumber } = config;

  // 1. Verify country code is strictly +91 (India)
  if (typeof countryCode !== 'string' || countryCode.trim() !== '+91') {
    return {
      isValid: false,
      error: 'Invalid country code. Only India (+91) is supported for customer care.',
      sanitizedNumber: null,
    };
  }

  // 2. Verify phone number is provided as string
  if (typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number must be provided as a string.',
      sanitizedNumber: null,
    };
  }

  let raw = phoneNumber.trim();

  // 3. Prevent and sanitize duplicate country codes such as +91 +91 or +9191
  if (raw.startsWith('+91')) {
    raw = raw.replace(/^\+91\s*/, '');
  } else if (raw.startsWith('91') && raw.length > 10) {
    raw = raw.replace(/^91\s*/, '');
  }

  // 4. Reject alphabetic, special characters, or spaces within digits
  if (!/^\d+$/.test(raw)) {
    return {
      isValid: false,
      error: 'Phone number must contain digits only with no special characters or letters.',
      sanitizedNumber: null,
    };
  }

  // 5. Must contain exactly 10 digits
  if (raw.length !== 10) {
    return {
      isValid: false,
      error: `Customer care number must contain exactly 10 digits (found ${raw.length}).`,
      sanitizedNumber: null,
    };
  }

  // 6. Indian mobile numbers start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(raw)) {
    return {
      isValid: false,
      error: 'Customer care mobile number must be a valid Indian mobile number starting with 6, 7, 8, or 9.',
      sanitizedNumber: null,
    };
  }

  return {
    isValid: true,
    error: null,
    sanitizedNumber: raw,
  };
}

/**
 * Formats a 10-digit number into "+91 XXXXX XXXXX"
 * 
 * @param {string} phoneNumber 
 * @param {string} [countryCode='+91']
 * @returns {string} Formatted number or empty string if invalid
 */
export function formatCustomerCareNumber(phoneNumber, countryCode = '+91') {
  const result = validateCustomerCareConfig({ countryCode, phoneNumber });
  if (!result.isValid || !result.sanitizedNumber) {
    return '';
  }

  const num = result.sanitizedNumber;
  return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
}

/**
 * Builds RFC 3966 click-to-call tel: URI (e.g. "tel:+919876543210")
 * 
 * @param {string} phoneNumber 
 * @param {string} [countryCode='+91']
 * @returns {string} tel URI or empty string if invalid
 */
export function getCustomerCareTelUri(phoneNumber, countryCode = '+91') {
  const result = validateCustomerCareConfig({ countryCode, phoneNumber });
  if (!result.isValid || !result.sanitizedNumber) {
    return '';
  }

  return `tel:+91${result.sanitizedNumber}`;
}

/**
 * Ready for future backend API integration:
 * Fetches and validates customer care details from an API.
 * 
 * @returns {Promise<{ countryCode: string, phoneNumber: string, formattedNumber: string, telUri: string }>}
 */
export async function fetchCustomerCareApi() {
  // In production with backend API:
  // const res = await fetch('/api/v1/support/contact');
  // const data = await res.json();
  // return validateAndFormat(data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const validation = validateCustomerCareConfig(CUSTOMER_CARE);
      if (!validation.isValid) {
        reject(new Error(validation.error));
      } else {
        resolve({
          countryCode: CUSTOMER_CARE.countryCode,
          phoneNumber: validation.sanitizedNumber,
          formattedNumber: formatCustomerCareNumber(validation.sanitizedNumber, CUSTOMER_CARE.countryCode),
          telUri: getCustomerCareTelUri(validation.sanitizedNumber, CUSTOMER_CARE.countryCode),
        });
      }
    }, 50);
  });
}
