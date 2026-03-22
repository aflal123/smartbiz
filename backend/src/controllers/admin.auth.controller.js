
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { Admin } = require('../models');

// ── ADMIN LOGIN ───────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find admin
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    // Generate token with type: 'admin'
    const token = jwt.sign(
      { id: admin.id, type: 'admin', role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful!',
      token,
      admin: {
        id:    admin.id,
        name:  admin.name,
        email: admin.email,
        role:  admin.role,
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── CREATE ADMIN (superadmin only) ───────────────────
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    // Check if exists
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully!',
      admin: {
        id:    admin.id,
        name:  admin.name,
        email: admin.email,
        role:  admin.role,
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ADMIN PROFILE ─────────────────────────────────
const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: {
      id:        req.admin.id,
      name:      req.admin.name,
      email:     req.admin.email,
      role:      req.admin.role,
      lastLogin: req.admin.lastLogin,
    }
  });
};

module.exports = { adminLogin, createAdmin, getAdminProfile };