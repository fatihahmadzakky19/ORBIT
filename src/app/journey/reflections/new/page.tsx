"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { formatWeekRange, getMondayOfWeek } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/context";

export default function NewReflectionPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const currentWeek = formatWeekRange(getMondayOfWeek(new Date()));

  const [whatHappened, setWhatHappened] = useState("");
  const [whatLearned, setWhatLearned] = useState("");
  const [whatChanged, setWhatChanged] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim() || !whatLearned.trim() || !whatChanged.trim()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      router.push("/journey/reflections");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/journey/reflections"
        className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t.reflections.backToReflections}</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-main">{t.reflections.title}</h1>
        <p className="text-xs font-mono text-dim mt-1">{currentWeek}</p>
      </div>

      {/* THIS WEEK CONTEXT BANNER */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <div className="flex items-center gap-2 mb-3 text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">
            {t.reflections.thisWeekContext}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-base font-mono font-semibold text-main">14</div>
            <div className="text-[11px] text-dim mt-0.5">{t.goals.activities}</div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-base font-mono font-semibold text-main">7</div>
            <div className="text-[11px] text-dim mt-0.5">{t.goals.learning}</div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-base font-mono font-semibold text-main">5 / 7</div>
            <div className="text-[11px] text-dim mt-0.5">
              {t.habits.title} {locale === "id" ? "Hari" : locale === "de" ? "Tage" : "Days"}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-base font-mono font-semibold text-main">3</div>
            <div className="text-[11px] text-dim mt-0.5">
              {t.common.active} {t.goals.title}
            </div>
          </div>
        </div>
      </div>

      {/* REFLECTION FORM */}
      <form onSubmit={handleSave} className="p-6 rounded-xl bg-surface border border-line space-y-6">
        <div>
          <label className="block text-xs font-semibold text-main mb-1.5">
            {t.reflections.whatHappened}
          </label>
          <p className="text-[11px] text-dim mb-2">
            {t.reflections.whatHappenedDesc}
          </p>
          <textarea
            required
            rows={4}
            placeholder={
              locale === "id"
                ? "Minggu ini saya mengerjakan portofolio dan mulai melamar pekerjaan frontend..."
                : locale === "de"
                ? "Diese Woche habe ich an meinem Portfolio gearbeitet und mich auf Stellen beworben..."
                : "This week I worked on my portfolio and started applying for frontend jobs..."
            }
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim leading-relaxed focus:outline-none focus:border-accent font-serif"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-main mb-1.5">
            {t.reflections.whatLearned}
          </label>
          <p className="text-[11px] text-dim mb-2">
            {t.reflections.whatLearnedDesc}
          </p>
          <textarea
            required
            rows={4}
            placeholder={
              locale === "id"
                ? "Saya lebih memahami tentang manipulasi array dan menghindari loop manual..."
                : locale === "de"
                ? "Ich habe mehr über Array-Transformationen gelernt..."
                : "I learned more about array transformations and avoiding manual loops..."
            }
            value={whatLearned}
            onChange={(e) => setWhatLearned(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim leading-relaxed focus:outline-none focus:border-accent font-serif"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-main mb-1.5">
            {t.reflections.whatChanged}
          </label>
          <p className="text-[11px] text-dim mb-2">
            {t.reflections.whatChangedDesc}
          </p>
          <textarea
            required
            rows={4}
            placeholder={
              locale === "id"
                ? "Saya merasa lebih percaya diri dalam membuat UI tanpa harus melihat tutorial setiap langkah..."
                : locale === "de"
                ? "Ich fühle mich sicherer beim Bauen von UIs, ohne ständig Tutorials ansehen zu müssen..."
                : "I feel more confident about building UIs without looking up tutorials every step..."
            }
            value={whatChanged}
            onChange={(e) => setWhatChanged(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim leading-relaxed focus:outline-none focus:border-accent font-serif"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-sub mb-1.5">
            {t.reflections.additionalNotes}
          </label>
          <textarea
            rows={2}
            placeholder={
              locale === "id"
                ? "Catatan atau observasi lainnya..."
                : locale === "de"
                ? "Weitere Beobachtungen oder Gedanken..."
                : "Any other observations or thoughts..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
          />
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
          <Link
            href="/journey/reflections"
            className="px-4 py-2 rounded-lg text-xs text-sub hover:text-main cursor-pointer"
          >
            {t.common.cancel}
          </Link>
          <button
            type="submit"
            disabled={isSaving || !whatHappened.trim() || !whatLearned.trim() || !whatChanged.trim()}
            className="px-5 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? t.common.saving : t.reflections.saveReflection}
          </button>
        </div>
      </form>
    </div>
  );
}
