import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { SaleService } from "@/services/sale.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireTenant(request);
    const { id } = await params;

    const sale = await SaleService.getSaleById(businessId, id);
    return NextResponse.json({ success: true, sale }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 404;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Sale not found" },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId, user } = await requireTenant(request);
    const { id } = await params;

    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body is optional
    }

    const cancelled = await SaleService.cancelSale(businessId, user.id, id, reason);
    return NextResponse.json(
      { success: true, message: "Sale cancelled and stock restored", sale: cancelled },
      { status: 200 }
    );
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error cancelling sale" },
      { status }
    );
  }
}
