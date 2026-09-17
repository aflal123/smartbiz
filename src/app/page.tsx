"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Boxes,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  Printer,
  ChevronRight,
  Database,
  Lock,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartBizLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 px-4 sm:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between w-full">
          <SmartBizLogo size="sm" showWordmark={true} href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#pos-terminal" className="hover:text-black dark:hover:text-white transition-colors">
              Cloud POS
            </a>
            <a href="#inventory" className="hover:text-black dark:hover:text-white transition-colors">
              Inventory Ledger
            </a>
            <a href="#finance" className="hover:text-black dark:hover:text-white transition-colors">
              Financial Engine
            </a>
            <a href="#ai-intelligence" className="hover:text-black dark:hover:text-white transition-colors">
              AI Intelligence
            </a>
            <a href="#architecture" className="hover:text-black dark:hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Sign In
              </Button>
            </Link>

            <Link href="/register">
              <Button className="h-9 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold shadow-xs">
                Launch Store
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6">
          {/* Release Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-3.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-8 shadow-xs">
            <Cpu className="h-3.5 w-3.5 text-black dark:text-white" />
            <span>Next-Gen Cloud POS & Enterprise ERP for Retail & Wholesale</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white leading-[1.08]">
            The Precision Operating System for Modern Commerce.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Unified Cloud POS, immutable stock movement ledgers, Decimal-accurate COGS accounting, and OpenAI business advisors—built for high-volume merchants.
          </p>

          {/* Primary Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-base shadow-sm group"
              >
                Launch Store Workspace
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 px-8 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-base"
              >
                Explore Live Demo
              </Button>
            </Link>
          </div>

          {/* Four Core Pillars Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3.5 text-left max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1.5">
                <Zap className="h-4 w-4 text-black dark:text-white" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Sub-second POS</span>
              </div>
              <p className="text-lg font-bold text-black dark:text-white">Atomic Sales</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Zero overselling with row locks
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1.5">
                <TrendingUp className="h-4 w-4 text-black dark:text-white" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Real COGS</span>
              </div>
              <p className="text-lg font-bold text-black dark:text-white">True Net Profit</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Revenue - COGS - Expenses
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1.5">
                <Sparkles className="h-4 w-4 text-black dark:text-white" />
                <span className="text-[11px] font-bold uppercase tracking-wider">OpenAI Core</span>
              </div>
              <p className="text-lg font-bold text-black dark:text-white">AI Intelligence</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Margin drivers & auto reorders
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1.5">
                <ShieldCheck className="h-4 w-4 text-black dark:text-white" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tenant Security</span>
              </div>
              <p className="text-lg font-bold text-black dark:text-white">Strict Isolation</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Multi-tenant PostgreSQL RBAC
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Made Interactive UI Product Mockup 1: POS Terminal & Thermal Receipt */}
      <section id="pos-terminal" className="py-20 sm:py-28 px-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Module 01 / Cloud POS Terminal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mt-2">
              Engineered for Speed: Scan, Checkout, Print in Under 3 Seconds.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
              Designed for touchscreens, handheld barcode guns, and keyboard shortcuts. Instant product lookup, tax computation, split payments, and real-time 80mm thermal receipt generation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* POS Terminal Screen Mockup (8 Cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 shadow-sm">
              {/* Terminal Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-black dark:bg-white" />
                  <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase">
                    TERMINAL #01 • REG: ACTIVE
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  <span>CASHIER: KAMAL P.</span>
                </div>
              </div>

              {/* Barcode Search Simulation */}
              <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                <span className="text-xs font-mono text-black dark:text-white font-medium flex-1">
                  SKU-8924 | Ceylon Earl Grey Premium 250g
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold">
                  ENTER TO ADD
                </span>
              </div>

              {/* POS Cart Table Mockup */}
              <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 p-2.5 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="col-span-6">Item Description</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs font-mono">
                  <div className="grid grid-cols-12 items-center p-3">
                    <div className="col-span-6">
                      <p className="font-bold text-black dark:text-white">Ceylon Earl Grey 250g</p>
                      <p className="text-[10px] text-neutral-400">SKU-8924 • Tax 0%</p>
                    </div>
                    <div className="col-span-2 text-center font-bold">2</div>
                    <div className="col-span-2 text-right text-neutral-500 dark:text-neutral-400">1,250.00</div>
                    <div className="col-span-2 text-right font-bold text-black dark:text-white">2,500.00</div>
                  </div>

                  <div className="grid grid-cols-12 items-center p-3">
                    <div className="col-span-6">
                      <p className="font-bold text-black dark:text-white">Organic Cinnamon Quills</p>
                      <p className="text-[10px] text-neutral-400">SKU-4401 • Tax 0%</p>
                    </div>
                    <div className="col-span-2 text-center font-bold">1</div>
                    <div className="col-span-2 text-right text-neutral-500 dark:text-neutral-400">1,850.00</div>
                    <div className="col-span-2 text-right font-bold text-black dark:text-white">1,850.00</div>
                  </div>

                  <div className="grid grid-cols-12 items-center p-3">
                    <div className="col-span-6">
                      <p className="font-bold text-black dark:text-white">Cardamom Pods Extra 100g</p>
                      <p className="text-[10px] text-neutral-400">SKU-2098 • Tax 0%</p>
                    </div>
                    <div className="col-span-2 text-center font-bold">1</div>
                    <div className="col-span-2 text-right text-neutral-500 dark:text-neutral-400">950.00</div>
                    <div className="col-span-2 text-right font-bold text-black dark:text-white">950.00</div>
                  </div>
                </div>
              </div>

              {/* Checkout Calculation Strip */}
              <div className="mt-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div className="flex gap-6 text-xs text-neutral-600 dark:text-neutral-400">
                  <div>
                    <span>Items: </span>
                    <strong className="text-black dark:text-white">3 (4 units)</strong>
                  </div>
                  <div>
                    <span>Discount: </span>
                    <strong className="text-black dark:text-white">-LKR 300.00</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider block">Net Total Due</span>
                  <span className="text-2xl font-black text-black dark:text-white">LKR 5,000.00</span>
                </div>
              </div>
            </div>

            {/* 80mm Thermal Receipt Simulation (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black p-6 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-3 mb-3">
                <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <Printer className="h-3.5 w-3.5" />
                  <span>80MM THERMAL RECEIPT</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-bold">
                  PAID
                </span>
              </div>

              <div className="text-center mb-4">
                <p className="font-black text-sm tracking-tight text-black dark:text-white">SMARTBIZ FLAGSHIP STORE</p>
                <p className="text-[10px] text-neutral-500">Kollupitiya Main Road, Colombo 03</p>
                <p className="text-[10px] text-neutral-500">Tel: +94 11 234 5678 • VAT: 998241</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-2 mb-2">
                <p>Receipt: #SB-2026-9041</p>
                <p>Date: 2026-09-17 17:15:22</p>
                <p>Cashier: Kamal P. [C-01]</p>
              </div>

              <div className="space-y-1.5 text-[11px] border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Ceylon Earl Grey (x2)</span>
                  <span className="font-bold">2,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cinnamon Quills (x1)</span>
                  <span className="font-bold">1,850.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cardamom Pods (x1)</span>
                  <span className="font-bold">950.00</span>
                </div>
              </div>

              <div className="space-y-1 text-xs border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-2 mb-3">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>5,300.00</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Loyalty Discount</span>
                  <span>-300.00</span>
                </div>
                <div className="flex justify-between font-black text-sm text-black dark:text-white pt-1">
                  <span>TOTAL PAID</span>
                  <span>LKR 5,000.00</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                  <span>CASH TENDERED</span>
                  <span>5,000.00</span>
                </div>
              </div>

              {/* Realistic SVG Barcode */}
              <div className="text-center pt-2">
                <svg
                  viewBox="0 0 160 40"
                  className="mx-auto h-9 w-40 text-black dark:text-white"
                  fill="currentColor"
                >
                  <rect x="0" y="0" width="3" height="35" />
                  <rect x="5" y="0" width="2" height="35" />
                  <rect x="9" y="0" width="4" height="35" />
                  <rect x="15" y="0" width="1" height="35" />
                  <rect x="18" y="0" width="5" height="35" />
                  <rect x="25" y="0" width="2" height="35" />
                  <rect x="29" y="0" width="3" height="35" />
                  <rect x="34" y="0" width="1" height="35" />
                  <rect x="38" y="0" width="4" height="35" />
                  <rect x="44" y="0" width="2" height="35" />
                  <rect x="48" y="0" width="5" height="35" />
                  <rect x="55" y="0" width="1" height="35" />
                  <rect x="58" y="0" width="3" height="35" />
                  <rect x="63" y="0" width="2" height="35" />
                  <rect x="67" y="0" width="4" height="35" />
                  <rect x="73" y="0" width="1" height="35" />
                  <rect x="76" y="0" width="5" height="35" />
                  <rect x="83" y="0" width="2" height="35" />
                  <rect x="87" y="0" width="3" height="35" />
                  <rect x="92" y="0" width="1" height="35" />
                  <rect x="96" y="0" width="4" height="35" />
                  <rect x="102" y="0" width="2" height="35" />
                  <rect x="106" y="0" width="5" height="35" />
                  <rect x="113" y="0" width="1" height="35" />
                  <rect x="116" y="0" width="3" height="35" />
                  <rect x="121" y="0" width="4" height="35" />
                  <rect x="127" y="0" width="2" height="35" />
                  <rect x="131" y="0" width="5" height="35" />
                  <rect x="138" y="0" width="1" height="35" />
                  <rect x="141" y="0" width="3" height="35" />
                  <rect x="146" y="0" width="2" height="35" />
                  <rect x="150" y="0" width="4" height="35" />
                  <rect x="156" y="0" width="2" height="35" />
                </svg>
                <p className="text-[9px] tracking-widest text-neutral-400 mt-1">
                  *SB-2026-9041-LKR*
                </p>
                <p className="text-[9px] text-neutral-400 mt-0.5">THANK YOU FOR YOUR PATRONAGE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Made UI Mockup 2: Immutable Inventory Movement Ledger */}
      <section id="inventory" className="py-20 sm:py-28 px-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Module 02 / Inventory Ledger
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mt-2">
              Audit-Logged Stock: Every Single Unit Accounted For.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
              No ghost stock. Every purchase, sale, return, or shelf damage writes an append-only audit trail with batch tracking, supplier attribution, and automated restock triggers.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800 min-w-[700px]">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-black dark:text-white" />
                <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">
                  LIVE STOCK MOVEMENT LEDGER (AUDIT TRAIL)
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400">POSTGRES IMMUTABLE LOG</span>
            </div>

            <table className="w-full text-left font-mono text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-[11px]">
                  <th className="pb-3 font-semibold">TIMESTAMP</th>
                  <th className="pb-3 font-semibold">SKU / ITEM</th>
                  <th className="pb-3 font-semibold">MOVEMENT TYPE</th>
                  <th className="pb-3 font-semibold">BATCH #</th>
                  <th className="pb-3 font-semibold text-right">CHANGE</th>
                  <th className="pb-3 font-semibold text-right">BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="py-3 text-neutral-500">17:15:22</td>
                  <td className="py-3 font-bold text-black dark:text-white">SKU-8924 • Ceylon Earl Grey</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold text-[10px]">
                      POS_SALE
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500">BAT-2026-08</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">-2</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">148</td>
                </tr>

                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="py-3 text-neutral-500">16:40:10</td>
                  <td className="py-3 font-bold text-black dark:text-white">SKU-4401 • Cinnamon Quills</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold text-[10px]">
                      POS_SALE
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500">BAT-2026-04</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">-1</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">64</td>
                </tr>

                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="py-3 text-neutral-500">14:12:00</td>
                  <td className="py-3 font-bold text-black dark:text-white">SKU-7019 • Virgin Coconut Oil 1L</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold text-[10px]">
                      PURCHASE_RESTOCK
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500">BAT-2026-11</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">+50</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">72</td>
                </tr>

                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="py-3 text-neutral-500">11:05:30</td>
                  <td className="py-3 font-bold text-black dark:text-white">SKU-1044 • Premium Roasted Cashews</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 font-bold text-[10px]">
                      DAMAGE_WRITE_OFF
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500">BAT-2026-02</td>
                  <td className="py-3 text-right font-bold text-neutral-600 dark:text-neutral-400">-1</td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Human-Made UI Mockup 3: Decimal Precision Financial Engine */}
      <section id="finance" className="py-20 sm:py-28 px-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Module 03 / Financial Accounting
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mt-2">
                True Decimal Precision: Know Your Real Net Profit.
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mt-4 leading-relaxed">
                Most SME point-of-sale software only shows revenue, masking actual supplier costs. SmartBiz implements true COGS (Cost of Goods Sold) accounting powered by Decimal.js precision to calculate exact gross profit and operating margins.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-black dark:text-white shrink-0" />
                  <span>Zero floating-point rounding errors on decimal currencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-black dark:text-white shrink-0" />
                  <span>Real-time COGS subtraction at point of every sale</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-black dark:text-white shrink-0" />
                  <span>Categorized expenses: Rent, Utilities, Payroll & Taxes</span>
                </li>
              </ul>
            </div>

            {/* Financial Waterfall Card */}
            <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 shadow-sm font-mono">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-black dark:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    P&L STATEMENT PREVIEW (SEPTEMBER 2026)
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-bold">
                  CURRENCY: LKR
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>1. TOTAL GROSS SALES REVENUE</span>
                    <span>100.0%</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-black dark:text-white">
                    <span>Gross Revenue</span>
                    <span>LKR 2,450,800.00</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>2. DIRECT COST OF GOODS SOLD (COGS)</span>
                    <span>58.2% of Revenue</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-neutral-600 dark:text-neutral-400">
                    <span>- Supplier COGS</span>
                    <span>-LKR 1,426,365.00</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>3. GROSS PROFIT MARGIN</span>
                    <span>41.8% Gross Margin</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-black dark:text-white">
                    <span>Gross Profit</span>
                    <span>LKR 1,024,435.00</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>4. OPERATING EXPENSES (OPEX)</span>
                    <span>Rent, Utilities, Wages</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-neutral-600 dark:text-neutral-400">
                    <span>- Operating Costs</span>
                    <span>-LKR 415,000.00</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-black">
                  <div className="flex justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                    <span>FINAL NET OPERATING PROFIT</span>
                    <span>24.8% Net Margin</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-black dark:text-white">
                    <span>TRUE NET PROFIT</span>
                    <span>LKR 609,435.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Made UI Mockup 4: OpenAI Executive Business Intelligence */}
      <section id="ai-intelligence" className="py-20 sm:py-28 px-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Module 04 / OpenAI Executive Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mt-2">
              Artificial Intelligence That Understands Your Store Numbers.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
              Ask questions in plain English or Sinhala/Tamil. The SmartBiz AI Advisor analyzes your sales trends, identifies dead stock eating shelf space, and drafts purchase orders automatically.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-sm font-mono">
            {/* User Prompt Box */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold shrink-0">
                U
              </div>
              <div className="flex-1 text-xs">
                <span className="text-neutral-400 text-[10px] block mb-1">PROMPT TO STORE ADVISOR</span>
                <p className="font-semibold text-black dark:text-white">
                  "Analyze our top revenue contributors for the past 14 days and flag any product batches approaching low stock thresholds."
                </p>
              </div>
            </div>

            {/* AI Advisor Response */}
            <div className="mt-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-black dark:text-white" />
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  SMARTBIZ AI EXECUTIVE SUMMARY
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                <p>
                  <strong>1. Top Margin Driver:</strong> <span className="font-semibold text-black dark:text-white">Ceylon Earl Grey 250g (SKU-8924)</span> generated <strong>LKR 284,500.00</strong> across 114 transactions with a strong <strong>44.2% gross margin</strong>.
                </p>
                <p>
                  <strong>2. Critical Reorder Alert:</strong> <span className="font-semibold text-black dark:text-white">Cardamom Pods Extra 100g (SKU-2098)</span> is at <strong>7 units remaining</strong> (minimum threshold: 10). Current sales velocity predicts stock depletion within 48 hours.
                </p>
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">RECOMMENDED ACTION:</span>
                  <p className="text-black dark:text-white font-medium">
                    Drafted purchase order for 50 units to <strong>Supplier: Ceylon Spices Direct</strong> at agreed unit cost LKR 620.00.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Tenancy & Architecture Section */}
      <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Security & Reliability
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mt-2">
              Enterprise Multi-Tenant SaaS Architecture.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mt-3">
              Guaranteed tenant data isolation, role-based access control, and rock-solid relational integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <Database className="h-6 w-6 text-black dark:text-white mb-4" />
              <h3 className="text-base font-bold text-black dark:text-white mb-2">
                Tenant Data Separation
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Strict foreign-key tenancy bounds on every table in PostgreSQL. No business can query or inspect another merchant's transactions or inventory.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <Lock className="h-6 w-6 text-black dark:text-white mb-4" />
              <h3 className="text-base font-bold text-black dark:text-white mb-2">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Granular permissions for Business Owners, Store Managers, Cashiers, and Platform Admins. Cashiers access POS terminals without exposing P&L reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <Building2 className="h-6 w-6 text-black dark:text-white mb-4" />
              <h3 className="text-base font-bold text-black dark:text-white mb-2">
                Multi-Store Ready
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Scale from a single retail outlet to multi-branch franchise stores with centralized stock transfers and consolidated revenue analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 text-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-3xl mx-auto">
          <SmartBizLogo size="lg" showWordmark={true} className="justify-center mb-6" />
          <h2 className="text-3xl sm:text-5xl font-black text-black dark:text-white tracking-tight">
            Ready to Run Your Store With Precision?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Join forward-thinking retail, wholesale, and service merchants powered by SmartBiz.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-base shadow-sm"
              >
                Launch Store Workspace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-base"
              >
                Sign In to Existing Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 bg-white dark:bg-black text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <SmartBizLogo size="sm" showWordmark={true} />

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#pos-terminal" className="hover:text-black dark:hover:text-white">
              Cloud POS
            </a>
            <a href="#inventory" className="hover:text-black dark:hover:text-white">
              Inventory Ledger
            </a>
            <a href="#finance" className="hover:text-black dark:hover:text-white">
              Financial Accounting
            </a>
            <a href="#ai-intelligence" className="hover:text-black dark:hover:text-white">
              OpenAI Suite
            </a>
            <Link href="/login" className="hover:text-black dark:hover:text-white">
              Merchant Login
            </Link>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px]">
            © 2026 SmartBiz ERP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
