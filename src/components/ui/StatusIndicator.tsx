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
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#11161B]/90 border border-[#252B30] text-xs select-none shadow-sm ${className}`}
    >
      {/* Date */}
      <span
        suppressHydrationWarning
        className="font-mono text-[#8A8580] tracking-wide text-xs"
      >
        {date}
      </span>

      {/* Subtle divider */}
      <span className="w-px h-3 bg-[#252B30]" />

      {/* Online Status Indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00A982]">
        <span
          className={`w-1.5 h-1.5 rounded-full bg-[#00A982] ${
            isOnline ? "animate-pulse" : "opacity-40"
          }`}
        />
        <span className="font-semibold tracking-wider">ONLINE</span>
      </div>
    </div>
  );
}
