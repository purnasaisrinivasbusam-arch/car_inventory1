import axios from 'axios';

const API = axios.create({
  baseURL: 'https://car-inventory1-hc9s.onrender.com/api',
});
// Add request interceptor
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('API Request:', config.method.toUpperCase(), config.url);
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor
API.interceptors.response.use(response => {
  console.log('API Response:', response.status, response.config.method.toUpperCase(), response.config.url);
  return response;
}, error => {
  console.error('API Response Error:', error.response?.status || 'Network Error', error.response?.data || error.message);
  return Promise.reject(error);
});

export default API;
