"use client";

import { useState } from "react";
import { JourneyTabs } from "@/components/layout/JourneyTabs";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function ComparePage() {
  const { t, locale } = useLanguage();
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
              <span className="text-dim">8</span>
              <ArrowRight className="w-3 h-3 text-dim" />
              <span className="text-emerald-400 font-semibold">
                14 {locale === "id" ? "sesi" : locale === "de" ? "Einheiten" : "sessions"} (+6)
              </span>
            </div>
          </div>

          {/* Learning */}
          <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-dim">{t.learning.title}</span>
            <div className="text-xs font-mono text-main flex items-center gap-2">
              <span className="text-dim">3</span>
              <ArrowRight className="w-3 h-3 text-dim" />
              <span className="text-emerald-400 font-semibold">
                7 {locale === "id" ? "topik" : locale === "de" ? "Themen" : "topics"} (+4)
              </span>
            </div>
          </div>

          {/* Habits */}
          <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-dim">{t.habits.rhythm}</span>
            <div className="text-xs font-mono text-main flex items-center gap-2">
              <span className="text-dim">3 / 7 {locale === "id" ? "hari" : locale === "de" ? "Tage" : "days"}</span>
              <ArrowRight className="w-3 h-3 text-dim" />
              <span className="text-accent font-semibold">5 / 7 {locale === "id" ? "hari" : locale === "de" ? "Tage" : "days"}</span>
            </div>
          </div>

          {/* Finance */}
          <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-dim">{t.finance.netFlow}</span>
            <div className="text-xs font-mono text-main flex items-center gap-2">
              <span className="text-dim">Rp 900.000</span>
              <ArrowRight className="w-3 h-3 text-dim" />
              <span className="text-emerald-400 font-semibold">+Rp 1.750.000</span>
            </div>
          </div>
        </div>

        {/* Reflection Excerpts Comparison */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
            {t.journey.reflectionExcerpts}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle text-xs space-y-1">
              <span className="text-[11px] font-mono text-dim block">{periodA}</span>
              <p className="text-sub italic font-serif leading-relaxed">
                {locale === "id"
                  ? "“Sempat kesulitan konsistensi di awal minggu, tapi mulai membaik setelah memecah target menjadi milestone kecil...”"
                  : locale === "de"
                  ? "„Ich hatte anfangs mit Konstanz zu kämpfen, habe dann aber nach dem Aufteilen der Ziele in kleinere Meilensteine Schwung aufgenommen...“"
                  : "“I struggled with consistency earlier in the week, but picked up momentum after breaking goals down...”"}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle text-xs space-y-1">
              <span className="text-[11px] font-mono text-dim block">{periodB}</span>
              <p className="text-main italic font-serif leading-relaxed font-medium">
                {locale === "id"
                  ? "“Makin konsisten coding pagi hari. Rasa ragu berkurang saat memulai komponen baru tanpa harus melihat tutorial langkah demi langkah.”"
                  : locale === "de"
                  ? "„Ich wurde konsequenter beim morgendlichen Coden. Ich zögere weniger beim Bauen neuer Komponenten ohne Schritt-für-Schritt-Anleitungen.“"
                  : "“I became more consistent with morning coding. I hesitate less when starting new components without step-by-step tutorials.”"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT CHANGED? (GROUNDED INSIGHTS) */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
        <div className="flex items-center gap-2 text-accent">
          <Sparkles className="w-4 h-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">
            {t.journey.groundedInsights}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Objective */}
          <div className="p-4 rounded-lg bg-canvas border border-border-subtle">
            <span className="text-[11px] uppercase tracking-wider text-accent font-semibold block mb-1">
              {t.journey.objective}
            </span>
            <p className="text-xs text-sub leading-relaxed">
              {locale === "id" ? (
                <>Catatan pemahamanmu bertambah dari <span className="font-mono text-main">3 → 7</span> topik.</>
              ) : locale === "de" ? (
                <>Deine Lerneinträge stiegen von <span className="font-mono text-main">3 → 7</span> Themen.</>
              ) : (
                <>Your learning records increased from <span className="font-mono text-main">3 → 7</span> topics.</>
              )}
            </p>
          </div>

          {/* Behavioral */}
          <div className="p-4 rounded-lg bg-canvas border border-border-subtle">
            <span className="text-[11px] uppercase tracking-wider text-accent font-semibold block mb-1">
              {t.journey.behavioral}
            </span>
            <p className="text-xs text-sub leading-relaxed">
              {locale === "id" ? (
                <>Penyelesaian kebiasaan coding meningkat dari <span className="font-mono text-main">3/7 → 5/7 hari</span>.</>
              ) : locale === "de" ? (
                <>Deine Codiereinheiten stiegen von <span className="font-mono text-main">3/7 → 5/7 Tagen</span>.</>
              ) : (
                <>Your coding habit completion improved from <span className="font-mono text-main">3/7 → 5/7 days</span>.</>
              )}
            </p>
          </div>

          {/* Subjective */}
          <div className="p-4 rounded-lg bg-canvas border border-border-subtle">
            <span className="text-[11px] uppercase tracking-wider text-accent font-semibold block mb-1">
              {t.journey.subjective}
            </span>
            <p className="text-xs text-sub leading-relaxed">
              {locale === "id"
                ? "Refleksi mingguanmu berulang kali mencatat meningkatnya rasa percaya diri dibanding bulan sebelumnya."
                : locale === "de"
                ? "Deine Reflexionen betonen wiederholt ein gesteigertes Selbstvertrauen im Vergleich zum Vormonat."
                : "Your reflections repeatedly mention feeling greater confidence compared to the previous month."}
            </p>
          </div>

          {/* Life Events */}
          <div className="p-4 rounded-lg bg-canvas border border-border-subtle">
            <span className="text-[11px] uppercase tracking-wider text-accent font-semibold block mb-1">
              {t.journey.lifeEvents}
            </span>
            <p className="text-xs text-sub leading-relaxed">
              {locale === "id"
                ? "Kamu lulus sekolah SMK, membangun website portofolio v1, dan mulai melamar lowongan frontend."
                : locale === "de"
                ? "Du hast die Schule abgeschlossen, deine Portfolio-Website v1 gebaut und begonnen, dich für Frontend-Stellen zu bewerben."
                : "You graduated from school, built your portfolio website, and started applying for frontend jobs."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
