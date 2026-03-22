import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── IMPORTANT: Use your Mac's IP address not localhost!
// ── On emulator, localhost = the emulator itself not your Mac!
// ── Find your IP: System Preferences → Network → WiFi → IP Address
const BASE_URL = 'http://10.0.2.2:8000/api';

// 🧑‍🏫 10.0.2.2 is Android emulator's special IP that points to your Mac!

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add token to every request
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ── AUTH ─────────────────────────────────────────────
export const authAPI = {
  register:      (data) => API.post('/auth/register', data),
  verifyOTP:     (data) => API.post('/auth/verify-otp', data),
  resendOTP:     (data) => API.post('/auth/resend-otp', data),
  login:         (data) => API.post('/auth/login', data),
  forgotPassword:(data) => API.post('/auth/forgot-password', data),
};

// ── DASHBOARD ─────────────────────────────────────────
export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

// ── PRODUCTS ─────────────────────────────────────────
export const productAPI = {
  getAll:  ()         => API.get('/products'),
  getOne:  (id)       => API.get(`/products/${id}`),
  create:  (data)     => API.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:  (id, data) => API.put(`/products/${id}`, data),
  delete:  (id)       => API.delete(`/products/${id}`),
};

// ── CUSTOMERS ────────────────────────────────────────
export const customerAPI = {
  getAll:  ()         => API.get('/customers'),
  create:  (data)     => API.post('/customers', data),
  update:  (id, data) => API.put(`/customers/${id}`, data),
  delete:  (id)       => API.delete(`/customers/${id}`),
};

// ── SALES ────────────────────────────────────────────
export const saleAPI = {
  getAll:  ()     => API.get('/sales'),
  getOne:  (id)   => API.get(`/sales/${id}`),
  create:  (data) => API.post('/sales', data),
  cancel:  (id)   => API.put(`/sales/${id}/cancel`),
};

// ── EXPENSES ─────────────────────────────────────────
export const expenseAPI = {
  getAll:  ()         => API.get('/expenses'),
  create:  (data)     => API.post('/expenses', data),
  update:  (id, data) => API.put(`/expenses/${id}`, data),
  delete:  (id)       => API.delete(`/expenses/${id}`),
};

// ── AI ───────────────────────────────────────────────
export const aiAPI = {
  chat: (data) => API.post('/ai/chat', data),
};

export default API;