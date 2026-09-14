"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-black/90 px-4 sm:px-6 backdrop-blur-md text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left side: Tenant Name & Currency */}
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            TENANT:
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {businessName}
          </span>
          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
            {currency}
          </span>
        </div>
      </div>

      {/* Right side: Low stock warning, Theme toggle, AI shortcut, POS */}
      <div className="flex items-center gap-2 sm:gap-3">
        {lowStockCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/70 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
          </Link>
        )}

        <ThemeToggle />

        <Link href="/ai">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4 text-slate-900 dark:text-white" />
            <span className="hidden sm:inline">AI Suite</span>
          </Button>
        </Link>

        <Link href="/pos">
          <Button size="sm" className="gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold hidden xs:inline">Open POS</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
