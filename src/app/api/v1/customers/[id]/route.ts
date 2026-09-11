import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireRole } from "@/lib/auth/session";
import { CustomerService } from "@/services/party.service";
import { UpdateCustomerSchema } from "@/lib/validations/party";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireTenant(request);
    const { id } = await params;

    const customer = await CustomerService.getCustomerById(businessId, id);
    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 404;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Customer not found" },
      { status }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireTenant(request);
    const { id } = await params;

    const body = await request.json();
    const validated = UpdateCustomerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const customer = await CustomerService.updateCustomer(businessId, id, validated.data);
    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error updating customer" },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireRole(
      [UserRole.BUSINESS_OWNER, UserRole.MANAGER],
      request
    );
    const { id } = await params;

    await CustomerService.deleteCustomer(businessId, id);
    return NextResponse.json({ success: true, message: "Customer removed" }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error removing customer" },
      { status }
    );
  }
}
