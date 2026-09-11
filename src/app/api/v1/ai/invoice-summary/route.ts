import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const body = await request.json();

    const { invoiceNumber } = body;
    if (!invoiceNumber) {
      return NextResponse.json(
        { success: false, message: "invoiceNumber is required" },
        { status: 400 }
      );
    }

    const summary = await AIService.summarizeInvoice(businessId, user.id, invoiceNumber);
    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error summarizing invoice" },
      { status }
    );
  }
}
