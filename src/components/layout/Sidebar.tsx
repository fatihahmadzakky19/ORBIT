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
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

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
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface min-h-screen px-4 py-6 select-none shrink-0">
      {/* Brand */}
      <div className="flex items-center justify-between px-3 mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-line flex items-center justify-center text-accent group-hover:border-accent transition-colors">
            <span className="text-base font-bold tracking-wider">O</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-wider text-main text-sm">ORBIT</span>
            <span className="text-[10px] text-dim tracking-widest uppercase">Life System</span>
          </div>
        </Link>
      </div>

      {/* Global Quick Add Button in Sidebar */}
      <button
        onClick={onOpenQuickAdd}
        className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-accent text-white font-medium text-sm shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>{t.nav.addRecord}</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <div key={item.label} className="space-y-0.5">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface-elevated text-main font-semibold border-l-2 border-accent"
                    : "text-sub hover:text-main hover:bg-surface-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-dim"}`} />
                <span>{item.label}</span>
              </Link>

              {/* Sub-items for Journey */}
              {item.subItems && isActive && (
                <div className="ml-7 pl-2 border-l border-border-subtle space-y-0.5 my-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`block px-2.5 py-1.5 rounded text-xs transition-colors ${
                          isSubActive
                            ? "text-accent font-medium bg-accent-muted"
                            : "text-dim hover:text-sub"
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

      {/* Footer Navigation */}
      <div className="pt-4 mt-auto border-t border-line space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-surface-elevated text-main font-medium"
              : "text-sub hover:text-main hover:bg-surface-hover"
          }`}
        >
          <Settings className="w-4 h-4 text-dim" />
          <span>{t.nav.settings}</span>
        </Link>
      </div>
    </aside>
  );
}
