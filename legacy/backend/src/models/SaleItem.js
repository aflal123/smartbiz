// src/models/SaleItem.js
// Each row = one product line in a sale
// e.g. "Samsung TV x2 @ 55000 = 110000"

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // How many units sold
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  // Price at the time of sale
  // Important: price might change later, so we save it HERE
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Total for this line item
  // subtotal = quantity × unitPrice
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Foreign keys
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'sale_items',
  timestamps: true,
});

module.exports = SaleItem;