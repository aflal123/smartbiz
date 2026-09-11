"use server";

import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export async function getBusinessInsightsAction(): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const insights = await AIService.generateBusinessInsights(businessId, user.id);
    return { success: true, message: "Insights generated", data: insights };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate business insights",
    };
  }
}

export async function composeEmailAction(params: {
  recipientType: "supplier" | "customer";
  recipientName: string;
  purpose: string;
  tone: "professional" | "friendly" | "urgent" | "concise";
  details: string;
}): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const email = await AIService.composeBusinessEmail(businessId, user.id, params);
    return { success: true, message: "Email draft generated", data: email };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate email draft",
    };
  }
}

export async function generateMarketingAction(params: {
  platform: "facebook" | "instagram" | "whatsapp" | "flyer";
  campaignGoal: string;
  productName?: string;
  discountOffer?: string;
  additionalNotes?: string;
}): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const content = await AIService.generateMarketingContent(businessId, user.id, params);
    return { success: true, message: "Marketing content generated", data: content };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate marketing content",
    };
  }
}

export async function summarizeInvoiceAction(invoiceNumber: string): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const summary = await AIService.summarizeInvoice(businessId, user.id, invoiceNumber);
    return { success: true, message: "Invoice summary ready", data: summary };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate invoice summary",
    };
  }
}

export async function chatWithBusinessAction(question: string): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireTenant();
    const response = await AIService.chatWithBusiness(businessId, user.id, question);
    return { success: true, message: "AI response generated", data: response };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to query AI assistant",
    };
  }
}

export async function getAIUsageAction(): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const usage = await AIService.getUsageHistory(businessId);
    return { success: true, message: "AI usage history fetched", data: usage };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch AI usage history",
    };
  }
}
