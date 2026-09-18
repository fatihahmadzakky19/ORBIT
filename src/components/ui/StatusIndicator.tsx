"use client";

import React from "react";
import { useLiveJakartaTime } from "@/hooks/useLiveJakartaTime";

interface StatusIndicatorProps {
  date?: string;
  time?: string;
  isOnline?: boolean;
  className?: string;
  showSeconds?: boolean;
}

export function StatusIndicator({
  date,
  time,
  isOnline = true,
  className = "",
  showSeconds = false,
}: StatusIndicatorProps) {
  const live = useLiveJakartaTime();

  const displayDate = date ?? (live.isMounted ? live.formattedShortDate : "18 Sep 2026");
  const displayTime =
    time ??
    (live.isMounted
      ? showSeconds
        ? live.formattedTimeWithSec
        : live.formattedTime
      : "09:20 WIB");

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/95 border border-[#D9DDD9] text-xs select-none shadow-sm backdrop-blur-sm ${className}`}
    >
      {/* Date */}
      <span
        suppressHydrationWarning
        className="font-mono text-[#57606A] tracking-tight text-xs font-normal"
      >
        {displayDate}
      </span>

      {/* Subtle divider */}
      <span className="w-px h-3 bg-[#D9DDD9]" />

      {/* Live Time */}
      <span
        suppressHydrationWarning
        className="font-mono text-[#20252A] font-medium text-xs tracking-tight"
      >
        {displayTime}
      </span>

      {/* Subtle divider */}
      <span className="w-px h-3 bg-[#D9DDD9]" />

      {/* Online Status Indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#059669]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
        <span className="font-semibold tracking-[0.05em]">ONLINE</span>
      </div>
    </div>
  );
}
