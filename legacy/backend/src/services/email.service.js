// src/services/email.service.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// ── CREATE TRANSPORTER ───────────────────────────────
// A "transporter" is the email sender — configured with Gmail credentials
// Think of it as setting up your email client (like Outlook or Gmail app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail address
    pass: process.env.EMAIL_PASS,  // Your 16-char App Password
  },
});

// ── HELPER: Generate a random 6-digit OTP ────────────
// Math.random() gives 0.something → multiply by 900000 → add 100000
// Result is always a 6-digit number between 100000 and 999999
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── SEND OTP VERIFICATION EMAIL ──────────────────────
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"SmartBiz" <${process.env.EMAIL_USER}>`, // Sender name and email
    to: email,                                        // Recipient
    subject: 'Verify Your SmartBiz Account',
    // HTML email body — looks professional
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to SmartBiz! </h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 40px; letter-spacing: 8px; margin: 0;">
            ${otp}
          </h1>
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't create a SmartBiz account, ignore this email.</p>
        <hr/>
        <p style="color: #9ca3af; font-size: 12px;">SmartBiz — AI-Powered Business Management</p>
      </div>
    `,
  };

  // Actually send the email
  // await means: wait until email is sent before continuing
  await transporter.sendMail(mailOptions);
};

// ── SEND PASSWORD RESET EMAIL ─────────────────────────
const sendPasswordResetEmail = async (email, name, resetToken) => {
  // Build the reset link — user clicks this in their email
  // It goes to the React frontend which reads the token from the URL
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SmartBiz" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your SmartBiz Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your SmartBiz password.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; 
                    border-radius: 6px; text-decoration: none; font-size: 16px;">
            Reset My Password
          </a>
        </div>
        <p>This link expires in <strong>15 minutes</strong>.</p>
        <p>If you didn't request a password reset, ignore this email. 
           Your password won't change.</p>
        <hr/>
        <p style="color: #9ca3af; font-size: 12px;">SmartBiz — AI-Powered Business Management</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Export everything
module.exports = { generateOTP, sendOTPEmail, sendPasswordResetEmail };