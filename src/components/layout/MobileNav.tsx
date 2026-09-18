"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Target,
  Menu,
  X,
  Moon,
  BookOpen,
  Wallet,
  Lock,
  Repeat,
  Settings,
  Plus,
  ChevronRight,
  Globe,
  Radio,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface MobileNavProps {
  onOpenQuickAdd: () => void;
}

export function MobileNav({ onOpenQuickAdd }: MobileNavProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu sheet is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check if any secondary module in Menu is active
  const isSecondaryActive =
    pathname.startsWith("/ibadah") ||
    pathname.startsWith("/learning") ||
    pathname.startsWith("/finance") ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/habits") ||
    pathname.startsWith("/settings");

  return (
    <>
      {/* ── 1. BOTTOM SHEET DRAWER FOR [MENU] ── */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Mobile"
        >
          <div
            className="w-full bg-white rounded-t-[24px] border-t border-[#D9DDD9] shadow-[0_-12px_40px_rgba(0,0,0,0.18)] max-h-[85dvh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Drawer Handle & Header */}
            <div className="pt-3 px-5 pb-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#08BFD7] animate-pulse" />
                <h3 className="text-sm font-semibold text-[#20252A] tracking-tight">
                  Navigasi & Modul OS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F5F2] hover:bg-[#EAECE8] text-[#687078] hover:text-[#20252A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Primary Secondary Modules Grid */}
              <div>
                <span className="text-[10px] font-mono text-[#8A9197] uppercase tracking-wider block mb-2 px-1">
                  Modul Utama
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Ibadah */}
                  <Link
                    href="/ibadah"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/ibadah")
                        ? "bg-[rgba(5,150,105,0.08)] border-[#059669]/40 text-[#059669] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#059669]/30 hover:bg-[#FAFDF9]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/50">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.ibadah}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">Spiritual & Sholat</div>
                    </div>
                  </Link>

                  {/* Pembelajaran */}
                  <Link
                    href="/learning"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/learning")
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#08BFD7]/30 hover:bg-[#F8FDFE]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center shrink-0 border border-[#08BFD7]/20">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.learning}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">PKM & Catatan</div>
                    </div>
                  </Link>

                  {/* Keuangan */}
                  <Link
                    href="/finance"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/finance")
                        ? "bg-[rgba(200,169,107,0.12)] border-[#C8A96B]/50 text-[#9B7F43] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#C8A96B]/30 hover:bg-[#FCFBF8]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center shrink-0 border border-[#C8A96B]/30">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.finance}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">Arus Kas & Saldo</div>
                    </div>
                  </Link>

                  {/* Brankas Privasi */}
                  <Link
                    href="/vault"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/vault")
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#08BFD7]/30 hover:bg-[#F8FDFE]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F4F5F2] text-[#08BFD7] flex items-center justify-center shrink-0 border border-[#D9DDD9]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.vault}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">Folder Rahasia</div>
                    </div>
                  </Link>

                  {/* Kebiasaan */}
                  <Link
                    href="/habits"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/habits")
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#08BFD7]/30 hover:bg-[#F8FDFE]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/50">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.habits}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">Ritme Harian</div>
                    </div>
                  </Link>

                  {/* Pengaturan */}
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                      pathname.startsWith("/settings")
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] shadow-xs"
                        : "bg-white border-[#E5E7EB] text-[#20252A] hover:border-[#08BFD7]/30 hover:bg-[#F8FDFE]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F4F5F2] text-[#687078] flex items-center justify-center shrink-0 border border-[#D9DDD9]">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.nav.settings}</div>
                      <div className="text-[10px] text-[#8A9197] truncate font-normal">Preferensi & Akun</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Sub-modul Perjalanan (Journey) */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <span className="text-[10px] font-mono text-[#8A9197] uppercase tracking-wider block mb-2 px-1">
                  Eksplorasi Perjalanan
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/journey/timeline"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      pathname === "/journey/timeline"
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] font-medium"
                        : "bg-[#FAFAF8] border-[#E5E7EB] text-[#464D59] hover:text-[#20252A]"
                    }`}
                  >
                    <span>{t.nav.timeline}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A9197]" />
                  </Link>

                  <Link
                    href="/journey/progress"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      pathname === "/journey/progress"
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] font-medium"
                        : "bg-[#FAFAF8] border-[#E5E7EB] text-[#464D59] hover:text-[#20252A]"
                    }`}
                  >
                    <span>{t.nav.progress}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A9197]" />
                  </Link>

                  <Link
                    href="/journey/compare"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      pathname === "/journey/compare"
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] font-medium"
                        : "bg-[#FAFAF8] border-[#E5E7EB] text-[#464D59] hover:text-[#20252A]"
                    }`}
                  >
                    <span>{t.nav.compare}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A9197]" />
                  </Link>

                  <Link
                    href="/journey/reflections"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      pathname === "/journey/reflections"
                        ? "bg-[rgba(8,191,215,0.08)] border-[#08BFD7]/40 text-[#08BFD7] font-medium"
                        : "bg-[#FAFAF8] border-[#E5E7EB] text-[#464D59] hover:text-[#20252A]"
                    }`}
                  >
                    <span>{t.nav.reflections}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A9197]" />
                  </Link>
                </div>
              </div>

              {/* Language & OS Telemetry Footer */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#687078]">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <span className="font-semibold text-[#20252A]">ORBIT DIGITAL OS</span>
                  <span className="text-[#8A9197]">v1.0</span>
                </div>

                <div className="flex items-center gap-1">
                  {(["id", "en", "de"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                        locale === l
                          ? "bg-[rgba(8,191,215,0.12)] text-[#08BFD7] border border-[#08BFD7]/30 font-semibold"
                          : "bg-[#F4F5F2] text-[#8A9197] hover:text-[#20252A]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. BOTTOM NAVIGATION BAR ── */}
      {/* Pattern: [Beranda] [Perjalanan] [+] [Target] [Menu] */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#D9DDD9] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex items-center justify-around px-2 pt-1 relative max-w-md mx-auto">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 ${
              pathname === "/"
                ? "text-[#08BFD7] font-medium"
                : "text-[#687078] font-normal hover:text-[#20252A]"
            }`}
          >
            <Home className={`w-[18px] h-[18px] mb-1 ${pathname === "/" ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
            <span className="truncate max-w-[64px]">{t.nav.home}</span>
          </Link>

          {/* 2. Perjalanan */}
          <Link
            href="/journey"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 ${
              pathname.startsWith("/journey")
                ? "text-[#08BFD7] font-medium"
                : "text-[#687078] font-normal hover:text-[#20252A]"
            }`}
          >
            <Compass className={`w-[18px] h-[18px] mb-1 ${pathname.startsWith("/journey") ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
            <span className="truncate max-w-[64px]">{t.nav.journey}</span>
          </Link>

          {/* 3. Central Prominent Action Button ("+ Tambah Catatan") */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={onOpenQuickAdd}
              aria-label="Tambah Catatan"
              className="w-12 h-12 rounded-full bg-[#08BFD7] hover:bg-[#07AEC4] text-white flex items-center justify-center border-2 border-white shadow-[0_2px_12px_rgba(8,191,215,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5] text-white" />
            </button>
          </div>

          {/* 4. Target */}
          <Link
            href="/goals"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 ${
              pathname.startsWith("/goals")
                ? "text-[#08BFD7] font-medium"
                : "text-[#687078] font-normal hover:text-[#20252A]"
            }`}
          >
            <Target className={`w-[18px] h-[18px] mb-1 ${pathname.startsWith("/goals") ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
            <span className="truncate max-w-[64px]">{t.nav.goals}</span>
          </Link>

          {/* 5. Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Buka Menu OS"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 cursor-pointer ${
              isSecondaryActive || isMenuOpen
                ? "text-[#08BFD7] font-medium"
                : "text-[#687078] font-normal hover:text-[#20252A]"
            }`}
          >
            <div className="relative">
              <Menu className={`w-[18px] h-[18px] mb-1 ${isSecondaryActive || isMenuOpen ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
              {isSecondaryActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#08BFD7]" />
              )}
            </div>
            <span className="truncate max-w-[64px]">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
