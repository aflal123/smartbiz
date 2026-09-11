import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationOtpAction } from "@/actions/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await verifyRegistrationOtpAction(body);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
