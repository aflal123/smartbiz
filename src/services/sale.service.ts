import { prisma } from "@/lib/prisma";
import {
  calculateLineSubtotal,
  calculateTax,
  calculateTotal,
  calculateChange,
} from "@/lib/finance";
import { PaymentMethod, SaleStatus, StockMovementType, Prisma } from "@prisma/client";
import Decimal from "decimal.js";

export interface CreateSaleInput {
  items: {
    productId: string;
    batchId?: string | null;
    quantity: number;
    unitSellingPrice: number;
    discount?: number;
  }[];
  customerId?: string | null;
  discountAmount?: number;
  taxRate?: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  status?: SaleStatus;
  notes?: string | null;
}

export interface SaleFilterParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  cashierId?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
}

export class SaleService {
  /**
   * Helper: Generate a unique invoice number scoped to the business
   * Format: INV-YYYY-XXXX (e.g. INV-2026-0001)
   */
  private static async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    businessId: string
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const count = await tx.sale.count({
      where: {
        businessId,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    return `${prefix}${sequence}`;
  }

  /**
   * Create an atomic sale transaction with concurrency checks, inventory deductions,
   * cost tracking, stock movement records, payments, and customer balance updates.
   */
  static async createSale(businessId: string, cashierId: string, input: CreateSaleInput) {
    return prisma.$transaction(
      async (tx) => {
        // ── 1. VALIDATE AND LOCK PRODUCTS CONCURRENTLY ─────────────────────
        let rawSubtotal = new Decimal(0);
        let totalCOGS = new Decimal(0);

        const preparedItems: {
          productId: string;
          batchId: string | null;
          quantity: number;
          unitCostPrice: Decimal;
          unitSellingPrice: Decimal;
          discount: Decimal;
          subtotal: Decimal;
          totalCost: Decimal;
          profit: Decimal;
          productName: string;
        }[] = [];

        for (const item of input.items) {
          // Find product inside transaction
          const product = await tx.product.findFirst({
            where: { id: item.productId, businessId, isActive: true },
          });

          if (!product) {
            throw new Error(`Product with ID ${item.productId} was not found.`);
          }

          // CONCURRENCY CHECK: Verify available stock
          if (product.stockQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
            );
          }

          const lineSubtotal = calculateLineSubtotal(item.quantity, item.unitSellingPrice);
          const lineDiscount = new Decimal(item.discount || 0);
          const lineFinalSubtotal = Decimal.max(0, lineSubtotal.minus(lineDiscount));

          // Unit cost price from product or selected batch
          let unitCostPrice = new Decimal(product.costPrice.toString());

          if (item.batchId) {
            const batch = await tx.productBatch.findFirst({
              where: { id: item.batchId, businessId, productId: product.id },
            });
            if (batch) {
              unitCostPrice = new Decimal(batch.costPrice.toString());
              if (batch.remainingQuantity < item.quantity) {
                throw new Error(
                  `Insufficient batch stock for batch ${batch.batchNumber}. Available: ${batch.remainingQuantity}.`
                );
              }
            }
          }

          const lineCost = unitCostPrice.mul(item.quantity);
          const lineProfit = lineFinalSubtotal.minus(lineCost);

          rawSubtotal = rawSubtotal.plus(lineFinalSubtotal);
          totalCOGS = totalCOGS.plus(lineCost);

          preparedItems.push({
            productId: product.id,
            batchId: item.batchId || null,
            quantity: item.quantity,
            unitCostPrice,
            unitSellingPrice: new Decimal(item.unitSellingPrice),
            discount: lineDiscount,
            subtotal: lineFinalSubtotal,
            totalCost: lineCost,
            profit: lineProfit,
            productName: product.name,
          });

          // ── DECREMENT PRODUCT STOCK ─────────────────────────────────────
          const updatedStock = product.stockQuantity - item.quantity;
          await tx.product.update({
            where: { id: product.id },
            data: { stockQuantity: updatedStock },
          });

          // ── DECREMENT BATCH IF PROVIDED ─────────────────────────────────
          if (item.batchId) {
            await tx.productBatch.update({
              where: { id: item.batchId },
              data: { remainingQuantity: { decrement: item.quantity } },
            });
          }
        }

        // ── 2. CALCULATE FINANCIAL TOTALS ──────────────────────────────────
        const generalDiscount = new Decimal(input.discountAmount || 0);
        const taxRate = new Decimal(input.taxRate || 0);

        const subAfterGeneralDiscount = Decimal.max(0, rawSubtotal.minus(generalDiscount));
        const taxAmount = calculateTax(subAfterGeneralDiscount, taxRate);
        const finalTotal = calculateTotal(rawSubtotal, generalDiscount, taxAmount);

        const paid = new Decimal(input.amountPaid);
        const change = calculateChange(paid, finalTotal);

        // Determine sale status
        let finalStatus = input.status || SaleStatus.COMPLETED;
        if (paid.lt(finalTotal)) {
          finalStatus = paid.isZero() ? SaleStatus.UNPAID : SaleStatus.PARTIAL;
        }

        // ── 3. GENERATE TENANT INVOICE NUMBER ──────────────────────────────
        const invoiceNumber = await SaleService.generateInvoiceNumber(tx, businessId);

        // ── 4. CREATE SALE RECORD ──────────────────────────────────────────
        const sale = await tx.sale.create({
          data: {
            businessId,
            invoiceNumber,
            customerId: input.customerId || null,
            cashierId,
            subtotal: rawSubtotal.toNumber(),
            discountAmount: generalDiscount.toNumber(),
            taxAmount: taxAmount.toNumber(),
            totalAmount: finalTotal.toNumber(),
            amountPaid: paid.toNumber(),
            changeAmount: change.toNumber(),
            paymentMethod: input.paymentMethod,
            status: finalStatus,
            notes: input.notes || null,
          },
        });

        // ── 5. CREATE SALE ITEMS & STOCK MOVEMENTS ─────────────────────────
        for (const item of preparedItems) {
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              batchId: item.batchId,
              quantity: item.quantity,
              unitCostPrice: item.unitCostPrice.toNumber(),
              unitSellingPrice: item.unitSellingPrice.toNumber(),
              discount: item.discount.toNumber(),
              subtotal: item.subtotal.toNumber(),
              totalCost: item.totalCost.toNumber(),
              profit: item.profit.toNumber(),
            },
          });

          // Record immutable stock movement
          const productRef = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stockQuantity: true },
          });

          const currentStock = productRef?.stockQuantity ?? 0;

          await tx.stockMovement.create({
            data: {
              businessId,
              productId: item.productId,
              batchId: item.batchId,
              type: StockMovementType.SALE,
              quantity: -item.quantity, // negative for sale
              previousStock: currentStock + item.quantity,
              newStock: currentStock,
              referenceId: sale.id,
              notes: `POS Sale: ${invoiceNumber}`,
              createdById: cashierId,
            },
          });
        }

        // ── 6. RECORD PAYMENT ──────────────────────────────────────────────
        if (paid.gt(0)) {
          await tx.payment.create({
            data: {
              businessId,
              saleId: sale.id,
              customerId: input.customerId || null,
              amount: Decimal.min(paid, finalTotal).toNumber(),
              paymentMethod: input.paymentMethod,
              referenceNote: `POS Payment for ${invoiceNumber}`,
              createdById: cashierId,
            },
          });
        }

        // ── 7. UPDATE CUSTOMER OUTSTANDING BALANCE IF UNPAID/PARTIAL ──────
        if (input.customerId && paid.lt(finalTotal)) {
          const unpaidAmount = finalTotal.minus(paid);
          await tx.customer.update({
            where: { id: input.customerId },
            data: {
              outstandingBalance: { increment: unpaidAmount.toNumber() },
            },
          });
        }

        // ── 8. RETURN FULL POPULATED SALE ─────────────────────────────────
        const completeSale = await tx.sale.findUnique({
          where: { id: sale.id },
          include: {
            customer: true,
            cashier: {
              select: { id: true, name: true, email: true },
            },
            items: {
              include: {
                product: {
                  select: { id: true, name: true, sku: true, unit: true },
                },
              },
            },
            payments: true,
          },
        });

        return completeSale;
      },
      {
        timeout: 10000, // 10s transaction timeout for POS concurrency
      }
    );
  }

  /**
   * Fetch paginated sales list with filters
   */
  static async getSales(businessId: string, params: SaleFilterParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = { businessId };

    if (params.status) {
      where.status = params.status;
    }

    if (params.paymentMethod) {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.cashierId) {
      where.cashierId = params.cashierId;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          cashier: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch single sale by ID
   */
  static async getSaleById(businessId: string, saleId: string) {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, businessId },
      include: {
        customer: true,
        cashier: { select: { id: true, name: true, email: true } },
        business: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            currency: true,
            logoUrl: true,
            receiptFooter: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } },
          },
        },
        payments: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found.");
    }

    return sale;
  }

  /**
   * Cancel sale and restore stock + update customer debt if applicable
   */
  static async cancelSale(
    businessId: string,
    userId: string,
    saleId: string,
    reason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, businessId },
        include: { items: true },
      });

      if (!sale) {
        throw new Error("Sale not found.");
      }

      if (sale.status === SaleStatus.CANCELLED) {
        throw new Error("This sale has already been cancelled.");
      }

      // 1. Restore product stock and record return movements
      for (const item of sale.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true },
        });

        const currentStock = product?.stockQuantity ?? 0;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });

        if (item.batchId) {
          await tx.productBatch.update({
            where: { id: item.batchId },
            data: { remainingQuantity: { increment: item.quantity } },
          });
        }

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: item.productId,
            batchId: item.batchId,
            type: StockMovementType.RETURN,
            quantity: item.quantity,
            previousStock: currentStock,
            newStock: currentStock + item.quantity,
            referenceId: sale.id,
            notes: `Cancelled sale: ${sale.invoiceNumber}. ${reason ? `Reason: ${reason}` : ""}`,
            createdById: userId,
          },
        });
      }

      // 2. If customer owed balance on this sale, reverse debt
      if (sale.customerId && Number(sale.amountPaid) < Number(sale.totalAmount)) {
        const unpaidDebt = Number(sale.totalAmount) - Number(sale.amountPaid);
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            outstandingBalance: { decrement: unpaidDebt },
          },
        });
      }

      // 3. Mark sale as cancelled
      const updated = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: SaleStatus.CANCELLED,
          notes: reason ? `${sale.notes || ""}\n[Cancelled]: ${reason}` : sale.notes,
        },
      });

      return updated;
    });
  }
}
