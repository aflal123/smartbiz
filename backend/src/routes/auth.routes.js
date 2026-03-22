// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

router.post('/register', register);          // Step 1: Create account
router.post('/verify-otp', verifyOTP);       // Step 2: Confirm email
router.post('/resend-otp', resendOTP);       // Optional: Get new OTP
router.post('/login', login);                // Step 3: Login
router.post('/forgot-password', forgotPassword); // Request reset link
router.post('/reset-password', resetPassword);   // Set new password

module.exports = router;
