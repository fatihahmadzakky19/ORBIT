"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, Lock, Compass, LogOut, ChevronDown, Check } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useLanguage } from "@/lib/i18n/context";

export function ProfileMenu() {
  const { profile } = useProfile();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const avatarSrc = profile.avatarUrl || "/avatar.jpg";
  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : "F";

  return (
    <div className="relative" ref={menuRef}>
      {/* Interactive Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Profile and account menu"
        className={`flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-lg bg-[#11161B] border transition-all duration-150 cursor-pointer select-none group ${
          isOpen
            ? "border-[#20C8E8]/50 shadow-[0_0_12px_rgba(32,200,232,0.15)]"
            : "border-[#252B30] hover:border-[#363737]"
        }`}
      >
        {/* Avatar (32px standard size) */}
        <div className="w-6 h-6 rounded-md bg-[#151A1F] border border-[#20C8E8]/30 overflow-hidden flex items-center justify-center shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-mono font-bold text-[#20C8E8]">
              {initial}
            </span>
          )}
        </div>

        {/* User Name */}
        <span className="hidden lg:inline text-xs font-medium text-[#E8E1D3] group-hover:text-white max-w-[120px] truncate transition-colors">
          {profile.name || "User"}
        </span>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-3 h-3 text-[#6B6762] group-hover:text-[#8A8580] transition-transform duration-150 shrink-0 ${
            isOpen ? "rotate-180 text-[#20C8E8]" : ""
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F1419] border border-[#252B30] shadow-[0_12px_36px_rgba(0,0,0,0.7)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="px-3.5 py-3 border-b border-[#1E2226] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#151A1F] border border-[#20C8E8]/35 overflow-hidden shrink-0 shadow-sm">
              <img
                src={avatarSrc}
                alt={profile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#E8E1D3] truncate">
                {profile.name || "Fatih Ahmad Zakky"}
              </div>
              <div className="text-[10px] text-[#8A8580] font-mono truncate mt-0.5">
                {profile.email || "fatihahmadzakky19@gmail.com"}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A982] animate-pulse" />
                <span className="text-[9px] font-mono text-[#00A982] tracking-wider uppercase">
                  Digital OS Online
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1 px-1.5 space-y-0.5">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#A7A29A] hover:text-[#E8E1D3] hover:bg-[#151A1F] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#6B6762]" />
              <span>{t.nav.settings}</span>
            </Link>

            <Link
              href="/vault"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#A7A29A] hover:text-[#E8E1D3] hover:bg-[#151A1F] transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#20C8E8]" />
              <span>{t.nav.vault}</span>
            </Link>

            <Link
              href="/journey"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#A7A29A] hover:text-[#E8E1D3] hover:bg-[#151A1F] transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#C5A56A]" />
              <span>{t.nav.journey}</span>
            </Link>
          </div>

          {/* Footer Divider */}
          <div className="pt-1 mt-1 border-t border-[#1E2226] px-1.5">
            <div className="px-2.5 py-1.5 text-[10px] font-mono text-[#52575C]">
              ORBIT v1.0 · Personal OS
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
