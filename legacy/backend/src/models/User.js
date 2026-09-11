// src/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin'),
    defaultValue: 'owner',
  },
  businessName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },

  // 🆕 OTP VERIFICATION FIELDS
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,    // New users start as unverified
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true,        // Only exists when OTP is pending
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,        // OTP expiry time (10 mins from creation)
  },

  // 🆕 PASSWORD RESET FIELDS
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,        // Only exists when reset is requested
  },
  resetPasswordExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,        // Reset link expires in 15 mins
  },

}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;