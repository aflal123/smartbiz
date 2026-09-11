// src/middleware/upload.middleware.js

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs'); // Built into Node.js — handles file system operations

// ── ENSURE UPLOAD FOLDERS EXIST ──────────────────────
// Create folders if they don't exist yet
// This prevents errors if someone deletes the folder
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  // recursive: true → creates parent folders too if missing
}

// ── MULTER STORAGE (Memory) ──────────────────────────
// Instead of saving directly to disk, we store in memory FIRST
// Then Sharp processes it, THEN we save to disk
// This gives us control over the image before saving
const storage = multer.memoryStorage();
// memoryStorage() → file goes into req.file.buffer (RAM)
// diskStorage() → file goes directly to disk (no processing possible)

// ── FILE FILTER ──────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);   // ✅ Accept
  } else {
    cb(new Error('Only image files are allowed!'), false); // ❌ Reject
  }
};

// ── MULTER INSTANCE ──────────────────────────────────
const upload = multer({
  storage,      // use memory storage
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max BEFORE compression
                                 // After sharp, it will be much smaller
  }
});

// ── SHARP COMPRESSION MIDDLEWARE ─────────────────────
// This runs AFTER multer, BEFORE the controller
// It takes the image from memory, compresses it, saves to disk
const compressImage = async (req, res, next) => {
  try {
    // If no file was uploaded, skip compression and continue
    if (!req.file) {
      return next();
    }

    // Create unique filename
    // Date.now() → timestamp e.g. 1704067200000
    // .webp → convert all images to WebP format (smallest size)
    const filename = `product-${Date.now()}.webp`;
    const outputPath = `uploads/products/${filename}`;

    // ── SHARP PROCESSING ─────────────────────────────
    await sharp(req.file.buffer)  // read from memory buffer
      .resize(800, 800, {         // resize to max 800x800 pixels
        fit: 'inside',            // keep aspect ratio — don't crop
        withoutEnlargement: true, // don't make small images bigger
      })
      .webp({ quality: 80 })      // convert to WebP, 80% quality
                                   // quality 80 = great balance of size vs clarity
                                   // quality 100 = no compression (huge file)
                                   // quality 50 = too blurry
      .toFile(outputPath);        // save to disk

    // ── UPDATE req.file ──────────────────────────────
    // Replace the original file info with our compressed version
    // Controller reads req.file.path to save in database
    req.file.path = outputPath;       // e.g. "uploads/products/product-123.webp"
    req.file.filename = filename;     // e.g. "product-123.webp"
    req.file.mimetype = 'image/webp'; // update mimetype

    // Continue to controller
    next();

  } catch (error) {
    console.error('Image compression error:', error);
    return res.status(500).json({
      success: false,
      message: 'Image processing failed.'
    });
  }
};

module.exports = { upload, compressImage };