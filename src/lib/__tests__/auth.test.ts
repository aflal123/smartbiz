import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../auth/password";
import { generateSecureOtp, hashOtp, verifyHashedOtp } from "../auth/otp";
import { signAuthToken, verifyAuthToken } from "../auth/jwt";
import { UserRole } from "@prisma/client";

describe("Authentication & Security Engine", () => {
  it("hashes passwords securely with salt and verifies matches", async () => {
    const password = "StrongPassword123!";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("generates cryptographically secure 6-digit numeric OTPs", () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateSecureOtp();
      expect(otp).toMatch(/^\d{6}$/);
      expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
    }
  });

  it("hashes OTPs with SHA-256 and verifies with timing-safe comparison", () => {
    const otp = "849201";
    const hashed = hashOtp(otp);

    expect(hashed.length).toBe(64); // SHA-256 hex length
    expect(verifyHashedOtp(otp, hashed)).toBe(true);
    expect(verifyHashedOtp("849200", hashed)).toBe(false);
  });

  it("signs and verifies JWT tokens with complete tenant and role context", async () => {
    const payload = {
      userId: "usr-12345",
      email: "owner@smartbiz.com",
      role: UserRole.BUSINESS_OWNER,
      businessId: "biz-99999",
    };

    const token = await signAuthToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifyAuthToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.businessId).toBe(payload.businessId);
  });

  it("rejects invalid or tampered JWT tokens", async () => {
    const validToken = await signAuthToken({
      userId: "usr-12345",
      email: "owner@smartbiz.com",
      role: UserRole.BUSINESS_OWNER,
      businessId: "biz-99999",
    });

    // Tamper with the signature
    const tampered = validToken.slice(0, -5) + "abcde";
    const decoded = await verifyAuthToken(tampered);
    expect(decoded).toBeNull();
  });
});
