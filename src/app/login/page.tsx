"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (!res.success) {
        if (res.requiresOtp) {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(res.message);
        setLoading(false);
        return;
      }

      // Success -> navigate to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("owner@smartbiz.lk");
    setPassword("SmartBiz2026!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-600/30">
              S
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-white">
                SmartBiz <span className="text-blue-400 font-semibold text-sm">V2</span>
              </span>
              <span className="text-xs text-slate-400">Enterprise ERP & POS Suite</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to your store</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your business credentials to continue</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Merchant Login</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Access your POS terminal, inventory, and AI reports
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/20"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Sign In to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Demo auto-fill banner */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span>Click to auto-fill sample test credentials</span>
                </button>
              </div>
            </CardContent>
          </form>

          <CardFooter className="pt-2 pb-6 border-t border-slate-800/80 flex justify-center text-xs text-slate-400">
            <span>Don&apos;t have a business account? </span>
            <Link
              href="/register"
              className="ml-1.5 font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Register your business
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
