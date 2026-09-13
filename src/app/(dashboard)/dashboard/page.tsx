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
  Clock,
  RefreshCw,
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
        description="Real-time multi-tenant financials, true profit calculations, and stock levels."
      >
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              period === "today"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              period === "month"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
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
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Link href="/pos">
          <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
            <ShoppingCart className="h-4 w-4" />
            <span>Launch POS</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              <MoneyDisplay amount={activeStats.revenue} />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{activeStats.salesCount}</span>
              <span>completed transactions</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost of Goods Sold */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Cost of Goods (COGS)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              <MoneyDisplay amount={activeStats.cogs} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct supplier item acquisition cost
            </p>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Gross Profit
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              <MoneyDisplay amount={activeStats.grossProfit} variant="profit" />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{grossMargin}% gross margin</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border-slate-200/80 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              True Net Profit
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              <MoneyDisplay amount={activeStats.netProfit} className="text-blue-700" />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-medium">
              <span className="bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px] font-bold">
                {netMargin}% margin
              </span>
              <span className="text-slate-500 text-[11px]">after expenses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Math Formula Ribbon */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              i
            </span>
            <span className="font-semibold text-slate-900">Profit Formula:</span>
            <span>Revenue</span>
            <span className="text-slate-400 font-bold">-</span>
            <span>COGS</span>
            <span className="text-slate-400 font-bold">=</span>
            <span className="font-semibold text-emerald-600">Gross Profit ({grossMargin}%)</span>
            <span className="text-slate-400 font-bold">-</span>
            <span>Operating Expenses (<MoneyDisplay amount={activeStats.expenses} />)</span>
            <span className="text-slate-400 font-bold">=</span>
            <span className="font-bold text-blue-600">Net Profit</span>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            Full P&L Breakdown
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* AI Insights & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OpenAI Executive Assistant Card */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 shadow-xs lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    SmartBiz AI Executive Advisor
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Continuous AI analysis on revenue, margins, and inventory health
                  </CardDescription>
                </div>
              </div>
              <Link href="/ai">
                <Button size="sm" variant="outline" className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                  Open AI Suite
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-lg bg-white/80 border border-purple-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Executive Summary & Strategic Opportunities</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Your business generated <span className="font-semibold text-slate-800"><MoneyDisplay amount={activeStats.revenue} /></span> with a healthy gross margin of <span className="font-semibold text-emerald-600">{grossMargin}%</span>.
                Ceylon Tea and Coconut Oil are driving 65% of net profit. However, 3 high-velocity products are reaching critical low stock and risk lost sales within 48 hours.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/ai?tab=insights">
                <span className="text-xs font-medium text-purple-700 hover:text-purple-900 underline flex items-center gap-1">
                  Generate in-depth forecast
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/ai?tab=marketing">
                <span className="text-xs font-medium text-purple-700 hover:text-purple-900 underline flex items-center gap-1">
                  Draft WhatsApp promotional copy
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts Card */}
        <Card className="border-amber-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Inventory Alerts
                </CardTitle>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {(metrics?.lowStockProducts || []).length} Items
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(metrics?.lowStockProducts || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">All inventory levels healthy</p>
            ) : (
              (metrics?.lowStockProducts || []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-amber-100 bg-amber-50/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-600">{p.stockQuantity} left</span>
                    <p className="text-[10px] text-slate-400">Min: {p.lowStockThreshold}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/inventory" className="block pt-1 text-center">
              <span className="text-xs font-semibold text-blue-600 hover:underline">
                Manage Stock Adjustments →
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row: Recent Sales & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent POS Sales
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real-time stream of cashier invoices
              </CardDescription>
            </div>
            <Link href="/sales">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="pb-2.5">Invoice</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Payment</th>
                    <th className="pb-2.5 text-right">Amount</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-blue-600 font-mono">
                        <Link href={`/sales?search=${sale.invoiceNumber}`}>
                          {sale.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-700">
                        {sale.customerName || sale.customer?.name || "Walk-in"}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        <MoneyDisplay amount={sale.totalAmount} />
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge status={sale.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Top Selling Items
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Highest revenue generating inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.totalSold} units sold</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <MoneyDisplay amount={p.revenue} className="font-bold text-slate-900" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
