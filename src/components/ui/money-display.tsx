import * as React from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: number | string;
  currency?: string;
  variant?: "default" | "profit" | "loss" | "muted";
  className?: string;
  prefix?: string;
}

export function MoneyDisplay({
  amount,
  currency = "LKR",
  variant = "default",
  className,
  prefix,
}: MoneyDisplayProps) {
  const numeric = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const formatted = formatCurrency(numeric, currency);

  const variantStyles = {
    default: "text-slate-900 font-semibold",
    profit: "text-emerald-600 font-semibold",
    loss: "text-rose-600 font-semibold",
    muted: "text-slate-500 font-medium",
  };

  return (
    <span className={cn(variantStyles[variant], className)}>
      {prefix}
      {formatted}
    </span>
  );
}
