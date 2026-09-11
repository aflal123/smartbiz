// src/routes/supplier.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// ✅ Import names must EXACTLY match what controller exports
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplier.controller');

// Protect all routes
router.use(protect);

router.get('/',       getSuppliers);
router.get('/:id',    getSupplier);
router.post('/',      createSupplier);
router.put('/:id',    updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;