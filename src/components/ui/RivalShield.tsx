"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RivalShieldProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  iconClassName?: string;
}

const sizeConfig = {
  xs: { box: "h-6 w-6 p-0.5", icon: "h-3.5 w-3.5" },
  sm: { box: "h-8 w-8 p-1", icon: "h-4 w-4" },
  md: { box: "h-12 w-12 sm:h-14 sm:w-14 p-1.5", icon: "h-7 w-7" },
  lg: { box: "h-16 w-16 sm:h-18 sm:w-18 p-2", icon: "h-8 w-8 sm:h-9 sm:w-9" },
  xl: { box: "h-16 w-16 sm:h-24 sm:w-24 p-2 sm:p-3", icon: "h-8 w-8 sm:h-10 sm:w-10" },
};

export function RivalShield({
  src,
  name = "Rival",
  size = "md",
  className,
  iconClassName,
}: RivalShieldProps) {
  const [hasError, setHasError] = useState(false);
  const cfg = sizeConfig[size] || sizeConfig.md;

  // Clean and validate URL
  const trimmed = src?.trim() || "";
  const isValidSrc =
    Boolean(trimmed) &&
    !hasError &&
    (trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("/"));

  return (
    <div
      className={cn(
        "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-elevated shadow-inner select-none",
        cfg.box,
        className
      )}
    >
      {isValidSrc ? (
        <img
          src={trimmed}
          alt={name}
          onError={() => setHasError(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Shield
          className={cn("text-muted flex-shrink-0", cfg.icon, iconClassName)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

