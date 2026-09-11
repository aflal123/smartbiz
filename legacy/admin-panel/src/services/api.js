// src/services/api.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/admin',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login:   (data) => API.post('/login', data),
  profile: ()     => API.get('/profile'),
};

export const adminAPI = {
  getStats:         ()   => API.get('/stats'),
  getBusinesses:    ()   => API.get('/businesses'),
  getBusiness:      (id) => API.get(`/businesses/${id}`),
  toggleUserStatus: (id) => API.put(`/businesses/${id}/toggle`),
};

export default API;