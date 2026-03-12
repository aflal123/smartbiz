// src/controllers/category.controller.js

const { Category } = require('../models');
const { validateRequired } = require('../utils/validate');

const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    // ── VALIDATION ───────────────────────────────────
    const error = validateRequired(['name'], req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 2 characters.'
      });
    }

    const existing = await Category.findOne({ where: { name: name.trim(), userId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists.'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      userId
    });

    return res.status(201).json({
      success: true,
      message: 'Category created!',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    // Validate if name is being updated
    if (req.body.name && req.body.name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 2 characters.'
      });
    }

    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await category.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Category updated!',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    await category.destroy();
    return res.status(200).json({ success: true, message: 'Category deleted!' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createCategory, getCategories,
  getCategory, updateCategory, deleteCategory
};