import { NextRequest, NextResponse } from "next/server";
import { loginAction } from "@/actions/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await loginAction(body);

    if (!result.success) {
      const status = result.requiresOtp ? 403 : 401;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
