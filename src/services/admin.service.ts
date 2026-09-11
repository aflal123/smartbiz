import { prisma } from "@/lib/prisma";
import { SubscriptionTier, SaleStatus, Prisma } from "@prisma/client";

export class AdminService {
  /**
   * Platform-wide aggregated statistics for Superadmin dashboard
   */
  static async getPlatformStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalBusinesses,
      activeBusinesses,
      totalUsers,
      totalSalesCount,
      totalRevenueAggregate,
      monthRevenueAggregate,
      aiUsageAggregate,
      recentBusinesses,
      topBusinesses,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.sale.count({ where: { status: { not: SaleStatus.CANCELLED } } }),
      prisma.sale.aggregate({
        where: { status: { not: SaleStatus.CANCELLED } },
        _sum: { totalAmount: true },
      }),
      prisma.sale.aggregate({
        where: {
          status: { not: SaleStatus.CANCELLED },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.aIUsage.aggregate({
        _count: { id: true },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          estimatedCost: true,
        },
      }),
      prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, products: true, sales: true } },
        },
      }),
      prisma.sale.groupBy({
        by: ["businessId"],
        where: { status: { not: SaleStatus.CANCELLED } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 5,
      }),
    ]);

    // Populate top businesses metadata
    const topBusinessesWithInfo = await Promise.all(
      topBusinesses.map(async (item) => {
        const b = await prisma.business.findUnique({
          where: { id: item.businessId },
          select: { name: true, slug: true, subscriptionTier: true },
        });
        return {
          businessId: item.businessId,
          name: b?.name || "Business",
          slug: b?.slug,
          subscriptionTier: b?.subscriptionTier,
          salesCount: item._count.id || 0,
          totalRevenue: Number(item._sum.totalAmount || 0),
        };
      })
    );

    return {
      totals: {
        businesses: totalBusinesses,
        activeBusinesses,
        users: totalUsers,
        salesCount: totalSalesCount,
        platformRevenue: Number(totalRevenueAggregate._sum.totalAmount || 0),
        monthRevenue: Number(monthRevenueAggregate._sum.totalAmount || 0),
      },
      aiUsage: {
        totalRequests: aiUsageAggregate._count.id || 0,
        totalTokens:
          (aiUsageAggregate._sum.inputTokens || 0) +
          (aiUsageAggregate._sum.outputTokens || 0),
        totalCostUSD: Number(aiUsageAggregate._sum.estimatedCost || 0),
      },
      recentBusinesses,
      topBusinesses: topBusinessesWithInfo,
    };
  }

  /**
   * List all registered businesses with pagination and filter
   */
  static async getAllBusinesses(params: {
    search?: string;
    subscriptionTier?: SubscriptionTier;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.BusinessWhereInput = {};

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    if (params.subscriptionTier) {
      where.subscriptionTier = params.subscriptionTier;
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true, products: true, sales: true },
          },
        },
      }),
      prisma.business.count({ where }),
    ]);

    return {
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single business details with comprehensive counts
   */
  static async getBusinessDetails(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
        },
        _count: {
          select: { products: true, customers: true, suppliers: true, sales: true, expenses: true },
        },
      },
    });

    if (!business) {
      throw new Error("Business not found.");
    }

    const revenue = await prisma.sale.aggregate({
      where: { businessId, status: { not: SaleStatus.CANCELLED } },
      _sum: { totalAmount: true },
    });

    return {
      ...business,
      totalRevenue: Number(revenue._sum.totalAmount || 0),
    };
  }

  /**
   * Toggle business account active/suspended status
   */
  static async toggleBusinessStatus(businessId: string, isActive: boolean) {
    return prisma.business.update({
      where: { id: businessId },
      data: { isActive },
    });
  }

  /**
   * Update business subscription plan
   */
  static async updateBusinessSubscription(businessId: string, tier: SubscriptionTier) {
    return prisma.business.update({
      where: { id: businessId },
      data: { subscriptionTier: tier },
    });
  }

  /**
   * Query system audit logs
   */
  static async getSystemAuditLogs(params: {
    businessId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (params.businessId) where.businessId = params.businessId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          business: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
