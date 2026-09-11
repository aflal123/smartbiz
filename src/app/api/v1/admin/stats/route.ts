import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const stats = await AdminService.getPlatformStats();
    return NextResponse.json({ success: true, ...stats }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 403;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Access denied" },
      { status }
    );
  }
}
