// src/models/index.js

const User     = require('./User');
const Category = require('./Category');
const Product  = require('./Product');
const Customer = require('./Customer');
const Supplier = require('./Supplier');
const Sale     = require('./Sale');
const SaleItem = require('./SaleItem');
const Expense  = require('./Expense');
const Admin    = require('./Admin');

// ── USER RELATIONSHIPS ───────────────────────────────
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
User.hasMany(Product,  { foreignKey: 'userId', as: 'products'   });
User.hasMany(Customer, { foreignKey: 'userId', as: 'customers'  });
User.hasMany(Supplier, { foreignKey: 'userId', as: 'suppliers'  });
User.hasMany(Sale,     { foreignKey: 'userId', as: 'sales'      });
User.hasMany(Expense,  { foreignKey: 'userId', as: 'expenses'   });


Category.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Product.belongsTo(User,  { foreignKey: 'userId', as: 'owner' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Supplier.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Sale.belongsTo(User,     { foreignKey: 'userId', as: 'owner' });
Expense.belongsTo(User,  { foreignKey: 'userId', as: 'owner' });

// ── CATEGORY ↔ PRODUCT ───────────────────────────────
Category.hasMany(Product,   { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// ── CUSTOMER ↔ SALE ──────────────────────────────────
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// ── SALE ↔ SALEITEMS ─────────────────────────────────
Sale.hasMany(SaleItem,   { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale'  });

// ── PRODUCT ↔ SALEITEMS ──────────────────────────────
Product.hasMany(SaleItem,   { foreignKey: 'productId', as: 'saleItems' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product'   });

module.exports = {
  User, Category, Product,
  Customer, Supplier,
  Sale, SaleItem,
  Expense,Admin
};