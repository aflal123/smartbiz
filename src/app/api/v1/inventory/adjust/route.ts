import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { StockAdjustmentSchema } from "@/lib/validations/product";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireRole(
      [UserRole.BUSINESS_OWNER, UserRole.MANAGER],
      request
    );

    const body = await request.json();
    const validated = StockAdjustmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = await ProductService.adjustStock(businessId, user.id, validated.data);

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error adjusting stock" },
      { status }
    );
  }
}
