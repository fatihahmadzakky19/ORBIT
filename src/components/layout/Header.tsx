"use client";

import { Plus, Lock } from "lucide-react";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/i18n/context";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
  onOpenQuickAdd: () => void;
}

export function Header({ onOpenQuickAdd }: HeaderProps) {
  const { t } = useLanguage();
  const todayStr = formatShortDate(new Date());

  return (
    <header className="sticky top-0 z-30 h-13 sm:h-14 border-b border-[#1E2226] bg-[#070A0D]/90 backdrop-blur-md px-3.5 sm:px-5 md:px-8 flex items-center justify-between select-none">
      {/* ── LEFT: Logo & Brand ── */}
      <div className="flex items-center gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-[#11161B] border border-[#252B30] flex items-center justify-center text-[#20C8E8] shadow-sm">
            <span className="text-[10px] font-bold font-mono">O</span>
          </div>
          <span className="font-bold text-[#E8E1D3] text-xs tracking-wider">ORBIT</span>
        </Link>

        {/* Desktop System Status Telemetry */}
        <div className="hidden md:flex items-center">
          <StatusIndicator date={todayStr} isOnline={true} />
        </div>
      </div>

      {/* ── RIGHT: Utilities, Primary Action & Profile Control ── */}
      <div className="flex items-center gap-2">
        {/* Language Utility — Desktop only (accessible in profile menu on mobile) */}
        <div className="hidden md:block">
          <LanguageSelector variant="compact" />
        </div>

        {/* Vault Quick Access — Desktop only */}
        <Link
          href="/vault"
          title={t.nav.vault}
          aria-label={t.nav.vault}
          className="hidden md:flex w-8 h-8 rounded-lg bg-[#11161B] border border-[#252B30] items-center justify-center text-[#8A8580] hover:text-[#20C8E8] hover:border-[#20C8E8]/40 transition-all duration-150 group cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
        </Link>

        {/* Primary Action Button — Desktop only (Mobile uses central bottom nav action) */}
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="sm"
          className="hidden md:inline-flex"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#20C8E8]" />
          <span>{t.nav.addRecord}</span>
        </Button>

        {/* Interactive Profile Control with Dropdown Menu & Real Avatar */}
        <ProfileMenu />
      </div>
    </header>
  );
}
