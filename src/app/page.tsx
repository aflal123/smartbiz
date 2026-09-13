import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Boxes,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Users,
  BarChart3,
  ArrowRight,
  Store,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-600/30">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white">
                SmartBiz
              </span>
              <span className="text-[11px] text-slate-400">
                AI-Powered SME ERP & POS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pos" className="hover:text-white transition-colors">
              High-Speed POS
            </a>
            <a href="#ai" className="hover:text-white transition-colors">
              AI Suite
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Multi-Tenancy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-8 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Next-Generation Multi-Tenant ERP & POS for SMEs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Run your business with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              real profit clarity
            </span>{" "}
            and AI intelligence.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant point-of-sale checkout, concurrent stock ledgering, accurate
            COGS & profit math, multi-tenant security, and built-in OpenAI
            business advisors.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/25">
                Launch Your Business
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-12 px-8 border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white text-base">
                View Live Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Sub-second POS</span>
              </div>
              <p className="text-xl font-bold text-white">Atomic Sales</p>
              <p className="text-xs text-slate-400">Zero overselling with row locks</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Real COGS</span>
              </div>
              <p className="text-xl font-bold text-white">True Net Profit</p>
              <p className="text-xs text-slate-400">Revenue - COGS - Expenses</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">OpenAI Core</span>
              </div>
              <p className="text-xl font-bold text-white">AI Advisors</p>
              <p className="text-xs text-slate-400">Smart insights & copy generator</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">SaaS Isolation</span>
              </div>
              <p className="text-xl font-bold text-white">Multi-Tenant</p>
              <p className="text-xs text-slate-400">Complete tenant separation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 border-t border-slate-800/80 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
              Enterprise Grade Power for SMEs
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">
              Everything your business needs in one unified platform.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 mb-5">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">High-Speed POS Terminal</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan barcodes or search products instantly. Calculate taxes, discounts, cash change, and generate standard 80mm thermal receipts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 mb-5">
                <Boxes className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Audit-Logged Inventory</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every unit gained or lost writes an immutable stock movement audit trail. Batch tracking, expiration alerts, and automatic reorder warnings.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Accurate Financial Engine</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                No floating point bugs. Built with Decimal precision to calculate true COGS, gross margins, and net profits after operating expenses.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Business Intelligence</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by OpenAI. Generates executive revenue analysis, customer marketing copy, invoice explanations, and staff email drafts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600/20 text-sky-400 mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Customer & Supplier Debts</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track customer store credit, outstanding dues, and supplier payables with instant one-click balance settlements.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Multi-Tenant RBAC Security</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Role-based access for Business Owners, Store Managers, Cashiers, and SuperAdmins. Guaranteed tenant data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 border-t border-slate-800 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to upgrade your business operations?
          </h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Get started in 60 seconds. Set up your store, add inventory, and start ringing sales right now.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-xs text-slate-500">
            SmartBiz © 2026. All rights reserved. Architected for modern retail, wholesale & service SMEs.
          </div>
        </div>
      </footer>
    </div>
  );
}
