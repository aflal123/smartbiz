// server.js

const app = require('./app');
const sequelize = require('./src/config/database');

const {
  User, Category, Product,
  Customer, Supplier,
  Sale, SaleItem
} = require('./src/models');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // ✅ force: false → only creates tables that don't exist yet
    // Never alters existing tables — no more duplicate indexes!
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced!');

    app.listen(PORT, () => {
      console.log('─────────────────────────────────────');
      console.log(`🚀 SmartBiz API running on http://localhost:${PORT}`);
      console.log('─────────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();