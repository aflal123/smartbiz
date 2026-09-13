"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRight,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { getDashboardMetricsAction } from "@/actions/finance";

interface MetricsData {
  today: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    expenses: number;
    salesCount: number;
  };
  month: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    expenses: number;
    salesCount: number;
  };
  lowStockCount: number;
  recentSales: any[];
  topProducts: any[];
  lowStockProducts: any[];
}

const emptyMetrics: MetricsData = {
  today: { revenue: 0, cogs: 0, grossProfit: 0, netProfit: 0, expenses: 0, salesCount: 0 },
  month: { revenue: 0, cogs: 0, grossProfit: 0, netProfit: 0, expenses: 0, salesCount: 0 },
  lowStockCount: 0,
  recentSales: [],
  topProducts: [],
  lowStockProducts: [],
};

export default function DashboardPage() {
  const [period, setPeriod] = React.useState<"today" | "month">("today");
  const [metrics, setMetrics] = React.useState<MetricsData>(emptyMetrics);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardMetricsAction();
      if (res.success && res.data) {
        const d = res.data as any;
        setMetrics({
          today: d.today || emptyMetrics.today,
          month: d.month || d.thisMonth || emptyMetrics.month,
          lowStockCount: d.lowStockCount ?? d.inventory?.lowStockCount ?? 0,
          recentSales: d.recentSales || [],
          topProducts: d.topProducts || [],
          lowStockProducts: d.lowStockProducts || d.inventory?.lowStockProducts || [],
        });
      }
    } catch {
      // Retain clean empty metrics
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const activeStats = period === "today" ? metrics.today : metrics.month;
  const grossMargin = activeStats.revenue > 0
    ? ((activeStats.grossProfit / activeStats.revenue) * 100).toFixed(1)
    : "0.0";
  const netMargin = activeStats.revenue > 0
    ? ((activeStats.netProfit / activeStats.revenue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Store Bento Dashboard"
        description="Real-time SME business metrics, true profit calculations, and bento telemetry."
      >
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === "today"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === "month"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            This Month
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="gap-1.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Link href="/pos">
          <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 font-semibold">
            <ShoppingCart className="h-4 w-4" />
            <span>Launch POS</span>
          </Button>
        </Link>
      </PageHeader>

      {/* ULTRA-PREMIUM BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BENTO CARD 1: Electric Blue POS Revenue Card (Spans 2 cols on Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 text-white shadow-2xl shadow-blue-600/20 border border-blue-400/30 flex flex-col justify-between min-h-[220px]"
        >
          {/* Subtle wave background lines */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-4 -bottom-4 w-48 h-48 rounded-full border border-white/20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase text-blue-100 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
                  POS TERMINAL REVENUE
                </span>
              </div>
              <Link
                href="/pos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-transform hover:scale-105 backdrop-blur-md"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-4">
              <span className="text-xs text-blue-100 font-medium">Total Gross Sales ({period})</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                <MoneyDisplay amount={activeStats.revenue} />
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/15 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-blue-200">**** {activeStats.salesCount}</span>
              <span className="text-blue-100">completed invoices</span>
            </div>
            <span className="font-semibold text-blue-100 bg-white/10 px-2 py-0.5 rounded-md">
              Live DB Sync
            </span>
          </div>
        </motion.div>

        {/* BENTO CARD 2: Quick Links & Action Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/pos" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700/60 hover:border-blue-500/40 transition-all text-center group">
                <ShoppingCart className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">New Sale</span>
              </Link>
              <Link href="/products" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-emerald-600/20 border border-slate-700/60 hover:border-emerald-500/40 transition-all text-center group">
                <Plus className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Add Stock</span>
              </Link>
              <Link href="/expenses" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-rose-600/20 border border-slate-700/60 hover:border-rose-500/40 transition-all text-center group">
                <CreditCard className="h-5 w-5 text-rose-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Expense</span>
              </Link>
              <Link href="/ai" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-purple-600/20 border border-slate-700/60 hover:border-purple-500/40 transition-all text-center group">
                <Sparkles className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">AI Suite</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* BENTO CARD 3: Vibrant Coral / Orange Net Profit Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-red-600 p-6 text-white shadow-2xl shadow-rose-600/20 border border-rose-400/30 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">True Net Profit</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-3xl font-extrabold tracking-tight">
                <MoneyDisplay amount={activeStats.netProfit} />
              </h3>
              <p className="text-xs text-rose-100 font-medium mt-1">
                {netMargin}% net profit margin after COGS & Expenses
              </p>
            </div>
          </div>

          {/* Sparkline curve visualization */}
          <div className="relative mt-4 pt-2">
            <div className="flex items-center justify-between text-[10px] text-rose-100 font-medium mb-1">
              <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
            <div className="h-8 w-full flex items-end justify-between gap-1">
              <div className="w-1/6 bg-white/30 rounded-t h-[40%]" />
              <div className="w-1/6 bg-white/50 rounded-t h-[60%]" />
              <div className="w-1/6 bg-white/40 rounded-t h-[45%]" />
              <div className="w-1/6 bg-white/70 rounded-t h-[80%]" />
              <div className="w-1/6 bg-white rounded-t h-[100%] shadow-lg shadow-white/40 relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-rose-600 text-[9px] font-bold px-1.5 rounded-full shadow-xs">
                  Peak
                </span>
              </div>
              <div className="w-1/6 bg-white/60 rounded-t h-[70%]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* BENTO SECOND ROW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* COGS & Expense Breakdown Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Margin Breakdown</h3>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>

            {/* Vertical Column Bar Visualization */}
            <div className="grid grid-cols-3 gap-3 my-3 text-center">
              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-emerald-500 rounded-lg shadow-md shadow-emerald-500/20 transition-all" style={{ height: `${Math.min(100, Math.max(20, Number(grossMargin)))}%` }} />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-2">{grossMargin}%</span>
                <span className="text-[9px] text-slate-400">Gross</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-amber-500 rounded-lg shadow-md shadow-amber-500/20 transition-all" style={{ height: "45%" }} />
                </div>
                <span className="text-[10px] font-bold text-amber-400 mt-2">
                  <MoneyDisplay amount={activeStats.cogs} />
                </span>
                <span className="text-[9px] text-slate-400">COGS</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-blue-500 rounded-lg shadow-md shadow-blue-500/20 transition-all" style={{ height: "30%" }} />
                </div>
                <span className="text-[10px] font-bold text-blue-400 mt-2">
                  <MoneyDisplay amount={activeStats.expenses} />
                </span>
                <span className="text-[9px] text-slate-400">Expense</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Formula</span>
            <span className="font-semibold text-slate-200">Rev - COGS - Exp</span>
          </div>
        </motion.div>

        {/* Customer Avatar & Staff Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Network</h3>
              <Users className="h-4 w-4 text-blue-400" />
            </div>

            <div className="my-4">
              <span className="text-2xl font-extrabold text-white">{activeStats.salesCount}</span>
              <p className="text-xs text-slate-400 mt-0.5">Transactions completed this period</p>
            </div>

            {/* Stacked Avatars */}
            <div className="flex items-center space-x-2 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs text-center leading-8 border-2 border-slate-900">
                  A
                </div>
                <div className="inline-block h-8 w-8 rounded-full bg-emerald-600 text-white font-bold text-xs text-center leading-8 border-2 border-slate-900">
                  M
                </div>
                <div className="inline-block h-8 w-8 rounded-full bg-purple-600 text-white font-bold text-xs text-center leading-8 border-2 border-slate-900">
                  S
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black text-xs border-2 border-slate-900">
                  +{metrics.recentSales.length}
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium pl-1">Active Customers</span>
            </div>
          </div>

          <Link href="/customers" className="pt-3 border-t border-slate-800/80 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between">
            <span>Manage CRM Accounts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* AI Assistant Bento Card (Spans 2 cols on lg) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-900 border border-purple-800/40 p-5 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-md shadow-purple-600/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">Gemini AI Executive Advisor</h3>
              </div>
              <Link href="/ai">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-300 hover:text-white hover:bg-purple-900/50">
                  Open AI Suite
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-900/50 text-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Data Telemetry Summary</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Store generated <span className="font-bold text-white"><MoneyDisplay amount={activeStats.revenue} /></span> with <span className="font-bold text-emerald-400">{grossMargin}%</span> gross margin. COGS stands at <MoneyDisplay amount={activeStats.cogs} />.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <Link href="/ai?tab=insights" className="text-purple-400 hover:text-purple-300 underline font-medium">
              Generate AI forecast →
            </Link>
            <span className="text-slate-500 text-[11px]">Updated live from Prisma</span>
          </div>
        </motion.div>
      </div>

      {/* RECENT SALES & TOP PRODUCTS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Bento Card */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/90 text-slate-100 shadow-xl rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <CardTitle className="text-base font-bold text-white">
                Recent Sales Transactions
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Live transaction ledger directly from PostgreSQL
              </CardDescription>
            </div>
            <Link href="/sales">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-blue-400 hover:text-blue-300">
                <span>View All Ledger</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 py-8">
                        No sales transactions recorded yet. Launch POS to ring up your first sale!
                      </td>
                    </tr>
                  ) : (
                    metrics.recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 font-semibold text-blue-400 font-mono">
                          <Link href={`/sales?search=${sale.invoiceNumber}`}>
                            {sale.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-300">
                          {sale.customerName || sale.customer?.name || "Walk-in Customer"}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-white">
                          <MoneyDisplay amount={sale.totalAmount} />
                        </td>
                        <td className="py-3 text-right">
                          <StatusBadge status={sale.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts Bento Card */}
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-xl rounded-3xl">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-base font-bold text-white">
                  Inventory Alerts
                </CardTitle>
              </div>
              <span className="rounded-full bg-amber-950 border border-amber-800/80 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                {(metrics?.lowStockProducts || []).length} Items
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(metrics?.lowStockProducts || []).length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-xs">
                <p>All stock levels healthy!</p>
              </div>
            ) : (
              (metrics?.lowStockProducts || []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-amber-900/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-200 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-400">{p.stockQuantity} left</span>
                    <p className="text-[10px] text-slate-500">Min: {p.lowStockThreshold}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/inventory" className="block pt-2 text-center">
              <span className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                Manage Stock Adjustments →
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
