"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building,
  UserCheck,
  Printer,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getProductsAction } from "@/actions/products";
import { createSaleAction } from "@/actions/sales";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  category?: { name: string } | null;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export default function PosPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = React.useState<number>(0);
  const [taxRate] = React.useState<number>(0); // 0% default SME sales tax
  const [loading, setLoading] = React.useState(true);

  // Mobile drawer state
  const [mobileCartOpen, setMobileCartOpen] = React.useState(false);

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "CARD" | "BANK_TRANSFER" | "CREDIT">("CASH");
  const [amountTendered, setAmountTendered] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState("Walk-in Customer");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Completed receipt state
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [completedSale, setCompletedSale] = React.useState<any>(null);

  // Fetch real products from server
  React.useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await getProductsAction({ limit: 100 });
        if (res.success && res.data) {
          const fetched = (res.data as any).products || [];
          setProducts(fetched);
        }
      } catch {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products by search and category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchesCategory =
        selectedCategory === "ALL" || p.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev; // Limit to available stock
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  // Barcode / Enter key quick add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = products.find(
      (p) =>
        p.barcode === searchQuery.trim() ||
        p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (matched && matched.stockQuantity > 0) {
      addToCart(matched);
      setSearchQuery("");
    }
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const tenderedNumeric = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedNumeric - grandTotal);

  const openCheckout = () => {
    setAmountTendered(grandTotal.toString());
    setErrorMsg(null);
    setCheckoutOpen(true);
  };

  const handleCompleteSale = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    const payload = {
      items: cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitSellingPrice: i.unitPrice,
        discount: 0,
      })),
      discountAmount,
      taxRate,
      amountPaid: paymentMethod === "CREDIT" ? 0 : tenderedNumeric,
      paymentMethod,
      status: paymentMethod === "CREDIT" ? "UNPAID" : "COMPLETED",
      notes: `POS order by ${customerName}`,
    };

    try {
      const res = await createSaleAction(payload);
      if (res.success && res.data) {
        const sale = res.data as any;
        setCompletedSale({
          invoiceNumber: sale.invoiceNumber,
          date: new Date(sale.createdAt || Date.now()).toLocaleString(),
          cashier: sale.cashier?.name || "Cashier",
          customerName: sale.customer?.name || customerName,
          items: sale.items?.map((item: any) => ({
            product: { name: item.product?.name || "Item", sku: item.product?.sku || "" },
            quantity: item.quantity,
            unitPrice: item.unitSellingPrice,
          })) || [...cart],
          subtotal: Number(sale.subtotal || subtotal),
          discountAmount: Number(sale.discountAmount || discountAmount),
          taxAmount: Number(sale.taxAmount || taxAmount),
          grandTotal: Number(sale.totalAmount || grandTotal),
          paymentMethod: sale.paymentMethod || paymentMethod,
          amountPaid: Number(sale.amountPaid || tenderedNumeric),
          changeDue: Number(sale.changeAmount || changeDue),
        });

        // Refresh inventory quantities from database
        const prodRes = await getProductsAction({ limit: 100 });
        if (prodRes.success && prodRes.data) {
          setProducts((prodRes.data as any).products || []);
        }

        setCheckoutOpen(false);
        setReceiptOpen(true);
        clearCart();
      } else {
        setErrorMsg(res.message || "Transaction error. Unable to complete sale.");
      }
    } catch {
      setErrorMsg("Transaction error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-7.5rem)]">
      {/* LEFT SECTION: Product Catalog & Search (65% width on desktop) */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Barcode Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search product name, SKU, or scan barcode (Enter to add)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-12 bg-white text-sm"
              autoFocus
            />
            <div className="absolute right-3 top-2.5 text-slate-400">
              <Barcode className="h-4 w-4" />
            </div>
          </form>

          {/* Quick Walk-in Customer tag */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 shrink-0">
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold">{customerName}</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar bg-white">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Products in Store Inventory</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Your database currently has 0 items. Add products to your inventory catalog to start ringing up sales.
              </p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 text-xs">
                  <Plus className="h-4 w-4" /> Create Product in Inventory
                </Button>
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingCart className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No products match your search</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOutOfStock = product.stockQuantity <= 0;
              const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isOutOfStock
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      : "border-slate-200 bg-white hover:border-blue-500 hover:shadow-md active:scale-[0.98]"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase truncate">
                        {product.sku}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                          {product.stockQuantity} left
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-400">
                          {product.stockQuantity} in stock
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <MoneyDisplay
                      amount={product.sellingPrice}
                      className="text-sm font-bold text-slate-900"
                    />
                    <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart & Fast Tender (35% width on desktop) */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Active Order</h3>
            <Badge variant="secondary" className="text-xs">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </Badge>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-100 space-y-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingCart className="h-10 w-10 text-slate-200 mb-2" />
              <p className="text-xs font-medium">Your cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click or scan items to begin</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <MoneyDisplay amount={item.unitPrice} /> x {item.quantity}
                  </p>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.product.stockQuantity}
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="h-6 w-6 rounded-md text-slate-400 hover:text-rose-600 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Summary & Checkout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <MoneyDisplay amount={subtotal} className="font-semibold text-slate-800" />
            </div>

            <div className="flex items-center justify-between">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  placeholder="0"
                  className="w-12 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white"
                />
                <span>%</span>
                <span className="font-semibold text-emerald-600 ml-1">
                  -<MoneyDisplay amount={discountAmount} />
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
              <span>Grand Total</span>
              <MoneyDisplay amount={grandTotal} className="text-blue-600 text-lg" />
            </div>
          </div>

          <Button
            type="button"
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm gap-2"
          >
            <Banknote className="h-5 w-5" />
            <span>Pay <MoneyDisplay amount={grandTotal} className="text-white" /></span>
          </Button>
        </div>
      </div>

      {/* CHECKOUT DIALOG MODAL */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete POS Sale</DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "CASH", label: "Cash", icon: Banknote },
                  { id: "CARD", label: "Card", icon: CreditCard },
                  { id: "BANK_TRANSFER", label: "Bank", icon: Building },
                  { id: "CREDIT", label: "Credit", icon: UserCheck },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total due card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-600">Total Due</span>
              <MoneyDisplay amount={grandTotal} className="text-xl font-bold text-slate-900" />
            </div>

            {/* Cash Tender Calculation */}
            {paymentMethod === "CASH" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Amount Tendered (Cash Given)
                </label>
                <Input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="text-lg font-bold text-slate-900"
                  placeholder="0.00"
                  autoFocus
                />

                {/* Quick denomination pills */}
                <div className="flex gap-2">
                  {[500, 1000, 2000, 5000].map((denom) => (
                    <button
                      key={denom}
                      type="button"
                      onClick={() => setAmountTendered(denom.toString())}
                      className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700"
                    >
                      +{denom}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmountTendered(grandTotal.toString())}
                    className="px-2.5 py-1 text-xs rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700"
                  >
                    Exact
                  </button>
                </div>

                {/* Change return calculation */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center mt-2">
                  <span className="text-xs font-semibold text-emerald-800">Change Due</span>
                  <MoneyDisplay amount={changeDue} className="text-xl font-bold text-emerald-700" />
                </div>
              </div>
            )}

            {/* Customer input for credit/tabs */}
            {paymentMethod === "CREDIT" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Customer Name for Store Credit
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
                <p className="text-[11px] text-amber-600 mt-1">
                  Sale will be recorded with status UNPAID and customer balance will be updated.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isProcessing || (paymentMethod === "CASH" && tenderedNumeric < grandTotal)}
              onClick={handleCompleteSale}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isProcessing ? "Processing..." : "Confirm & Print Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* THERMAL RECEIPT DIALOG MODAL */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          {/* Printable 80mm Thermal Receipt Content */}
          <div id="printable-receipt" className="p-6 font-mono text-xs bg-white text-slate-900 space-y-3">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-bold uppercase tracking-wider">SmartBiz Store</h2>
              <p className="text-[11px] text-slate-500">Official Sales Receipt</p>
              <p className="text-[11px] text-slate-500 mt-1">Tel: +94 11 234 5678</p>
            </div>

            <div className="space-y-0.5 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold">{completedSale?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{completedSale?.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{completedSale?.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{completedSale?.customerName}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="border-b border-dashed border-slate-300 pb-2 space-y-1.5">
              {completedSale?.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div className="max-w-[180px] truncate">
                    <span>{item.product.name}</span>
                    <span className="text-slate-500 block text-[10px]">
                      {item.quantity} x {item.unitPrice}
                    </span>
                  </div>
                  <span className="font-semibold">
                    <MoneyDisplay amount={item.quantity * item.unitPrice} />
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <MoneyDisplay amount={completedSale?.subtotal || 0} />
              </div>
              {completedSale?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-<MoneyDisplay amount={completedSale.discountAmount} /></span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <MoneyDisplay amount={completedSale?.grandTotal || 0} />
              </div>
              <div className="flex justify-between">
                <span>Paid ({completedSale?.paymentMethod}):</span>
                <MoneyDisplay amount={completedSale?.amountPaid || 0} />
              </div>
              {completedSale?.changeDue > 0 && (
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Change:</span>
                  <MoneyDisplay amount={completedSale.changeDue} />
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-500">
              <p className="font-semibold">Thank you for your business!</p>
              <p>Items exchangeable within 7 days with receipt</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setReceiptOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start New Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
