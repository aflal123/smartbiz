import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const body = await request.json();

    const { recipientType, recipientName, purpose, tone, details } = body;
    if (!recipientName || !purpose || !details) {
      return NextResponse.json(
        { success: false, message: "recipientName, purpose, and details are required" },
        { status: 400 }
      );
    }

    const email = await AIService.composeBusinessEmail(businessId, user.id, {
      recipientType: recipientType || "customer",
      recipientName,
      purpose,
      tone: tone || "professional",
      details,
    });

    return NextResponse.json({ success: true, email }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error composing email" },
      { status }
    );
  }
}
