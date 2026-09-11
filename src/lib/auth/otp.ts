import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { OtpType } from "@prisma/client";

const OTP_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash an OTP using SHA-256 so plaintext codes are NEVER stored in the database
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Secure timing-safe comparison of hashed OTPs
 */
export function verifyHashedOtp(inputOtp: string, storedHash: string): boolean {
  const inputHash = hashOtp(inputOtp);
  try {
    return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

/**
 * Generate and store a secure hashed OTP for verification or password recovery
 */
export async function createOrUpdateOtp(
  identifier: string,
  type: OtpType
): Promise<{ otp: string; expiresAt: Date }> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Check rate limiting / resend cooldown
  const recentOtp = await prisma.otpVerification.findFirst({
    where: {
      identifier: normalizedIdentifier,
      type,
      isUsed: false,
      createdAt: {
        gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000),
      },
    },
  });

  if (recentOtp) {
    throw new Error(
      `Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting a new verification code.`
    );
  }

  // Invalidate any previous unused OTPs for this identifier and type
  await prisma.otpVerification.updateMany({
    where: {
      identifier: normalizedIdentifier,
      type,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  const otp = generateSecureOtp();
  const hashedOtp = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpVerification.create({
    data: {
      identifier: normalizedIdentifier,
      hashedOtp,
      type,
      expiresAt,
      attempts: 0,
      isUsed: false,
    },
  });

  return { otp, expiresAt };
}

/**
 * Verify and consume an OTP
 */
export async function verifyAndConsumeOtp(
  identifier: string,
  type: OtpType,
  inputOtp: string
): Promise<{ success: boolean; message: string }> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const cleanOtp = inputOtp.trim();

  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      identifier: normalizedIdentifier,
      type,
      isUsed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return {
      success: false,
      message: "No pending verification code found. Please request a new one.",
    };
  }

  // Check expiration
  if (new Date() > otpRecord.expiresAt) {
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return {
      success: false,
      message: "Verification code has expired. Please request a new one.",
    };
  }

  // Check maximum attempts
  if (otpRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return {
      success: false,
      message: "Too many incorrect attempts. This code has been invalidated. Please request a new one.",
    };
  }

  // Verify code using timing-safe hash comparison
  const isValid = verifyHashedOtp(cleanOtp, otpRecord.hashedOtp);

  if (!isValid) {
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_VERIFICATION_ATTEMPTS - (otpRecord.attempts + 1);
    return {
      success: false,
      message: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Mark code as used (single-use)
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return {
    success: true,
    message: "Verification successful.",
  };
}
