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
    <header className="sticky top-0 z-30 h-14 border-b border-[#1E2226] bg-[#070A0D]/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between select-none">
      {/* ── LEFT: Date / System Status Group ── */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand */}
        <Link href="/" className="md:hidden flex items-center gap-2 group">
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
        {/* Language Utility */}
        <LanguageSelector variant="compact" />

        {/* Vault Quick Access */}
        <Link
          href="/vault"
          title={t.nav.vault}
          aria-label={t.nav.vault}
          className="w-8 h-8 rounded-lg bg-[#11161B] border border-[#252B30] flex items-center justify-center text-[#8A8580] hover:text-[#20C8E8] hover:border-[#20C8E8]/40 transition-all duration-150 group cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
        </Link>

        {/* Primary Action Button ("Tambah Catatan") */}
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
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
