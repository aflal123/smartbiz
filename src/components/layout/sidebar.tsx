"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  Users,
  Truck,
  BarChart3,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Building2,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

const navItems: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS Terminal", href: "/pos", icon: ShoppingCart, badge: "POS" },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Sales & Receipts", href: "/sales", icon: Receipt },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Reports & P&L", href: "/reports", icon: BarChart3 },
  { name: "AI Suite", href: "/ai", icon: Sparkles, badge: "AI" },
  {
    name: "Platform Admin",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
];

interface SidebarProps {
  businessName?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function Sidebar({
  businessName = "SmartBiz Store",
  userName = "Business Owner",
  userRole = "BUSINESS_OWNER",
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-lg shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">
                SmartBiz <span className="text-blue-400 font-semibold text-xs">v2</span>
              </span>
              <span className="text-xs text-slate-400 truncate max-w-[140px]">
                {businessName}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business Selector / Info */}
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600/20 text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">
              {businessName}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {userRole.toLowerCase().replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="px-3 space-y-1 mt-2">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-blue-950 text-blue-400 border border-blue-800/60"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <form action="/api/v1/auth/me" method="DELETE">
              <button
                type="submit"
                title="Log out"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-800">
        {sidebarContent}
      </aside>
    </>
  );
}
