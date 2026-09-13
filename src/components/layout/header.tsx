"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ShoppingCart,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  businessName?: string;
  currency?: string;
  lowStockCount?: number;
}

export function Header({
  businessName = "SmartBiz Store",
  currency = "LKR",
  lowStockCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Left side: Business name or breadcrumb indicator */}
      <div className="flex items-center gap-4 pl-12 md:pl-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tenant:
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {businessName}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {currency}
          </span>
        </div>
      </div>

      {/* Right side: POS button, Low Stock alert badge, AI shortcut */}
      <div className="flex items-center gap-3">
        {lowStockCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>{lowStockCount} Low Stock</span>
          </Link>
        )}

        <Link href="/ai">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="hidden sm:inline">AI Insights</span>
          </Button>
        </Link>

        <Link href="/pos">
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">Open POS</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
