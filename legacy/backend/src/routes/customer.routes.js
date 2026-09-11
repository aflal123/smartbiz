// src/routes/customer.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createCustomer, getCustomers,
  getCustomer, updateCustomer, deleteCustomer
} = require('../controllers/customer.controller');

router.use(protect);

router.get('/',      getCustomers);
router.get('/:id',   getCustomer);
router.post('/',     createCustomer);
router.put('/:id',   updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;