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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md text-slate-100 transition-colors">
      {/* Left side: Tenant Name & Currency */}
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TENANT:
          </span>
          <span className="text-sm font-bold text-white tracking-tight">
            {businessName}
          </span>
          <span className="inline-flex items-center rounded-md bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 text-xs font-semibold text-blue-300">
            {currency}
          </span>
        </div>
      </div>

      {/* Right side: Low stock warning, Theme toggle, AI shortcut, POS */}
      <div className="flex items-center gap-2 sm:gap-3">
        {lowStockCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex items-center gap-1.5 rounded-full bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-900/70 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
          </Link>
        )}

        <ThemeToggle />

        <Link href="/ai">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-purple-300 hover:text-white hover:bg-purple-950/60 border border-purple-800/40"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">AI Insights</span>
          </Button>
        </Link>

        <Link href="/pos">
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/20">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold hidden xs:inline">Open POS</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
