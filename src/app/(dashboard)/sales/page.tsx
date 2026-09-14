"use client";

import * as React from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  XCircle,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { getSalesAction, cancelSaleAction } from "@/actions/sales";
import { formatDateTime } from "@/lib/utils";

interface Sale {
  id: string;
  invoiceNumber: string;
  customer?: { name: string } | null;
  cashier?: { name: string } | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string | null;
  items?: any[];
  createdAt: string;
}

export default function SalesPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");

  // Receipt viewer
  const [viewSale, setViewSale] = React.useState<Sale | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);

  // Cancel
  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelling, setCancelling] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadSales = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalesAction({ search, page, limit: 15, status: (statusFilter as any) || undefined });
      if (res.success && res.data) {
        const d = res.data as any;
        setSales(d.sales || []);
        setTotalPages(d.pagination?.totalPages || 1);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [search, page, statusFilter]);

  React.useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const res = await cancelSaleAction(cancelId, { reason: cancelReason });
      if (res.success) {
        setSuccessMsg("Sale cancelled and stock restored.");
        setCancelId(null);
        setCancelReason("");
        loadSales();
      }
    } catch {} finally {
      setCancelling(false);
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
        title="Sales & Receipts"
        description="Browse all POS transactions, view invoices, and manage cancellations."
      >
        <Button variant="outline" size="sm" onClick={loadSales} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input placeholder="Search by invoice #..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
          {["", "COMPLETED", "PARTIAL", "UNPAID", "CANCELLED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === s ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      {sales.length === 0 && !loading ? (
        <EmptyState
          icon={Receipt}
          title="No Sales Found"
          description="Complete your first POS sale to see transaction history here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-semibold text-slate-900 dark:text-white text-sm">{s.invoiceNumber}</TableCell>
                <TableCell className="text-xs text-slate-500">{formatDateTime(s.createdAt)}</TableCell>
                <TableCell className="text-sm text-slate-700">{s.customer?.name || "Walk-in"}</TableCell>
                <TableCell className="text-sm text-slate-500">{s.cashier?.name || "—"}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                    {s.paymentMethod}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <MoneyDisplay amount={s.totalAmount} className="font-bold text-slate-900" />
                </TableCell>
                <TableCell className="text-right">
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => { setViewSale(s); setViewOpen(true); }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="View receipt"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {s.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => setCancelId(s.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Cancel sale"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* RECEIPT VIEWER DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm" onClose={() => setViewOpen(false)}>
          {viewSale && (
            <div className="font-mono text-xs bg-white text-slate-900 space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-bold uppercase tracking-wider">SmartBiz Store</h2>
                <p className="text-[11px] text-slate-500">Sales Receipt</p>
              </div>
              <div className="space-y-0.5 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between"><span>Invoice:</span><span className="font-bold">{viewSale.invoiceNumber}</span></div>
                <div className="flex justify-between"><span>Date:</span><span>{formatDateTime(viewSale.createdAt)}</span></div>
                <div className="flex justify-between"><span>Customer:</span><span>{viewSale.customer?.name || "Walk-in"}</span></div>
                <div className="flex justify-between"><span>Payment:</span><span>{viewSale.paymentMethod}</span></div>
              </div>
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between"><span>Subtotal:</span><MoneyDisplay amount={viewSale.subtotal} /></div>
                {Number(viewSale.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600"><span>Discount:</span><span>-<MoneyDisplay amount={viewSale.discountAmount} /></span></div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200"><span>TOTAL:</span><MoneyDisplay amount={viewSale.totalAmount} /></div>
                <div className="flex justify-between"><span>Paid:</span><MoneyDisplay amount={viewSale.amountPaid} /></div>
                {Number(viewSale.changeAmount) > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-700"><span>Change:</span><MoneyDisplay amount={viewSale.changeAmount} /></div>
                )}
              </div>
              <div className="text-center pt-1 text-[10px] text-slate-500">
                <p>Thank you for your business!</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5">
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCEL SALE DIALOG */}
      <Dialog open={!!cancelId} onOpenChange={(open) => { if (!open) setCancelId(null); }}>
        <DialogContent className="max-w-sm" onClose={() => setCancelId(null)}>
          <DialogHeader>
            <DialogTitle>Cancel Sale</DialogTitle>
          </DialogHeader>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>This will restore stock and void this invoice. This cannot be undone.</span>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Reason (optional)</label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cancellation reason..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep Sale</Button>
            <Button variant="destructive" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
