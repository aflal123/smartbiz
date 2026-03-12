// src/routes/sale.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createSale, getSales, getSale,
  cancelSale, getSalesSummary
} = require('../controllers/sale.controller');

router.use(protect);

router.get('/summary',   getSalesSummary); // Must be before /:id
router.get('/',          getSales);
router.get('/:id',       getSale);
router.post('/',         createSale);
router.put('/:id/cancel', cancelSale);

module.exports = router;