import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUSTOMER_CARE,
  validateCustomerCareConfig,
  formatCustomerCareNumber,
  getCustomerCareTelUri,
  fetchCustomerCareApi,
} from './contactConfig.js';

test('CUSTOMER_CARE constant is properly configured', () => {
  assert.equal(CUSTOMER_CARE.countryCode, '+91', 'Country code must strictly be +91');
  assert.equal(CUSTOMER_CARE.phoneNumber, '9876543210', 'Phone number must be a 10-digit number');
  assert.equal(CUSTOMER_CARE.phoneNumber.length, 10, 'Phone number must have exactly 10 digits');
});

test('validateCustomerCareConfig accepts valid Indian customer care configuration', () => {
  const result = validateCustomerCareConfig(CUSTOMER_CARE);
  assert.equal(result.isValid, true);
  assert.equal(result.sanitizedNumber, '9876543210');
  assert.equal(result.error, null);
});

test('validateCustomerCareConfig rejects non-Indian country codes', () => {
  const usConfig = { countryCode: '+1', phoneNumber: '9876543210' };
  const ukConfig = { countryCode: '+44', phoneNumber: '9876543210' };
  const nullCode = { countryCode: '', phoneNumber: '9876543210' };

  assert.equal(validateCustomerCareConfig(usConfig).isValid, false);
  assert.match(validateCustomerCareConfig(usConfig).error, /Only India \(\+91\) is supported/);
  assert.equal(validateCustomerCareConfig(ukConfig).isValid, false);
  assert.equal(validateCustomerCareConfig(nullCode).isValid, false);
});

test('validateCustomerCareConfig rejects phone numbers with length not equal to 10', () => {
  const shortConfig = { countryCode: '+91', phoneNumber: '987654321' }; // 9 digits
  const longConfig = { countryCode: '+91', phoneNumber: '98765432101' }; // 11 digits

  assert.equal(validateCustomerCareConfig(shortConfig).isValid, false);
  assert.match(validateCustomerCareConfig(shortConfig).error, /must contain exactly 10 digits/);

  assert.equal(validateCustomerCareConfig(longConfig).isValid, false);
  assert.match(validateCustomerCareConfig(longConfig).error, /must contain exactly 10 digits/);
});

test('validateCustomerCareConfig rejects letters and special characters', () => {
  const alphaConfig = { countryCode: '+91', phoneNumber: '98765abcde' };
  const symbolConfig = { countryCode: '+91', phoneNumber: '98765-43210' };
  const spaceConfig = { countryCode: '+91', phoneNumber: '98765 43210' };

  assert.equal(validateCustomerCareConfig(alphaConfig).isValid, false);
  assert.equal(validateCustomerCareConfig(symbolConfig).isValid, false);
  assert.equal(validateCustomerCareConfig(spaceConfig).isValid, false);
});

test('validateCustomerCareConfig handles and sanitizes accidental country code prefixing without duplicate +91', () => {
  const prefixedWithPlus91 = { countryCode: '+91', phoneNumber: '+91 9876543210' };
  const prefixedWith91 = { countryCode: '+91', phoneNumber: '919876543210' };

  const res1 = validateCustomerCareConfig(prefixedWithPlus91);
  assert.equal(res1.isValid, true);
  assert.equal(res1.sanitizedNumber, '9876543210');

  const res2 = validateCustomerCareConfig(prefixedWith91);
  assert.equal(res2.isValid, true);
  assert.equal(res2.sanitizedNumber, '9876543210');
});

test('validateCustomerCareConfig rejects invalid Indian mobile prefixes (not starting with 6,7,8,9)', () => {
  const invalidPrefix = { countryCode: '+91', phoneNumber: '1234567890' };
  const res = validateCustomerCareConfig(invalidPrefix);
  assert.equal(res.isValid, false);
  assert.match(res.error, /starting with 6, 7, 8, or 9/);
});

test('formatCustomerCareNumber outputs formatted string in +91 XXXXX XXXXX format', () => {
  const formatted = formatCustomerCareNumber('9876543210', '+91');
  assert.equal(formatted, '+91 98765 43210', 'Number must be formatted as +91 XXXXX XXXXX');

  // Should return empty string on invalid number
  assert.equal(formatCustomerCareNumber('invalid', '+91'), '');
  assert.equal(formatCustomerCareNumber('9876543210', '+1'), '');
});

test('getCustomerCareTelUri outputs correct click-to-call tel: URI', () => {
  const uri = getCustomerCareTelUri('9876543210', '+91');
  assert.equal(uri, 'tel:+919876543210', 'Tel URI must be tel:+91XXXXXXXXXX');

  // Should return empty string on invalid input
  assert.equal(getCustomerCareTelUri('123', '+91'), '');
  assert.equal(getCustomerCareTelUri('9876543210', '+44'), '');
});

test('fetchCustomerCareApi returns validated and formatted API payload for future backend readiness', async () => {
  const data = await fetchCustomerCareApi();
  assert.equal(data.countryCode, '+91');
  assert.equal(data.phoneNumber, '9876543210');
  assert.equal(data.formattedNumber, '+91 98765 43210');
  assert.equal(data.telUri, 'tel:+919876543210');
});
