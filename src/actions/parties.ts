"use server";

import { requireTenant, requireRole } from "@/lib/auth/session";
import { CustomerService, SupplierService } from "@/services/party.service";
import {
  CustomerSchema,
  UpdateCustomerSchema,
  SupplierSchema,
  UpdateSupplierSchema,
  CustomerPaymentSchema,
} from "@/lib/validations/party";
import { UserRole } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ── CUSTOMERS ACTIONS ───────────────────────────────────────────────

export async function getCustomersAction(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await CustomerService.getCustomers(businessId, params);
    return { success: true, message: "Customers fetched", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch customers",
    };
  }
}

export async function createCustomerAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const validated = CustomerSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid customer data",
      };
    }

    const customer = await CustomerService.createCustomer(businessId, validated.data);
    return { success: true, message: "Customer created successfully!", data: customer };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function updateCustomerAction(
  customerId: string,
  formData: unknown
): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const validated = UpdateCustomerSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid customer data",
      };
    }

    const updated = await CustomerService.updateCustomer(businessId, customerId, validated.data);
    return { success: true, message: "Customer updated successfully!", data: updated };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([UserRole.BUSINESS_OWNER, UserRole.MANAGER]);
    await CustomerService.deleteCustomer(businessId, customerId);
    return { success: true, message: "Customer removed successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}

export async function settleCustomerBalanceAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const validated = CustomerPaymentSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid payment data",
      };
    }

    const result = await CustomerService.settleBalance(businessId, user.id, validated.data);
    return { success: true, message: "Payment recorded and balance updated!", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Payment settlement failed",
    };
  }
}

// ── SUPPLIERS ACTIONS ───────────────────────────────────────────────

export async function getSuppliersAction(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await SupplierService.getSuppliers(businessId, params);
    return { success: true, message: "Suppliers fetched", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch suppliers",
    };
  }
}

export async function createSupplierAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([UserRole.BUSINESS_OWNER, UserRole.MANAGER]);
    const validated = SupplierSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid supplier data",
      };
    }

    const supplier = await SupplierService.createSupplier(businessId, validated.data);
    return { success: true, message: "Supplier created successfully!", data: supplier };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create supplier",
    };
  }
}

export async function updateSupplierAction(
  supplierId: string,
  formData: unknown
): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([UserRole.BUSINESS_OWNER, UserRole.MANAGER]);
    const validated = UpdateSupplierSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid supplier data",
      };
    }

    const updated = await SupplierService.updateSupplier(businessId, supplierId, validated.data);
    return { success: true, message: "Supplier updated successfully!", data: updated };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update supplier",
    };
  }
}

export async function deleteSupplierAction(supplierId: string): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([UserRole.BUSINESS_OWNER, UserRole.MANAGER]);
    await SupplierService.deleteSupplier(businessId, supplierId);
    return { success: true, message: "Supplier removed successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete supplier",
    };
  }
}
