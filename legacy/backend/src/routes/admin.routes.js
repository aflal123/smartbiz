// src/routes/admin.routes.js

const express = require('express');
const router  = express.Router();

const { protectAdmin, superAdminOnly } = require('../middleware/admin.middleware');
const { adminLogin, createAdmin, getAdminProfile } = require('../controllers/admin.auth.controller');
const {
  getAllBusinesses, getSystemStats,
  getBusinessDetails, toggleUserStatus
} = require('../controllers/admin.controller');

// ── PUBLIC ────────────────────────────────────────────
router.post('/login', adminLogin);

// ── PROTECTED ─────────────────────────────────────────
router.use(protectAdmin);

router.get('/profile',                  getAdminProfile);
router.get('/stats',                    getSystemStats);
router.get('/businesses',               getAllBusinesses);
router.get('/businesses/:id',           getBusinessDetails);
router.put('/businesses/:id/toggle',    toggleUserStatus);

// ── SUPER ADMIN ONLY ──────────────────────────────────
router.post('/create', superAdminOnly, createAdmin);

module.exports = router;