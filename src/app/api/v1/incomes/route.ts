import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireRole } from "@/lib/auth/session";
import { FinanceService } from "@/services/finance.service";
import { IncomeSchema } from "@/lib/validations/finance";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await FinanceService.getIncomes(businessId, {
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error fetching incomes" },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireRole(
      [UserRole.BUSINESS_OWNER, UserRole.MANAGER],
      request
    );
    const body = await request.json();

    const validated = IncomeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const income = await FinanceService.createIncome(businessId, user.id, validated.data);
    return NextResponse.json({ success: true, income }, { status: 201 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error creating income" },
      { status }
    );
  }
}
