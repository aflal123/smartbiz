"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SmartBizLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  href?: string;
  iconOnly?: boolean;
}

const sizeMap = {
  xs: { box: "h-6 w-6", svg: 16, text: "text-xs", badge: "text-[9px] px-1" },
  sm: { box: "h-8 w-8", svg: 20, text: "text-sm", badge: "text-[10px] px-1.5" },
  md: { box: "h-9 w-9", svg: 22, text: "text-base", badge: "text-[10px] px-1.5" },
  lg: { box: "h-11 w-11", svg: 26, text: "text-xl", badge: "text-xs px-2" },
  xl: { box: "h-14 w-14", svg: 32, text: "text-2xl", badge: "text-xs px-2.5" },
};

/**
 * Custom SmartBiz ERP Geometric Brandmark
 * Represents interconnected commerce layers, cloud ledger precision, and high-speed POS data flow.
 */
export function SmartBizLogoIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200", className)}
      aria-hidden="true"
    >
      {/* Precision Interconnected Geometric ERP Planes */}
      {/* Top Facet: Data Node & Cloud Velocity */}
      <path
        d="M16 3L27 9.5V14L16 7.5L5 14V9.5L16 3Z"
        fill="currentColor"
        fillOpacity="1"
      />
      {/* Left Central Fold: Inventory & Stock Layers forming "S" upper sweep */}
      <path
        d="M5 16.5L14.5 22V27.5L5 22V16.5Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Right Central Fold: Sales, POS & Real-Time Ledger forming "S" lower sweep */}
      <path
        d="M27 16.5L17.5 22V27.5L27 22V16.5Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      {/* Core Dynamic Monogram Notch (The "S" Nexus Connector) */}
      <path
        d="M16 11.5L22.5 15.25L16 19L9.5 15.25L16 11.5Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      {/* Central Axis Point */}
      <circle cx="16" cy="15.25" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SmartBizLogo({
  size = "md",
  showWordmark = true,
  showBadge = true,
  badgeText = "ERP",
  className,
  href,
  iconOnly = false,
}: SmartBizLogoProps) {
  const currentSize = sizeMap[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none group",
        href && "cursor-pointer",
        className
      )}
    >
      {/* Brandmark Emblem Box */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black border border-neutral-800 dark:border-neutral-200 shadow-xs group-hover:scale-105 transition-transform duration-200",
          currentSize.box
        )}
      >
        <SmartBizLogoIcon size={currentSize.svg} />
      </div>

      {/* Typography & Sub-Badge */}
      {showWordmark && !iconOnly && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-black tracking-tight text-black dark:text-white leading-none",
                currentSize.text
              )}
            >
              Smart<span className="font-extrabold text-neutral-500 dark:text-neutral-400">Biz</span>
            </span>

            {showBadge && (
              <span
                className={cn(
                  "font-mono font-bold uppercase tracking-wider rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white py-0.2",
                  currentSize.badge
                )}
              >
                {badgeText}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight text-neutral-500 dark:text-neutral-400">
            Intelligent POS & Commerce
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
