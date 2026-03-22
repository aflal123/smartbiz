// src/config/database.js

const { Sequelize } = require('sequelize');  // ✅ Capital S — this is the CLASS
require('dotenv').config();

const sequelize = new Sequelize(             // ✅ lowercase sequelize = our CONNECTION INSTANCE
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;