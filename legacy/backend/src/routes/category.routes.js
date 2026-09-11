// src/routes/category.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createCategory, getCategories,
  getCategory, updateCategory, deleteCategory
} = require('../controllers/category.controller');

router.use(protect);

router.get('/',       getCategories);
router.get('/:id',    getCategory);
router.post('/',      createCategory);
router.put('/:id',    updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;