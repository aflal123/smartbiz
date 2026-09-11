"use server";

import { requireTenant } from "@/lib/auth/session";
import { SaleService, CreateSaleInput, SaleFilterParams } from "@/services/sale.service";
import { CreateSaleSchema, CancelSaleSchema } from "@/lib/validations/sale";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Atomic POS Sale creation
 */
export async function createSaleAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const validated = CreateSaleSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid sale input data",
      };
    }

    const sale = await SaleService.createSale(
      businessId,
      user.id,
      validated.data as CreateSaleInput
    );

    return {
      success: true,
      message: `Sale ${sale?.invoiceNumber} completed successfully!`,
      data: sale,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process sale transaction",
    };
  }
}

/**
 * Fetch sales list
 */
export async function getSalesAction(params: SaleFilterParams = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await SaleService.getSales(businessId, params);
    return {
      success: true,
      message: "Sales fetched successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch sales",
    };
  }
}

/**
 * Fetch sale details
 */
export async function getSaleDetailsAction(saleId: string): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const sale = await SaleService.getSaleById(businessId, saleId);
    return {
      success: true,
      message: "Sale details loaded",
      data: sale,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load sale details",
    };
  }
}

/**
 * Cancel a sale and restore inventory
 */
export async function cancelSaleAction(
  saleId: string,
  formData?: unknown
): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const validated = CancelSaleSchema.safeParse(formData || {});

    const cancelled = await SaleService.cancelSale(
      businessId,
      user.id,
      saleId,
      validated.success ? validated.data.reason : undefined
    );

    return {
      success: true,
      message: `Sale ${cancelled.invoiceNumber} has been cancelled and inventory restored.`,
      data: cancelled,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to cancel sale",
    };
  }
}
