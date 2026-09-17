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
      className={`py-5 sm:py-7 px-4 sm:px-6 text-center rounded-xl border border-dashed border-[#D9DDD9] bg-[#FAFAF8] ${className}`}
    >
      <h3 className="text-sm font-medium text-[#20252A] mb-1">{title}</h3>
      <p className="text-[13px] font-normal text-[#687078] max-w-sm mx-auto leading-relaxed mb-3">
        {description}
      </p>
      {actionLabel && (
        <div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#FFFFFF] border border-[#D9DDD9] hover:border-[#08BFD7] text-[#20252A] hover:text-[#08BFD7] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#08BFD7]" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#FFFFFF] border border-[#D9DDD9] hover:border-[#08BFD7] text-[#20252A] hover:text-[#08BFD7] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#08BFD7]" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
