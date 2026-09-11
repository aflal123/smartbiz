import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "smartbiz_session";
const JWT_SECRET_STRING = process.env.JWT_SECRET || "fallback-secret-for-development-mode-min-32-chars";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AuthSessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  businessId: string | null;
}

/**
 * Sign an authentic JWT token valid for 7 days
 */
export async function signAuthToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT token and extract the session payload
 */
export async function verifyAuthToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      businessId: (payload.businessId as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Set HTTP-Only, Secure session cookie in Next.js Server Action or Route Handler
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear session cookie on logout
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Extract auth token from incoming Request headers or cookies
 */
export async function extractTokenFromRequest(request?: Request): Promise<string | null> {
  // 1. Check Authorization header: "Bearer <token>" (e.g. mobile app)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }

  // 2. Check Next.js cookies
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }
  } catch {
    // In environments where cookies() cannot be called
  }

  return null;
}
