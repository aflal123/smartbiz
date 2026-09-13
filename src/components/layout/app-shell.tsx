import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
  businessName?: string;
  userName?: string;
  userRole?: string;
  currency?: string;
  lowStockCount?: number;
}

export function AppShell({
  children,
  businessName = "SmartBiz Store",
  userName = "Merchant Owner",
  userRole = "BUSINESS_OWNER",
  currency = "LKR",
  lowStockCount = 0,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Sidebar
        businessName={businessName}
        userName={userName}
        userRole={userRole}
      />
      <div className="flex flex-col md:pl-64 min-h-screen">
        <Header
          businessName={businessName}
          currency={currency}
          lowStockCount={lowStockCount}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
