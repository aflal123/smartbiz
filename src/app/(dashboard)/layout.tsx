import * as React from "react";
import { getCurrentSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getCurrentSession();
  } catch (err) {
    console.error("Session lookup error:", err);
  }

  const businessName = session?.business?.name || "SmartBiz Flagship Store";
  const userName = session?.name || "Business Owner";
  const userRole = session?.role || "BUSINESS_OWNER";
  const currency = session?.business?.currency || "LKR";

  return (
    <AppShell
      businessName={businessName}
      userName={userName}
      userRole={userRole}
      currency={currency}
    >
      {children}
    </AppShell>
  );
}
