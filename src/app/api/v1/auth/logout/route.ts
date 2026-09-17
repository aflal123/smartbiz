import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/jwt";

/**
 * Clean Logout Route
 * Deletes the session cookie and redirects user to login.
 */
export async function POST(request: NextRequest) {
  await clearAuthCookie();
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function GET(request: NextRequest) {
  await clearAuthCookie();
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl, { status: 303 });
}
