import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const CustomerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(7, "Phone number is required").max(20),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const UpdateCustomerSchema = CustomerSchema.partial();

export const SupplierSchema = z.object({
  name: z.string().min(2, "Supplier contact name must be at least 2 characters").max(100),
  companyName: z.string().max(150).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(7, "Phone number is required").max(20),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const UpdateSupplierSchema = SupplierSchema.partial();

export const CustomerPaymentSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive("Payment amount must be greater than zero"),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNote: z.string().max(200).optional(),
});
