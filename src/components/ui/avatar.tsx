"use client";

import Image from "next/image";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";

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
  lg: 32,
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
  const bgColor = userId ? getAvatarColor(userId) : "#5865F2";

  const statusColors = {
    online: "bg-status-online",
    idle: "bg-status-idle",
    dnd: "bg-status-dnd",
    offline: "bg-status-offline",
  };

  return (
    <div className={cn("relative inline-block group", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className="rounded-sm object-cover grayscale brightness-90 contrast-110 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100"
          style={{ width: dimension, height: dimension }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-sm font-mono font-medium text-primary"
          style={{
            width: dimension,
            height: dimension,
            backgroundColor: "#1A1A1A",
            fontSize: dimension * 0.4,
            border: "1px solid #00FF41",
          }}
        >
          {getInitials(alt)}
        </div>
      )}
      {showStatus && status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-dark",
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
