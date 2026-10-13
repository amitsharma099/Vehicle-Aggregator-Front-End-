/**
 * Centralized API Configuration
 *
 * Configures the base URL for the backend API from environment variables,
 * falling back to the default backend URL (port 8081 as defined in the backend service).
 */

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:8081';

export const API_ENDPOINTS = Object.freeze({
  REGISTER: `${API_BASE_URL}/api/auth/register`,
});
