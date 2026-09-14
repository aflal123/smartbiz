"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { verifyRegistrationOtpAction, resendRegistrationOtpAction } from "@/actions/auth";

export default function VerifyOtpPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading verification...</div>}>
      <VerifyOtpContent />
    </React.Suspense>
  );
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const businessNameParam = searchParams.get("businessName") || "";

  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(60);

  // Retrieve cached registration data if present
  const [regData, setRegData] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("smartbiz_reg_data");
      if (saved) {
        try {
          setRegData(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const targetEmail = regData?.email || emailParam;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyRegistrationOtpAction({
        email: targetEmail,
        otp,
        name: regData?.name || "Business Owner",
        businessName: regData?.businessName || businessNameParam || "My Store",
        phone: regData?.phone || undefined,
        currency: regData?.currency || "LKR",
        password: regData?.password || "SmartBiz2026!",
      });

      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }

      setSuccess("Account verified! Launching your workspace...");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("smartbiz_reg_data");
      }

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError("Verification error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      const res = await resendRegistrationOtpAction(targetEmail, regData?.name);
      if (res.success) {
        setSuccess("A new 6-digit code has been dispatched to your inbox.");
        setResendCooldown(60);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black font-black text-2xl shadow-xl">
              S
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-white">
                SmartBiz
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ENTERPRISE ERP
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Verify Email OTP
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            We sent a 6-digit code to <span className="text-white font-bold">{targetEmail || "your email"}</span>
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black mb-4 shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Enter 6-Digit Code</h3>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Check your inbox or spam folder for your confirmation PIN
            </CardDescription>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6 text-left">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg bg-rose-950/50 border border-rose-800/80 p-3 text-sm text-rose-200">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/80 p-3 text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-14 text-center tracking-[0.6em] text-2xl font-mono font-bold bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 focus-visible:ring-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 bg-white text-black hover:bg-slate-200 font-bold shadow-xs cursor-pointer"
              >
                {loading ? "Verifying Code..." : "Verify & Activate Store"}
              </Button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResend}
                  className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Did not receive code? Resend OTP"}
                  </span>
                </button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="pt-2 pb-6 border-t border-slate-800/80 flex justify-center text-xs text-slate-400">
            <Link href="/login" className="text-white hover:underline font-semibold">
              Return to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
