import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer JWT Token automatically (Customer vs Admin)
api.interceptors.request.use(
  (config) => {
    // If Authorization header is already explicitly provided, keep it
    if (config.headers.Authorization) {
      return config;
    }

    const isAdminRequest = window.location.pathname.startsWith('/admin') || (config.url && config.url.includes('/admin/'));
    const token = isAdminRequest
      ? localStorage.getItem('avon_admin_token')
      : localStorage.getItem('avon_customer_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdminRequest = window.location.pathname.startsWith('/admin') || (error.config?.url && error.config.url.includes('/admin/'));
      if (isAdminRequest) {
        localStorage.removeItem('avon_admin_token');
        localStorage.removeItem('avon_admin_data');
      } else {
        localStorage.removeItem('avon_customer_token');
        localStorage.removeItem('avon_customer_data');
      }
    }
    return Promise.reject(error);
  }
);

export default api;


