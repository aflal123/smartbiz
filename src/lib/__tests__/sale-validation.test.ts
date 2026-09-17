import { describe, it, expect } from "vitest";
import { CreateSaleSchema } from "@/lib/validations/sale";
import { PaymentMethod, SaleStatus } from "@prisma/client";

describe("CreateSaleSchema Deep Validation Tests", () => {
  const validUUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  it("should successfully parse and coerce string prices, quantities, and totals", () => {
    const rawInput = {
      items: [
        {
          productId: validUUID,
          quantity: "2", // string from HTML input or serialized state
          unitSellingPrice: "2200.50", // string from Decimal JSON serialization
          discount: "0",
        },
      ],
      discountAmount: "0",
      taxRate: "0",
      amountPaid: "4401.00",
      paymentMethod: PaymentMethod.CASH,
      status: SaleStatus.COMPLETED,
      notes: "POS order by Walk-in Customer",
    };

    const result = CreateSaleSchema.safeParse(rawInput);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.items[0].quantity).toBe(2);
      expect(typeof result.data.items[0].quantity).toBe("number");
      expect(result.data.items[0].unitSellingPrice).toBe(2200.5);
      expect(typeof result.data.items[0].unitSellingPrice).toBe("number");
      expect(result.data.amountPaid).toBe(4401);
      expect(typeof result.data.amountPaid).toBe("number");
    }
  });

  it("should handle empty string customerId by transforming to null", () => {
    const rawInput = {
      items: [
        {
          productId: validUUID,
          quantity: 1,
          unitSellingPrice: 1500,
          discount: 0,
        },
      ],
      customerId: "",
      discountAmount: 0,
      taxRate: 0,
      amountPaid: 1500,
      paymentMethod: PaymentMethod.CASH,
    };

    const result = CreateSaleSchema.safeParse(rawInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBeNull();
    }
  });

  it("should reject negative prices or zero quantities", () => {
    const invalidInput = {
      items: [
        {
          productId: validUUID,
          quantity: 0,
          unitSellingPrice: -50,
        },
      ],
      amountPaid: 0,
    };

    const result = CreateSaleSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
