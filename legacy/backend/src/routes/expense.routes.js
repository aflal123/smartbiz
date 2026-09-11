// src/routes/expense.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createExpense, getExpenses, getExpense,
  updateExpense, deleteExpense
} = require('../controllers/expense.controller');

router.use(protect);

router.get('/',      getExpenses);
router.get('/:id',   getExpense);
router.post('/',     createExpense);
router.put('/:id',   updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;