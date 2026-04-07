"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-sm text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "ring-2 ring-error",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 font-mono text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
