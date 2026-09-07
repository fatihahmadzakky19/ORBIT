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

const REFLECTIONS_ARCHIVE: ReflectionArchiveItem[] = [];

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
        {REFLECTIONS_ARCHIVE.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
            <Sparkles className="w-8 h-8 text-dim mx-auto mb-3" />
            <p className="text-sm font-medium text-main mb-1">
              {t.reflections.noReflections}
            </p>
            <p className="text-xs text-dim max-w-sm mx-auto mb-4">
              {locale === "id"
                ? "Tulis refleksi mingguan pertamamu untuk mendokumentasikan apa yang terjadi, dipelajari, dan berubah."
                : locale === "de"
                ? "Schreibe deine erste wöchentliche Reflexion, um zu dokumentieren, was passiert ist, was du gelernt hast und was sich verändert hat."
                : "Write your first weekly reflection to document what happened, what you learned, and what evolved."}
            </p>
            <Link
              href="/journey/reflections/new"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.reflections.writeReflection}</span>
            </Link>
          </div>
        ) : (
          REFLECTIONS_ARCHIVE.map((ref) => (
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
          ))
        )}
      </div>
    </div>
  );
}
