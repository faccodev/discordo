"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-dark">
      <div className="w-full max-w-sm space-y-6 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blurple">
            <svg
              viewBox="0 0 71 55"
              className="h-8 w-8 text-white"
              fill="currentColor"
            >
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.7 1.1a.06.06 0 0 0-.07.03 39.3 39.3 0 0 0-17.2 14.5 54 54 0 0 0-5.8-3.5.06.06 0 0 0-.08.02C13 21.3 7.4 30.8 7.4 40.3c0 3 .4 6 .9 8.7a.06.06 0 0 0 .03.05 58 58 0 0 0 17.6 5.7.07.07 0 0 0 .08-.03 39.7 39.7 0 0 0 14-12.6.06.06 0 0 0 0-.06 53 53 0 0 0 5.4 3.3.06.06 0 0 0 .07-.02c12.2-5.2 20.7-14.6 20.7-26.1a.06.06 0 0 0-.03-.05 44.3 44.3 0 0 0-6.6-8.5.06.06 0 0 0-.07-.03ZM23.7 34.3c-3.5 0-6.3-3.2-6.3-7.1 0-3.9 2.8-7.1 6.3-7.1 3.5 0 6.3 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1Zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1 0-3.9 2.8-7.1 6.3-7.1 3.5 0 6.3 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1Z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Discordo Web</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Enter your password to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded bg-red-500/20 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-neutral-500">
          Your Discord token is kept server-side and never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
