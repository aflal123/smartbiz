// src/controllers/expense.controller.js

const { Expense } = require('../models');
const { validateRequired, isPositiveNumber } = require('../utils/validate');
const { Op } = require('sequelize');

// ── CREATE EXPENSE ───────────────────────────────────
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, category, expenseDate, notes } = req.body;

    // Validate required fields
    const error = validateRequired(['title', 'amount'], req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    if (!isPositiveNumber(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.'
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category: category || 'other',
      expenseDate: expenseDate || new Date(),
      notes,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense recorded!',
      expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ALL EXPENSES ─────────────────────────────────
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional filter by date range
    const { startDate, endDate, category } = req.query;
    const where = { userId };

    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [startDate, endDate] };
    }

    if (category) {
      where.category = category;
    }

    const expenses = await Expense.findAll({
      where,
      order: [['expenseDate', 'DESC']],
    });

    // Calculate total
    const total = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount), 0
    );

    return res.status(200).json({
      success: true,
      count: expenses.length,
      total: total.toFixed(2),
      expenses
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SINGLE EXPENSE ───────────────────────────────
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    return res.status(200).json({ success: true, expense });

  } catch (error) {
    console.error('Get expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UPDATE EXPENSE ───────────────────────────────────
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    const { title, amount, category, expenseDate, notes } = req.body;

    if (amount && (!isPositiveNumber(amount) || Number(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.'
      });
    }

    await expense.update({ title, amount, category, expenseDate, notes });

    return res.status(200).json({
      success: true,
      message: 'Expense updated!',
      expense
    });

  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE EXPENSE ───────────────────────────────────
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    await expense.destroy();

    return res.status(200).json({
      success: true,
      message: 'Expense deleted!'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createExpense, getExpenses, getExpense,
  updateExpense, deleteExpense
};