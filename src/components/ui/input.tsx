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
            "flex h-10 w-full rounded bg-dark-bl px-3 py-2 text-sm text-white",
            "placeholder:text-neutral-500",
            "focus:outline-none focus:ring-2 focus:ring-blurple focus:ring-offset-2 focus:ring-offset-dark",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "ring-2 ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
