import { z } from "zod";
import { PaymentMethod, SaleStatus } from "@prisma/client";

export const SaleItemInputSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  batchId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitSellingPrice: z.number().positive("Unit price must be positive"),
  discount: z.number().nonnegative().default(0),
});

export const CreateSaleSchema = z.object({
  items: z.array(SaleItemInputSchema).min(1, "Sale must have at least one product line item"),
  customerId: z.string().uuid().optional().nullable(),
  discountAmount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0), // Tax percentage e.g. 8.0
  amountPaid: z.number().nonnegative(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  status: z.nativeEnum(SaleStatus).default(SaleStatus.COMPLETED),
  notes: z.string().max(500).optional().nullable(),
});

export const CancelSaleSchema = z.object({
  reason: z.string().max(300).optional(),
});
