import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const body = await request.json();

    const { platform, campaignGoal, productName, discountOffer, additionalNotes } = body;
    if (!platform || !campaignGoal) {
      return NextResponse.json(
        { success: false, message: "platform and campaignGoal are required" },
        { status: 400 }
      );
    }

    const content = await AIService.generateMarketingContent(businessId, user.id, {
      platform,
      campaignGoal,
      productName,
      discountOffer,
      additionalNotes,
    });

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error generating marketing copy" },
      { status }
    );
  }
}
