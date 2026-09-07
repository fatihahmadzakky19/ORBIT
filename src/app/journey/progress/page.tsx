"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { JourneyTabs } from "@/components/layout/JourneyTabs";
import { useLanguage } from "@/lib/i18n/context";

export default function ProgressPage() {
  const { t, locale } = useLanguage();

  const currentGoals: { title: string; status: string; percent: number; detail: string; color: string }[] = [];
  const milestones: { month: string; label: string; isNow: boolean }[] = [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold text-main">{t.journey.title}</h1>
        <p className="text-xs text-dim mt-0.5">
          {locale === "id"
            ? "Evaluasi kemajuan terarah menuju target-target utamamu."
            : locale === "de"
            ? "Bewerte den zielgerichteten Fortschritt deiner Kernziele."
            : "Evaluate directional progress towards your core goals."}
        </p>
      </div>

      <JourneyTabs />

      {/* Current Goals Progress */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
          {t.journey.currentGoals}
        </h2>

        {currentGoals.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-lg border border-dashed border-border-subtle bg-canvas/40">
            <p className="text-xs text-dim mb-3">{t.journey.noProgress}</p>
            <Link
              href="/goals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border-subtle hover:border-line text-sub hover:text-main transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.goals.createGoal}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentGoals.map((g) => (
              <div key={g.title} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sm font-medium text-main">{g.title}</span>
                  <span className="font-mono text-sub">{g.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-canvas overflow-hidden">
                  <div
                    className={`h-full ${g.color} rounded-full transition-all duration-500`}
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-dim">
                  <span>{g.status}</span>
                  <span>{g.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Over Time Milestone Map */}
      <div className="p-6 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          {t.journey.progressOverTime}
        </h2>

        {milestones.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-lg border border-dashed border-border-subtle bg-canvas/40">
            <p className="text-xs text-dim">
              {locale === "id"
                ? "Garis tahapan waktu akan terbentuk otomatis seiring berjalannya bulan dan target."
                : locale === "de"
                ? "Der Zeitverlauf bildet sich automatisch mit fortschreitenden Monaten und Zielen ab."
                : "The milestone map will naturally form as months and goals progress."}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between py-6 px-4 rounded-lg bg-canvas border border-border-subtle relative">
            <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-line -translate-y-1/2 z-0" />

            {milestones.map((m, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full mb-2 ${
                    m.isNow
                      ? "bg-accent border-2 border-canvas shadow-sm"
                      : "bg-surface-elevated border-2 border-line"
                  }`}
                />
                <span
                  className={`text-xs font-mono ${
                    m.isNow ? "text-accent font-semibold" : "text-dim"
                  }`}
                >
                  {m.month}
                </span>
                <span
                  className={`text-[10px] text-center mt-1 hidden sm:block ${
                    m.isNow ? "text-sub font-medium" : "text-dim"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
