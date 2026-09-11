// src/models/Customer.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Money this customer owes us
  outstandingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'customers',
  timestamps: true,
});

module.exports = Customer;