"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Wallet,
} from "lucide-react";
import { formatWeekRange, getMondayOfWeek } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/context";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [habits, setHabits] = useState([
    { id: "h1", name: "Coding Practice", completed: true },
    { id: "h2", name: "Exercise 30 min", completed: false },
    { id: "h3", name: "Reading 20 pages", completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const completedHabitsCount = habits.filter((h) => h.completed).length;

  const dateLocaleStr = locale === "id" ? "id-ID" : locale === "de" ? "de-DE" : "en-US";
  const todayFormatted = new Intl.DateTimeFormat(dateLocaleStr, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.home.greetingMorning
      : hour < 17
      ? t.home.greetingAfternoon
      : t.home.greetingEvening;

  const currentWeekRange = formatWeekRange(getMondayOfWeek(new Date()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-main tracking-tight">
          {greeting}, Alex
        </h1>
        <p className="text-xs md:text-sm text-dim font-mono mt-1">
          {todayFormatted}
        </p>
      </div>

      {/* TODAY'S RHYTHM CARD */}
      <section className="p-5 rounded-xl bg-surface border border-line shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
            {t.home.today}
          </h2>
          <span className="text-xs font-mono text-sub">
            {completedHabitsCount} / {habits.length} {t.home.habitsCount}
          </span>
        </div>

        <div className="space-y-2">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-border-subtle hover:border-line transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {habit.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-dim group-hover:text-sub shrink-0" />
                )}
                <span
                  className={`text-sm transition-colors ${
                    habit.completed ? "text-sub line-through" : "text-main"
                  }`}
                >
                  {habit.name}
                </span>
              </div>
              <span className="text-[11px] text-dim opacity-0 group-hover:opacity-100 transition-opacity">
                {habit.completed ? t.common.done : t.common.markDone}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CURRENT FOCUS (ACTIVE GOALS) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
            {t.home.currentFocus}
          </h2>
          <Link
            href="/goals"
            className="text-xs text-sub hover:text-main flex items-center gap-1 transition-colors"
          >
            <span>{t.home.allGoals}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goal 1 */}
          <Link
            href="/goals"
            className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all group block"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                Get First Job
              </h3>
              <span className="text-xs font-mono text-sub">65%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden mb-3">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: "65%" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-dim">
              <span>{t.common.inProgress}</span>
              <span>{t.common.deadline} 30 Nov 2026</span>
            </div>
          </Link>

          {/* Goal 2 */}
          <Link
            href="/goals"
            className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all group block"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                Save Rp10M
              </h3>
              <span className="text-xs font-mono text-sub">40%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden mb-3">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: "40%" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-dim">
              <span>{t.common.inProgress}</span>
              <span className="font-mono">Rp4M / Rp10M</span>
            </div>
          </Link>
        </div>
      </section>

      {/* RECENT LEARNING & FINANCE SNAPSHOT */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Learning */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-dim">
              <BookOpen className="w-3.5 h-3.5" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                {t.home.recentLearning}
              </h2>
            </div>
            <h3 className="text-sm font-medium text-main mb-1">
              Array Methods
            </h3>
            <p className="text-xs text-sub line-clamp-2 leading-relaxed">
              Understanding map(), filter(), and reduce() - transforming vs selecting elements without mutating state.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <Link
              href="/learning"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>{t.home.viewLearning}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Finance Snapshot */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-dim">
              <Wallet className="w-3.5 h-3.5" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                {t.home.financeSnapshot}
              </h2>
            </div>
            <div className="text-xs text-dim mb-0.5">{t.common.actualBalance}</div>
            <div className="text-xl font-mono font-semibold text-main">
              Rp 4.750.000
            </div>
            <div className="text-xs text-dim mt-1">
              {t.common.calculatedBalance}: <span className="font-mono text-sub">Rp 4.800.000</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <Link
              href="/finance"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>{t.home.viewFinance}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* WEEKLY REFLECTION BANNER */}
      <section className="p-5 rounded-xl bg-gradient-to-r from-surface to-surface-elevated border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              {t.home.weeklyReflection}
            </h2>
          </div>
          <p className="text-xs font-mono text-dim mb-1">{currentWeekRange}</p>
          <p className="text-xs text-sub">
            {t.home.reflectionPending}
          </p>
        </div>
        <Link
          href="/journey/reflections/new"
          className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all shrink-0 cursor-pointer"
        >
          <span>{t.home.reflectThisWeek}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </section>
    </div>
  );
}
