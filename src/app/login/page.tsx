"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black font-black text-2xl shadow-xl">
              S
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-white">
                SmartBiz
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
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white text-black hover:bg-slate-200 font-bold shadow-xs cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign in to Dashboard"}
              </Button>

              {/* Demo auto-fill banner */}
              <div className="mt-5 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
                Need to test demo store credentials?{" "}
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-white hover:underline font-semibold inline-flex items-center gap-1 ml-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-white" />
                  Fill Demo Merchant
                </button>
              </div>
            </CardContent>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have a business account yet?
          <Link
            href="/register"
            className="ml-1.5 font-semibold text-white hover:underline transition-colors"
          >
            Register your business
          </Link>
        </p>
      </div>
    </div>
  );
}
