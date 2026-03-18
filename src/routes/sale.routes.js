// src/routes/sale.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createSale, getSales, getSale,
  cancelSale, getSalesSummary,
  downloadInvoice, getSalesReport, updateSale
} = require('../controllers/sale.controller');

router.use(protect);

// ── SPECIFIC ROUTES FIRST (before /:id) ──────────────
router.get('/summary', getSalesSummary);
router.get('/report',  getSalesReport);   
router.get('/',        getSales);
router.post('/',       createSale);

// ── DYNAMIC ROUTES AFTER ─────────────────────────────
router.get('/:id',          getSale);
router.get('/:id/invoice',  downloadInvoice);
router.put('/:id/cancel',   cancelSale);
router.put('/:id',          updateSale);

module.exports = router;