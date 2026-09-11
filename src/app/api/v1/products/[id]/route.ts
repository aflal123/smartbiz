import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireRole } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { UpdateProductSchema } from "@/lib/validations/product";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireTenant(request);
    const { id } = await params;

    const product = await ProductService.getProductById(businessId, id);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 404;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Product not found" },
      { status }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { businessId } = await requireRole(
      [UserRole.BUSINESS_OWNER, UserRole.MANAGER],
      request
    );
    const { id } = await params;

    const body = await request.json();
    const validated = UpdateProductSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const product = await ProductService.updateProduct(businessId, id, validated.data);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error updating product" },
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

    await ProductService.deleteProduct(businessId, id);
    return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error deleting product" },
      { status }
    );
  }
}
