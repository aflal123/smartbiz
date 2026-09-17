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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  businessName = "SmartBiz Store",
  userName = "Business Owner",
  userRole = "BUSINESS_OWNER",
  onLogout,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);

  const isDrawerOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen;
  const handleClose = () => {
    if (onMobileClose) {
      onMobileClose();
    } else {
      setInternalMobileOpen(false);
    }
  };

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-black text-black dark:text-neutral-200 border-r border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/dashboard" onClick={handleClose} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-lg shadow-xs">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-black dark:text-white">
                SmartBiz
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[140px]">
                {businessName}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close navigation"
            className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business Selector / Info */}
        <div className="mx-3 my-3 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-black dark:text-white truncate">
              {businessName}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
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
                onClick={handleClose}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all group select-none",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white dark:text-black"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                      isActive
                        ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                        : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-neutral-200 border border-neutral-300 dark:border-neutral-800"
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
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-black dark:text-white truncate">
                {userName}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <form action="/api/v1/auth/me" method="DELETE">
              <button
                type="submit"
                title="Log out"
                className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
      {/* Mobile Drawer with Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={handleClose}
            aria-label="Close menu overlay"
          />
          <aside className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 ease-out">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-neutral-200 dark:border-neutral-800">
        {sidebarContent}
      </aside>
    </>
  );
}
