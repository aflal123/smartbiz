import { prisma } from "@/lib/prisma";
import {
  calculateGrossProfit,
  calculateNetProfit,
  calculateGrossMarginPercentage,
} from "@/lib/finance";
import { Prisma, SaleStatus } from "@prisma/client";
import Decimal from "decimal.js";

export class FinanceService {
  /**
   * Fetch Expenses with pagination and category details
   */
  static async getExpenses(
    businessId: string,
    params: {
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = { businessId };

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.startDate || params.endDate) {
      where.expenseDate = {};
      if (params.startDate) where.expenseDate.gte = new Date(params.startDate);
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    const [expenses, totalCount, aggregate] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      expenses,
      totalAmount: aggregate._sum.amount ? Number(aggregate._sum.amount) : 0,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async createExpense(
    businessId: string,
    userId: string,
    data: {
      title: string;
      amount: number;
      categoryId?: string | null;
      expenseDate?: string;
      receiptUrl?: string | null;
      notes?: string | null;
    }
  ) {
    return prisma.expense.create({
      data: {
        businessId,
        title: data.title.trim(),
        amount: data.amount,
        categoryId: data.categoryId || null,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        receiptUrl: data.receiptUrl || null,
        notes: data.notes?.trim() || null,
        createdById: userId,
      },
      include: {
        category: true,
      },
    });
  }

  static async deleteExpense(businessId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, businessId },
    });

    if (!expense) {
      throw new Error("Expense record not found.");
    }

