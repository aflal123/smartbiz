// src/controllers/ai.controller.js

const {
  generateBusinessInsights,
  composeEmail,
  generateSocialPost,
  chatWithBusiness,
} = require('../services/ai.service');

const { Sale, Expense, Product, Customer } = require('../models');
const { Op } = require('sequelize');

// ── HELPER: Get Business Context ─────────────────────
const getBusinessContext = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const todaySales = await Sale.findAll({
    where: { userId, status: 'paid', createdAt: { [Op.between]: [today, tomorrow] } }
  });

  const todayRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.finalAmount), 0);

  const monthSales = await Sale.findAll({
    where: { userId, status: 'paid', createdAt: { [Op.between]: [monthStart, monthEnd] } }
  });

  const monthRevenue = monthSales.reduce((sum, s) => sum + parseFloat(s.finalAmount), 0);

  const totalRevenue  = await Sale.sum('finalAmount', { where: { userId, status: 'paid' } });
  const totalExpenses = await Expense.sum('amount', { where: { userId } });
  const totalProducts = await Product.count({ where: { userId, isActive: true } });
  const totalCustomers = await Customer.count({ where: { userId } });

  const lowStockProducts = await Product.findAll({
    where: { userId, isActive: true },
    attributes: ['name', 'stockQuantity', 'lowStockAlert'],
  });

  const monthExpenses = await Expense.sum('amount', {
    where: {
      userId,
      expenseDate: {
        [Op.between]: [
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0],
        ]
      }
    }
  });

  return {
    today: {
      revenue:    todayRevenue.toFixed(2),
      expenses:   '0',
      profit:     todayRevenue.toFixed(2),
      salesCount: todaySales.length,
    },
    thisMonth: {
      revenue:    monthRevenue.toFixed(2),
      expenses:   (monthExpenses || 0).toFixed(2),
      profit:     (monthRevenue - (monthExpenses || 0)).toFixed(2),
      salesCount: monthSales.length,
    },
    allTime: {
      revenue:  (totalRevenue  || 0).toFixed(2),
      expenses: (totalExpenses || 0).toFixed(2),
      profit:   ((totalRevenue || 0) - (totalExpenses || 0)).toFixed(2),
    },
    inventory: {
      totalProducts,
      lowStockCount: lowStockProducts.filter(
        p => p.stockQuantity <= p.lowStockAlert
      ).length,
    },
    counts: { customers: totalCustomers },
  };
};

// ── GET BUSINESS INSIGHTS ────────────────────────────
const getInsights = async (req, res) => {
  try {
    const businessData = await getBusinessContext(req.user.id);
    const insights = await generateBusinessInsights(businessData);

    return res.status(200).json({
      success: true,
      insights,
    });

  } catch (error) {
    console.error('AI insights error:', error);
    return res.status(500).json({ success: false, message: 'AI service error.' });
  }
};

// ── COMPOSE EMAIL ────────────────────────────────────
const getEmail = async (req, res) => {
  try {
    const { purpose, details } = req.body;

    if (!purpose || !details) {
      return res.status(400).json({
        success: false,
        message: 'Purpose and details are required.'
      });
    }

    const email = await composeEmail(purpose, details);

    return res.status(200).json({
      success: true,
      email,
    });

  } catch (error) {
    console.error('AI email error:', error);
    return res.status(500).json({ success: false, message: 'AI service error.' });
  }
};

// ── SOCIAL MEDIA POST ────────────────────────────────
const getSocialPost = async (req, res) => {
  try {
    const { platform, productName, details } = req.body;

    if (!platform || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Platform and product name are required.'
      });
    }

    const post = await generateSocialPost(platform, productName, details);

    return res.status(200).json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('AI social post error:', error);
    return res.status(500).json({ success: false, message: 'AI service error.' });
  }
};

// ── CHATBOT ──────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required.'
      });
    }

    const businessContext = await getBusinessContext(req.user.id);
    const answer = await chatWithBusiness(question, businessContext);

    return res.status(200).json({
      success: true,
      question,
      answer,
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ success: false, message: 'AI service error.' });
  }
};

module.exports = { getInsights, getEmail, getSocialPost, chat };