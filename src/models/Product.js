// src/models/Product.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  lowStockAlert: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },

  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'pcs',
  },

  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  // 🆕 IMAGE FIELD
  // Stores the file path e.g. "uploads/products/product-123.jpg"
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,   // Optional — product can exist without image
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;