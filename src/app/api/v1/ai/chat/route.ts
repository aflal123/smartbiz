import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/session";
import { AIService } from "@/services/ai.service";

export async function POST(request: NextRequest) {
  try {
    const { businessId, user } = await requireTenant(request);
    const body = await request.json();

    const { question } = body;
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { success: false, message: "question string is required" },
        { status: 400 }
      );
    }

    const response = await AIService.chatWithBusiness(businessId, user.id, question.trim());
    return NextResponse.json({ success: true, ...response }, { status: 200 });
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error with AI assistant" },
      { status }
    );
  }
}
