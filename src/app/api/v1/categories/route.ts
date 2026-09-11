import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireRole } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { CategorySchema } from "@/lib/validations/product";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { businessId } = await requireTenant(request);
    const categories = await ProductService.getCategories(businessId);
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error fetching categories" },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await requireRole(
      [UserRole.BUSINESS_OWNER, UserRole.MANAGER],
      request
    );

    const body = await request.json();
    const validated = CategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const category = await ProductService.createCategory(
      businessId,
      validated.data.name,
      validated.data.description
    );

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error creating category" },
      { status }
    );
  }
}
