import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  try {
    const stored = window.localStorage.getItem('suri-auth');
    if (!stored) {
      return config;
    }

    const parsed = JSON.parse(stored);
    const token = parsed?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore malformed stored auth values.
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from the auth endpoints (e.g. wrong password) is a normal form error,
    // not an expired session, so let the page show the message instead of redirecting.
    const isAuthRequest = error.config?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !isAuthRequest && typeof window !== 'undefined') {
      window.localStorage.removeItem('suri-auth');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
