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
  { href: "/ai", label: "AI Suite", icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
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
                "relative flex flex-col items-center justify-center py-1.5 px-2.5 min-w-[58px] rounded-xl transition-all duration-200 select-none",
                isActive
                  ? "text-black dark:text-white font-bold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 mb-0.5 relative z-10 transition-transform duration-200",
                  isActive && "scale-110 text-black dark:text-white stroke-[2.25]"
                )}
              />
              <span className="text-[10px] tracking-tight relative z-10 font-semibold truncate max-w-[60px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
