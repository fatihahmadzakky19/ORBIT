"use client";

import React from "react";

interface StatusIndicatorProps {
  date: string;
  isOnline?: boolean;
  className?: string;
}

export function StatusIndicator({
  date,
  isOnline = true,
  className = "",
}: StatusIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/90 border border-[#D9DDD9] text-xs select-none shadow-sm backdrop-blur-sm ${className}`}
    >
      {/* Date */}
      <span
        suppressHydrationWarning
        className="font-mono text-[#687078] tracking-wide text-xs"
      >
        {date}
      </span>

      {/* Subtle divider */}
      <span className="w-px h-3 bg-[#D9DDD9]" />

      {/* Online Status Indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#059669]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
        <span className="font-medium tracking-[0.05em]">ONLINE</span>
      </div>
    </div>
  );
}
