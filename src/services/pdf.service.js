// src/services/pdf.service.js

const PDFDocument = require('pdfkit');

const generateInvoicePDF = (sale, res) => {
  // Create PDF document
  const doc = new PDFDocument({ margin: 50 });

  // ── SET RESPONSE HEADERS ──────────────────────────
  // This tells the browser to download the file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${sale.invoiceNumber}.pdf`
  );

  // Pipe PDF to response
  doc.pipe(res);

  // ── COLORS ────────────────────────────────────────
  const PRIMARY   = '#2563eb';
  const DARK      = '#1e293b';
  const GRAY      = '#64748b';
  const LIGHT     = '#f8fafc';
  const SUCCESS   = '#10b981';

  // ── HEADER ────────────────────────────────────────
  // Blue background header
  doc.rect(0, 0, 612, 100).fill(PRIMARY);

  // Company name
  doc
    .fillColor('white')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('SmartBiz', 50, 30);

  // Tagline
  doc
    .fillColor('white')
    .fontSize(10)
    .font('Helvetica')
    .text('AI-Powered Business Management', 50, 62);

  // INVOICE label
  doc
    .fillColor('white')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('INVOICE', 450, 30, { align: 'right' });

  // Invoice number
  doc
    .fillColor('white')
    .fontSize(11)
    .font('Helvetica')
    .text(sale.invoiceNumber, 450, 62, { align: 'right' });

  // ── INVOICE INFO BOX ──────────────────────────────
  doc
    .fillColor(LIGHT)
    .rect(50, 120, 512, 80)
    .fill();

  // Date
  doc
    .fillColor(GRAY)
    .fontSize(10)
    .font('Helvetica')
    .text('Invoice Date:', 70, 135);
  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .text(new Date(sale.createdAt).toLocaleDateString('en-GB'), 70, 150);

  // Status
  doc
    .fillColor(GRAY)
    .font('Helvetica')
    .text('Status:', 220, 135);
  doc
    .fillColor(sale.status === 'paid' ? SUCCESS : '#ef4444')
    .font('Helvetica-Bold')
    .text(sale.status?.toUpperCase(), 220, 150);

  // Payment Method
  doc
    .fillColor(GRAY)
    .font('Helvetica')
    .text('Payment:', 370, 135);
  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .text(sale.paymentMethod?.toUpperCase(), 370, 150);

  // ── BILL TO SECTION ───────────────────────────────
  doc
    .fillColor(DARK)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('BILL TO:', 50, 230);

  doc
    .moveTo(50, 245)
    .lineTo(200, 245)
    .strokeColor(PRIMARY)
    .lineWidth(2)
    .stroke();

  if (sale.customer) {
    doc
      .fillColor(DARK)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(sale.customer.name, 50, 255);

    if (sale.customer.phone) {
      doc
        .fillColor(GRAY)
        .fontSize(10)
        .font('Helvetica')
        .text(`Phone: ${sale.customer.phone}`, 50, 272);
    }

    if (sale.customer.email) {
      doc
        .fillColor(GRAY)
        .fontSize(10)
        .font('Helvetica')
        .text(`Email: ${sale.customer.email}`, 50, 287);
    }
  } else {
    doc
      .fillColor(DARK)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Walk-in Customer', 50, 255);
  }

  // ── ITEMS TABLE HEADER ────────────────────────────
  const tableTop = 330;

  doc
    .rect(50, tableTop, 512, 28)
    .fill(PRIMARY);

  doc
    .fillColor('white')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('#',          60,  tableTop + 9)
    .text('Product',    90,  tableTop + 9)
    .text('Qty',        320, tableTop + 9)
    .text('Unit Price', 370, tableTop + 9)
    .text('Subtotal',   470, tableTop + 9);

  // ── ITEMS TABLE ROWS ──────────────────────────────
  let y = tableTop + 28;

  sale.items?.forEach((item, index) => {
    // Alternating row color
    if (index % 2 === 0) {
      doc.rect(50, y, 512, 28).fill('#f0f4ff');
    }

    doc
      .fillColor(DARK)
      .fontSize(10)
      .font('Helvetica')
      .text(String(index + 1),                          60,  y + 9)
      .text(item.product?.name || 'Product',            90,  y + 9, { width: 220 })
      .text(String(item.quantity),                      320, y + 9)
      .text(`Rs. ${Number(item.unitPrice).toLocaleString()}`,  370, y + 9)
      .text(`Rs. ${Number(item.subtotal).toLocaleString()}`,   470, y + 9);

    y += 28;
  });

  // Table bottom border
  doc
    .moveTo(50, y)
    .lineTo(562, y)
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .stroke();

  // ── TOTALS SECTION ────────────────────────────────
  y += 20;

  const drawTotalRow = (label, value, isBold = false, color = DARK) => {
    doc
      .fillColor(GRAY)
      .fontSize(10)
      .font('Helvetica')
      .text(label, 370, y);

    doc
      .fillColor(color)
      .fontSize(isBold ? 12 : 10)
      .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
      .text(value, 470, y);

    y += 20;
  };

  drawTotalRow('Subtotal:',    `Rs. ${Number(sale.totalAmount).toLocaleString()}`);
  drawTotalRow('Discount:',    `- Rs. ${Number(sale.discount).toLocaleString()}`, false, '#ef4444');

  // Divider before final
  doc
    .moveTo(370, y)
    .lineTo(562, y)
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .stroke();

  y += 8;
  drawTotalRow('Final Amount:', `Rs. ${Number(sale.finalAmount).toLocaleString()}`, true, PRIMARY);
  drawTotalRow('Amount Paid:',  `Rs. ${Number(sale.amountPaid).toLocaleString()}`,  false, SUCCESS);
  drawTotalRow('Change:',       `Rs. ${Number(sale.changeAmount).toLocaleString()}`);

  // ── NOTES SECTION ─────────────────────────────────
  if (sale.notes) {
    y += 20;
    doc
      .rect(50, y, 512, 50)
      .fill(LIGHT);

    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('NOTES:', 65, y + 10);

    doc
      .fillColor(DARK)
      .fontSize(9)
      .font('Helvetica')
      .text(sale.notes, 65, y + 23, { width: 480 });

    y += 60;
  }

  // ── FOOTER ────────────────────────────────────────
  doc
    .rect(0, 750, 612, 92)
    .fill(LIGHT);

  doc
    .fillColor(GRAY)
    .fontSize(9)
    .font('Helvetica')
    .text('Thank you for your business!', 50, 765, { align: 'center', width: 512 });

  doc
    .fillColor(GRAY)
    .fontSize(8)
    .text('Generated by SmartBiz — AI-Powered Business Management', 50, 780, {
      align: 'center', width: 512
    });

  // ── BARCODE URL IF EXISTS ─────────────────────────
  if (sale.barcodeNumber) {
    doc
      .fillColor(GRAY)
      .fontSize(8)
      .text(`Invoice Barcode: ${sale.barcodeNumber}`, 50, 795, {
        align: 'center', width: 512
      });
  }

  // Finalize PDF
  doc.end();
};

module.exports = { generateInvoicePDF };