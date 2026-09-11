import { prisma } from "@/lib/prisma";
import { PaymentMethod, Prisma } from "@prisma/client";
import Decimal from "decimal.js";

export class CustomerService {
  static async getCustomers(
    businessId: string,
    params: { search?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = { businessId };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(businessId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: {
        sales: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            amountPaid: true,
            status: true,
            createdAt: true,
          },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found.");
    }

    return customer;
  }

  static async createCustomer(
    businessId: string,
    data: {
      name: string;
      email?: string | null;
      phone: string;
      address?: string | null;
      notes?: string | null;
    }
  ) {
    return prisma.customer.create({
      data: {
        businessId,
        name: data.name.trim(),
        email: data.email?.trim().toLowerCase() || null,
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  static async updateCustomer(
    businessId: string,
    customerId: string,
    data: {
      name?: string;
      email?: string | null;
      phone?: string;
      address?: string | null;
      notes?: string | null;
    }
  ) {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });

    if (!existing) {
      throw new Error("Customer not found.");
    }

    return prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email !== undefined && { email: data.email?.trim().toLowerCase() || null }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      },
    });
  }

  static async deleteCustomer(businessId: string, customerId: string) {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });

    if (!existing) {
      throw new Error("Customer not found.");
    }

    return prisma.customer.delete({
      where: { id: customerId },
    });
  }

  /**
   * Settle customer outstanding balance with atomic Payment record
   */
  static async settleBalance(
    businessId: string,
    userId: string,
    params: {
      customerId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      referenceNote?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: params.customerId, businessId },
      });

      if (!customer) {
        throw new Error("Customer not found.");
      }

      const currentBalance = new Decimal(customer.outstandingBalance.toString());
      const paymentAmount = new Decimal(params.amount);

      const newBalance = Decimal.max(0, currentBalance.minus(paymentAmount));

      // 1. Record payment
      const payment = await tx.payment.create({
        data: {
          businessId,
          customerId: customer.id,
          amount: paymentAmount.toNumber(),
          paymentMethod: params.paymentMethod,
          referenceNote: params.referenceNote || "Debt payment settlement",
          createdById: userId,
        },
      });

      // 2. Update customer balance
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          outstandingBalance: newBalance.toNumber(),
        },
      });

      return { payment, customer: updatedCustomer };
    });
  }
}

export class SupplierService {
  static async getSuppliers(
    businessId: string,
    params: { search?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = { businessId };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { companyName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { purchaseOrders: true },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSupplierById(businessId: string, supplierId: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) {
      throw new Error("Supplier not found.");
    }

    return supplier;
  }

  static async createSupplier(
    businessId: string,
    data: {
      name: string;
      companyName?: string | null;
      email?: string | null;
      phone: string;
      address?: string | null;
      notes?: string | null;
    }
  ) {
    return prisma.supplier.create({
      data: {
        businessId,
        name: data.name.trim(),
        companyName: data.companyName?.trim() || null,
        email: data.email?.trim().toLowerCase() || null,
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  static async updateSupplier(
    businessId: string,
    supplierId: string,
    data: {
      name?: string;
      companyName?: string | null;
      email?: string | null;
      phone?: string;
      address?: string | null;
      notes?: string | null;
    }
  ) {
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });

    if (!existing) {
      throw new Error("Supplier not found.");
    }

    return prisma.supplier.update({
      where: { id: supplierId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.companyName !== undefined && { companyName: data.companyName?.trim() || null }),
        ...(data.email !== undefined && { email: data.email?.trim().toLowerCase() || null }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      },
    });
  }

  static async deleteSupplier(businessId: string, supplierId: string) {
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });

    if (!existing) {
      throw new Error("Supplier not found.");
    }

    return prisma.supplier.delete({
      where: { id: supplierId },
    });
  }
}
