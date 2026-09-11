// src/models/Category.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // e.g. "Electronics", "Clothing", "Food"
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Which business owner created this category
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;