import { z } from "zod";

export const ExpenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  amount: z.number().positive("Expense amount must be greater than zero"),
  categoryId: z.string().uuid().optional().nullable(),
  expenseDate: z.string().optional(),
  receiptUrl: z.string().url().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const IncomeSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  amount: z.number().positive("Income amount must be greater than zero"),
  incomeDate: z.string().optional(),
  category: z.string().default("other"),
  notes: z.string().max(500).optional().nullable(),
});

export const ReportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
