// src/models/Sale.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // Unique invoice number e.g. "INV-2024-0001"
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },

  // Total amount of the sale
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  // Discount given on this sale
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },

  // Final amount after discount
  // finalAmount = totalAmount - discount
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  // How much customer paid
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },

  // Change to give back to customer
  // change = amountPaid - finalAmount
  changeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },

  // Payment method
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'credit'),
    defaultValue: 'cash',
  },

  // Sale status
  status: {
    type: DataTypes.ENUM('paid', 'partial', 'unpaid', 'cancelled'),
    defaultValue: 'paid',
  },

  // Optional notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Foreign keys
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,   // Sale can be made without a registered customer
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'sales',
  timestamps: true,
});

module.exports = Sale;