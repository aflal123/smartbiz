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

    const receipt = {
      business: {
        name: sale.business?.name,
        email: sale.business?.email,
        phone: sale.business?.phone,
        address: sale.business?.address,
        currency: sale.business?.currency,
        footer: sale.business?.receiptFooter || "Thank you for shopping with us!",
      },
      invoiceNumber: sale.invoiceNumber,
      date: sale.createdAt,
      cashier: sale.cashier?.name,
      customer: sale.customer ? { name: sale.customer.name, phone: sale.customer.phone } : null,
      items: sale.items.map((item) => ({
        name: item.product?.name,
        sku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: item.unitSellingPrice,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      subtotal: sale.subtotal,
      discountAmount: sale.discountAmount,
      taxAmount: sale.taxAmount,
      totalAmount: sale.totalAmount,
      amountPaid: sale.amountPaid,
      changeAmount: sale.changeAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
    };

    return NextResponse.json({ success: true, receipt }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 404;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Receipt not found" },
      { status }
    );
  }
}
