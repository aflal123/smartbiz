// src/models/Admin.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {

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
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // Super admin has full access
  // Regular admin has limited access
  role: {
    type: DataTypes.ENUM('superadmin', 'admin'),
    defaultValue: 'admin',
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'admins',
  timestamps: true,
});

module.exports = Admin;