// src/routes/product.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// 🆕 Import BOTH upload and compressImage
const { upload, compressImage } = require('../middleware/upload.middleware');

const {
  createProduct, getProducts, getProduct,
  updateProduct, deleteProduct, getLowStockProducts
} = require('../controllers/product.controller');

router.use(protect);

router.get('/low-stock', getLowStockProducts);
router.get('/',          getProducts);
router.get('/:id',       getProduct);

// Chain 3 middlewares: protect → upload → compress → controller
// They run in ORDER from left to right
router.post('/',   upload.single('image'), compressImage, createProduct);
router.put('/:id', upload.single('image'), compressImage, updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;