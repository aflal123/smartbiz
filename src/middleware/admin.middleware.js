// src/middleware/admin.middleware.js

const jwt     = require('jsonwebtoken');
const { Admin } = require('../models');

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. Invalid token type.'
      });
    }

    const admin = await Admin.findOne({
      where: { id: decoded.id, isActive: true }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or deactivated.'
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin token.'
    });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required.'
    });
  }
  next();
};

module.exports = { protectAdmin, superAdminOnly };