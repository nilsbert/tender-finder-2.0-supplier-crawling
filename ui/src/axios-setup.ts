import axios from 'axios';

// Add a request interceptor to include the Bearer token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('tf_identity_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
