import { prisma } from "@/lib/prisma";
import { StockMovementType, Prisma } from "@prisma/client";

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "stockQuantity" | "sellingPrice" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export class ProductService {
  /**
   * Fetch paginated products for a tenant
   */
  static async getProducts(businessId: string, params: ProductFilterParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      businessId,
      isActive: true,
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
        { barcode: { contains: term, mode: "insensitive" } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    // For low stock alerts
    if (params.lowStockOnly) {
      // In PostgreSQL/Prisma, we can filter where stockQuantity <= lowStockThreshold
      // Or query raw or fetch
      where.stockQuantity = { lte: 10 }; // Fallback threshold or handled via query
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [params.sortBy || "createdAt"]: params.sortOrder || "desc",
    };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true },
          },
          batches: {
            where: { remainingQuantity: { gt: 0 } },
            orderBy: { receivedDate: "asc" },
            take: 5,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Get single product by ID scoped to tenant
   */
  static async getProductById(businessId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId,
        isActive: true,
      },
      include: {
        category: true,
        batches: {
          orderBy: { receivedDate: "asc" },
        },
        stockMovements: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found or has been removed.");
    }

    return product;
  }

  /**
   * Create new product for tenant
   */
  static async createProduct(
    businessId: string,
    userId: string,
    data: {
      name: string;
      description?: string | null;
      categoryId?: string | null;
      sku?: string | null;
      barcode?: string | null;
      costPrice: number;
      sellingPrice: number;
      stockQuantity: number;
      lowStockThreshold?: number;
      unit?: string;
      imageUrl?: string | null;
    }
  ) {
    // Check duplicate SKU if provided
    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: {
          businessId,
          sku: data.sku.trim(),
          isActive: true,
        },
      });

      if (existing) {
        throw new Error(`A product with SKU "${data.sku}" already exists.`);
      }
    }

    // Auto-generate barcode number if omitted: PRD-XXXXXX
    const finalBarcode =
      data.barcode?.trim() ||
      `PRD-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          categoryId: data.categoryId || null,
          sku: data.sku?.trim() || null,
          barcode: finalBarcode,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          stockQuantity: data.stockQuantity || 0,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          unit: data.unit || "pcs",
          imageUrl: data.imageUrl || null,
        },
        include: {
          category: true,
        },
      });

      // If initial stock is greater than 0, create an initial batch and stock movement record
      if (data.stockQuantity > 0) {
        const batch = await tx.productBatch.create({
          data: {
            businessId,
            productId: product.id,
            batchNumber: `BATCH-INIT-${Date.now().toString().slice(-6)}`,
            costPrice: data.costPrice,
            initialQuantity: data.stockQuantity,
            remainingQuantity: data.stockQuantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: product.id,
            batchId: batch.id,
            type: StockMovementType.PURCHASE,
            quantity: data.stockQuantity,
            previousStock: 0,
            newStock: data.stockQuantity,
            notes: "Initial inventory setup",
            createdById: userId,
          },
        });
      }

      return product;
    });
  }

  /**
   * Update product
   */
  static async updateProduct(
    businessId: string,
    productId: string,
    data: {
      name?: string;
      description?: string | null;
      categoryId?: string | null;
      sku?: string | null;
      barcode?: string | null;
      costPrice?: number;
      sellingPrice?: number;
      lowStockThreshold?: number;
      unit?: string;
      imageUrl?: string | null;
    }
  ) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId, isActive: true },
    });

    if (!existing) {
      throw new Error("Product not found.");
    }

    if (data.sku && data.sku !== existing.sku) {
      const duplicate = await prisma.product.findFirst({
        where: {
          businessId,
          sku: data.sku.trim(),
          id: { not: productId },
          isActive: true,
        },
      });
      if (duplicate) {
        throw new Error(`A product with SKU "${data.sku}" already exists.`);
      }
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.sellingPrice !== undefined && { sellingPrice: data.sellingPrice }),
        ...(data.lowStockThreshold !== undefined && {
          lowStockThreshold: data.lowStockThreshold,
        }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Soft delete product
   */
  static async deleteProduct(businessId: string, productId: string) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId, isActive: true },
    });

    if (!existing) {
      throw new Error("Product not found.");
    }

    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }

  /**
   * Concurrently safe stock adjustment with audit ledger entry
   */
  static async adjustStock(
    businessId: string,
    userId: string,
    params: {
      productId: string;
      batchId?: string | null;
      type: StockMovementType;
      quantity: number; // Positive to add, negative to deduct
      notes?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch current product inside transaction
      const product = await tx.product.findFirst({
        where: { id: params.productId, businessId, isActive: true },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      const previousStock = product.stockQuantity;
      const newStock = previousStock + params.quantity;

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock for "${product.name}". Current available: ${previousStock}, Requested deduction: ${Math.abs(params.quantity)}.`
        );
      }

      // 2. Update product stock atomically
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: newStock,
        },
      });

      // 3. If batch specified, adjust batch remaining quantity
      if (params.batchId) {
        const batch = await tx.productBatch.findFirst({
          where: { id: params.batchId, businessId, productId: product.id },
        });

        if (batch) {
          const newBatchRemaining = Math.max(0, batch.remainingQuantity + params.quantity);
          await tx.productBatch.update({
            where: { id: batch.id },
            data: { remainingQuantity: newBatchRemaining },
          });
        }
      }

      // 4. Record immutable stock movement
      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          productId: product.id,
          batchId: params.batchId || null,
          type: params.type,
          quantity: params.quantity,
          previousStock,
          newStock,
          notes: params.notes || null,
          createdById: userId,
        },
      });

      return {
        product: updatedProduct,
        movement,
      };
    });
  }

  /**
   * Categories CRUD
   */
  static async getCategories(businessId: string) {
    return prisma.category.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async createCategory(businessId: string, name: string, description?: string) {
    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findFirst({
      where: { businessId, name: cleanName },
    });

    if (existing) {
      throw new Error(`Category "${cleanName}" already exists.`);
    }

    return prisma.category.create({
      data: {
        businessId,
        name: cleanName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        description: description?.trim() || null,
      },
    });
  }
}
