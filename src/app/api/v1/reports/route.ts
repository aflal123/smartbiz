import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { FinanceService } from "@/services/finance.service";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const report = await FinanceService.getFinancialReport(businessId, startDate, endDate);
    return NextResponse.json({ success: true, report }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error generating report" },
      { status }
    );
  }
}
