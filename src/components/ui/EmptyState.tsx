"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`py-7 px-4 text-center rounded-lg border border-dashed border-[#252B30] bg-[#070A0D]/50 ${className}`}
    >
      <h3 className="text-xs font-semibold text-[#E8E1D3] mb-1">{title}</h3>
      <p className="text-xs text-[#8A8580] max-w-sm mx-auto leading-relaxed mb-3">
        {description}
      </p>
      {actionLabel && (
        <div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#151A1F] border border-[#252B30] hover:border-[#20C8E8]/40 text-[#8A8580] hover:text-[#E8E1D3] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#20C8E8]" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#151A1F] border border-[#252B30] hover:border-[#20C8E8]/40 text-[#8A8580] hover:text-[#E8E1D3] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#20C8E8]" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
