"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Banknote,
  Phone,
  Mail,
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
  getCustomersAction,
  createCustomerAction,
  deleteCustomerAction,
  settleCustomerBalanceAction,
} from "@/actions/parties";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  outstandingBalance: number;
  notes?: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [creating, setCreating] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Settle balance
  const [settleCustomer, setSettleCustomer] = React.useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = React.useState("");
  const [settleMethod, setSettleMethod] = React.useState("CASH");
  const [settleNote, setSettleNote] = React.useState("");
  const [settling, setSettling] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomersAction({ search, page, limit: 15 });
      if (res.success && res.data) {
        const d = res.data as any;
        setCustomers(d.customers || []);
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
      const res = await createCustomerAction({
        name: formData.name, email: formData.email || null,
        phone: formData.phone || null, address: formData.address || null,
        notes: formData.notes || null,
      });
      if (!res.success) { setFormError(res.message); setCreating(false); return; }
      setSuccessMsg("Customer created!");
      setCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
      loadData();
    } catch { setFormError("Failed to create."); } finally { setCreating(false); }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCustomer) return;
    setSettling(true);
    try {
      const res = await settleCustomerBalanceAction({
        customerId: settleCustomer.id,
        amount: parseFloat(settleAmount),
        paymentMethod: settleMethod,
        referenceNote: settleNote || undefined,
      });
      if (res.success) {
        setSuccessMsg("Payment recorded and balance updated!");
        setSettleCustomer(null);
        loadData();
      }
    } catch {} finally { setSettling(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this customer?")) return;
    try { const res = await deleteCustomerAction(id); if (res.success) loadData(); } catch {}
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalOutstanding = customers.reduce((s, c) => s + Number(c.outstandingBalance || 0), 0);

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /><span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      <PageHeader title="Customers" description="Manage customer directory, outstanding balances, and collect payments.">
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /><span>Add Customer</span>
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-slate-500 uppercase font-semibold">Total Customers</p><p className="text-xl font-bold text-slate-900 mt-1">{customers.length}</p></div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-amber-700 uppercase font-semibold">Outstanding Dues</p><MoneyDisplay amount={totalOutstanding} className="text-xl font-bold text-amber-700 mt-1" /></div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Banknote className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-emerald-700 uppercase font-semibold">Zero Balance</p><p className="text-xl font-bold text-emerald-700 mt-1">{customers.filter((c) => Number(c.outstandingBalance) === 0).length}</p></div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </Button>
      </div>

      {/* Table */}
      {customers.length === 0 && !loading ? (
        <EmptyState icon={Users} title="No Customers Yet" description="Add your first customer to start tracking purchase history and credit." action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 bg-blue-600 text-white"><Plus className="h-4 w-4" />Add Customer</Button>
        } />
      ) : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell><p className="font-semibold text-slate-900">{c.name}</p>{c.address && <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.address}</p>}</TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs text-slate-500">
                    {c.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</p>}
                    {c.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {Number(c.outstandingBalance) > 0 ? (
                    <MoneyDisplay amount={c.outstandingBalance} variant="loss" />
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Settled</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {Number(c.outstandingBalance) > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setSettleCustomer(c); setSettleAmount(""); setSettleNote(""); }} className="gap-1 text-xs">
                        <Banknote className="h-3 w-3" />Collect
                      </Button>
                    )}
                    <button type="button" onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
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

      {/* CREATE CUSTOMER DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" onClose={() => setCreateOpen(false)}>
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            {formError && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span></div>}
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Full Name *</label><Input name="name" required value={formData.name} onChange={handleFieldChange} placeholder="Kamal Perera" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Email</label><Input name="email" type="email" value={formData.email} onChange={handleFieldChange} placeholder="kamal@email.com" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Phone</label><Input name="phone" value={formData.phone} onChange={handleFieldChange} placeholder="+94 77 123 4567" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Address</label><Input name="address" value={formData.address} onChange={handleFieldChange} placeholder="123 Main St, Colombo" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Notes</label><Textarea name="notes" value={formData.notes} onChange={handleFieldChange} placeholder="VIP customer, bulk buyer..." rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">{creating ? "Creating..." : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SETTLE BALANCE DIALOG */}
      <Dialog open={!!settleCustomer} onOpenChange={(open) => { if (!open) setSettleCustomer(null); }}>
        <DialogContent className="max-w-sm" onClose={() => setSettleCustomer(null)}>
          <DialogHeader><DialogTitle>Collect Payment</DialogTitle></DialogHeader>
          {settleCustomer && (
            <form onSubmit={handleSettle} className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm flex justify-between">
                <span className="text-slate-600">{settleCustomer.name} owes</span>
                <MoneyDisplay amount={settleCustomer.outstandingBalance} variant="loss" className="font-bold" />
              </div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Payment Amount *</label><Input type="number" step="0.01" required value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)} placeholder="0.00" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Reference Note</label><Input value={settleNote} onChange={(e) => setSettleNote(e.target.value)} placeholder="Receipt #, bank transfer ID..." /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSettleCustomer(null)}>Cancel</Button>
                <Button type="submit" disabled={settling} className="bg-emerald-600 hover:bg-emerald-700 text-white">{settling ? "Recording..." : "Record Payment"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
