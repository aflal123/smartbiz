"use server";

import { requireSuperAdmin } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import { SubscriptionTier } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export async function getPlatformStatsAction(): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const stats = await AdminService.getPlatformStats();
    return { success: true, message: "Platform stats loaded", data: stats };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unauthorized platform access",
    };
  }
}

export async function getAllBusinessesAction(params: {
  search?: string;
  subscriptionTier?: SubscriptionTier;
  page?: number;
  limit?: number;
} = {}): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const result = await AdminService.getAllBusinesses(params);
    return { success: true, message: "Businesses loaded", data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unauthorized platform access",
    };
  }
}

export async function getBusinessDetailsAction(businessId: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const details = await AdminService.getBusinessDetails(businessId);
    return { success: true, message: "Business details loaded", data: details };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unauthorized platform access",
    };
  }
}

export async function toggleBusinessStatusAction(
  businessId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const updated = await AdminService.toggleBusinessStatus(businessId, isActive);
    return {
      success: true,
      message: `Business ${isActive ? "activated" : "suspended"} successfully.`,
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to toggle status",
    };
  }
}

export async function updateBusinessSubscriptionAction(
  businessId: string,
  tier: SubscriptionTier
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const updated = await AdminService.updateBusinessSubscription(businessId, tier);
    return {
      success: true,
      message: `Subscription plan updated to ${tier}.`,
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update subscription",
    };
  }
}
