"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      window.location.href = "/";
    } catch (err) {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center relative overflow-hidden bg-[var(--color-bg-deep)]">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(62,207,142,0.08)] rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(62,207,142,0.06)] rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-5xl font-mono font-bold text-[var(--color-brand)] text-glow">
            MATRIX
          </h1>
          <span className="animate-blink text-5xl text-[var(--color-brand)]">_</span>
          <p className="mt-4 font-mono text-sm text-[var(--color-text-secondary)]">
            Terminal v2.0 — Authentication Required
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-bg-glass)] p-3 font-mono text-sm text-[var(--color-error)]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[var(--color-brand)] opacity-70">&gt;</span>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="ACCESS_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] pl-8 pr-10 font-mono text-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] rounded-xl focus:border-[var(--color-brand)] focus:outline-none focus:shadow-[0_0_20px_rgba(62,207,142,0.2)] transition-all duration-300"
              required
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full border border-[var(--color-brand)]/50 bg-[var(--color-bg-glass)] font-mono text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)] hover:border-[var(--color-brand)] hover:shadow-[0_0_25px_rgba(62,207,142,0.3)] transition-all duration-300"
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              "[ AUTHENTICATE ]"
            )}
          </Button>
        </form>

        {/* Info */}
        <p className="text-center font-mono text-xs text-[var(--color-text-muted)]">
          Your Discord token is kept server-side and never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
