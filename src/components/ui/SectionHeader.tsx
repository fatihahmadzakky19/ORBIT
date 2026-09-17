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
  iconColor = "text-[#08BFD7]",
  countBadge,
  actionHref,
  actionLabel,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />}
        <h2 className="text-[13px] sm:text-[14px] font-semibold tracking-[0.02em] uppercase text-[#20252A]">
          {title}
        </h2>
        {countBadge !== undefined && (
          <span className="text-[10px] font-normal text-[#687078] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#D9DDD9]">
            {countBadge}
          </span>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="text-xs font-medium text-[#08BFD7] hover:underline flex items-center gap-1 transition-colors duration-150 group cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
