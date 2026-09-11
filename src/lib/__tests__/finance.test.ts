import { describe, it, expect } from "vitest";
import {
  calculateSubtotal,
  calculateLineSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  calculateChange,
  calculateCOGS,
  calculateGrossProfit,
  calculateNetProfit,
  calculateGrossMarginPercentage,
} from "../finance";

describe("Financial Calculations Engine", () => {
  it("calculates line subtotal with exact precision", () => {
    // 3 items at 19.99
    const subtotal = calculateLineSubtotal(3, "19.99");
    expect(subtotal.toFixed(2)).toBe("59.97");
  });

  it("calculates total subtotal across multiple items without floating point drift", () => {
    const items = [
      { quantity: 2, unitPrice: "0.10" },
      { quantity: 1, unitPrice: "0.20" },
      { quantity: 5, unitPrice: "100.55" },
    ];
    // 0.20 + 0.20 + 502.75 = 503.15
    const totalSub = calculateSubtotal(items);
    expect(totalSub.toFixed(2)).toBe("503.15");
  });

  it("calculates percentage discount accurately", () => {
    // 10% discount on 250.00 = 25.00
    const disc = calculateDiscount("250.00", 10, true);
    expect(disc.toFixed(2)).toBe("25.00");
  });

  it("calculates fixed discount and does not exceed subtotal", () => {
    const discNormal = calculateDiscount("100.00", "15.00", false);
    expect(discNormal.toFixed(2)).toBe("15.00");

    // Fixed discount of 150 on 100 should be capped at 100
    const discCapped = calculateDiscount("100.00", "150.00", false);
    expect(discCapped.toFixed(2)).toBe("100.00");
  });

  it("calculates sales tax percentage correctly", () => {
    // 8.5% tax on 100.00 = 8.50
    const tax = calculateTax("100.00", "8.5");
    expect(tax.toFixed(2)).toBe("8.50");
  });

  it("calculates final sale total (subtotal - discount + tax)", () => {
    // Subtotal: 1000, Discount: 100, Tax: 45 (5% on 900) -> Total = 945.00
    const total = calculateTotal("1000.00", "100.00", "45.00");
    expect(total.toFixed(2)).toBe("945.00");
  });

  it("calculates change given amount paid", () => {
    const change = calculateChange("1000.00", "945.00");
    expect(change.toFixed(2)).toBe("55.00");

    // Underpaid should return 0 change
    const underpaidChange = calculateChange("900.00", "945.00");
    expect(underpaidChange.toFixed(2)).toBe("0.00");
  });

  it("calculates COGS (Cost of Goods Sold)", () => {
    const items = [
      { quantity: 10, unitCostPrice: "50.00" }, // 500.00
      { quantity: 2, unitCostPrice: "120.50" },  // 241.00
    ];
    const cogs = calculateCOGS(items);
    expect(cogs.toFixed(2)).toBe("741.00");
  });

  it("calculates Gross Profit and Net Profit correctly (solving V1 omission)", () => {
    const revenue = "1500.00";
    const cogs = "741.00";
    const operatingExpenses = "300.00";

    // Real Gross Profit = 1500 - 741 = 759.00
    const grossProfit = calculateGrossProfit(revenue, cogs);
    expect(grossProfit.toFixed(2)).toBe("759.00");

    // Real Net Profit = 759 - 300 = 459.00
    const netProfit = calculateNetProfit(grossProfit, operatingExpenses);
    expect(netProfit.toFixed(2)).toBe("459.00");

    // Margin = (759 / 1500) * 100 = 50.60%
    const margin = calculateGrossMarginPercentage(revenue, cogs);
    expect(margin.toFixed(2)).toBe("50.60");
  });
});
