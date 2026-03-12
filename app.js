// app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── ROUTES ───────────────────────────────────────────
const authRoutes     = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes  = require('./src/routes/product.routes');
const customerRoutes = require('./src/routes/customer.routes');
const supplierRoutes = require('./src/routes/supplier.routes');
const saleRoutes     = require('./src/routes/sale.routes'); // 🆕

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/suppliers',  supplierRoutes);
app.use('/api/sales',      saleRoutes); // 🆕

app.get('/', (req, res) => {
  res.json({ message: '🚀 SmartBiz API is running!' });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;