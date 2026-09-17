"use client";

import { useState, useEffect, useRef } from "react";
import { Edit3, X } from "lucide-react";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  title?: string;
  initialValue: string;
  label?: string;
  placeholder?: string;
}

export function RenameDialog({
  isOpen,
  onClose,
  onRename,
  title = "Ubah Nama",
  initialValue,
  label = "Nama Baru",
  placeholder = "Masukkan nama...",
}: RenameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError("");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Nama tidak boleh kosong.");
      return;
    }
    onRename(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#20252A]">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#6A7282] mb-1.5 uppercase tracking-wider">
              {label}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              placeholder={placeholder}
              className={`w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border text-xs text-[#20252A] focus:outline-none transition-all ${
                error
                  ? "border-red-400 focus:ring-1 focus:ring-red-400"
                  : "border-[#D9DDD9] focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
              }`}
            />
            {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] active:scale-95 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
