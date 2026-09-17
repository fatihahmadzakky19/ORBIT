"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Target,
  Repeat,
  Moon,
  BookOpen,
  Wallet,
  Settings,
  Plus,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

export function Sidebar({ onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.home, href: "/", icon: Home },
    {
      label: t.nav.journey,
      href: "/journey",
      icon: Compass,
      subItems: [
        { label: t.nav.timeline, href: "/journey/timeline" },
        { label: t.nav.progress, href: "/journey/progress" },
        { label: t.nav.compare, href: "/journey/compare" },
        { label: t.nav.reflections, href: "/journey/reflections" },
      ],
    },
    { label: t.nav.goals, href: "/goals", icon: Target },
    { label: t.nav.habits, href: "/habits", icon: Repeat },
    { label: t.nav.ibadah, href: "/ibadah", icon: Moon },
    { label: t.nav.learning, href: "/learning", icon: BookOpen },
    { label: t.nav.finance, href: "/finance", icon: Wallet },
    { label: t.nav.vault, href: "/vault", icon: Lock },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[#D9DDD9] bg-[#F7F8F5] min-h-screen px-3.5 py-4 select-none shrink-0 relative z-20">
      {/* ── 1. BRAND + PRIMARY ACTION ── */}
      <div className="px-2 mb-4 pt-1">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#D9DDD9] flex items-center justify-center text-[#08BFD7] shadow-sm group-hover:border-[#08BFD7]/40 group-hover:shadow-[0_2px_8px_rgba(8,191,215,0.18)] transition-all duration-150 shrink-0">
            <span className="text-xs font-semibold font-mono">O</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-[0.08em] text-[#20252A] leading-none group-hover:text-[#08BFD7] transition-colors">
              ORBIT
            </span>
            <span className="text-[9.5px] font-normal tracking-[0.18em] text-[#8A9197] uppercase mt-1 leading-none">
              DIGITAL OS
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Action Button ("Tambah Catatan") */}
      <div className="mb-4 px-0.5">
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#08BFD7] hover:bg-[#07AEC4] text-white font-medium text-[13px] shadow-[0_2px_8px_rgba(8,191,215,0.22)] hover:shadow-[0_4px_14px_rgba(8,191,215,0.32)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-white" />
          <span>{t.nav.addRecord}</span>
        </button>
      </div>

      {/* ── 2. MAIN NAVIGATION (Controlled vertical flow without arbitrary expansion) ── */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <div key={item.label} className="space-y-0.5">
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[13px] transition-all duration-150 relative ${
                  isActive
                    ? "bg-[rgba(8,191,215,0.08)] text-[#20252A] font-medium border-l-[3px] border-[#08BFD7] pl-2 shadow-sm"
                    : "text-[#687078] font-normal hover:text-[#20252A] hover:bg-black/[0.03]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-[#08BFD7]" : "text-[#8A9197]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>

              {/* Sub-items for Journey */}
              {item.subItems && isActive && (
                <div className="ml-5 pl-2.5 border-l border-[#D9DDD9] space-y-0.5 my-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`block h-7 leading-7 px-2 rounded-lg text-[11px] font-mono transition-colors duration-150 truncate ${
                          isSubActive
                            ? "text-[#08BFD7] font-medium bg-[rgba(8,191,215,0.08)]"
                            : "text-[#687078] font-normal hover:text-[#20252A]"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── 3. SECONDARY NAVIGATION + SYSTEM STATUS ──
          Controlled Spacing:
          Brankas Privasi -> 24px (mt-6) with subtle separator -> Pengaturan -> 16px (space-y-4) -> System Status */}
      <div className="pt-3.5 mt-6 border-t border-[#D9DDD9] space-y-3">
        {/* Settings Navigation Item */}
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[13px] transition-all duration-150 ${
            pathname.startsWith("/settings")
              ? "bg-[rgba(8,191,215,0.08)] text-[#20252A] font-medium border-l-[3px] border-[#08BFD7] pl-2 shadow-sm"
              : "text-[#687078] font-normal hover:text-[#20252A] hover:bg-black/[0.03]"
          }`}
        >
          <Settings
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
              pathname.startsWith("/settings") ? "text-[#08BFD7]" : "text-[#8A9197]"
            }`}
          />
          <span>{t.nav.settings}</span>
        </Link>

        {/* System Status Telemetry Indicator */}
        <div className="px-3 py-2 rounded-xl bg-white border border-[#D9DDD9] shadow-sm flex items-center justify-between text-[10px] font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[#687078]">SYSTEM</span>
            <span className="text-[#059669] font-medium tracking-[0.05em]">ONLINE</span>
          </div>
          <div className="text-[#8A9197] font-normal">SYNC OK</div>
        </div>
      </div>
    </aside>
  );
}
