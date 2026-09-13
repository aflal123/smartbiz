"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyDisplay } from "@/components/ui/money-display";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getProductsAction,
  createProductAction,
  deleteProductAction,
  getCategoriesAction,
  createCategoryAction,
} from "@/actions/products";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // New product modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    categoryId: "",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    unit: "pcs",
  });
  const [creating, setCreating] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // New category modal
  const [catOpen, setCatOpen] = React.useState(false);
  const [catName, setCatName] = React.useState("");
  const [catDesc, setCatDesc] = React.useState("");
  const [catCreating, setCatCreating] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsAction({ search, page, limit: 15 }),
        getCategoriesAction(),
      ]);

      if (prodRes.success && prodRes.data) {
        const d = prodRes.data as any;
        setProducts(d.products || []);
        setTotalPages(d.pagination?.totalPages || 1);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data as Category[]);
      }
    } catch {
      // Fallback gracefully
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);

    try {
      const res = await createProductAction({
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || null,
        description: formData.description || null,
        categoryId: formData.categoryId || undefined,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity || "0"),
        lowStockThreshold: parseInt(formData.lowStockThreshold || "10"),
        unit: formData.unit,
      });

      if (!res.success) {
        setFormError(res.message);
        setCreating(false);
        return;
      }

      setSuccessMsg("Product created successfully!");
      setCreateOpen(false);
      setFormData({
        name: "", sku: "", barcode: "", description: "", categoryId: "",
        costPrice: "", sellingPrice: "", stockQuantity: "", lowStockThreshold: "10", unit: "pcs",
      });
      loadData();
    } catch {
      setFormError("Failed to create product. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatCreating(true);
    try {
      const res = await createCategoryAction({ name: catName, description: catDesc || null });
      if (res.success) {
        setCatOpen(false);
        setCatName("");
        setCatDesc("");
        const catRes = await getCategoriesAction();
        if (catRes.success && catRes.data) setCategories(catRes.data as Category[]);
      }
    } catch {} finally {
      setCatCreating(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await deleteProductAction(productId);
      if (res.success) loadData();
    } catch {}
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getStockStatus = (p: Product) => {
    if (p.stockQuantity <= 0) return { label: "Out of Stock", color: "text-rose-600 bg-rose-50 border-rose-200" };
    if (p.stockQuantity <= p.lowStockThreshold) return { label: "Low Stock", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "In Stock", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  const margin = (cost: number, sell: number) => {
    if (sell <= 0) return "0.0";
    return (((sell - cost) / sell) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      <PageHeader
        title="Products & Catalog"
        description="Manage your full product inventory with cost/selling prices and stock levels."
      >
        <Button variant="outline" size="sm" onClick={() => setCatOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </Button>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </PageHeader>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat.id} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {cat.name} {cat._count ? `(${cat._count.products})` : ""}
            </span>
          ))}
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 && !loading ? (
        <EmptyState
          icon={Package}
          title="No Products Yet"
          description="Add your first product to start managing inventory and running POS sales."
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Add First Product
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Selling</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const status = getStockStatus(p);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                      {p.barcode && <p className="text-[11px] text-slate-400 font-mono">{p.barcode}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{p.sku}</TableCell>
                  <TableCell>
                    {p.category ? (
                      <Badge variant="secondary">{p.category.name}</Badge>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyDisplay amount={p.costPrice} variant="muted" />
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyDisplay amount={p.sellingPrice} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold text-emerald-600">{margin(Number(p.costPrice), Number(p.sellingPrice))}%</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {p.stockQuantity}
                    <span className="text-xs text-slate-400 ml-0.5">{p.unit}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${status.color}`}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg" onClose={() => setCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-700">Product Name *</label>
                <Input name="name" required value={formData.name} onChange={handleFieldChange} placeholder="Premium Ceylon Tea 500g" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">SKU *</label>
                <Input name="sku" required value={formData.sku} onChange={handleFieldChange} placeholder="TEA-BLK-500" className="font-mono" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Barcode</label>
                <Input name="barcode" value={formData.barcode} onChange={handleFieldChange} placeholder="89345001" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Category</label>
                <Select name="categoryId" value={formData.categoryId} onChange={handleFieldChange}>
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Unit</label>
                <Select name="unit" value={formData.unit} onChange={handleFieldChange}>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Litres (L)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="bag">Bag</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Cost Price *</label>
                <Input type="number" step="0.01" name="costPrice" required value={formData.costPrice} onChange={handleFieldChange} placeholder="520.00" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Selling Price *</label>
                <Input type="number" step="0.01" name="sellingPrice" required value={formData.sellingPrice} onChange={handleFieldChange} placeholder="850.00" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Opening Stock</label>
                <Input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleFieldChange} placeholder="100" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Low Stock Alert</label>
                <Input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleFieldChange} placeholder="10" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-700">Description</label>
                <Textarea name="description" value={formData.description} onChange={handleFieldChange} placeholder="Brief product description..." rows={2} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {creating ? "Creating..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-sm" onClose={() => setCatOpen(false)}>
          <DialogHeader>
            <DialogTitle>New Product Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category Name *</label>
              <Input required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Beverages" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Description</label>
              <Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={catCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {catCreating ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
