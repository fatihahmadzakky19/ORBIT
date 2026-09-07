"use client";

import { Bell, Plus, User } from "lucide-react";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/i18n/context";

interface HeaderProps {
  onOpenQuickAdd: () => void;
}

export function Header({ onOpenQuickAdd }: HeaderProps) {
  const { t } = useLanguage();
  const todayStr = formatShortDate(new Date());

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-surface/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
      {/* Left side: Mobile Brand & Desktop Breadcrumb / Date */}
      <div className="flex items-center gap-3">
        <Link href="/" className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-surface-elevated border border-line flex items-center justify-center text-accent">
            <span className="text-sm font-bold">O</span>
          </div>
          <span className="font-semibold text-main text-sm tracking-wider">ORBIT</span>
        </Link>
        <span className="hidden md:inline-block text-xs font-mono text-dim border border-border-subtle px-2 py-1 rounded bg-canvas">
          {todayStr}
        </span>
      </div>

      {/* Right side: Language Selector, Bell, Profile & Global Add Button */}
      <div className="flex items-center gap-2.5">
        <LanguageSelector variant="compact" />

        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.nav.addRecord}</span>
        </button>

        <button
          aria-label="Notifications"
          className="p-2 rounded-md text-sub hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        <Link
          href="/settings"
          aria-label="Profile and Settings"
          className="w-8 h-8 rounded-full bg-surface-elevated border border-line flex items-center justify-center text-sub hover:text-main hover:border-accent transition-colors"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
