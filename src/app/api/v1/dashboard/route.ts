import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { FinanceService } from "@/services/finance.service";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const metrics = await FinanceService.getDashboardMetrics(businessId);
    return NextResponse.json({ success: true, ...metrics }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error loading dashboard" },
      { status }
    );
  }
}
