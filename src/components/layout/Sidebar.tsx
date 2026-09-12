"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Target,
  Repeat,
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
    { label: t.nav.learning, href: "/learning", icon: BookOpen },
    { label: t.nav.finance, href: "/finance", icon: Wallet },
    { label: t.nav.vault, href: "/vault", icon: Lock },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[#1E2226] bg-[#080B0F] min-h-screen px-3.5 py-4 select-none shrink-0 relative z-20">
      {/* ── 1. BRAND + PRIMARY ACTION ── */}
      <div className="px-2 mb-3.5 pt-1">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#11161B] border border-[#252B30] flex items-center justify-center text-[#20C8E8] group-hover:border-[#20C8E8]/40 group-hover:shadow-[0_0_12px_rgba(32,200,232,0.18)] transition-all duration-150 shrink-0">
            <span className="text-xs font-bold font-mono tracking-wider">O</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-[0.14em] text-[#E8E1D3] leading-none group-hover:text-white transition-colors">
              ORBIT
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#8A8580] uppercase mt-1 leading-none">
              DIGITAL OS
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Action Button ("Tambah Catatan") */}
      <div className="mb-3.5 px-0.5">
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="md"
          className="w-full"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#20C8E8]" />
          <span>{t.nav.addRecord}</span>
        </Button>
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
                className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-[#0F171E] text-[#E8E1D3] border-l-2 border-[#20C8E8] pl-2 shadow-[0_0_12px_rgba(32,200,232,0.06)]"
                    : "text-[#8A8580] hover:text-[#C5C0B8] hover:bg-[#151A1F]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-[#20C8E8]" : "text-[#6B6762]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>

              {/* Sub-items for Journey */}
              {item.subItems && isActive && (
                <div className="ml-5 pl-2.5 border-l border-[#1E2226] space-y-0.5 my-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`block h-7 leading-7 px-2 rounded-md text-[11px] font-mono transition-colors duration-150 truncate ${
                          isSubActive
                            ? "text-[#20C8E8] font-medium bg-[#20C8E8]/08"
                            : "text-[#8A8580] hover:text-[#E8E1D3]"
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
      <div className="pt-3.5 mt-6 border-t border-[#1E2226] space-y-4">
        {/* Settings Navigation Item */}
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
            pathname.startsWith("/settings")
              ? "bg-[#0F171E] text-[#E8E1D3] border-l-2 border-[#20C8E8] pl-2"
              : "text-[#8A8580] hover:text-[#C5C0B8] hover:bg-[#151A1F]"
          }`}
        >
          <Settings
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
              pathname.startsWith("/settings") ? "text-[#20C8E8]" : "text-[#6B6762]"
            }`}
          />
          <span>{t.nav.settings}</span>
        </Link>

        {/* System Status Telemetry Indicator */}
        <div className="px-2.5 py-2 rounded-lg bg-[#0C1014] border border-[#1E2226] flex items-center justify-between text-[10px] font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A982] animate-pulse" />
            <span className="text-[#8A8580]">SYSTEM</span>
            <span className="text-[#00A982] font-semibold">ONLINE</span>
          </div>
          <div className="text-[#52575C]">SYNC OK</div>
        </div>
      </div>
    </aside>
  );
}
