/**
 * SSK Natural Gold — Axios HTTP Client Configuration & Security Gateway
 *
 * Security Architecture & JWT Storage Implications:
 * - Token Storage: The administrator Bearer JWT is managed via localStorage under 'ssk_admin_token'.
 * - Threat Model: LocalStorage is accessible to JavaScript within the same origin. It is susceptible to
 *   exfiltration if Cross-Site Scripting (XSS) is introduced. In contrast, HttpOnly cookies resist XSS
 *   exfiltration but require CSRF protection and specialized cross-origin cookie handling.
 * - Mitigations Enforced:
 *   1. Scoped Injection: Bearer tokens are attached EXCLUSIVELY to protected administrator API requests
 *      (e.g., endpoints under '/admin/'). Customer-facing public requests (/products, /orders, /settings)
 *      are NEVER tagged with the admin JWT, preventing credential leakage.
 *   2. Server-Side Token Versioning: The PostgreSQL AdminUser model maintains an integer 'tokenVersion'.
 *      Rotating the admin password immediately increments this counter and renders all existing JWTs invalid.
 *   3. Ephemeral Lifetime: Tokens expire after 24 hours.
 *   4. Sensitive Data Masking: No passwords, JWT tokens, or 10-digit customer phone numbers are ever emitted
 *      to browser console logs.
 *   5. Concurrent 401 Session Cleanup: Debounced redirection guards prevent cascading redirects or race
 *      conditions when multiple background requests encounter authentication expiry.
 */

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';


export const ADMIN_TOKEN_STORAGE_KEY = 'ssk_admin_token';
export const ADMIN_USER_STORAGE_KEY = 'ssk_admin_user_session';

/**
 * Retrieve the active administrator JWT from browser storage.
 */
export const getAdminToken = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Persist an administrator JWT following successful authentication.
 */
export const setAdminToken = (token: string): void => {
  try {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Fail silently without logging sensitive data
  }
};

/**
 * Remove the administrator JWT.
 */
export const removeAdminToken = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Fail silently
  }
};

/**
 * Check if an administrator token is present in storage.
 */
export const isAdminAuthenticated = (): boolean => {
  return Boolean(getAdminToken());
};

/**
 * Clear all administrator session state from local storage.
 */
export const clearAdminSession = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  } catch {
    // Fail silently
  }
};

/**
 * Determine if a given request URL targets a protected administrator endpoint.
 * Public endpoints like /api/products, /api/orders, and /api/settings MUST NOT receive the admin token.
 * /api/admin/auth/login is public and does not require an existing token.
 */
export const isProtectedAdminUrl = (url?: string): boolean => {
  if (!url) return false;
  // Normalize URL by removing query parameters
  const path = url.split('?')[0].toLowerCase();

  // If it's the admin login endpoint itself, do not attach existing token
  if (path.includes('/admin/auth/login')) {
    return false;
  }

  // Check if it belongs to admin namespace
  return path.includes('/admin/') || path.endsWith('/admin');
};

const apiBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';


export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Attaches the administrator Bearer JWT strictly to protected admin routes.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach admin token ONLY to protected admin API requests
    if (isProtectedAdminUrl(config.url)) {
      const token = getAdminToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Concurrency flag to prevent duplicate 401 logout handling / redirect loops
let isHandling401 = false;

/**
 * Reset 401 concurrency lock (primarily for automated testing).
 */
export const _reset401Guard = (): void => {
  isHandling401 = false;
};


/**
 * Response Interceptor:
 * Standardizes error responses and triggers single-pass session invalidation on 401 Unauthorized.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    // Handle 401 Unauthorized for admin endpoints
    if (status === 401 && isProtectedAdminUrl(requestUrl)) {
      if (!isHandling401) {
        isHandling401 = true;
        clearAdminSession();

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Avoid redirect loops if already on the admin login page
          if (!currentPath.includes('/admin/login')) {
            window.location.assign('/admin/login');
          }
        }

        // Reset concurrency guard after brief debounce
        setTimeout(() => {
          isHandling401 = false;
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
