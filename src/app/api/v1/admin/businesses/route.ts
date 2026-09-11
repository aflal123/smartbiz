import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import { SubscriptionTier } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const subscriptionTier = (searchParams.get("tier") as SubscriptionTier) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await AdminService.getAllBusinesses({ search, subscriptionTier, page, limit });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 403;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Access denied" },
      { status }
    );
  }
}
