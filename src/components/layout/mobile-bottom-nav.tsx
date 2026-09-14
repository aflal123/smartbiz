"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/ai", label: "AI Advisor", icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1.5 shadow-2xl transition-colors">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2 min-w-[60px] rounded-xl transition-all duration-200",
                isActive ? "text-slate-900 dark:text-white font-bold" : "hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 mb-0.5 relative z-10", isActive && "text-slate-950 dark:text-white scale-110")} />
              <span className="text-[10px] tracking-tight relative z-10 font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
