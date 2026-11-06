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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('suri-auth');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
