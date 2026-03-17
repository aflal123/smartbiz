// src/controllers/product.controller.js

const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const {
  validateRequired,
  isPositiveNumber
} = require('../utils/validate');
const { generateBarcodeNumber, generateBarcodeImage } = require('../utils/barcode');

const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, description, costPrice, sellingPrice,
      stockQuantity, lowStockAlert, unit, sku, categoryId
    } = req.body;

    // ── MANDATORY FIELDS ─────────────────────────────
    const error = validateRequired(
      ['name', 'sellingPrice', 'costPrice', 'stockQuantity'],
      req.body
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // ── NUMBER VALIDATION ────────────────────────────
    if (!isPositiveNumber(sellingPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be a positive number.'
      });
    }

    if (!isPositiveNumber(costPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Cost price must be a positive number.'
      });
    }

    if (!isPositiveNumber(stockQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a positive number.'
      });
    }

    // ── NAME LENGTH ──────────────────────────────────
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be at least 2 characters.'
      });
    }

    // ── DUPLICATE SKU CHECK ──────────────────────────
    if (sku) {
      const existing = await Product.findOne({ where: { sku, userId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A product with this SKU already exists.'
        });
      }
    }

    const image = req.file ? req.file.path : null;

    // ── CREATE PRODUCT ────────────────────────────────
    const product = await Product.create({
      name: name.trim(),
      description: description?.trim(),
      costPrice,
      sellingPrice,
      stockQuantity: stockQuantity || 0,
      lowStockAlert: lowStockAlert || 5,
      unit: unit || 'pcs',
      sku: sku?.trim(),
      categoryId,
      image,
      userId,
    });

    // ── GENERATE BARCODE ──────────────────────────────
    // Uses product ID to create unique barcode e.g. "PRD-000001"
    const barcodeNumber = generateBarcodeNumber('product', product.id);
    const { barcodeUrl } = await generateBarcodeImage(barcodeNumber, 'product');

    // Save barcode back to product
    await product.update({ barcodeNumber, barcodeUrl });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: {
        ...product.toJSON(),
        barcodeImageUrl: `${req.protocol}://${req.get('host')}/${barcodeUrl}`
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.findAll({
      where: { userId, isActive: true },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      }],
      order: [['createdAt', 'DESC']],
    });

    const productsWithExtras = products.map(product => {
      const p = product.toJSON();
      p.isLowStock = p.stockQuantity <= p.lowStockAlert;
      p.imageUrl = p.image
        ? `${req.protocol}://${req.get('host')}/${p.image}`
        : null;
      return p;
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products: productsWithExtras,
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const p = product.toJSON();
    p.imageUrl = p.image
      ? `${req.protocol}://${req.get('host')}/${p.image}`
      : null;

    return res.status(200).json({ success: true, product: p });

  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    // Validate numbers if provided
    if (req.body.sellingPrice && !isPositiveNumber(req.body.sellingPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be a positive number.'
      });
    }

    if (req.body.stockQuantity && !isPositiveNumber(req.body.stockQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a positive number.'
      });
    }

    const product = await Product.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    await product.update(req.body);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await product.update({ isActive: false });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully!'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.findAll({
      where: {
        userId,
        isActive: true,
        stockQuantity: { [Op.lte]: 10 }
      },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Low stock error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};


module.exports = {
  createProduct, getProducts, getProduct,
  updateProduct, deleteProduct, getLowStockProducts
};