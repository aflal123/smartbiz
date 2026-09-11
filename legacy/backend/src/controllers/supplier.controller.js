// src/controllers/supplier.controller.js

const { Supplier } = require('../models');
const { validateRequired, isValidEmail, isValidPhone } = require('../utils/validate');

const createSupplier = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, companyName } = req.body;

    // ── MANDATORY FIELDS ─────────────────────────────
    const error = validateRequired(['name', 'phone'], req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // ── NAME LENGTH ──────────────────────────────────
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name must be at least 2 characters.'
      });
    }

    // ── PHONE VALIDATION ─────────────────────────────
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    // ── EMAIL VALIDATION ─────────────────────────────
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone.trim(),
      address: address?.trim(),
      companyName: companyName?.trim(),
      userId
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier created!',
      supplier
    });

  } catch (error) {
    console.error('Create supplier error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    return res.status(200).json({ success: true, supplier });
  } catch (error) {
    console.error('Get supplier error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    if (req.body.email && !isValidEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (req.body.phone && !isValidPhone(req.body.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    const supplier = await Supplier.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    await supplier.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Supplier updated!',
      supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    await supplier.destroy();
    return res.status(200).json({ success: true, message: 'Supplier deleted!' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createSupplier, getSuppliers,
  getSupplier, updateSupplier, deleteSupplier
};