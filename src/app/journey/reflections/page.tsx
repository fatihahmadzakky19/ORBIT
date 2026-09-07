"use client";

import Link from "next/link";
import { Plus, ArrowRight, Sparkles } from "lucide-react";

interface ReflectionArchiveItem {
  id: string;
  weekLabel: string;
  dateRange: string;
  excerpt: string;
  fullHappened?: string;
  fullLearned?: string;
  fullChanged?: string;
}

const REFLECTIONS_ARCHIVE: ReflectionArchiveItem[] = [
  {
    id: "ref-36",
    weekLabel: "Week 36",
    dateRange: "31 Aug — 6 Sep 2026",
    excerpt:
      "This week I worked on my portfolio and started applying for frontend jobs. I feel more confident about...",
    fullHappened:
      "Finalized the core layout of my portfolio project, practiced technical interview questions, and reviewed array methods.",
    fullLearned:
      "Understood how functional transformations in JavaScript keep code declarative and bug-free.",
    fullChanged:
      "I notice I hesitate less when starting new components and rely less on step-by-step video tutorials.",
  },
  {
    id: "ref-35",
    weekLabel: "Week 35",
    dateRange: "24 Aug — 30 Aug 2026",
    excerpt:
      "I struggled with consistency earlier in the week, but picked up momentum after breaking goals down into smaller milestones...",
    fullHappened:
      "Missed workout sessions mid-week due to fatigue, but caught up over the weekend.",
    fullLearned: "Consistent daily effort of 45 minutes beats a 4-hour weekend cram session.",
    fullChanged: "Switched my practice schedule to mornings before distractions happen.",
  },
  {
    id: "ref-34",
    weekLabel: "Week 34",
    dateRange: "17 Aug — 23 Aug 2026",
    excerpt:
      "I finally understood closures and asynchronous event loops. Celebrated completing my graduation project.",
    fullHappened: "Graduation ceremony and first week setting up ORBIT system.",
    fullLearned: "Mental models for asynchronous JavaScript and Promise chaining.",
    fullChanged: "A clearer sense of direction for the next 6 months.",
  },
];

import { useLanguage } from "@/lib/i18n/context";

export default function ReflectionsPage() {
  const { t, locale } = useLanguage();

  const getWeekLabel = (weekLabel: string) => {
    if (locale === "id") return weekLabel.replace("Week", "Minggu");
    if (locale === "de") return weekLabel.replace("Week", "Woche");
    return weekLabel;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-main">{t.reflections.title}</h1>
          <p className="text-xs text-dim mt-0.5">
            {t.reflections.subtitle}
          </p>
        </div>
        <Link
          href="/journey/reflections/new"
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.reflections.writeReflection}</span>
        </Link>
      </div>

      {/* Reflections List */}
      <div className="space-y-3">
        {REFLECTIONS_ARCHIVE.map((ref) => (
          <div
            key={ref.id}
            className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-main">{getWeekLabel(ref.weekLabel)}</span>
                  <span className="text-xs font-mono text-dim">· {ref.dateRange}</span>
                </div>
                <p className="text-xs text-sub mt-2 leading-relaxed italic font-serif">
                  &ldquo;{ref.excerpt}&rdquo;
                </p>
              </div>
            </div>

            {ref.fullHappened && (
              <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">
                    {t.reflections.whatHappened}
                  </span>
                  <p className="text-sub">{ref.fullHappened}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">
                    {t.reflections.whatLearned}
                  </span>
                  <p className="text-sub">{ref.fullLearned}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-accent block mb-1">
                    {t.reflections.whatChanged}
                  </span>
                  <p className="text-main font-medium">{ref.fullChanged}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
