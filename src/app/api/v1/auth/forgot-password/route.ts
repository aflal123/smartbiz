import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordAction } from "@/actions/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await forgotPasswordAction(body);

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
