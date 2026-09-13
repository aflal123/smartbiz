"use client";

import * as React from "react";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyDisplay } from "@/components/ui/money-display";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  getSuppliersAction,
  createSupplierAction,
  deleteSupplierAction,
} from "@/actions/parties";

interface Supplier {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  outstandingBalance: number;
  notes?: string | null;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "", companyName: "", email: "", phone: "", address: "", notes: "",
  });
  const [creating, setCreating] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliersAction({ search, page, limit: 15 });
      if (res.success && res.data) {
        const d = res.data as any;
        setSuppliers(d.suppliers || []);
        setTotalPages(d.pagination?.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [search, page]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      const res = await createSupplierAction({
        name: formData.name,
        companyName: formData.companyName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
      });
      if (!res.success) { setFormError(res.message); setCreating(false); return; }
      setSuccessMsg("Supplier added successfully!");
      setCreateOpen(false);
      setFormData({ name: "", companyName: "", email: "", phone: "", address: "", notes: "" });
      loadData();
    } catch { setFormError("Failed to create supplier."); } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this supplier?")) return;
    try { const res = await deleteSupplierAction(id); if (res.success) loadData(); } catch {}
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalPayable = suppliers.reduce((s, c) => s + Number(c.outstandingBalance || 0), 0);

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /><span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      <PageHeader title="Suppliers" description="Manage vendor relationships and track payable balances.">
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /><span>Add Supplier</span>
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-slate-500 uppercase font-semibold">Total Suppliers</p><p className="text-xl font-bold text-slate-900 mt-1">{suppliers.length}</p></div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Truck className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-amber-700 uppercase font-semibold">Total Payable</p><MoneyDisplay amount={totalPayable} className="text-xl font-bold text-amber-700 mt-1" /></div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Building2 className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input placeholder="Search suppliers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </Button>
      </div>

      {/* Table */}
      {suppliers.length === 0 && !loading ? (
        <EmptyState icon={Truck} title="No Suppliers Yet" description="Add vendors to track purchase orders and payable balances." action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 text-white"><Plus className="h-4 w-4" />Add Supplier</Button>
        } />
      ) : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Contact Name</TableHead><TableHead>Company</TableHead><TableHead>Contact Info</TableHead>
            <TableHead className="text-right">Balance Payable</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-semibold text-slate-900">{s.name}</TableCell>
                <TableCell className="text-sm text-slate-600">{s.companyName || "—"}</TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs text-slate-500">
                    {s.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>}
                    {s.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {Number(s.outstandingBalance) > 0 ? (
                    <MoneyDisplay amount={s.outstandingBalance} variant="loss" />
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Clear</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button type="button" onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" onClose={() => setCreateOpen(false)}>
          <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            {formError && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span></div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Contact Name *</label><Input name="name" required value={formData.name} onChange={handleFieldChange} placeholder="Nimal Fernando" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Company Name</label><Input name="companyName" value={formData.companyName} onChange={handleFieldChange} placeholder="Apex Trading Co." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Email</label><Input name="email" type="email" value={formData.email} onChange={handleFieldChange} placeholder="vendor@company.com" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Phone</label><Input name="phone" value={formData.phone} onChange={handleFieldChange} placeholder="+94 11 234 5678" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Address</label><Input name="address" value={formData.address} onChange={handleFieldChange} placeholder="456 Industrial Blvd, Colombo" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Notes</label><Textarea name="notes" value={formData.notes} onChange={handleFieldChange} placeholder="Primary tea supplier, 30-day credit terms..." rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">{creating ? "Adding..." : "Add Supplier"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
