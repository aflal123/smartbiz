import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const usage = await AIService.getUsageHistory(businessId);
    return NextResponse.json({ success: true, ...usage }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error fetching AI usage" },
      { status }
    );
  }
}
