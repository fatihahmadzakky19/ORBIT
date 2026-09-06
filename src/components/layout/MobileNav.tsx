"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Target, Repeat, Wallet, Plus } from "lucide-react";

interface MobileNavProps {
  onOpenQuickAdd: () => void;
}

export function MobileNav({ onOpenQuickAdd }: MobileNavProps) {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Journey", href: "/journey", icon: Compass },
    { label: "Goals", href: "/goals", icon: Target },
    { label: "Habits", href: "/habits", icon: Repeat },
    { label: "Finance", href: "/finance", icon: Wallet },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-line px-2 py-1.5 pb-safe">
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
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] transition-colors ${
                isActive ? "text-accent font-medium" : "text-dim hover:text-sub"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Central Floating + Add Action Button */}
        <button
          onClick={onOpenQuickAdd}
          aria-label="Add new record"
          className="w-11 h-11 -mt-5 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-transform cursor-pointer border-2 border-canvas"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
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
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] transition-colors ${
                isActive ? "text-accent font-medium" : "text-dim hover:text-sub"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