    return prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  /**
   * Fetch Incomes
   */
  static async getIncomes(
    businessId: string,
    params: { startDate?: string; endDate?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.IncomeWhereInput = { businessId };
    if (params.startDate || params.endDate) {
      where.incomeDate = {};
      if (params.startDate) where.incomeDate.gte = new Date(params.startDate);
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.incomeDate.lte = end;
      }
    }

    const [incomes, totalCount, aggregate] = await Promise.all([
      prisma.income.findMany({
        where,
        skip,
        take: limit,
        orderBy: { incomeDate: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      prisma.income.count({ where }),
      prisma.income.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      incomes,
      totalAmount: aggregate._sum.amount ? Number(aggregate._sum.amount) : 0,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async createIncome(
    businessId: string,
    userId: string,
    data: {
      title: string;
      amount: number;
      incomeDate?: string;
      category?: string;
      notes?: string | null;
    }
  ) {
    return prisma.income.create({
      data: {
        businessId,
        title: data.title.trim(),
        amount: data.amount,
        incomeDate: data.incomeDate ? new Date(data.incomeDate) : new Date(),
        category: data.category || "other",
        notes: data.notes?.trim() || null,
        createdById: userId,
      },
    });
  }

  /**
   * Real-time multi-tenant Dashboard Metrics
   */
  static async getDashboardMetrics(businessId: string) {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sales filter excluding cancelled
    const validSaleWhere: Prisma.SaleWhereInput = {
      businessId,
      status: { not: SaleStatus.CANCELLED },
    };

    const [
      todaySales,
      monthSales,
      allTimeSalesAggregate,
      todayExpensesAggregate,
      monthExpensesAggregate,
      allTimeExpensesAggregate,
      totalProductsCount,
      lowStockProducts,
      recentSales,
      topSaleItems,
    ] = await Promise.all([
      // 1. Today sales
      prisma.sale.findMany({
        where: {
          ...validSaleWhere,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        include: { items: true },
      }),
      // 2. Month sales
      prisma.sale.findMany({
        where: {
          ...validSaleWhere,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        include: { items: true },
      }),
      // 3. All time sales
      prisma.sale.aggregate({
        where: validSaleWhere,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      // 4. Today expenses
      prisma.expense.aggregate({
        where: {
          businessId,
          expenseDate: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      // 5. Month expenses
      prisma.expense.aggregate({
        where: {
          businessId,
          expenseDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
      // 6. All time expenses
      prisma.expense.aggregate({
        where: { businessId },
        _sum: { amount: true },
      }),
      // 7. Products count
      prisma.product.count({ where: { businessId, isActive: true } }),
      // 8. Low stock alert products (stock <= lowStockThreshold)
      prisma.product.findMany({
        where: {
          businessId,
          isActive: true,
          stockQuantity: { lte: 10 },
        },
        take: 8,
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
          unit: true,
        },
      }),
      // 9. Recent 5 sales
      prisma.sale.findMany({
        where: { businessId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          cashier: { select: { name: true } },
        },
      }),
      // 10. Top selling products
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: {
          sale: {
            businessId,
            status: { not: SaleStatus.CANCELLED },
          },
        },
        _sum: {
          quantity: true,
          subtotal: true,
          profit: true,
        },
        orderBy: {
          _sum: { subtotal: "desc" },
        },
        take: 5,
      }),
    ]);

    // Compute Today Financials
    const todayRevenue = todaySales.reduce((acc, s) => acc.plus(s.totalAmount.toString()), new Decimal(0));
    const todayCOGS = todaySales.reduce(
      (acc, s) => acc.plus(s.items.reduce((iAcc, item) => iAcc.plus(item.totalCost.toString()), new Decimal(0))),
      new Decimal(0)
    );
    const todayExpenses = new Decimal(todayExpensesAggregate._sum.amount?.toString() || 0);
    const todayGrossProfit = calculateGrossProfit(todayRevenue, todayCOGS);
    const todayNetProfit = calculateNetProfit(todayGrossProfit, todayExpenses);

    // Compute Month Financials
    const monthRevenue = monthSales.reduce((acc, s) => acc.plus(s.totalAmount.toString()), new Decimal(0));
    const monthCOGS = monthSales.reduce(
      (acc, s) => acc.plus(s.items.reduce((iAcc, item) => iAcc.plus(item.totalCost.toString()), new Decimal(0))),
      new Decimal(0)
    );
    const monthExpenses = new Decimal(monthExpensesAggregate._sum.amount?.toString() || 0);
    const monthGrossProfit = calculateGrossProfit(monthRevenue, monthCOGS);
    const monthNetProfit = calculateNetProfit(monthGrossProfit, monthExpenses);

    // Fetch product details for top selling products
    const topProductsWithDetails = await Promise.all(
      topSaleItems.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true },
        });
        return {
          id: item.productId,
          name: prod?.name || "Product",
          sku: prod?.sku,
          unitsSold: item._sum.quantity || 0,
          revenue: Number(item._sum.subtotal || 0),
          profit: Number(item._sum.profit || 0),
        };
      })
    );

    return {
      today: {
        salesCount: todaySales.length,
        revenue: todayRevenue.toNumber(),
        cogs: todayCOGS.toNumber(),
        grossProfit: todayGrossProfit.toNumber(),
        expenses: todayExpenses.toNumber(),
        netProfit: todayNetProfit.toNumber(),
      },
      thisMonth: {
        salesCount: monthSales.length,
        revenue: monthRevenue.toNumber(),
        cogs: monthCOGS.toNumber(),
        grossProfit: monthGrossProfit.toNumber(),
        expenses: monthExpenses.toNumber(),
        netProfit: monthNetProfit.toNumber(),
      },
      allTime: {
        salesCount: allTimeSalesAggregate._count.id || 0,
        revenue: Number(allTimeSalesAggregate._sum.totalAmount || 0),
        expenses: Number(allTimeExpensesAggregate._sum.amount || 0),
      },
      inventory: {
        totalProducts: totalProductsCount,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
      topProducts: topProductsWithDetails,
      recentSales,
    };
  }

  /**
   * Comprehensive Financial P&L and Sales Report for any given date range
   */
  static async getFinancialReport(
    businessId: string,
    startDateStr?: string,
    endDateStr?: string
  ) {
    const now = new Date();
    const start = startDateStr
      ? new Date(startDateStr)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDateStr
      ? new Date(endDateStr)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: {
          businessId,
          status: { not: SaleStatus.CANCELLED },
          createdAt: { gte: start, lte: end },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, categoryId: true } } },
          },
          cashier: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.expense.findMany({
        where: {
          businessId,
          expenseDate: { gte: start, lte: end },
        },
        include: { category: true },
      }),
    ]);

    // Financial totals
    let totalRevenue = new Decimal(0);
    let totalCOGS = new Decimal(0);
    let totalDiscounts = new Decimal(0);
    let totalTaxes = new Decimal(0);

    const dailyBreakdown: Record<string, { date: string; revenue: Decimal; cogs: Decimal; count: number }> = {};
    const paymentBreakdown: Record<string, { method: string; count: number; total: Decimal }> = {};
    const productBreakdown: Record<string, { name: string; quantity: number; revenue: Decimal; profit: Decimal }> = {};

    for (const sale of sales) {
      const rev = new Decimal(sale.totalAmount.toString());
      const disc = new Decimal(sale.discountAmount.toString());
      const tx = new Decimal(sale.taxAmount.toString());

      totalRevenue = totalRevenue.plus(rev);
      totalDiscounts = totalDiscounts.plus(disc);
      totalTaxes = totalTaxes.plus(tx);

      // Daily
      const dateKey = sale.createdAt.toISOString().split("T")[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { date: dateKey, revenue: new Decimal(0), cogs: new Decimal(0), count: 0 };
      }
      dailyBreakdown[dateKey].revenue = dailyBreakdown[dateKey].revenue.plus(rev);
      dailyBreakdown[dateKey].count += 1;

      // Payment method
      const method = sale.paymentMethod;
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { method, count: 0, total: new Decimal(0) };
      }
      paymentBreakdown[method].count += 1;
      paymentBreakdown[method].total = paymentBreakdown[method].total.plus(rev);

      // Line items
      for (const item of sale.items) {
        const cost = new Decimal(item.totalCost.toString());
        const profit = new Decimal(item.profit.toString());
        const sub = new Decimal(item.subtotal.toString());

        totalCOGS = totalCOGS.plus(cost);
        dailyBreakdown[dateKey].cogs = dailyBreakdown[dateKey].cogs.plus(cost);

        const prodId = item.productId;
        const prodName = item.product?.name || "Product";
        if (!productBreakdown[prodId]) {
          productBreakdown[prodId] = { name: prodName, quantity: 0, revenue: new Decimal(0), profit: new Decimal(0) };
        }
        productBreakdown[prodId].quantity += item.quantity;
        productBreakdown[prodId].revenue = productBreakdown[prodId].revenue.plus(sub);
        productBreakdown[prodId].profit = productBreakdown[prodId].profit.plus(profit);
      }
    }

    const totalExpenses = expenses.reduce((acc, e) => acc.plus(e.amount.toString()), new Decimal(0));
    const grossProfit = calculateGrossProfit(totalRevenue, totalCOGS);
    const netProfit = calculateNetProfit(grossProfit, totalExpenses);
    const grossMargin = calculateGrossMarginPercentage(totalRevenue, totalCOGS);

    return {
      period: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      },
      summary: {
        totalSales: sales.length,
        totalRevenue: totalRevenue.toNumber(),
        totalCOGS: totalCOGS.toNumber(),
        grossProfit: grossProfit.toNumber(),
        totalExpenses: totalExpenses.toNumber(),
        netProfit: netProfit.toNumber(),
        grossMarginPercentage: grossMargin.toNumber(),
        totalDiscounts: totalDiscounts.toNumber(),
        totalTaxes: totalTaxes.toNumber(),
      },
      dailyTrends: Object.values(dailyBreakdown).map((d) => ({
        date: d.date,
        salesCount: d.count,
        revenue: d.revenue.toNumber(),
        cogs: d.cogs.toNumber(),
        grossProfit: d.revenue.minus(d.cogs).toNumber(),
      })),
      paymentMethods: Object.values(paymentBreakdown).map((p) => ({
        method: p.method,
        salesCount: p.count,
        amount: p.total.toNumber(),
      })),
      topSellingProducts: Object.values(productBreakdown)
        .sort((a, b) => b.revenue.minus(a.revenue).toNumber())
        .slice(0, 10)
        .map((p) => ({
          name: p.name,
          unitsSold: p.quantity,
          revenue: p.revenue.toNumber(),
          profit: p.profit.toNumber(),
        })),
    };
  }
}
