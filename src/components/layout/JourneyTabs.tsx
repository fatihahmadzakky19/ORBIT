"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export function JourneyTabs() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { label: t.nav.timeline, href: "/journey/timeline" },
    { label: t.nav.progress, href: "/journey/progress" },
    { label: t.nav.compare, href: "/journey/compare" },
    { label: t.nav.reflections, href: "/journey/reflections" },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-line pb-2 mb-6 text-xs overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? "bg-surface-elevated text-main font-semibold border-b-2 border-accent"
                : "text-dim hover:text-sub"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
