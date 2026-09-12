"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  countBadge?: string | number;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  iconColor = "text-[#20C8E8]",
  countBadge,
  actionHref,
  actionLabel,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />}
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A8580]">
          {title}
        </h2>
        {countBadge !== undefined && (
          <span className="text-[11px] font-mono text-[#A7A29A] bg-[#151A1F] px-2 py-0.5 rounded border border-[#252B30]">
            {countBadge}
          </span>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="text-xs font-mono text-[#8A8580] hover:text-[#20C8E8] flex items-center gap-1 transition-colors duration-150 group cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
