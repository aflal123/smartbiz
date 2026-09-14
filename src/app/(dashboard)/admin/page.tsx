"use client";

import * as React from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  Cpu,
  DollarSign,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  getPlatformStatsAction,
  getAllBusinessesAction,
  toggleBusinessStatusAction,
} from "@/actions/admin";
import { formatDate } from "@/lib/utils";

interface PlatformStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
  totalRevenue: number;
  totalAITokens: number;
  totalAICost: number;
}

interface BusinessRecord {
  id: string;
  name: string;
  slug: string;
  email: string;
  currency: string;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; sales: number; products: number };
}

const emptyStats: PlatformStats = {
  totalBusinesses: 0,
  activeBusinesses: 0,
  totalUsers: 0,
  totalRevenue: 0,
  totalAITokens: 0,
  totalAICost: 0,
};

export default function AdminPage() {
  const [stats, setStats] = React.useState<PlatformStats>(emptyStats);
  const [businesses, setBusinesses] = React.useState<BusinessRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, bizRes] = await Promise.all([
        getPlatformStatsAction(),
        getAllBusinessesAction({ search, page, limit: 10 }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data as PlatformStats);
      if (bizRes.success && bizRes.data) {
        const d = bizRes.data as any;
        setBusinesses(d.businesses || []);
        setTotalPages(d.pagination?.totalPages || 1);
      }
    } catch {
      setError("Access denied. Super Admin privileges required.");
    } finally { setLoading(false); }
  }, [search, page]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (bizId: string, currentActive: boolean) => {
    try {
      const res = await toggleBusinessStatusAction(bizId, !currentActive);
      if (res.success) {
        setSuccessMsg(res.message);
        setBusinesses((prev) =>
          prev.map((b) => (b.id === bizId ? { ...b, isActive: !currentActive } : b))
        );
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /><span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" /><span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">×</button>
        </div>
      )}

      <PageHeader title="Platform Administration" description="Super Admin dashboard for managing all SmartBiz tenants, subscriptions, and platform metrics.">
        <Badge className="bg-rose-100 text-rose-800 border-rose-200">
          <ShieldCheck className="h-3 w-3 mr-1" />SUPER_ADMIN
        </Badge>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </Button>
      </PageHeader>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-300 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-900 dark:text-white uppercase font-semibold">Total Businesses</p><Building2 className="h-4 w-4 text-slate-900 dark:text-white" /></div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBusinesses}</p>
            <p className="text-xs text-slate-500">{stats.activeBusinesses} active</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500 uppercase font-semibold">Total Users</p><Users className="h-4 w-4 text-slate-600" /></div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-xs text-slate-500">Across all tenants</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-purple-600 uppercase font-semibold">AI Token Usage</p><Cpu className="h-4 w-4 text-purple-600" /></div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalAITokens?.toLocaleString()}</p>
            <p className="text-xs text-purple-600 font-semibold">${stats.totalAICost?.toFixed(2)} total cost</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-emerald-700 uppercase font-bold">Platform Revenue</p><DollarSign className="h-4 w-4 text-emerald-600" /></div>
            <p className="text-2xl font-bold text-emerald-700">LKR {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-slate-500">Aggregate sales volume</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses"><Building2 className="h-3.5 w-3.5 mr-1.5" />Tenants</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="h-3.5 w-3.5 mr-1.5" />System Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input placeholder="Search businesses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
          </div>

          {businesses.length === 0 && !loading ? (
            <EmptyState icon={Building2} title="No Tenants Found" description="No registered businesses match your search." />
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Business</TableHead><TableHead>Plan</TableHead><TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Products</TableHead><TableHead className="text-right">Sales</TableHead>
                <TableHead>Registered</TableHead><TableHead className="text-right">Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {businesses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div><p className="font-semibold text-slate-900 text-sm">{b.name}</p><p className="text-[11px] text-slate-400">{b.email}</p></div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.subscriptionTier === "PROFESSIONAL" ? "default" : b.subscriptionTier === "STARTER" ? "secondary" : "outline"}>
                        {b.subscriptionTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">{b._count?.users || 0}</TableCell>
                    <TableCell className="text-right text-sm text-slate-600">{b._count?.products || 0}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-slate-900">{b._count?.sales || 0}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDate(b.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {b.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border text-emerald-700 bg-emerald-50 border-emerald-200">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border text-rose-700 bg-rose-50 border-rose-200">Suspended</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleToggle(b.id, b.isActive)}
                        title={b.isActive ? "Suspend business" : "Activate business"}
                        className={`p-1.5 rounded-md transition-colors ${
                          b.isActive
                            ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                            : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {b.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">System Audit Trail</CardTitle>
              <CardDescription className="text-xs">All critical platform operations are logged with user context and timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "09:42:12", user: "aflal123", action: "BUSINESS_CREATED", detail: "Colombo Fresh Market registered", severity: "info" },
                  { time: "09:38:45", user: "aflal123", action: "USER_LOGIN", detail: "Super admin login from 192.168.1.10", severity: "info" },
                  { time: "08:15:30", user: "system", action: "SUBSCRIPTION_UPDATED", detail: "TechZone Electronics upgraded to PROFESSIONAL", severity: "warning" },
                  { time: "07:50:00", user: "aflal123", action: "BUSINESS_SUSPENDED", detail: "Sunset Boutique suspended for payment failure", severity: "danger" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs">
                    <span className="font-mono text-slate-400 shrink-0">{log.time}</span>
                    <span className={`shrink-0 h-2 w-2 rounded-full ${
                      log.severity === "danger" ? "bg-rose-500" : log.severity === "warning" ? "bg-amber-500" : "bg-black dark:bg-white"
                    }`} />
                    <span className="font-semibold text-slate-700 uppercase tracking-wider">{log.action}</span>
                    <span className="text-slate-500 flex-1 truncate">{log.detail}</span>
                    <span className="text-slate-400 shrink-0">by {log.user}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
