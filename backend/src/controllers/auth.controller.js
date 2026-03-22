// src/controllers/auth.controller.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built into Node.js — no install needed. Generates secure random tokens.
const User = require('../models/user');
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require('../services/email.service');

const register = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    // Step 1: Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Step 2: Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered.' 
      });
    }

    // Step 3: Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 4: Generate OTP and expiry time
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Step 5: ✅ Send email FIRST before saving to database
    // If email fails → nothing saved → user can try again cleanly
    await sendOTPEmail(email, name, otp);

    // Step 6: Only reach here if email succeeded — now save to DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      businessName,
      role: 'owner',
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    // Step 7: Send success response
    return res.status(201).json({
      success: true,
      message: 'Account created! Check your email for the 6-digit verification code.',
      userId: user.id,
    });

  } catch (error) {
    console.error('Register error:', error);

    // ✅ Give a helpful error message if email sending failed
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};


// ── VERIFY OTP ───────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Step 1: Find the user by ID
    const user = await User.findByPk(userId); // findByPk = find by Primary Key (id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Step 2: Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified. Please login.' });
    }

    // Step 3: Check if OTP has expired
    // Date.now() is the current time in milliseconds
    // We compare it with the expiry time we saved
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Step 4: Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Step 5: Mark user as verified and clear the OTP (no longer needed)
    await user.update({
      isVerified: true,
      otp: null,           // Delete OTP from database — it's been used
      otpExpiresAt: null,
    });

    // Step 6: Create JWT token — user is now fully logged in
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified! Welcome to SmartBiz 🎉',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, businessName: user.businessName },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── RESEND OTP ───────────────────────────────────────
// In case OTP expired or user didn't receive it
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified.' });
    }

    // Generate a fresh OTP with a new 10-minute window
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otpExpiresAt });
    await sendOTPEmail(user.email, user.name, otp);

    return res.status(200).json({ success: true, message: 'New OTP sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── LOGIN (updated to check isVerified) ──────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 🆕 Check if user has verified their email before allowing login
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first.',
        userId: user.id,  // So frontend can redirect to OTP page
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, businessName: user.businessName },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
  
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });

    // SECURITY TIP: Always send the same response whether user exists or not
    // This prevents attackers from finding out which emails are registered
    if (!user) {
      return res.status(200).json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    // Generate a secure random token using Node's built-in crypto module
    // crypto.randomBytes(32) → 32 random bytes → convert to hex string (64 chars)
    // This is much safer than a simple random number
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set expiry: 15 minutes from now
    const resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save the token to the database
    await user.update({ resetPasswordToken: resetToken, resetPasswordExpiresAt });

    // Send the reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.status(200).json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    // .trim() removes spaces from BOTH start and end
    const token = req.body.token?.trim();
    const newPassword = req.body.newPassword?.trim();

    console.log('token length after trim:', token?.length); // Should be 64

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters.' 
      });
    }

    const user = await User.findOne({ where: { resetPasswordToken: token } });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or already used reset link.' 
      });
    }

    if (new Date() > user.resetPasswordExpiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired. Please request a new one.' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
module.exports = { register, verifyOTP, resendOTP, login, forgotPassword, resetPassword };