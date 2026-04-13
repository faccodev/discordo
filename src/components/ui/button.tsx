"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-sm font-mono font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "border border-[var(--color-border)] bg-[var(--color-bg-hover)] hover:border-[var(--color-brand)] text-[var(--color-brand)]": variant === "default",
            "border border-[var(--color-brand)] bg-[var(--color-brand)] hover:brightness-110 text-black": variant === "primary",
            "bg-transparent hover:bg-[var(--color-bg-hover)] text-[var(--color-brand)]": variant === "ghost",
            "border border-[var(--color-error)] bg-[rgba(239,68,68,0.1)] hover:bg-[var(--color-error)] text-[var(--color-error)]": variant === "danger",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
