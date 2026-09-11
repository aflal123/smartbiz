// src/utils/validate.js

// ── REQUIRED FIELDS CHECKER ──────────────────────────
// fields = array of field names that are required
// data   = req.body object
const validateRequired = (fields, data) => {
  const missing = [];

  fields.forEach(field => {
    if (!data[field] && data[field] !== 0) {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    return `These fields are required: ${missing.join(', ')}`;
  }

  return null; // null = no errors
};

// ── EMAIL VALIDATOR ──────────────────────────────────
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ── PHONE VALIDATOR ──────────────────────────────────
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
  return phoneRegex.test(phone);
};

// ── POSITIVE NUMBER VALIDATOR ────────────────────────
const isPositiveNumber = (value) => {
  return !isNaN(value) && Number(value) >= 0;
};

module.exports = {
  validateRequired,
  isValidEmail,
  isValidPhone,
  isPositiveNumber
};