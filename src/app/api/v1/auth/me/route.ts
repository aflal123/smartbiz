import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        business: user.business
          ? {
              id: user.business.id,
              name: user.business.name,
              currency: user.business.currency,
              timezone: user.business.timezone,
              subscriptionTier: user.business.subscriptionTier,
            }
          : null,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
