"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-[#20252A] leading-tight">
              {title}
            </h3>
            <p className="text-xs text-[#6A7282] mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0F2EE]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] active:scale-95 transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
                : "bg-[#08BFD7] hover:bg-[#07ABC1] text-white shadow-sm"
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
