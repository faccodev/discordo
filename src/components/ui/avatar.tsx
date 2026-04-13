"use client";

import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  userId?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "idle" | "dnd" | "offline";
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
};

const statusSizeMap = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
};

export function Avatar({
  src,
  alt,
  userId,
  size = "md",
  className,
  showStatus,
  status,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const statusSize = statusSizeMap[size];

  const statusColors = {
    online: "bg-[var(--color-status-online)]",
    idle: "bg-[var(--color-status-idle)]",
    dnd: "bg-[var(--color-status-dnd)]",
    offline: "bg-[var(--color-status-offline)]",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className="rounded-lg object-cover"
          style={{ width: dimension, height: dimension }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-lg bg-[var(--color-bg-hover)] font-medium text-[var(--color-text-secondary)]"
          style={{
            width: dimension,
            height: dimension,
            fontSize: dimension * 0.35,
          }}
        >
          {getInitials(alt)}
        </div>
      )}
      {showStatus && status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--color-bg)]",
            statusColors[status]
          )}
          style={{
            width: statusSize,
            height: statusSize,
          }}
        />
      )}
    </div>
  );
}
