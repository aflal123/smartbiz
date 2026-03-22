// src/utils/barcode.js

const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

// ── ENSURE BARCODE FOLDERS EXIST ─────────────────────
const productBarcodePath = path.join(__dirname, '../../uploads/barcodes/products');
const invoiceBarcodePath = path.join(__dirname, '../../uploads/barcodes/invoices');

if (!fs.existsSync(productBarcodePath)) {
  fs.mkdirSync(productBarcodePath, { recursive: true });
}
if (!fs.existsSync(invoiceBarcodePath)) {
  fs.mkdirSync(invoiceBarcodePath, { recursive: true });
}

// ── GENERATE BARCODE NUMBER ───────────────────────────
// Product barcode: "PRD-000001"
// Invoice barcode: "INV-2026-0001" (already unique)
const generateBarcodeNumber = (type, id) => {
  if (type === 'product') {
    return `PRD-${String(id).padStart(6, '0')}`;
  }
  return null; // invoices use their invoiceNumber
};

// ── GENERATE BARCODE IMAGE ────────────────────────────
const generateBarcodeImage = async (text, type) => {
  try {
    const folder = type === 'product' ? productBarcodePath : invoiceBarcodePath;
    const filename = `barcode-${text}.png`;
    const filepath = path.join(folder, filename);
    const publicPath = `uploads/barcodes/${type}s/${filename}`;

    // Generate PNG barcode using bwip-js
    const png = await bwipjs.toBuffer({
      bcid:        'code128',   // Barcode type — Code128 is most common
      text:        text,        // Text to encode
      scale:       3,           // Image scale
      height:      10,          // Barcode height in mm
      includetext: true,        // Show text below barcode
      textxalign:  'center',    // Center the text
    });

    // Save PNG to disk
    fs.writeFileSync(filepath, png);

    return {
      barcodeNumber: text,
      barcodeUrl: publicPath,
    };

  } catch (error) {
    console.error('Barcode generation error:', error);
    throw error;
  }
};

module.exports = {
  generateBarcodeNumber,
  generateBarcodeImage,
};