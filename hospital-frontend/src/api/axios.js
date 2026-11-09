// src/api/axios.js
import axios from 'axios';

// In development the default "/api/" goes through the Vite proxy (see
// vite.config.js), so the browser only ever talks to the dev server. That keeps
// CORS out of the picture and lets a phone on the same network use the app.
// Set VITE_API_BASE_URL to an absolute URL to bypass the proxy.
const CONFIGURED_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/';

// A trailing slash matters: endpoint paths such as 'queue/status_board/' are
// resolved relative to the base URL.
export const API_BASE_URL = CONFIGURED_BASE_URL.endsWith('/')
  ? CONFIGURED_BASE_URL
  : `${CONFIGURED_BASE_URL}/`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints that must never carry (or try to refresh) an access token.
const AUTH_ENDPOINTS = ['token/', 'token/refresh/', 'token/verify/'];

// The UI language is sent with every request so server-generated text (emails,
// validation messages) can match what the user sees.
const readUiLanguage = () => {
  try {
    const explicit = localStorage.getItem('queuecare_language');
    if (explicit) return explicit;
    const settings = JSON.parse(localStorage.getItem('medicare_settings') || '{}');
    return settings.language || '';
  } catch {
    return '';
  }
};

const isAuthEndpoint = (url = '') => {
  const path = url.replace(/^\/+/, '');
  return AUTH_ENDPOINTS.some((endpoint) => path.startsWith(endpoint));
};

export const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
};

// A bare client so refreshing a token cannot itself re-enter the interceptors.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Several requests can fail at once; only refresh once and let them all wait.
let refreshPromise = null;

const refreshAccessToken = () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('token/refresh/', { refresh: refreshToken })
      .then(({ data }) => {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const language = readUiLanguage();
    if (language) {
      config.headers['Accept-Language'] = language;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the token expired and we haven't retried yet, refresh and replay once.
    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const access = await refreshAccessToken();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user. Don't redirect here, let the component handle it.
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
