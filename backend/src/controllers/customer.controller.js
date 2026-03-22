// src/controllers/customer.controller.js

const { Customer } = require('../models');
const { validateRequired, isValidEmail, isValidPhone } = require('../utils/validate');

const createCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, notes } = req.body;

    // ── MANDATORY FIELDS ─────────────────────────────
    const error = validateRequired(['name', 'phone'], req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // ── NAME LENGTH ──────────────────────────────────
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Customer name must be at least 2 characters.'
      });
    }

    // ── PHONE VALIDATION ─────────────────────────────
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    // ── EMAIL VALIDATION (optional but if provided must be valid) ──
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone.trim(),
      address: address?.trim(),
      notes: notes?.trim(),
      userId
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created!',
      customer
    });

  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    return res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    // Validate email if being updated
    if (req.body.email && !isValidEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Validate phone if being updated
    if (req.body.phone && !isValidPhone(req.body.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await customer.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Customer updated!',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    await customer.destroy();
    return res.status(200).json({ success: true, message: 'Customer deleted!' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createCustomer, getCustomers,
  getCustomer, updateCustomer, deleteCustomer
};