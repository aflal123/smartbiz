"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createOrUpdateOtp, verifyAndConsumeOtp } from "@/lib/auth/otp";
import { signAuthToken, setAuthCookie, clearAuthCookie } from "@/lib/auth/jwt";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  RegisterSchema,
  VerifyOtpSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/lib/validations/auth";
import { OtpType, UserRole } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  requiresOtp?: boolean;
}

/**
 * Step 1: Initiate Business Owner Registration
 * Sends 6-digit OTP to user's email before creating the actual account
 */
export async function registerAction(formData: unknown): Promise<ActionResult<{ email: string }>> {
  try {
    const validated = RegisterSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid input data",
      };
    }

    const { name, email } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email address already exists. Please log in.",
      };
    }

    // Generate secure hashed OTP
    const { otp } = await createOrUpdateOtp(normalizedEmail, OtpType.EMAIL_VERIFICATION);

    // Send OTP verification email
    await sendOtpEmail(normalizedEmail, name, otp);

    return {
      success: true,
      message: `Verification code sent to ${normalizedEmail}. Please enter the 6-digit code to complete registration.`,
      requiresOtp: true,
      data: { email: normalizedEmail },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed. Please try again.",
    };
  }
}

/**
 * Step 2: Verify OTP and Provision Business + Owner atomically
 */
export async function verifyRegistrationOtpAction(
  formData: unknown
): Promise<ActionResult<{ token: string; user: { id: string; name: string; email: string; businessName: string } }>> {
  try {
    const validated = VerifyOtpSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid input data",
      };
    }

    const { email, otp, name, password, businessName, phone, currency } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP
    const verification = await verifyAndConsumeOtp(
      normalizedEmail,
      OtpType.EMAIL_VERIFICATION,
      otp
    );

    if (!verification.success) {
      return {
        success: false,
        message: verification.message,
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create unique business slug e.g. "my-store-1a2b"
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const uniqueSlug = `${baseSlug || "store"}-${Math.random().toString(36).substring(2, 7)}`;

    // Execute atomic provisioning of Business + Owner User + Default Categories
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Business Tenant
      const business = await tx.business.create({
        data: {
          name: businessName.trim(),
          slug: uniqueSlug,
          email: normalizedEmail,
          phone: phone || null,
          currency: currency || "LKR",
          isActive: true,
        },
      });

      // 2. Create Owner User
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone || null,
          role: UserRole.BUSINESS_OWNER,
          businessId: business.id,
          isActive: true,
          isEmailVerified: true,
        },
      });

      // 3. Seed default expense categories for standard SME bookkeeping
      const defaultCategories = [
        "Rent",
        "Salaries",
        "Utilities",
        "Supplies",
        "Marketing",
        "Maintenance",
        "Other",
      ];

      await tx.expenseCategory.createMany({
        data: defaultCategories.map((cat) => ({
          businessId: business.id,
          name: cat,
        })),
        skipDuplicates: true,
      });

      return { business, user };
    });

    // Create JWT Token and set session cookie
    const token = await signAuthToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      businessId: result.business.id,
    });

    await setAuthCookie(token);

    return {
      success: true,
      message: "Business registered and verified successfully! Welcome to SmartBiz.",
      data: {
        token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          businessName: result.business.name,
        },
      },
    };
  } catch (error) {
    console.error("OTP verification & business provisioning error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Verification failed. Please try again.",
    };
  }
}

/**
 * Resend verification OTP
 */
export async function resendRegistrationOtpAction(
  email: string,
  name = "Merchant"
): Promise<ActionResult> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { otp } = await createOrUpdateOtp(normalizedEmail, OtpType.EMAIL_VERIFICATION);
    await sendOtpEmail(normalizedEmail, name, otp);

    return {
      success: true,
      message: "A new verification code has been sent to your email.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to resend code. Please wait a minute.",
    };
  }
}

/**
 * User Login
 */
export async function loginAction(
  formData: unknown
): Promise<ActionResult<{ token: string; user: { id: string; name: string; email: string; role: string; businessName?: string } }>> {
  try {
    const validated = LoginSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid email or password",
      };
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        business: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "Your account has been deactivated. Please contact your business administrator.",
      };
    }

    if (user.business && !user.business.isActive) {
      return {
        success: false,
        message: "Your business account is currently inactive.",
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Check email verification
    if (!user.isEmailVerified) {
      const { otp } = await createOrUpdateOtp(normalizedEmail, OtpType.EMAIL_VERIFICATION);
      await sendOtpEmail(normalizedEmail, user.name, otp);

      return {
        success: false,
        message: "Your email address is not verified yet. A verification code has been sent to your email.",
        requiresOtp: true,
        data: undefined,
      };
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    });

    await setAuthCookie(token);

    return {
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessName: user.business?.name,
        },
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (
      msg.includes("Can't reach database") ||
      msg.includes("P1001") ||
      msg.includes("does not exist in the current database") ||
      msg.includes("P2021") ||
      msg.includes("DATABASE_URL")
    ) {
      return {
        success: false,
        message: "Database connection failed. Please check DATABASE_URL and ensure database migrations are pushed.",
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred during login. Please try again.",
    };
  }
}

/**
 * Logout
 */
export async function logoutAction(): Promise<ActionResult> {
  await clearAuthCookie();
  return {
    success: true,
    message: "Logged out successfully.",
  };
}

/**
 * Request Password Reset (Forgot Password)
 */
export async function forgotPasswordAction(formData: unknown): Promise<ActionResult<{ email: string }>> {
  try {
    const validated = ForgotPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Please provide a valid email",
      };
    }

    const { email } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Security practice: always return success to prevent email enumeration
    if (user && user.isActive) {
      try {
        const { otp } = await createOrUpdateOtp(normalizedEmail, OtpType.PASSWORD_RESET);
        await sendPasswordResetEmail(normalizedEmail, user.name, otp);
      } catch (err) {
        console.error("Password reset OTP error:", err);
      }
    }

    return {
      success: true,
      message: "If an account with this email exists, a 6-digit password reset code has been sent.",
      data: { email: normalizedEmail },
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (
      msg.includes("Can't reach database") ||
      msg.includes("P1001") ||
      msg.includes("does not exist in the current database") ||
      msg.includes("P2021") ||
      msg.includes("DATABASE_URL")
    ) {
      return {
        success: false,
        message: "Database connection failed. Please check DATABASE_URL in environment variables.",
      };
    }
    return {
      success: false,
      message: "Unable to process request. Please try again later.",
    };
  }
}

/**
 * Reset Password with Verified OTP
 */
export async function resetPasswordAction(formData: unknown): Promise<ActionResult> {
  try {
    const validated = ResetPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid input data",
      };
    }

    const { email, otp, newPassword } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP
    const verification = await verifyAndConsumeOtp(
      normalizedEmail,
      OtpType.PASSWORD_RESET,
      otp
    );

    if (!verification.success) {
      return {
        success: false,
        message: verification.message,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: false,
        message: "User account not found.",
      };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Password reset failed. Please try again.",
    };
  }
}
