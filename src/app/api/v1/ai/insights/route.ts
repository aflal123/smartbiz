import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function GET(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const insights = await AIService.generateBusinessInsights(businessId, user.id);
    return NextResponse.json({ success: true, insights }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error generating insights" },
      { status }
    );
  }
}
