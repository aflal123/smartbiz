import { z } from "zod";
import { StockMovementType } from "@prisma/client";

export const CategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(150),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  costPrice: z.number().nonnegative("Cost price must be zero or positive").default(0),
  sellingPrice: z.number().positive("Selling price must be greater than zero"),
  stockQuantity: z.number().int().nonnegative("Stock quantity cannot be negative").default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  unit: z.string().default("pcs"),
  imageUrl: z.string().url().optional().nullable(),
});

export const UpdateProductSchema = ProductSchema.partial();

export const StockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional().nullable(),
  type: z.nativeEnum(StockMovementType),
  quantity: z.number().int().refine((q) => q !== 0, "Quantity cannot be zero"),
  notes: z.string().max(500).optional(),
});

export const BatchCreateSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1, "Batch number is required").max(100),
  costPrice: z.number().nonnegative("Cost price must be zero or positive"),
  quantity: z.number().int().positive("Initial quantity must be greater than zero"),
  expiryDate: z.string().datetime().optional().nullable(),
});
