import Decimal from "decimal.js";

// Ensure standard financial rounding (ROUND_HALF_UP)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CartItemInput {
  quantity: number;
  unitPrice: number | string | Decimal;
  unitCostPrice?: number | string | Decimal;
  discountPercentage?: number | string | Decimal;
}

/**
 * Calculate subtotal for a line item (quantity * unitPrice)
 */
export function calculateLineSubtotal(
  quantity: number,
  unitPrice: number | string | Decimal
): Decimal {
  const qty = new Decimal(quantity);
  const price = new Decimal(unitPrice);
  return qty.mul(price).toDecimalPlaces(2);
}

/**
 * Calculate subtotal across multiple items
 */
export function calculateSubtotal(items: CartItemInput[]): Decimal {
  return items.reduce((acc, item) => {
    return acc.plus(calculateLineSubtotal(item.quantity, item.unitPrice));
  }, new Decimal(0)).toDecimalPlaces(2);
}

/**
 * Calculate discount amount given subtotal and discount percentage or fixed value
 */
export function calculateDiscount(
  subtotal: number | string | Decimal,
  discountValue: number | string | Decimal,
  isPercentage = false
): Decimal {
  const sub = new Decimal(subtotal);
  const disc = new Decimal(discountValue);

  if (disc.isNegative()) {
    return new Decimal(0);
  }

  if (isPercentage) {
    // subtotal * (percentage / 100)
    const percentage = Decimal.min(disc, 100);
    return sub.mul(percentage.div(100)).toDecimalPlaces(2);
  }

  // Fixed discount cannot exceed subtotal
  return Decimal.min(disc, sub).toDecimalPlaces(2);
}

/**
 * Calculate tax amount given taxable amount and tax rate percentage
 */
export function calculateTax(
  taxableAmount: number | string | Decimal,
  taxRatePercentage: number | string | Decimal
): Decimal {
  const amount = new Decimal(taxableAmount);
  const rate = new Decimal(taxRatePercentage);

  if (amount.isNegative() || rate.isNegative()) {
    return new Decimal(0);
  }

  return amount.mul(rate.div(100)).toDecimalPlaces(2);
}

/**
 * Calculate total = Subtotal - Discount + Tax
 */
export function calculateTotal(
  subtotal: number | string | Decimal,
  discount: number | string | Decimal = 0,
  tax: number | string | Decimal = 0
): Decimal {
  const sub = new Decimal(subtotal);
  const disc = new Decimal(discount);
  const tx = new Decimal(tax);

  const afterDiscount = Decimal.max(0, sub.minus(disc));
  return afterDiscount.plus(tx).toDecimalPlaces(2);
}

/**
 * Calculate change = amountPaid - totalAmount
 */
export function calculateChange(
  amountPaid: number | string | Decimal,
  totalAmount: number | string | Decimal
): Decimal {
  const paid = new Decimal(amountPaid);
  const total = new Decimal(totalAmount);
  return Decimal.max(0, paid.minus(total)).toDecimalPlaces(2);
}

/**
 * Calculate Cost of Goods Sold (COGS) for sold items
 * COGS = Sum of (quantity * unitCostPrice)
 */
export function calculateCOGS(
  items: { quantity: number; unitCostPrice: number | string | Decimal }[]
): Decimal {
  return items.reduce((acc, item) => {
    const qty = new Decimal(item.quantity);
    const cost = new Decimal(item.unitCostPrice);
    return acc.plus(qty.mul(cost));
  }, new Decimal(0)).toDecimalPlaces(2);
}

/**
 * Calculate Gross Profit = Revenue - COGS
 */
export function calculateGrossProfit(
  revenue: number | string | Decimal,
  cogs: number | string | Decimal
): Decimal {
  const rev = new Decimal(revenue);
  const costOfGoods = new Decimal(cogs);
  return rev.minus(costOfGoods).toDecimalPlaces(2);
}

/**
 * Calculate Net Profit = Gross Profit - Operating Expenses
 */
export function calculateNetProfit(
  grossProfit: number | string | Decimal,
  operatingExpenses: number | string | Decimal
): Decimal {
  const gp = new Decimal(grossProfit);
  const expenses = new Decimal(operatingExpenses);
  return gp.minus(expenses).toDecimalPlaces(2);
}

/**
 * Calculate Gross Margin Percentage = (Gross Profit / Revenue) * 100
 */
export function calculateGrossMarginPercentage(
  revenue: number | string | Decimal,
  cogs: number | string | Decimal
): Decimal {
  const rev = new Decimal(revenue);
  if (rev.isZero()) return new Decimal(0);

  const gp = calculateGrossProfit(revenue, cogs);
  return gp.div(rev).mul(100).toDecimalPlaces(2);
}
