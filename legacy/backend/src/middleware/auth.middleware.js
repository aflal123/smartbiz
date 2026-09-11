// src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── PROTECT MIDDLEWARE ───────────────────────────────
// Runs before every protected route
// Checks if request has a valid JWT token
const protect = (req, res, next) => {
  try {
    // Step 1: Get the Authorization header from the request
    // Frontend sends: Authorization: "Bearer eyJhbGciOiJ..."
    const authHeader = req.headers.authorization;

    // Step 2: Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Step 3: Extract just the token part
    // "Bearer eyJhbGci..." → split by space → ["Bearer", "eyJhbGci..."][1]
    const token = authHeader.split(' ')[1];

    // Step 4: Verify token is valid and not expired
    // If invalid → throws error → caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Attach decoded user info to request object
    // Now every controller can access req.user.id, req.user.role
    req.user = decoded;

    // Step 6: Call next() to continue to the actual controller
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

// ── ADMIN ONLY MIDDLEWARE ────────────────────────────
// Use this on routes that only admins can access
// Always use AFTER protect middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

// ✅ Export both as an object
// This is why we import with: const { protect } = require('./auth.middleware')
module.exports = { protect, adminOnly };