// src/controllers/dashboard.controller.js

const { Sale, SaleItem, Expense, Product, Customer, Supplier } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── DATE RANGES ──────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // ── TODAY'S SALES ────────────────────────────────
    const todaySales = await Sale.findAll({
      where: {
        userId,
        status: 'paid',
        createdAt: { [Op.between]: [today, tomorrow] }
      }
    });

    const todayRevenue = todaySales.reduce(
      (sum, s) => sum + parseFloat(s.finalAmount), 0
    );

    // ── TODAY'S EXPENSES ─────────────────────────────
    const todayExpenses = await Expense.findAll({
      where: {
        userId,
        expenseDate: today.toISOString().split('T')[0]
      }
    });

    const todayExpenseTotal = todayExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount), 0
    );

    // ── THIS MONTH ───────────────────────────────────
    const monthSales = await Sale.findAll({
      where: {
        userId,
        status: 'paid',
        createdAt: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    const monthRevenue = monthSales.reduce(
      (sum, s) => sum + parseFloat(s.finalAmount), 0
    );

    const monthExpenseTotal = await Expense.sum('amount', {
      where: {
        userId,
        expenseDate: { [Op.between]: [
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0]
        ]}
      }
    });

    // ── ALL TIME ─────────────────────────────────────
    const totalRevenue = await Sale.sum('finalAmount', {
      where: { userId, status: 'paid' }
    });

    const totalExpenses = await Expense.sum('amount', { where: { userId } });

    // ── INVENTORY ────────────────────────────────────
    const totalProducts = await Product.count({ where: { userId, isActive: true } });

    // Low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        userId,
        isActive: true,
        stockQuantity: { [Op.lte]: sequelize.col('lowStockAlert') }
      },
      attributes: ['id', 'name', 'stockQuantity', 'lowStockAlert'],
    });

    // ── COUNTS ───────────────────────────────────────
    const totalCustomers = await Customer.count({ where: { userId } });
    const totalSuppliers = await Supplier.count({ where: { userId } });
    const totalSales     = await Sale.count({ where: { userId, status: 'paid' } });

    // ── RECENT SALES ─────────────────────────────────
    const recentSales = await Sale.findAll({
      where: { userId },
      include: [{
        model: require('../models').Customer,
        as: 'customer',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // ── BUILD RESPONSE ───────────────────────────────
    return res.status(200).json({
      success: true,
      dashboard: {

        today: {
          revenue:      todayRevenue.toFixed(2),
          expenses:     todayExpenseTotal.toFixed(2),
          profit:       (todayRevenue - todayExpenseTotal).toFixed(2),
          salesCount:   todaySales.length,
        },

        thisMonth: {
          revenue:      monthRevenue.toFixed(2),
          expenses:     (monthExpenseTotal || 0).toFixed(2),
          profit:       (monthRevenue - (monthExpenseTotal || 0)).toFixed(2),
          salesCount:   monthSales.length,
        },

        allTime: {
          revenue:      (totalRevenue  || 0).toFixed(2),
          expenses:     (totalExpenses || 0).toFixed(2),
          profit:       ((totalRevenue || 0) - (totalExpenses || 0)).toFixed(2),
          salesCount:   totalSales,
        },

        inventory: {
          totalProducts,
          lowStockCount:    lowStockProducts.length,
          lowStockProducts,
        },

        counts: {
          customers: totalCustomers,
          suppliers: totalSuppliers,
        },

        recentSales,
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboard };