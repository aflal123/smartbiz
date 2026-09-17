"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordAction } from "@/actions/auth";

import { SmartBizLogo } from "@/components/brand/logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await forgotPasswordAction({ email });
      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }

      setSuccess("Reset instructions dispatched. Please check your email inbox.");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch {
      setError("Error sending reset email. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <SmartBizLogo size="lg" showWordmark={true} href="/" className="mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Enter your registered email to receive a password reset code
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-white">Reset Account Access</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              We will send a 6-digit verification code to reset your password
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-white text-black hover:bg-slate-200 font-bold shadow-xs cursor-pointer"
                >
                  {loading ? "Sending Code..." : "Send Reset Code"}
                </Button>
              </div>
            </CardContent>
          </form>

          <CardFooter className="pt-2 pb-6 border-t border-slate-800/80 flex justify-center text-xs text-slate-400">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-white hover:underline transition-colors font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
