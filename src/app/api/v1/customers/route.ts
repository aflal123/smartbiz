import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { CustomerService } from "@/services/party.service";
import { CustomerSchema } from "@/lib/validations/party";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await CustomerService.getCustomers(businessId, { search, page, limit });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error fetching customers" },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const body = await request.json();

    const validated = CustomerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const customer = await CustomerService.createCustomer(businessId, validated.data);
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error creating customer" },
      { status }
    );
  }
}
