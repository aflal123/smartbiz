"use client";

import * as React from "react";
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getProductsAction,
  adjustStockAction,
  getStockMovementsAction,
} from "@/actions/products";

interface Product {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  category?: { name: string } | null;
}

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [movements, setMovements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"ALL" | "LOW" | "OUT">("ALL");

  // Adjust stock modal
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [adjustType, setAdjustType] = React.useState("PURCHASE");
  const [adjustQty, setAdjustQty] = React.useState("");
  const [adjustNotes, setAdjustNotes] = React.useState("");
  const [adjusting, setAdjusting] = React.useState(false);
  const [adjustError, setAdjustError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, moveRes] = await Promise.all([
        getProductsAction({ search, limit: 100 }),
        getStockMovementsAction(),
      ]);
      if (prodRes.success && prodRes.data) {
        setProducts((prodRes.data as any).products || []);
      }
      if (moveRes.success && moveRes.data) {
        setMovements((moveRes.data as any) || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [search]);

  const loadProducts = loadData;

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (filter === "LOW") return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
      if (filter === "OUT") return p.stockQuantity <= 0;
      return true;
    });
  }, [products, filter]);

  const totalValue = products.reduce((sum, p) => sum + (Number(p.costPrice) * p.stockQuantity), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

  const openAdjust = (product: Product) => {
    setSelectedProduct(product);
    setAdjustType("PURCHASE");
    setAdjustQty("");
    setAdjustNotes("");
    setAdjustError(null);
    setAdjustOpen(true);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setAdjusting(true);
    setAdjustError(null);

    try {
      const isNegative = ["SALE", "DAMAGE", "RETURN"].includes(adjustType);
      const quantity = isNegative ? -Math.abs(parseInt(adjustQty)) : Math.abs(parseInt(adjustQty));

      const res = await adjustStockAction({
        productId: selectedProduct.id,
        type: adjustType,
        quantity,
        notes: adjustNotes || undefined,
      });

      if (!res.success) {
        setAdjustError(res.message);
        setAdjusting(false);
        return;
      }

      setSuccessMsg(`Stock adjusted: ${selectedProduct.name} (${quantity > 0 ? "+" : ""}${quantity})`);
      setAdjustOpen(false);
      loadProducts();
    } catch {
      setAdjustError("Stock adjustment failed.");
    } finally {
      setAdjusting(false);
    }
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
        title="Inventory Management"
        description="Track stock levels, record adjustments, and audit every unit movement."
      >
        <Button variant="outline" size="sm" onClick={loadProducts} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </PageHeader>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Inventory Value</p>
              <MoneyDisplay amount={totalValue} className="text-xl font-bold text-slate-900 mt-1" />
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 uppercase font-semibold tracking-wider">Low Stock Items</p>
              <p className="text-xl font-bold text-amber-700 mt-1">{lowStockCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-700 uppercase font-semibold tracking-wider">Out of Stock</p>
              <p className="text-xl font-bold text-rose-700 mt-1">{outOfStockCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Minus className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock-levels">
        <TabsList>
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="movements">Movement Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="stock-levels">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
              {(["ALL", "LOW", "OUT"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f === "ALL" ? "All" : f === "LOW" ? "Low Stock" : "Out of Stock"}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No products match this filter"
              description="Try a different search or filter to find inventory items."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Low Threshold</TableHead>
                  <TableHead className="text-right">Stock Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
                  const isOut = p.stockQuantity <= 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{p.sku}</TableCell>
                      <TableCell>
                        {p.category ? <Badge variant="secondary">{p.category.name}</Badge> : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-sm ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-900"}`}>
                          {p.stockQuantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-0.5">{p.unit}</span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">{p.lowStockThreshold}</TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay amount={Number(p.costPrice) * p.stockQuantity} variant="muted" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openAdjust(p)} className="gap-1 text-xs">
                          <ClipboardList className="h-3 w-3" />
                          <span>Adjust</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="movements">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty Change</TableHead>
                <TableHead className="text-right">Before</TableHead>
                <TableHead className="text-right">After</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs text-slate-500 py-8">
                    No stock movements recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 text-sm">
                      {m.product?.name || "Product"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.type === "PURCHASE" ? "success" : m.type === "SALE" ? "default" : "warning"}>
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold text-sm ${m.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-500">{m.previousStock}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-slate-900">{m.newStock}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">{m.notes || m.referenceId || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* ADJUST STOCK DIALOG */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md" onClose={() => setAdjustOpen(false)}>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            {adjustError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm flex justify-between">
              <span className="text-slate-600">Current Stock</span>
              <span className="font-bold text-slate-900">{selectedProduct?.stockQuantity} {selectedProduct?.unit}</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Adjustment Type *</label>
              <Select value={adjustType} onChange={(e) => setAdjustType(e.target.value)}>
                <option value="PURCHASE">Purchase (Stock In)</option>
                <option value="RETURN">Customer Return (Stock In)</option>
                <option value="ADJUSTMENT">Manual Correction</option>
                <option value="DAMAGE">Damage / Loss (Stock Out)</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Quantity *</label>
              <Input type="number" required min={1} value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="Enter quantity" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Notes / Reference</label>
              <Textarea value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} placeholder="PO number, reason for adjustment..." rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjusting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {adjusting ? "Processing..." : "Confirm Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
