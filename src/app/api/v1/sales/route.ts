import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { SaleService, CreateSaleInput } from "@/services/sale.service";
import { CreateSaleSchema } from "@/lib/validations/sale";
import { PaymentMethod, SaleStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const cashierId = searchParams.get("cashierId") || undefined;
    const status = (searchParams.get("status") as SaleStatus) || undefined;
    const paymentMethod = (searchParams.get("paymentMethod") as PaymentMethod) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await SaleService.getSales(businessId, {
      startDate,
      endDate,
      customerId,
      cashierId,
      status,
      paymentMethod,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error fetching sales" },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const body = await request.json();

    const validated = CreateSaleSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid sale input" },
        { status: 400 }
      );
    }

    const sale = await SaleService.createSale(
      businessId,
      user.id,
      validated.data as CreateSaleInput
    );

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error processing sale" },
      { status }
    );
  }
}
