"use client";

import { useState } from "react";
import { JourneyTabs } from "@/components/layout/JourneyTabs";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function ComparePage() {
  const { t, locale } = useLanguage();
  const [hasSufficientHistory] = useState(false);
  const [periodA, setPeriodA] = useState(locale === "id" ? "Agustus 2026" : "August 2026");
  const [periodB, setPeriodB] = useState("September 2026");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold text-main">{t.journey.title}</h1>
        <p className="text-xs text-dim mt-0.5">
          {locale === "id"
            ? "Bandingkan periode untuk melihat perubahan dirimu berdasarkan bukti nyata."
            : locale === "de"
            ? "Vergleiche Zeiträume, um zu sehen, wie du dich anhand von Beweisen weiterentwickelt hast."
            : "Compare periods to see how you have evolved over time based on factual evidence."}
        </p>
      </div>

      <JourneyTabs />

      {!hasSufficientHistory ? (
        <div className="p-12 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
          <Sparkles className="w-8 h-8 text-dim mx-auto mb-3" />
          <h2 className="text-base font-medium text-main mb-1.5">
            {t.journey.noCompare}
          </h2>
          <p className="text-xs text-dim max-w-md mx-auto leading-relaxed">
            {locale === "id"
              ? "ORBIT membutuhkan data dari minimal 2 periode (mingguan atau bulanan) untuk menyajikan perbandingan perubahan diri yang bermakna dan berbasis bukti nyata."
              : locale === "de"
              ? "ORBIT benötigt Daten aus mindestens 2 Zeiträumen (wöchentlich oder monatlich), um bedeutsame und faktenbasierte Entwicklungsvergleiche anzuzeigen."
              : "ORBIT requires data across at least 2 periods (weeks or months) to present meaningful, grounded comparisons of how you have evolved."}
          </p>
        </div>
      ) : (
        <>
          {/* Period Selector Card */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t.journey.comparePeriods}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={periodA}
                  onChange={(e) => setPeriodA(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-canvas border border-border-subtle text-main focus:outline-none focus:border-accent"
                >
                  <option value={locale === "id" ? "Juli 2026" : "July 2026"}>{locale === "id" ? "Juli 2026" : "July 2026"}</option>
                  <option value={locale === "id" ? "Agustus 2026" : "August 2026"}>{locale === "id" ? "Agustus 2026" : "August 2026"}</option>
                  <option value="September 2026">September 2026</option>
                </select>
                <span className="text-dim">vs</span>
                <select
                  value={periodB}
                  onChange={(e) => setPeriodB(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-canvas border border-border-subtle text-main focus:outline-none focus:border-accent"
                >
                  <option value={locale === "id" ? "Agustus 2026" : "August 2026"}>{locale === "id" ? "Agustus 2026" : "August 2026"}</option>
                  <option value="September 2026">September 2026</option>
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="space-y-3">
              {/* Activity */}
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-dim">{t.quickAdd.activityTitle}</span>
                <div className="text-xs font-mono text-main flex items-center gap-2">
                  <span className="text-dim">0</span>
                  <ArrowRight className="w-3 h-3 text-dim" />
                  <span className="text-emerald-400 font-semibold">
                    0 {locale === "id" ? "sesi" : locale === "de" ? "Einheiten" : "sessions"}
                  </span>
                </div>
              </div>

              {/* Learning */}
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-dim">{t.learning.title}</span>
                <div className="text-xs font-mono text-main flex items-center gap-2">
                  <span className="text-dim">0</span>
                  <ArrowRight className="w-3 h-3 text-dim" />
                  <span className="text-emerald-400 font-semibold">
                    0 {locale === "id" ? "topik" : locale === "de" ? "Themen" : "topics"}
                  </span>
                </div>
              </div>

              {/* Habits */}
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-dim">{t.habits.rhythm}</span>
                <div className="text-xs font-mono text-main flex items-center gap-2">
                  <span className="text-dim">0 / 7 {locale === "id" ? "hari" : locale === "de" ? "Tage" : "days"}</span>
                  <ArrowRight className="w-3 h-3 text-dim" />
                  <span className="text-accent font-semibold">0 / 7 {locale === "id" ? "hari" : locale === "de" ? "Tage" : "days"}</span>
                </div>
              </div>

              {/* Finance */}
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-dim">{t.finance.netFlow}</span>
                <div className="text-xs font-mono text-main flex items-center gap-2">
                  <span className="text-dim">0</span>
                  <ArrowRight className="w-3 h-3 text-dim" />
                  <span className="text-emerald-400 font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
