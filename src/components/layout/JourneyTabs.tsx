"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function JourneyTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Timeline", href: "/journey/timeline" },
    { label: "Progress", href: "/journey/progress" },
    { label: "Compare", href: "/journey/compare" },
    { label: "Reflections", href: "/journey/reflections" },
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
