import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL
});

// request interceptor to add token
api.interceptors.request.use(config => {
  const studentToken = localStorage.getItem('studentToken');
  const coordToken = localStorage.getItem('coordToken');
  if (studentToken) {
    config.headers['Authorization'] = `Bearer ${studentToken}`;
  } else if (coordToken) {
    config.headers['Authorization'] = `Bearer ${coordToken}`;
  }
  return config;
});

// response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('studentToken');
      localStorage.removeItem('coordToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
