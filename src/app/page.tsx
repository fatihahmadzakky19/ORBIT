"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Wallet,
  Plus,
  Target,
  Activity,
  Clock,
} from "lucide-react";
import { formatWeekRange, getMondayOfWeek, getTodayDateString } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/motion/FadeIn";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

// Dynamically import 3D Scene to keep SSR fast and bundle isolated
const DashboardScene = dynamic(
  () => import("@/components/3d/DashboardScene").then((mod) => mod.DashboardScene),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border border-cyan-400/20 border-dashed animate-[spin_20s_linear_infinite]" />
        <div className="absolute w-12 h-12 rounded-xl rotate-45 bg-cyan-500/15 border border-cyan-400/20" />
      </div>
    ),
  }
);

interface HabitItem {
  id: string;
  name: string;
  completedDates: string[];
  evidence?: any[];
}

interface GoalItem {
  id: string;
  title: string;
  percent: number;
  deadline?: string;
  status: string;
}

interface LearningItem {
  id: string;
  topic: string;
  understood: string;
  date: string;
}

export default function HomePage() {
  const { t, locale } = useLanguage();

  // Real-time ticking clock for digital OS feel
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(locale === "id" ? "id-ID" : locale === "de" ? "de-DE" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  // Data states connected to localStorage
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [focusGoals, setFocusGoals] = useState<GoalItem[]>([]);
  const [recentLearning, setRecentLearning] = useState<LearningItem | null>(null);
  const [actualBalance, setActualBalance] = useState<number>(0);
  const [calculatedBalance, setCalculatedBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>("Fatih");

  const todayStr = getTodayDateString(new Date());

  // Load real data from localStorage
  useEffect(() => {
    try {
      // Habits
      const savedHabits = localStorage.getItem("orbit_habits");
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
        }
      }

      // Goals
      const savedGoals = localStorage.getItem("orbit_goals");
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        if (Array.isArray(parsed)) {
          const active = parsed.filter(
            (g: any) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED" || !g.status
          );
          setFocusGoals(active.slice(0, 4));
        }
      }

      // Learning
      const savedLearning = localStorage.getItem("orbit_learnings");
      if (savedLearning) {
        const parsed = JSON.parse(savedLearning);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentLearning(parsed[0]);
        }
      }

      // Profile name
      const savedProfile = localStorage.getItem("orbit_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setUserName(parsed.name);
      }
    } catch {
      // Fallback gracefully on parsing errors
    }
  }, []);

  // Toggle habit completion for today
  const toggleHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== id) return h;
        const isDoneToday = h.completedDates?.includes(todayStr);
        const newDates = isDoneToday
          ? h.completedDates.filter((d) => d !== todayStr)
          : [...(h.completedDates || []), todayStr];
        return { ...h, completedDates: newDates };
      });
      try {
        localStorage.setItem("orbit_habits", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const completedTodayCount = habits.filter((h) =>
    h.completedDates?.includes(todayStr)
  ).length;
  const habitCompletionRate = habits.length > 0
    ? Math.round((completedTodayCount / habits.length) * 100)
    : 0;

  const dateLocaleStr = locale === "id" ? "id-ID" : locale === "de" ? "de-DE" : "en-US";
  const todayFormatted = new Intl.DateTimeFormat(dateLocaleStr, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const hour = new Date().getHours();
  const greetingText =
    hour < 12
      ? t.home.greetingMorning
      : hour < 17
      ? t.home.greetingAfternoon
      : t.home.greetingEvening;

  const currentWeekRange = formatWeekRange(getMondayOfWeek(new Date()));

  return (
    <div className="space-y-12 md:space-y-16 pb-10">
      {/* 1. HERO SECTION — Doppelrand architecture (high-end §4.A) */}
      <FadeIn direction="up" duration={0.45}>
        <div className="doppelrand">
          <div className="doppelrand-inner relative overflow-hidden p-6 sm:p-8 lg:p-10">
            {/* Subtle ambient light */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-0 w-72 h-72 bg-sky-500/[0.06] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Console */}
              <div className="lg:col-span-7 space-y-5">
                {/* Status pill + Clock — Copy Self-Audit: removed fake system jargon */}
                <div className="flex flex-wrap items-center gap-3">
                  {currentTime && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-dim px-2.5 py-1 rounded-full bg-canvas/60 border border-border-subtle">
                      <Clock className="w-3 h-3 text-accent" />
                      <span>{currentTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Greeting & Date */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-main tracking-tight">
                    {greetingText}, <span className="text-accent">{userName}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-sub font-mono mt-1.5 flex items-center gap-2">
                    <span suppressHydrationWarning>{todayFormatted}</span>
                    <span className="text-dim">·</span>
                    <span className="text-dim" suppressHydrationWarning>{currentWeekRange}</span>
                  </p>
                </div>

                {/* Quick vitals — plain labels, no jargon */}
                <div className="pt-1 flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border-subtle text-xs">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-dim">{t.nav.habits}:</span>
                    <span className="font-mono font-medium text-main">
                      {completedTodayCount}/{habits.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border-subtle text-xs">
                    <Target className="w-3.5 h-3.5 text-accent" />
                    <span className="text-dim">{t.nav.goals}:</span>
                    <span className="font-mono font-medium text-main">
                      {focusGoals.length} {t.common.active}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: 3D Celestial Orbit */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                <div className="w-full max-w-[320px] aspect-square flex items-center justify-center relative">
                  <DashboardScene />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 2. METRICS ROW — no eyebrows on individual cards (eyebrow restraint §4.7) */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Metric 1: Daily Habit Completion Rate */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 glass-card rounded-xl">
            <div className="flex items-center justify-between text-dim mb-2.5">
              <span className="text-[11px] font-mono text-sub">{t.home.today}</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-semibold font-mono text-main tracking-tight">
              {habitCompletionRate}%
            </div>
            <div className="w-full h-1 rounded-full bg-canvas mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${habitCompletionRate}%` }}
              />
            </div>
            <div className="text-[10px] text-dim mt-2 flex justify-between font-mono">
              <span>{completedTodayCount} done</span>
              <span>{habits.length - completedTodayCount} pending</span>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 2: Active Goals Count */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 glass-card rounded-xl">
            <div className="flex items-center justify-between text-dim mb-2.5">
              <span className="text-[11px] font-mono text-sub">{t.nav.goals}</span>
              <Target className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-2xl font-semibold font-mono text-main tracking-tight">
              {focusGoals.length}
            </div>
            <div className="text-xs text-sub mt-1.5 truncate">
              {focusGoals.length > 0 ? focusGoals[0].title : t.goals.noGoals}
            </div>
            <Link
              href="/goals"
              className="text-[10px] text-accent hover:underline mt-2.5 inline-flex items-center gap-1"
            >
              <span>{t.home.allGoals}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 3: Latest Learning */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 glass-card rounded-xl">
            <div className="flex items-center justify-between text-dim mb-2.5">
              <span className="text-[11px] font-mono text-sub">{t.nav.learning}</span>
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xs font-medium text-main line-clamp-2 min-h-[3rem]">
              {recentLearning ? recentLearning.topic : t.home.noRecentLearning}
            </div>
            <Link
              href="/learning"
              className="text-[10px] text-accent hover:underline mt-2.5 inline-flex items-center gap-1"
            >
              <span>{t.home.viewLearning}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 4: Finance */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 glass-card rounded-xl">
            <div className="flex items-center justify-between text-dim mb-2.5">
              <span className="text-[11px] font-mono text-sub">{t.nav.finance}</span>
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-semibold font-mono text-main tracking-tight truncate">
              {formatCurrency(actualBalance)}
            </div>
            <div className="text-[10px] text-dim mt-1.5 font-mono">
              {t.nav.finance}: <span className="text-sub">{formatCurrency(calculatedBalance)}</span>
            </div>
            <Link
              href="/finance"
              className="text-[10px] text-accent hover:underline mt-2.5 inline-flex items-center gap-1"
            >
              <span>{t.home.viewFinance}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* 3. MAIN CONTENT — Habits + Goals side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* TODAY'S HABITS — keeps eyebrow (1 of 2 allowed) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t.home.today}
              </h2>
            </div>
            {habits.length > 0 && (
              <span className="text-xs font-mono text-sub bg-surface-elevated px-2.5 py-0.5 rounded-full border border-border-subtle">
                {completedTodayCount} / {habits.length}
              </span>
            )}
          </div>

          <AnimatedCard interactive={false} className="p-5 glass-card rounded-xl">
            {habits.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-lg border border-dashed border-border-subtle bg-canvas/40">
                <p className="text-xs text-dim mb-3">{t.home.noHabitsToday}</p>
                <Link
                  href="/habits"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border-subtle hover:border-accent/50 text-sub hover:text-main transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.habits.createHabit}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {habits.map((habit) => {
                  const isDone = habit.completedDates?.includes(todayStr);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] text-left cursor-pointer group ${
                        isDone
                          ? "bg-canvas/50 border-border-subtle hover:border-border"
                          : "bg-surface/80 border-border-subtle hover:border-accent/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        ) : (
                          <Circle className="w-4 h-4 text-dim group-hover:text-accent shrink-0 transition-colors" />
                        )}
                        <span
                          className={`text-sm transition-all duration-200 ${
                            isDone
                              ? "text-dim line-through"
                              : "text-main font-medium group-hover:text-white"
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded transition-opacity ${
                          isDone
                            ? "text-emerald-400/70 bg-emerald-500/10"
                            : "text-dim opacity-0 group-hover:opacity-100 bg-surface-elevated"
                        }`}
                      >
                        {isDone ? t.common.done : t.common.markDone}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* ACTIVE GOALS — eyebrow (2 of 2 allowed) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t.home.currentFocus}
              </h2>
            </div>
            <Link
              href="/goals"
              className="text-xs text-sub hover:text-accent flex items-center gap-1 transition-colors"
            >
              <span>{t.home.allGoals}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <AnimatedCard interactive={false} className="p-5 glass-card rounded-xl">
            {focusGoals.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-lg border border-dashed border-border-subtle bg-canvas/40">
                <p className="text-xs text-dim mb-3">{t.home.noActiveGoals}</p>
                <Link
                  href="/goals"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border-subtle hover:border-accent/50 text-sub hover:text-main transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.goals.createGoal}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {focusGoals.map((goal) => (
                  <Link
                    key={goal.id}
                    href="/goals"
                    className="p-3.5 rounded-lg bg-canvas/60 border border-border-subtle hover:border-accent/30 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] block group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xs font-medium text-main group-hover:text-accent transition-colors line-clamp-1">
                        {goal.title}
                      </h3>
                      <span className="text-xs font-mono text-sub shrink-0 ml-2">
                        {goal.percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{ width: `${Math.min(100, Math.max(0, goal.percent))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-dim font-mono">
                      <span>{t.common.inProgress}</span>
                      {goal.deadline && (
                        <span>{goal.deadline}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {/* 4. BOTTOM ROW — Learning + Reflection (no eyebrows, border-top separator §4.7) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* Recent Learning — minimal treatment, no eyebrow */}
        <div className="md:col-span-6">
          <AnimatedCard interactive={true} className="p-5 sm:p-6 glass-card rounded-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-dim">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <h2 className="text-sm font-medium text-sub">
                  {t.home.recentLearning}
                </h2>
              </div>
              {recentLearning ? (
                <>
                  <h3 className="text-sm font-semibold text-main mb-1.5 line-clamp-1">
                    {recentLearning.topic}
                  </h3>
                  <p className="text-xs text-sub line-clamp-3 leading-relaxed">
                    {recentLearning.understood}
                  </p>
                </>
              ) : (
                <p className="text-xs text-dim leading-relaxed">
                  {t.home.noRecentLearning}
                </p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center">
              <span className="text-[10px] font-mono text-dim">
                {recentLearning?.date || todayFormatted}
              </span>
              <Link
                href="/learning"
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <span>{t.home.viewLearning}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </AnimatedCard>
        </div>

        {/* Weekly Reflection — no eyebrow, clean copy */}
        <div className="md:col-span-6">
          <AnimatedCard interactive={true} className="p-5 sm:p-6 glass-card rounded-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <h2 className="text-sm font-medium text-sub">
                  {t.home.weeklyReflection}
                </h2>
              </div>
              <p className="text-xs font-mono text-dim mb-2">{currentWeekRange}</p>
              <p className="text-xs text-sub leading-relaxed">
                {t.home.reflectionPending}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-dim">{currentWeekRange}</span>
              <Link
                href="/journey/reflections/new"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated/90 border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer shadow-sm"
              >
                <span>{t.home.reflectThisWeek}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
