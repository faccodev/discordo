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
    <div className="flex h-screen w-screen items-center justify-center matrix-bg">
      <div className="w-full max-w-sm space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-5xl font-mono font-bold text-primary animate-glow">
            DISCORDO
          </h1>
          <span className="animate-blink text-5xl text-primary">_</span>
          <p className="mt-4 font-mono text-sm text-text-dim">
            Terminal v2.0 — Authentication Required
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-sm border border-error bg-error/10 p-3 font-mono text-sm text-error">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-primary">&gt;</span>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="ACCESS_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-b border-primary bg-transparent pl-8 pr-10 font-mono text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              required
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-text-dim hover:text-primary transition-colors"
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
            className="w-full border border-primary bg-transparent font-mono text-primary hover:bg-primary hover:text-black transition-all hover:shadow-[0_0_12px_#00FF41]"
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
        <p className="text-center font-mono text-xs text-text-muted">
          Your Discord token is kept server-side and never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
