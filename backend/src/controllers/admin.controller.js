// src/controllers/admin.controller.js

const { User, Sale, Product, Customer, Supplier, Expense, SaleItem } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ── GET ALL BUSINESSES (users) ────────────────────────
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await User.findAll({
      attributes: [
        'id', 'name', 'email', 'businessName',
        'role', 'isVerified', 'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get stats for each business
    const businessesWithStats = await Promise.all(
      businesses.map(async (user) => {
        const salesCount    = await Sale.count({ where: { userId: user.id } });
        const productsCount = await Product.count({ where: { userId: user.id } });
        const totalRevenue  = await Sale.sum('finalAmount', {
          where: { userId: user.id, status: 'paid' }
        });

        return {
          ...user.toJSON(),
          stats: {
            salesCount,
            productsCount,
            totalRevenue: totalRevenue || 0,
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: businesses.length,
      businesses: businessesWithStats,
    });

  } catch (error) {
    console.error('Get businesses error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SYSTEM STATISTICS ─────────────────────────────
const getSystemStats = async (req, res) => {
  try {

    // Totals
    const totalUsers     = await User.count();
    const totalSales     = await Sale.count();
    const totalProducts  = await Product.count();
    const totalCustomers = await Customer.count();
    const totalRevenue   = await Sale.sum('finalAmount', {
      where: { status: 'paid' }
    });

    // This month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd   = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const newUsersThisMonth = await User.count({
      where: { createdAt: { [Op.between]: [monthStart, monthEnd] } }
    });

    const salesThisMonth = await Sale.count({
      where: {
        status: 'paid',
        createdAt: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    const revenueThisMonth = await Sale.sum('finalAmount', {
      where: {
        status: 'paid',
        createdAt: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    // Recent registrations
    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'businessName', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Top businesses by revenue
    const topBusinesses = await Sale.findAll({
      attributes: [
        'userId',
        [sequelize.fn('SUM', sequelize.col('finalAmount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'salesCount'],
      ],
      where: { status: 'paid' },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['name', 'businessName', 'email']
      }],
      group: ['userId', 'owner.id'],
      order: [[sequelize.fn('SUM', sequelize.col('finalAmount')), 'DESC']],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      stats: {
        totals: {
          users:     totalUsers,
          sales:     totalSales,
          products:  totalProducts,
          customers: totalCustomers,
          revenue:   (totalRevenue || 0).toFixed(2),
        },
        thisMonth: {
          newUsers:  newUsersThisMonth,
          sales:     salesThisMonth,
          revenue:   (revenueThisMonth || 0).toFixed(2),
        },
        recentUsers,
        topBusinesses,
      }
    });

  } catch (error) {
    console.error('System stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SINGLE BUSINESS DETAILS ───────────────────────
const getBusinessDetails = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt', 'resetPasswordToken'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Business not found.'
      });
    }

    const sales     = await Sale.count({ where: { userId: user.id } });
    const products  = await Product.count({ where: { userId: user.id } });
    const customers = await Customer.count({ where: { userId: user.id } });
    const suppliers = await Supplier.count({ where: { userId: user.id } });
    const revenue   = await Sale.sum('finalAmount', {
      where: { userId: user.id, status: 'paid' }
    });
    const expenses  = await Expense.sum('amount', {
      where: { userId: user.id }
    });

    return res.status(200).json({
      success: true,
      business: {
        ...user.toJSON(),
        stats: {
          sales,
          products,
          customers,
          suppliers,
          revenue:  revenue  || 0,
          expenses: expenses || 0,
          profit:   (revenue || 0) - (expenses || 0),
        }
      }
    });

  } catch (error) {
    console.error('Get business details error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── TOGGLE USER STATUS ────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Toggle isVerified as active/inactive flag
    await user.update({ isVerified: !user.isVerified });

    return res.status(200).json({
      success: true,
      message: `User ${user.isVerified ? 'activated' : 'deactivated'} successfully!`,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllBusinesses,
  getSystemStats,
  getBusinessDetails,
  toggleUserStatus,
};