"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, Lock, Compass, LogOut, ChevronDown, Check, BookOpen, Wallet, Globe } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useLanguage } from "@/lib/i18n/context";

export function ProfileMenu() {
  const { profile } = useProfile();
  const { t, locale, setLocale } = useLanguage();
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
      {/* Interactive Trigger Button — 32-38px circular container */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Profile and account menu"
        className={`flex items-center gap-2 pl-1 pr-2.5 h-9 sm:h-10 rounded-full bg-white border transition-all duration-150 cursor-pointer select-none group shadow-sm ${
          isOpen
            ? "border-[#08BFD7] shadow-[0_2px_8px_rgba(8,191,215,0.15)]"
            : "border-[#D9DDD9] hover:border-[#C5CAC4]"
        }`}
      >
        {/* Avatar (32px circular container) */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4F5F2] border border-[#D9DDD9] overflow-hidden flex items-center justify-center shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-mono font-medium text-[#08BFD7]">
              {initial}
            </span>
          )}
        </div>

        {/* User Name */}
        <span className="hidden sm:inline text-[13px] sm:text-[14px] font-medium text-[#20252A] group-hover:text-[#08BFD7] max-w-[140px] truncate transition-colors">
          {profile.name || "Fatih Ahmad Zakky"}
        </span>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-3 h-3 text-[#8A9197] group-hover:text-[#20252A] transition-transform duration-150 shrink-0 ${
            isOpen ? "rotate-180 text-[#08BFD7]" : ""
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_12px_36px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="px-3.5 py-3 border-b border-[#D9DDD9] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F2] border border-[#D9DDD9] overflow-hidden shrink-0 shadow-sm">
              <img
                src={avatarSrc}
                alt={profile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-[13px] font-medium text-[#20252A] truncate">
                {profile.name || "Fatih Ahmad Zakky"}
              </div>
              <div className="text-[10px] text-[#8A9197] font-mono truncate mt-0.5">
                {profile.email || "fatihahmadzakky19@gmail.com"}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <span className="text-[9px] font-mono text-[#059669] font-medium tracking-wider uppercase">
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
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#687078] hover:text-[#20252A] hover:bg-[#F7F8F5] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#8A9197]" />
              <span>{t.nav.settings}</span>
            </Link>

            <Link
              href="/vault"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#687078] hover:text-[#20252A] hover:bg-[#F7F8F5] transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#08BFD7]" />
              <span>{t.nav.vault}</span>
            </Link>

            {/* Mobile-accessible secondary modules */}
            <div className="md:hidden border-t border-[#D9DDD9] pt-1 mt-1 space-y-0.5">
              <Link
                href="/learning"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#687078] hover:text-[#20252A] hover:bg-[#F7F8F5] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{t.nav.learning}</span>
              </Link>

              <Link
                href="/finance"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#687078] hover:text-[#20252A] hover:bg-[#F7F8F5] transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{t.nav.finance}</span>
              </Link>

              {/* Mobile Language Selector */}
              <div className="px-2.5 py-2 flex items-center justify-between text-xs text-[#687078]">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#8A9197]" />
                  <span>Bahasa</span>
                </div>
                <div className="flex items-center gap-1">
                  {(["id", "en", "de"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                        locale === l
                          ? "bg-[rgba(8,191,215,0.12)] text-[#08BFD7] border border-[#08BFD7]/30 font-semibold"
                          : "bg-[#FAFAF8] text-[#8A9197] hover:text-[#20252A]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Divider */}
          <div className="pt-1 mt-1 border-t border-[#D9DDD9] px-1.5">
            <div className="px-2.5 py-1 text-[10px] font-mono text-[#8A9197] flex justify-between items-center">
              <span>ORBIT v1.0</span>
              <span>Digital OS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
