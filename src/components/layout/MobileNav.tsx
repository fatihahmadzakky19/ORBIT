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

  const leftItems = [
    { label: t.nav.home, href: "/", icon: Home },
    { label: t.nav.journey, href: "/journey", icon: Compass },
  ];

  const rightItems = [
    { label: t.nav.goals, href: "/goals", icon: Target },
    { label: t.nav.habits, href: "/habits", icon: Repeat },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#D9DDD9] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-1 relative max-w-md mx-auto">
        {/* Left Two Navigation Items */}
        {leftItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 ${
                isActive
                  ? "text-[#08BFD7] font-medium"
                  : "text-[#687078] font-normal hover:text-[#20252A]"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] mb-1 ${isActive ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Central Prominent Action Button ("+ Tambah Catatan") */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Tambah Catatan"
            className="w-12 h-12 rounded-full bg-[#08BFD7] hover:bg-[#07AEC4] text-white flex items-center justify-center border-2 border-white shadow-[0_2px_12px_rgba(8,191,215,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5] text-white" />
          </button>
        </div>

        {/* Right Two Navigation Items */}
        {rightItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-150 ${
                isActive
                  ? "text-[#08BFD7] font-medium"
                  : "text-[#687078] font-normal hover:text-[#20252A]"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] mb-1 ${isActive ? "text-[#08BFD7]" : "text-[#8A9197]"}`} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
