"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Target, Repeat, Wallet, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface MobileNavProps {
  onOpenQuickAdd: () => void;
}

export function MobileNav({ onOpenQuickAdd }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const items = [
    { label: t.nav.home, href: "/", icon: Home },
    { label: t.nav.journey, href: "/journey", icon: Compass },
    { label: t.nav.goals, href: "/goals", icon: Target },
    { label: t.nav.habits, href: "/habits", icon: Repeat },
    { label: t.nav.finance, href: "/finance", icon: Wallet },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B0F]/95 backdrop-blur-lg border-t border-[#1E2226] px-2 py-1 pb-safe select-none">
      <div className="flex items-center justify-around relative">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] transition-colors duration-150 ${
                isActive ? "text-[#20C8E8] font-medium" : "text-[#8A8580] hover:text-[#E8E1D3]"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Central Action Button */}
        <button
          onClick={onOpenQuickAdd}
          aria-label="Tambah Catatan"
          className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-r from-[#0C4A57] to-[#0F5A6B] hover:from-[#0E5463] hover:to-[#12687A] text-[#E8E1D3] flex items-center justify-center border border-[#20C8E8]/35 shadow-[0_0_14px_rgba(32,200,232,0.22)] active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#20C8E8]" />
        </button>

        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] transition-colors duration-150 ${
                isActive ? "text-[#20C8E8] font-medium" : "text-[#8A8580] hover:text-[#E8E1D3]"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
