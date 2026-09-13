"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { getFinancialReportAction, getDashboardMetricsAction } from "@/actions/finance";

interface ReportData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  salesCount: number;
  dailyBreakdown?: { date: string; revenue: number; cogs: number; grossProfit: number; expenses: number; netProfit: number }[];
  paymentBreakdown?: { method: string; count: number; total: number }[];
  topProducts?: { name: string; totalSold: number; revenue: number; profit: number }[];
}

const emptyReport: ReportData = {
  revenue: 0,
  cogs: 0,
  grossProfit: 0,
  grossMarginPercent: 0,
  totalExpenses: 0,
  netProfit: 0,
  netMarginPercent: 0,
  salesCount: 0,
  dailyBreakdown: [],
  paymentBreakdown: [],
  topProducts: [],
};

export default function ReportsPage() {
  const [report, setReport] = React.useState<ReportData>(emptyReport);
  const [loading, setLoading] = React.useState(true);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const loadReport = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFinancialReportAction({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success && res.data) {
        setReport(res.data as ReportData);
      }
    } catch {} finally { setLoading(false); }
  }, [startDate, endDate]);

  React.useEffect(() => { loadReport(); }, [loadReport]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & P&L" description="Comprehensive financial reports with real COGS-based profit calculations.">
        <Button variant="outline" size="sm" onClick={loadReport} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </Button>
      </PageHeader>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-700">Report Period:</span>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto max-w-[160px]" />
        <span className="text-xs text-slate-400">to</span>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto max-w-[160px]" />
        <Button size="sm" onClick={loadReport} className="bg-blue-600 hover:bg-blue-700 text-white">Generate Report</Button>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500 uppercase font-semibold">Revenue</p><DollarSign className="h-4 w-4 text-blue-600" /></div>
            <MoneyDisplay amount={report.revenue} className="text-xl font-bold text-slate-900" />
            <p className="text-xs text-slate-500 mt-0.5">{report.salesCount} transactions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500 uppercase font-semibold">COGS</p><Package className="h-4 w-4 text-rose-500" /></div>
            <MoneyDisplay amount={report.cogs} className="text-xl font-bold text-slate-900" />
            <p className="text-xs text-slate-500 mt-0.5">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-emerald-600 uppercase font-semibold">Gross Profit</p><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
            <MoneyDisplay amount={report.grossProfit} variant="profit" className="text-xl font-bold" />
            <div className="flex items-center gap-1 mt-0.5"><ArrowUpRight className="h-3 w-3 text-emerald-500" /><span className="text-xs font-semibold text-emerald-600">{report.grossMarginPercent?.toFixed(1) || "0.0"}% margin</span></div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-xs bg-gradient-to-br from-white to-blue-50/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-blue-700 uppercase font-bold">Net Profit</p><TrendingUp className="h-4 w-4 text-blue-700" /></div>
            <MoneyDisplay amount={report.netProfit} className="text-xl font-bold text-blue-700" />
            <div className="flex items-center gap-1 mt-0.5"><span className="bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px] font-bold text-blue-700">{report.netMarginPercent?.toFixed(1) || "0.0"}%</span><span className="text-[11px] text-slate-500">net margin</span></div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Breakdown Ribbon */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900">Profit & Loss Statement</CardTitle>
          <CardDescription className="text-xs text-slate-500">SmartBiz V2 uses real COGS line-item math, not estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Sales Revenue</span><MoneyDisplay amount={report.revenue} className="font-semibold text-slate-900" /></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Cost of Goods Sold (COGS)</span><span className="font-semibold text-rose-600">-<MoneyDisplay amount={report.cogs} /></span></div>
            <div className="flex justify-between py-2 border-b border-slate-200 bg-emerald-50/50 px-3 rounded-lg"><span className="font-bold text-emerald-800">Gross Profit</span><MoneyDisplay amount={report.grossProfit} variant="profit" className="font-bold text-lg" /></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Operating Expenses</span><span className="font-semibold text-rose-600">-<MoneyDisplay amount={report.totalExpenses} /></span></div>
            <div className="flex justify-between py-3 bg-blue-50/70 px-3 rounded-lg"><span className="font-bold text-blue-800 text-base">True Net Profit</span><MoneyDisplay amount={report.netProfit} className="font-bold text-xl text-blue-700" /></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
          <TabsTrigger value="payment">By Payment Method</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">COGS</TableHead>
              <TableHead className="text-right">Gross Profit</TableHead><TableHead className="text-right">Expenses</TableHead><TableHead className="text-right">Net Profit</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(report.dailyBreakdown || []).map((d) => (
                <TableRow key={d.date}>
                  <TableCell className="text-sm font-medium text-slate-700">{d.date}</TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={d.revenue} /></TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={d.cogs} variant="muted" /></TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={d.grossProfit} variant="profit" /></TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={d.expenses} variant="loss" /></TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={d.netProfit} variant={d.netProfit >= 0 ? "profit" : "loss"} className="font-bold" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="payment">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Payment Method</TableHead><TableHead className="text-right">Transactions</TableHead><TableHead className="text-right">Total Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(report.paymentBreakdown || []).map((p) => (
                <TableRow key={p.method}>
                  <TableCell className="font-semibold text-slate-900">{p.method.replace("_", " ")}</TableCell>
                  <TableCell className="text-right text-slate-600">{p.count}</TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={p.total} className="font-bold text-slate-900" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="products">
          <Table>
            <TableHeader><TableRow>
              <TableHead>#</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Profit</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(report.topProducts || []).map((p, i) => (
                <TableRow key={p.name}>
                  <TableCell className="font-bold text-slate-400">{i + 1}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                  <TableCell className="text-right text-slate-600">{p.totalSold}</TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={p.revenue} /></TableCell>
                  <TableCell className="text-right"><MoneyDisplay amount={p.profit} variant="profit" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
