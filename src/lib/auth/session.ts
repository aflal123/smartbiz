import { prisma } from "@/lib/prisma";
import { extractTokenFromRequest, verifyAuthToken } from "@/lib/auth/jwt";
import { UserRole } from "@prisma/client";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

/**
 * Get the current authenticated session without throwing
 */
export async function getCurrentSession(request?: Request) {
  const token = await extractTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      business: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

/**
 * Require an authenticated user or throw AuthError(401)
 */
export async function requireAuth(request?: Request) {
  const user = await getCurrentSession(request);
  if (!user) {
    throw new AuthError("Authentication required. Please log in.", 401);
  }
  return user;
}

/**
 * Require an authenticated user belonging to an active tenant (Business)
 * This guarantees tenant isolation — all downstream queries can safely use tenantContext.businessId
 */
export async function requireTenant(request?: Request) {
  const user = await requireAuth(request);

  if (!user.businessId || !user.business) {
    // Super admins without a business must not access business-scoped endpoints directly
    throw new AuthError("No active business tenant associated with this account.", 403);
  }

  if (!user.business.isActive) {
    throw new AuthError("This business account is currently inactive or suspended.", 403);
  }

  return {
    user,
    business: user.business,
    businessId: user.businessId,
    role: user.role,
  };
}

/**
 * Require specific user roles within the business
 */
export async function requireRole(allowedRoles: UserRole[], request?: Request) {
  const tenant = await requireTenant(request);

  if (!allowedRoles.includes(tenant.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }

  return tenant;
}

/**
 * Require Super Admin platform access
 */
export async function requireSuperAdmin(request?: Request) {
  const user = await requireAuth(request);

  if (user.role !== UserRole.SUPER_ADMIN) {
    throw new AuthError("Super Administrator access required.", 403);
  }

  return user;
}
