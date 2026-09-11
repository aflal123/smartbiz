// src/services/api.js

import axios from 'axios';

// Base URL points to our backend
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// ── REQUEST INTERCEPTOR ───────────────────────────────
// Automatically adds token to EVERY request
// So we don't have to manually add it every time!
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR ──────────────────────────────
// If token expires → automatically logout and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── AUTH ENDPOINTS ────────────────────────────────────
export const authAPI = {
  register:      (data) => API.post('/auth/register', data),
  verifyOTP:     (data) => API.post('/auth/verify-otp', data),
  resendOTP:     (data) => API.post('/auth/resend-otp', data),
  login:         (data) => API.post('/auth/login', data),
  forgotPassword:(data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

// ── DASHBOARD ─────────────────────────────────────────
export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

// ── CATEGORIES ───────────────────────────────────────
export const categoryAPI = {
  getAll:  ()         => API.get('/categories'),
  getOne:  (id)       => API.get(`/categories/${id}`),
  create:  (data)     => API.post('/categories', data),
  update:  (id, data) => API.put(`/categories/${id}`, data),
  delete:  (id)       => API.delete(`/categories/${id}`),
};

// ── PRODUCTS ─────────────────────────────────────────
export const productAPI = {
  getAll:  ()         => API.get('/products'),
  getOne:  (id)       => API.get(`/products/${id}`),
  create:  (data)     => API.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:  (id, data) => API.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:  (id)       => API.delete(`/products/${id}`),
};

// ── CUSTOMERS ────────────────────────────────────────
export const customerAPI = {
  getAll:  ()         => API.get('/customers'),
  getOne:  (id)       => API.get(`/customers/${id}`),
  create:  (data)     => API.post('/customers', data),
  update:  (id, data) => API.put(`/customers/${id}`, data),
  delete:  (id)       => API.delete(`/customers/${id}`),
};

// ── SUPPLIERS ────────────────────────────────────────
export const supplierAPI = {
  getAll:  ()         => API.get('/suppliers'),
  getOne:  (id)       => API.get(`/suppliers/${id}`),
  create:  (data)     => API.post('/suppliers', data),
  update:  (id, data) => API.put(`/suppliers/${id}`, data),
  delete:  (id)       => API.delete(`/suppliers/${id}`),
};



// ── EXPENSES ─────────────────────────────────────────
export const expenseAPI = {
  getAll:  ()         => API.get('/expenses'),
  getOne:  (id)       => API.get(`/expenses/${id}`),
  create:  (data)     => API.post('/expenses', data),
  update:  (id, data) => API.put(`/expenses/${id}`, data),
  delete:  (id)       => API.delete(`/expenses/${id}`),
};

// ── AI ───────────────────────────────────────────────
export const aiAPI = {
  insights:   ()     => API.get('/ai/insights'),
  email:      (data) => API.post('/ai/email', data),
  socialPost: (data) => API.post('/ai/social-post', data),
  chat:       (data) => API.post('/ai/chat', data),
};

export const saleAPI = {
  getAll:   ()          => API.get('/sales'),
  getOne:   (id)        => API.get(`/sales/${id}`),
  create:   (data)      => API.post('/sales', data),
  update:   (id, data)  => API.put(`/sales/${id}`, data),
  cancel:   (id)        => API.put(`/sales/${id}/cancel`),
  summary:  ()          => API.get('/sales/summary'),
  report:   (params)    => API.get('/sales/report', { params }), // 🆕
};

export default API;


