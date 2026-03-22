// src/models/Expense.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // What was the expense for?
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  // How much was spent?
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Category of expense
  category: {
    type: DataTypes.ENUM(
      'rent',
      'salaries',
      'utilities',
      'supplies',
      'transport',
      'marketing',
      'maintenance',
      'other'
    ),
    defaultValue: 'other',
  },

  // Date of expense
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  // Optional notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Who recorded this expense
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'expenses',
  timestamps: true,
});

module.exports = Expense;