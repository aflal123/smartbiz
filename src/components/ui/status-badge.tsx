import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "outline";
  let label = status;

  switch (normalized) {
    case "COMPLETED":
    case "PAID":
    case "ACTIVE":
    case "IN_STOCK":
      variant = "success";
      label = normalized === "COMPLETED" ? "Completed" : normalized === "PAID" ? "Paid" : normalized === "ACTIVE" ? "Active" : "In Stock";
      break;

    case "PARTIAL":
    case "PENDING":
    case "LOW_STOCK":
      variant = "warning";
      label = normalized === "PARTIAL" ? "Partial" : normalized === "PENDING" ? "Pending" : "Low Stock";
      break;

    case "CANCELLED":
    case "UNPAID":
    case "OUT_OF_STOCK":
    case "SUSPENDED":
      variant = "destructive";
      label = normalized === "CANCELLED" ? "Cancelled" : normalized === "UNPAID" ? "Unpaid" : normalized === "OUT_OF_STOCK" ? "Out of Stock" : "Suspended";
      break;

    case "CASH":
    case "CARD":
    case "BANK_TRANSFER":
    case "CREDIT":
      variant = "secondary";
      label = normalized.replace("_", " ");
      break;

    default:
      variant = "outline";
      label = status;
  }

  return (
    <Badge variant={variant} className={cn("capitalize tracking-normal", className)}>
      {label}
    </Badge>
  );
}
