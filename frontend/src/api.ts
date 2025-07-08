import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global error handler (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Bisa handle error global di sini (misal: auto logout jika 401)
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('token');
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 