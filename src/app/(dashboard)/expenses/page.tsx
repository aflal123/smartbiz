"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyDisplay } from "@/components/ui/money-display";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  getExpensesAction,
  createExpenseAction,
  getIncomesAction,
  createIncomeAction,
} from "@/actions/finance";
import { formatDate } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
  category?: { id: string; name: string } | null;
  createdBy?: { name: string } | null;
}

interface Income {
  id: string;
  title: string;
  amount: number;
  incomeDate: string;
  category?: string | null;
  notes?: string | null;
  createdBy?: { name: string } | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [incomes, setIncomes] = React.useState<Income[]>([]);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [totalIncomes, setTotalIncomes] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Create expense
  const [expenseOpen, setExpenseOpen] = React.useState(false);
  const [expForm, setExpForm] = React.useState({ title: "", amount: "", expenseDate: "", categoryId: "", notes: "" });
  const [expCreating, setExpCreating] = React.useState(false);
  const [expError, setExpError] = React.useState<string | null>(null);

  // Create income
  const [incomeOpen, setIncomeOpen] = React.useState(false);
  const [incForm, setIncForm] = React.useState({ title: "", amount: "", incomeDate: "", category: "other", notes: "" });
  const [incCreating, setIncCreating] = React.useState(false);
  const [incError, setIncError] = React.useState<string | null>(null);

  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, incRes] = await Promise.all([
        getExpensesAction({ page, limit: 15 }),
        getIncomesAction({ page, limit: 15 }),
      ]);
      if (expRes.success && expRes.data) {
        const d = expRes.data as any;
        setExpenses(d.expenses || []);
        setTotalExpenses(d.totalAmount || 0);
        setTotalPages(d.pagination?.totalPages || 1);
      }
      if (incRes.success && incRes.data) {
        const d = incRes.data as any;
        setIncomes(d.incomes || []);
        setTotalIncomes(d.totalAmount || 0);
      }
    } catch {} finally { setLoading(false); }
  }, [page]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);
    setExpCreating(true);
    try {
      const res = await createExpenseAction({
        title: expForm.title,
        amount: parseFloat(expForm.amount),
        expenseDate: expForm.expenseDate || undefined,
        categoryId: expForm.categoryId || undefined,
        notes: expForm.notes || null,
      });
      if (!res.success) { setExpError(res.message); setExpCreating(false); return; }
      setSuccessMsg("Expense recorded successfully!");
      setExpenseOpen(false);
      setExpForm({ title: "", amount: "", expenseDate: "", categoryId: "", notes: "" });
      loadData();
    } catch { setExpError("Failed to record expense."); } finally { setExpCreating(false); }
  };

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIncError(null);
    setIncCreating(true);
    try {
      const res = await createIncomeAction({
        title: incForm.title,
        amount: parseFloat(incForm.amount),
        incomeDate: incForm.incomeDate || undefined,
        category: incForm.category || "other",
        notes: incForm.notes || null,
      });
      if (!res.success) { setIncError(res.message); setIncCreating(false); return; }
      setSuccessMsg("Income recorded successfully!");
      setIncomeOpen(false);
      setIncForm({ title: "", amount: "", incomeDate: "", category: "other", notes: "" });
      loadData();
    } catch { setIncError("Failed to record income."); } finally { setIncCreating(false); }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /><span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      <PageHeader title="Expenses & Income" description="Track operating expenses and additional income streams for accurate net profit.">
        <Button variant="outline" size="sm" onClick={() => setIncomeOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /><span>Record Income</span>
        </Button>
        <Button size="sm" onClick={() => setExpenseOpen(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /><span>Record Expense</span>
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-rose-600 uppercase font-semibold">Total Expenses</p><MoneyDisplay amount={totalExpenses} className="text-xl font-bold text-rose-700 mt-1" /></div>
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><TrendingDown className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-emerald-600 uppercase font-semibold">Other Income</p><MoneyDisplay amount={totalIncomes} className="text-xl font-bold text-emerald-700 mt-1" /></div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-blue-600 uppercase font-semibold">Net Impact</p><MoneyDisplay amount={totalIncomes - totalExpenses} variant={totalIncomes - totalExpenses >= 0 ? "profit" : "loss"} className="text-xl font-bold mt-1" /></div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="incomes">Other Income ({incomes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          {expenses.length === 0 && !loading ? (
            <EmptyState icon={CreditCard} title="No Expenses Recorded" description="Record your first business expense to track operating costs." action={
              <Button onClick={() => setExpenseOpen(true)} className="gap-1.5 bg-blue-600 text-white"><Plus className="h-4 w-4" />Record Expense</Button>
            } />
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead>
                <TableHead>Recorded By</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="text-xs text-slate-500"><div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(exp.expenseDate)}</div></TableCell>
                    <TableCell><p className="font-semibold text-slate-900 text-sm">{exp.title}</p>{exp.notes && <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{exp.notes}</p>}</TableCell>
                    <TableCell>{exp.category ? <Badge variant="secondary">{exp.category.name}</Badge> : "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500">{exp.createdBy?.name || "—"}</TableCell>
                    <TableCell className="text-right"><MoneyDisplay amount={exp.amount} variant="loss" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="incomes">
          {incomes.length === 0 && !loading ? (
            <EmptyState icon={DollarSign} title="No Additional Income" description="Record non-sales income like rental, interest, or consulting fees." action={
              <Button onClick={() => setIncomeOpen(true)} className="gap-1.5 bg-blue-600 text-white"><Plus className="h-4 w-4" />Record Income</Button>
            } />
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead>
                <TableHead>Recorded By</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {incomes.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="text-xs text-slate-500"><div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(inc.incomeDate)}</div></TableCell>
                    <TableCell><p className="font-semibold text-slate-900 text-sm">{inc.title}</p>{inc.notes && <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{inc.notes}</p>}</TableCell>
                    <TableCell><Badge variant="secondary">{inc.category || "Other"}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-500">{inc.createdBy?.name || "—"}</TableCell>
                    <TableCell className="text-right"><MoneyDisplay amount={inc.amount} variant="profit" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* CREATE EXPENSE DIALOG */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent className="max-w-md" onClose={() => setExpenseOpen(false)}>
          <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-3">
            {expError && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /><span>{expError}</span></div>}
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Title *</label><Input required value={expForm.title} onChange={(e) => setExpForm((p) => ({ ...p, title: e.target.value }))} placeholder="Office electricity bill" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Amount *</label><Input type="number" step="0.01" required value={expForm.amount} onChange={(e) => setExpForm((p) => ({ ...p, amount: e.target.value }))} placeholder="15000.00" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Date</label><Input type="date" value={expForm.expenseDate} onChange={(e) => setExpForm((p) => ({ ...p, expenseDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Notes</label><Textarea value={expForm.notes} onChange={(e) => setExpForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional details..." rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExpenseOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={expCreating} className="bg-blue-600 hover:bg-blue-700 text-white">{expCreating ? "Recording..." : "Save Expense"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE INCOME DIALOG */}
      <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
        <DialogContent className="max-w-md" onClose={() => setIncomeOpen(false)}>
          <DialogHeader><DialogTitle>Record Other Income</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateIncome} className="space-y-3">
            {incError && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /><span>{incError}</span></div>}
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Title *</label><Input required value={incForm.title} onChange={(e) => setIncForm((p) => ({ ...p, title: e.target.value }))} placeholder="Consultation fee" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Amount *</label><Input type="number" step="0.01" required value={incForm.amount} onChange={(e) => setIncForm((p) => ({ ...p, amount: e.target.value }))} placeholder="50000.00" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Date</label><Input type="date" value={incForm.incomeDate} onChange={(e) => setIncForm((p) => ({ ...p, incomeDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <Select value={incForm.category} onChange={(e) => setIncForm((p) => ({ ...p, category: e.target.value }))}>
                <option value="other">Other</option><option value="rental">Rental Income</option><option value="interest">Interest</option>
                <option value="consulting">Consulting</option><option value="refund">Vendor Refund</option>
              </Select>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Notes</label><Textarea value={incForm.notes} onChange={(e) => setIncForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional details..." rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIncomeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={incCreating} className="bg-emerald-600 hover:bg-emerald-700 text-white">{incCreating ? "Recording..." : "Save Income"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
