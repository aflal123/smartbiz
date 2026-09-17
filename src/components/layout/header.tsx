"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Sparkles,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  businessName?: string;
  currency?: string;
  lowStockCount?: number;
  onMenuToggle?: () => void;
}

export function Header({
  businessName = "SmartBiz Store",
  currency = "LKR",
  lowStockCount = 0,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 px-3 sm:px-6 backdrop-blur-md text-black dark:text-white transition-colors">
      {/* Left side: Mobile Menu Button + Tenant Name & Currency */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shadow-xs cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 shrink-0">
            TENANT:
          </span>
          <span className="text-sm font-bold text-black dark:text-white tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[240px]">
            {businessName}
          </span>
          <span className="hidden xs:inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[11px] font-semibold text-black dark:text-white shrink-0">
            {currency}
          </span>
        </div>
      </div>

      {/* Right side: Low stock warning, Theme toggle, AI shortcut, POS */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {lowStockCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-2 sm:px-2.5 py-1 text-xs font-semibold text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            title={`${lowStockCount} items low in stock`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
            <span className="sm:hidden text-[11px] font-bold">{lowStockCount}</span>
          </Link>
        )}

        <ThemeToggle />

        <Link href="/ai" className="hidden xs:inline-flex">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 sm:px-3 gap-1.5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">AI Suite</span>
          </Button>
        </Link>

        <Link href="/pos">
          <Button
            size="sm"
            className="h-9 px-2.5 sm:px-3.5 gap-1.5 bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline font-semibold">Open POS</span>
            <span className="sm:hidden font-semibold text-xs">POS</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
