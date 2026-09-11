"use server";

import { requireTenant, requireRole } from "@/lib/auth/session";
import { FinanceService } from "@/services/finance.service";
import { ExpenseSchema, IncomeSchema, ReportQuerySchema } from "@/lib/validations/finance";
import { UserRole } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export async function getDashboardMetricsAction(): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const metrics = await FinanceService.getDashboardMetrics(businessId);
    return { success: true, message: "Dashboard metrics loaded", data: metrics };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load dashboard metrics",
    };
  }
}

export async function getExpensesAction(params: {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await FinanceService.getExpenses(businessId, params);
    return { success: true, message: "Expenses loaded", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load expenses",
    };
  }
}

export async function createExpenseAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = ExpenseSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid expense data",
      };
    }

    const expense = await FinanceService.createExpense(businessId, user.id, validated.data);
    return { success: true, message: "Expense recorded successfully!", data: expense };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record expense",
    };
  }
}

export async function deleteExpenseAction(expenseId: string): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    await FinanceService.deleteExpense(businessId, expenseId);
    return { success: true, message: "Expense record deleted" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

export async function getIncomesAction(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await FinanceService.getIncomes(businessId, params);
    return { success: true, message: "Incomes loaded", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load incomes",
    };
  }
}

export async function createIncomeAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = IncomeSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid income data",
      };
    }

    const income = await FinanceService.createIncome(businessId, user.id, validated.data);
    return { success: true, message: "Income recorded successfully!", data: income };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record income",
    };
  }
}

export async function getFinancialReportAction(params: unknown = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const validated = ReportQuerySchema.safeParse(params);

    const report = await FinanceService.getFinancialReport(
      businessId,
      validated.success ? validated.data.startDate : undefined,
      validated.success ? validated.data.endDate : undefined
    );

    return { success: true, message: "Report generated", data: report };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}
