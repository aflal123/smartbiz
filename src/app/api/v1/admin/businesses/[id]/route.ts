import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import { SubscriptionTier } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin(request);
    const { id } = await params;
    const business = await AdminService.getBusinessDetails(id);
    return NextResponse.json({ success: true, business }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 404;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Business not found" },
      { status }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin(request);
    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const updated = await AdminService.toggleBusinessStatus(id, body.isActive);
      return NextResponse.json({ success: true, business: updated }, { status: 200 });
    }

    if (body.subscriptionTier && Object.values(SubscriptionTier).includes(body.subscriptionTier)) {
      const updated = await AdminService.updateBusinessSubscription(id, body.subscriptionTier);
      return NextResponse.json({ success: true, business: updated }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "No valid update field provided" }, { status: 400 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error updating business" },
      { status }
    );
  }
}
