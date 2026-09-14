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
        title="Store Dashboard"
        description="Real-time SME business metrics, true profit calculations, and live telemetry."
      >
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === "today"
                ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === "month"
                ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
          className="gap-1.5 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Link href="/pos">
          <Button size="sm" className="gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold shadow-xs">
            <ShoppingCart className="h-4 w-4" />
            <span>Launch POS</span>
          </Button>
        </Link>
      </PageHeader>

      {/* ULTRA-PREMIUM BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BENTO CARD 1: POS Revenue Card (Spans 2 cols on Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-black dark:bg-white text-white dark:text-black p-6 shadow-xl border border-slate-900 dark:border-slate-100 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase bg-white/20 dark:bg-black/20 text-white dark:text-black px-2.5 py-1 rounded-full backdrop-blur-md">
                  POS TERMINAL REVENUE
                </span>
              </div>
              <Link
                href="/pos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 dark:bg-black/20 text-white dark:text-black transition-transform hover:scale-105 backdrop-blur-md"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-300 dark:text-slate-700 font-medium">Total Gross Sales ({period})</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                <MoneyDisplay amount={activeStats.revenue} />
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-black/20 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300 dark:text-slate-700">**** {activeStats.salesCount}</span>
              <span className="text-slate-300 dark:text-slate-700">completed invoices</span>
            </div>
            <span className="font-semibold bg-white/10 dark:bg-black/10 px-2 py-0.5 rounded-md">
              Live DB Sync
            </span>
          </div>
        </motion.div>

        {/* BENTO CARD 2: Quick Links & Action Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Actions</h3>
              <Zap className="h-4 w-4 text-slate-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/pos" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-slate-200 dark:border-slate-700/60 transition-all text-center group">
                <ShoppingCart className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">New Sale</span>
              </Link>
              <Link href="/products" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-slate-200 dark:border-slate-700/60 transition-all text-center group">
                <Plus className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">Add Stock</span>
              </Link>
              <Link href="/expenses" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-slate-200 dark:border-slate-700/60 transition-all text-center group">
                <CreditCard className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">Expense</span>
              </Link>
              <Link href="/ai" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-slate-200 dark:border-slate-700/60 transition-all text-center group">
                <Sparkles className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">AI Suite</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* BENTO CARD 3: True Net Profit Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 p-6 text-white shadow-xl border border-slate-800 dark:border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">True Net Profit</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-3xl font-extrabold tracking-tight">
                <MoneyDisplay amount={activeStats.netProfit} />
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {netMargin}% net profit margin after COGS & Expenses
              </p>
            </div>
          </div>

          {/* Sparkline curve visualization */}
          <div className="relative mt-4 pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
              <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
            <div className="h-8 w-full flex items-end justify-between gap-1">
              <div className="w-1/6 bg-white/20 rounded-t h-[40%]" />
              <div className="w-1/6 bg-white/40 rounded-t h-[60%]" />
              <div className="w-1/6 bg-white/30 rounded-t h-[45%]" />
              <div className="w-1/6 bg-white/60 rounded-t h-[80%]" />
              <div className="w-1/6 bg-white rounded-t h-[100%] shadow-lg shadow-white/40 relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-1.5 rounded-full shadow-xs">
                  Peak
                </span>
              </div>
              <div className="w-1/6 bg-white/50 rounded-t h-[70%]" />
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
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Margin Breakdown</h3>
              <Activity className="h-4 w-4 text-slate-900 dark:text-white" />
            </div>

            {/* Vertical Column Bar Visualization */}
            <div className="grid grid-cols-3 gap-3 my-3 text-center">
              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-black dark:bg-white rounded-lg transition-all" style={{ height: `${Math.min(100, Math.max(20, Number(grossMargin)))}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white mt-2">{grossMargin}%</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Gross</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-slate-600 dark:bg-slate-400 rounded-lg transition-all" style={{ height: "45%" }} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                  <MoneyDisplay amount={activeStats.cogs} />
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">COGS</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 flex items-end">
                  <div className="w-full bg-slate-400 dark:bg-slate-600 rounded-lg transition-all" style={{ height: "30%" }} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                  <MoneyDisplay amount={activeStats.expenses} />
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Expense</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Formula</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">Rev - COGS - Exp</span>
          </div>
        </motion.div>

        {/* Customer Avatar & Staff Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Store Network</h3>
              <Users className="h-4 w-4 text-slate-900 dark:text-white" />
            </div>

            <div className="my-4">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeStats.salesCount}</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Transactions completed this period</p>
            </div>

            {/* Stacked Avatars */}
            <div className="flex items-center space-x-2 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs text-center leading-8 border-2 border-white dark:border-slate-900">
                  A
                </div>
                <div className="inline-block h-8 w-8 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-black font-bold text-xs text-center leading-8 border-2 border-white dark:border-slate-900">
                  M
                </div>
                <div className="inline-block h-8 w-8 rounded-full bg-slate-600 dark:bg-slate-400 text-white dark:text-black font-bold text-xs text-center leading-8 border-2 border-white dark:border-slate-900">
                  S
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border-2 border-white dark:border-slate-900">
                  +{metrics.recentSales.length}
                </div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">Active Customers</span>
            </div>
          </div>

          <Link href="/customers" className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center justify-between">
            <span>Manage CRM Accounts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* AI Assistant Bento Card (Spans 2 cols on lg) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">AI Executive Advisor</h3>
              </div>
              <Link href="/ai">
                <Button size="sm" variant="outline" className="h-7 text-xs border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white">
                  Open AI Suite
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white animate-pulse" />
                <span>Live Data Telemetry Summary</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Store generated <span className="font-bold text-slate-950 dark:text-white"><MoneyDisplay amount={activeStats.revenue} /></span> with <span className="font-bold text-slate-950 dark:text-white">{grossMargin}%</span> gross margin. COGS stands at <MoneyDisplay amount={activeStats.cogs} />.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <Link href="/ai?tab=insights" className="text-slate-900 dark:text-white hover:underline font-bold">
              Generate AI forecast →
            </Link>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Updated live from Prisma</span>
          </div>
        </motion.div>
      </div>

      {/* RECENT SALES & TOP PRODUCTS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Bento Card */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Recent Sales Transactions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Live transaction ledger directly from PostgreSQL
              </CardDescription>
            </div>
            <Link href="/sales">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-slate-900 dark:text-white font-semibold">
                <span>View All Ledger</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {metrics.recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 dark:text-slate-400 py-8">
                        No sales transactions recorded yet. Launch POS to ring up your first sale!
                      </td>
                    </tr>
                  ) : (
                    metrics.recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white font-mono">
                          <Link href={`/sales?search=${sale.invoiceNumber}`}>
                            {sale.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">
                          {sale.customerName || sale.customer?.name || "Walk-in Customer"}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
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
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs rounded-3xl">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Inventory Alerts
                </CardTitle>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                {(metrics?.lowStockProducts || []).length} Items
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(metrics?.lowStockProducts || []).length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8 text-xs">
                <p>All stock levels healthy!</p>
              </div>
            ) : (
              (metrics?.lowStockProducts || []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-200 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">{p.stockQuantity} left</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Min: {p.lowStockThreshold}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/inventory" className="block pt-2 text-center">
              <span className="text-xs font-semibold text-slate-900 dark:text-white hover:underline">
                Manage Stock Adjustments →
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
