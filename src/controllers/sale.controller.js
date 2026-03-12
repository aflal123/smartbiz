// src/controllers/sale.controller.js

const { Sale, SaleItem, Product, Customer } = require('../models');
const { validateRequired, isPositiveNumber } = require('../utils/validate');

// ── HELPER: Generate Invoice Number ─────────────────
// Generates unique invoice number like "INV-2024-0001"
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Count how many sales exist this year
  const count = await Sale.count({
    where: {
      invoiceNumber: {
        [require('sequelize').Op.like]: `${prefix}%`
      }
    }
  });

  // Pad with zeros: 1 → "0001", 42 → "0042"
  const number = String(count + 1).padStart(4, '0');
  return `${prefix}${number}`;
};

// ── CREATE SALE ──────────────────────────────────────
const createSale = async (req, res) => {
  // We use a transaction to ensure ALL or NOTHING is saved
  // If saving SaleItem fails → the whole Sale is rolled back
  const t = await require('../config/database').transaction();

  try {
    const userId = req.user.id;
    const {
      items,           // Array of { productId, quantity, unitPrice }
      customerId,
      discount,
      amountPaid,
      paymentMethod,
      notes,
      status
    } = req.body;

    // ── VALIDATION ───────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sale must have at least one item.'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId, quantity and unitPrice.'
        });
      }

      if (!isPositiveNumber(item.quantity) || item.quantity <= 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be greater than 0.'
        });
      }
    }

    // ── CALCULATE TOTALS ─────────────────────────────
    let totalAmount = 0;
    const saleItemsData = [];

    for (const item of items) {
      // Get product from database to verify it exists
      const product = await Product.findOne({
        where: { id: item.productId, userId, isActive: true }
      });

      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.productId} not found.`
        });
      }

      // Check if enough stock available
      if (product.stockQuantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${product.name}". Available: ${product.stockQuantity}`
        });
      }

      const subtotal = item.quantity * item.unitPrice;
      totalAmount += subtotal;

      saleItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      });
    }

    // Calculate final amount after discount
    const discountAmount = discount || 0;
    const finalAmount = totalAmount - discountAmount;
    const paid = amountPaid || finalAmount;
    const changeAmount = paid - finalAmount;

    // ── GENERATE INVOICE NUMBER ──────────────────────
    const invoiceNumber = await generateInvoiceNumber();

    // ── CREATE SALE ──────────────────────────────────
    const sale = await Sale.create({
      invoiceNumber,
      totalAmount,
      discount: discountAmount,
      finalAmount,
      amountPaid: paid,
      changeAmount: changeAmount > 0 ? changeAmount : 0,
      paymentMethod: paymentMethod || 'cash',
      status: status || 'paid',
      customerId,
      notes,
      userId,
    }, { transaction: t }); // pass transaction

    // ── CREATE SALE ITEMS ────────────────────────────
    for (const itemData of saleItemsData) {
      await SaleItem.create({
        ...itemData,
        saleId: sale.id,
      }, { transaction: t });

      // ── UPDATE STOCK ─────────────────────────────
      // Reduce stock quantity for each product sold
      await Product.decrement(
        'stockQuantity',
        {
          by: itemData.quantity,
          where: { id: itemData.productId },
          transaction: t
        }
      );
    }

    // ── COMMIT TRANSACTION ───────────────────────────
    // Everything succeeded — save all changes permanently
    await t.commit();

    // Fetch the complete sale with all relations
    const completeSale = await Sale.findOne({
      where: { id: sale.id },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }]
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Sale created successfully!',
      sale: completeSale
    });

  } catch (error) {
    // ── ROLLBACK ON ERROR ────────────────────────────
    await t.rollback();
    console.error('Create sale error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ALL SALES ────────────────────────────────────
const getSales = async (req, res) => {
  try {
    const userId = req.user.id;

    const sales = await Sale.findAll({
      where: { userId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales
    });

  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SINGLE SALE ──────────────────────────────────
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit']
          }]
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    return res.status(200).json({ success: true, sale });

  } catch (error) {
    console.error('Get sale error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── CANCEL SALE ──────────────────────────────────────
const cancelSale = async (req, res) => {
  const t = await require('../config/database').transaction();

  try {
    const sale = await Sale.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: SaleItem, as: 'items' }]
    });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    if (sale.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Sale already cancelled.' });
    }

    // Restore stock for each item
    for (const item of sale.items) {
      await Product.increment(
        'stockQuantity',
        {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t
        }
      );
    }

    // Mark sale as cancelled
    await sale.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    return res.status(200).json({
      success: true,
      message: 'Sale cancelled and stock restored!'
    });

  } catch (error) {
    await t.rollback();
    console.error('Cancel sale error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SALES SUMMARY ────────────────────────────────
const getSalesSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySales = await Sale.findAll({
      where: {
        userId,
        status: 'paid',
        createdAt: { [Op.between]: [today, tomorrow] }
      }
    });

    // Total revenue today
    const todayRevenue = todaySales.reduce(
      (sum, sale) => sum + parseFloat(sale.finalAmount), 0
    );

    // All time totals
    const totalSales = await Sale.count({ where: { userId, status: 'paid' } });
    const totalRevenue = await Sale.sum('finalAmount', {
      where: { userId, status: 'paid' }
    });

    return res.status(200).json({
      success: true,
      summary: {
        today: {
          salesCount: todaySales.length,
          revenue: todayRevenue.toFixed(2),
        },
        allTime: {
          salesCount: totalSales,
          revenue: (totalRevenue || 0).toFixed(2),
        }
      }
    });

  } catch (error) {
    console.error('Sales summary error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createSale, getSales, getSale,
  cancelSale, getSalesSummary
};