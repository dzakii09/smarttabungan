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
  console.log('🔍 Debug: Token from localStorage:', token ? 'Token exists' : 'No token found');
  
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('🔍 Debug: Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('🔍 Debug: No token found in localStorage');
  }
  
  console.log('🔍 Debug: Request URL:', config.url);
  console.log('🔍 Debug: Request headers:', config.headers);
  
  return config;
});

// Global error handler (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 Debug: Response error:', error.response?.status, error.response?.data);
    
    // Bisa handle error global di sini (misal: auto logout jika 401)
    if (error.response && error.response.status === 401) {
      console.log('🔍 Debug: 401 Unauthorized - Token mungkin invalid atau expired');
      // localStorage.removeItem('token');
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 