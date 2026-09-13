"use server";

import { requireTenant, requireRole } from "@/lib/auth/session";
import { ProductService, ProductFilterParams } from "@/services/product.service";
import {
  ProductSchema,
  UpdateProductSchema,
  CategorySchema,
  StockAdjustmentSchema,
} from "@/lib/validations/product";
import { UserRole } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Fetch paginated products for the authenticated merchant
 */
export async function getProductsAction(params: ProductFilterParams = {}): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const result = await ProductService.getProducts(businessId, params);
    return {
      success: true,
      message: "Products fetched successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch products",
    };
  }
}

/**
 * Create a new product
 */
export async function createProductAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = ProductSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid product input data",
      };
    }

    const product = await ProductService.createProduct(
      businessId,
      user.id,
      validated.data
    );

    return {
      success: true,
      message: "Product created successfully!",
      data: product,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProductAction(
  productId: string,
  formData: unknown
): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = UpdateProductSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid product input data",
      };
    }

    const updated = await ProductService.updateProduct(
      businessId,
      productId,
      validated.data
    );

    return {
      success: true,
      message: "Product updated successfully!",
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

/**
 * Soft delete product
 */
export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    await ProductService.deleteProduct(businessId, productId);

    return {
      success: true,
      message: "Product removed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

/**
 * Adjust stock with concurrency controls and movement ledger
 */
export async function adjustStockAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId, user } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = StockAdjustmentSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid stock adjustment data",
      };
    }

    const result = await ProductService.adjustStock(
      businessId,
      user.id,
      validated.data
    );

    return {
      success: true,
      message: "Stock adjusted successfully!",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Stock adjustment failed",
    };
  }
}

/**
 * Categories
 */
export async function getCategoriesAction(): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const categories = await ProductService.getCategories(businessId);
    return {
      success: true,
      message: "Categories fetched",
      data: categories,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function createCategoryAction(formData: unknown): Promise<ActionResult> {
  try {
    const { businessId } = await requireRole([
      UserRole.BUSINESS_OWNER,
      UserRole.MANAGER,
    ]);

    const validated = CategorySchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid category input",
      };
    }

    const category = await ProductService.createCategory(
      businessId,
      validated.data.name,
      validated.data.description
    );

    return {
      success: true,
      message: "Category created successfully!",
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function getStockMovementsAction(): Promise<ActionResult> {
  try {
    const { businessId } = await requireTenant();
    const movements = await ProductService.getStockMovements(businessId);
    return {
      success: true,
      message: "Stock movements loaded",
      data: movements,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load stock movements",
    };
  }
}
