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
    <header className="sticky top-0 z-30 h-14 border-b border-[#D9DDD9] bg-white/95 backdrop-blur-md px-3.5 sm:px-5 md:px-8 flex items-center justify-between select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* ── LEFT: Logo & Brand ── */}
      <div className="flex items-center gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#D9DDD9] flex items-center justify-center text-[#08BFD7] shadow-sm group-hover:border-[#08BFD7]/50 transition-all">
            <span className="text-[11px] font-semibold font-mono">O</span>
          </div>
          <span className="font-semibold text-[#20252A] text-xs tracking-wider group-hover:text-[#08BFD7] transition-colors">ORBIT</span>
        </Link>

        {/* Desktop System Status Telemetry */}
        <div className="hidden md:flex items-center">
          <StatusIndicator date={todayStr} isOnline={true} />
        </div>
      </div>

      {/* ── RIGHT: Utilities, Primary Action & Profile Control ── */}
      <div className="flex items-center gap-2">
        {/* Language Utility — Desktop only */}
        <div className="hidden md:block">
          <LanguageSelector variant="compact" />
        </div>

        {/* Vault Quick Access — Desktop only */}
        <Link
          href="/vault"
          title={t.nav.vault}
          aria-label={t.nav.vault}
          className="hidden md:flex w-8 h-8 rounded-lg bg-white border border-[#D9DDD9] items-center justify-center text-[#687078] hover:text-[#08BFD7] hover:border-[#08BFD7]/40 shadow-sm transition-all duration-150 group cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
        </Link>

        {/* Primary Action Button — Desktop only */}
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="sm"
          className="hidden md:inline-flex"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] text-white" />
          <span>{t.nav.addRecord}</span>
        </Button>

        {/* Interactive Profile Control with Dropdown Menu & Real Avatar */}
        <ProfileMenu />
      </div>
    </header>
  );
}
