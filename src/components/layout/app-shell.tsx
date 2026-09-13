import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

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
  businessName = "SmartBiz Demo Store",
  userName = "Aflal Ahamed",
  userRole = "BUSINESS_OWNER",
  currency = "LKR",
  lowStockCount = 0,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
