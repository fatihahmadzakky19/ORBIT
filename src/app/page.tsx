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
  Lock,
  Compass,
} from "lucide-react";
import { formatWeekRange, getMondayOfWeek, getTodayDateString } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/motion/FadeIn";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";
import { motion, useReducedMotion } from "framer-motion";
import { useProfile } from "@/lib/profile";
import { getVaultStats } from "@/lib/vault";
import { getStoredFinanceBalances, ORBIT_DATA_CHANGED_EVENT, notifyDataChanged } from "@/lib/storage";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

// Dynamically import 3D Scene to keep SSR fast and bundle isolated
// (Existing approved 3D black hole visual preserved 100% untouched)
const DashboardScene = dynamic(
  () => import("@/components/3d/DashboardScene").then((mod) => mod.DashboardScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center select-none">
        <div
          className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-[#C5A56A]/10 via-[#9B8060]/5 to-transparent blur-3xl animate-pulse"
          style={{ right: "18%" }}
        />
        <div
          className="absolute w-40 h-20 rounded-[100%] border border-[#C5A56A]/15 rotate-[-18deg] animate-[pulse_3s_ease-in-out_infinite]"
          style={{ right: "18%" }}
        />
        <div
          className="w-14 h-14 rounded-full bg-[#070A0D] shadow-[0_0_30px_rgba(197,165,106,0.18)] border border-[#2A2D2D]"
          style={{ marginLeft: "32%" }}
        />
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
  const { profile } = useProfile();
  const shouldReduceMotion = useReducedMotion();

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
  const [vaultStats, setVaultStats] = useState({ totalFolders: 0, totalItems: 0, isUnlocked: false });

  const todayStr = getTodayDateString(new Date());

  const loadDashboardData = () => {
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

      // Learning (check both orbit_learning_notes and orbit_learnings)
      const savedLearningNotes =
        localStorage.getItem("orbit_learning_notes") || localStorage.getItem("orbit_learnings");
      if (savedLearningNotes) {
        const parsed = JSON.parse(savedLearningNotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentLearning(parsed[0]);
        }
      }

      // Finance balances
      const balances = getStoredFinanceBalances();
      setActualBalance(balances.actual);
      setCalculatedBalance(balances.calculated);

      // Vault stats
      setVaultStats(getVaultStats());
    } catch {
      // Fallback gracefully on parsing errors
    }
  };

  // Load real data from localStorage and attach live listeners
  useEffect(() => {
    loadDashboardData();
    window.addEventListener(ORBIT_DATA_CHANGED_EVENT, loadDashboardData);
    window.addEventListener("orbit_vault_changed", loadDashboardData);
    window.addEventListener("storage", loadDashboardData);
    return () => {
      window.removeEventListener(ORBIT_DATA_CHANGED_EVENT, loadDashboardData);
      window.removeEventListener("orbit_vault_changed", loadDashboardData);
      window.removeEventListener("storage", loadDashboardData);
    };
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
        notifyDataChanged("habits");
      } catch {}
      return updated;
    });
  };

  const completedTodayCount = habits.filter((h) =>
    h.completedDates?.includes(todayStr)
  ).length;
  const pendingHabitCount = habits.length - completedTodayCount;
  const habitCompletionRate =
    habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

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

  // Active Focus item (first focus goal)
  const primaryFocus = focusGoals.length > 0 ? focusGoals[0] : null;

  // ═══════════════════════════════════════════════════════════════
  // HERO TYPING & SEQUENTIAL REVEAL CONTROLLER
  // - Step 1: "Selamat malam," types char-by-char with gentle blinking cursor
  // - Step 2: 200ms delay -> "Fatih Ahmad Zakky" types with warm reflection cursor
  // - Step 3: 200ms delay -> Date reveals with subtle fade-in
  // - Step 4: 150ms delay -> Time badge + ONLINE pulse reveals
  // - Step 5: Mini status indicators reveal, completing OS boot feel
  // - Respects prefers-reduced-motion (instant display)
  // - Runs once on mount, no endless looping or text erasure
  // ═══════════════════════════════════════════════════════════════
  const greetingFull = `${greetingText},`;
  const nameFull = profile.name || "Fatih Ahmad Zakky";

  const [displayedGreeting, setDisplayedGreeting] = useState("");
  const [displayedName, setDisplayedName] = useState("");
  const [isTypingGreeting, setIsTypingGreeting] = useState(false);
  const [isTypingName, setIsTypingName] = useState(false);
  const [showGreetingCursor, setShowGreetingCursor] = useState(false);
  const [showNameCursor, setShowNameCursor] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion, reveal everything immediately
    if (shouldReduceMotion) {
      setDisplayedGreeting(greetingFull);
      setDisplayedName(nameFull);
      setShowDate(true);
      setShowTelemetry(true);
      setShowMetrics(true);
      setHasAnimated(true);
      return;
    }

    // If animation has already completed once, keep full text displayed
    if (hasAnimated) {
      setDisplayedGreeting(greetingFull);
      setDisplayedName(nameFull);
      setShowDate(true);
      setShowTelemetry(true);
      setShowMetrics(true);
      return;
    }

    let isMounted = true;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
    const greetingSpeed = isMobile ? 46 : 58; // 50–70ms per character
    const nameSpeed = isMobile ? 54 : 68; // 60–80ms per character

    // 1. Begin typing greeting
    setIsTypingGreeting(true);
    setShowGreetingCursor(true);

    let gIndex = 0;
    const gTimer = setInterval(() => {
      if (!isMounted) return;
      gIndex++;
      setDisplayedGreeting(greetingFull.slice(0, gIndex));

      if (gIndex >= greetingFull.length) {
        clearInterval(gTimer);
        setIsTypingGreeting(false);

        // Pause 200ms after greeting completes, then start name
        setTimeout(() => {
          if (!isMounted) return;
          setShowGreetingCursor(false);

          // 2. Begin typing name
          setIsTypingName(true);
          setShowNameCursor(true);

          let nIndex = 0;
          const nTimer = setInterval(() => {
            if (!isMounted) return;
            nIndex++;
            setDisplayedName(nameFull.slice(0, nIndex));

            if (nIndex >= nameFull.length) {
              clearInterval(nTimer);
              setIsTypingName(false);

              // Pause 200ms after name completes, then reveal date
              setTimeout(() => {
                if (!isMounted) return;
                setShowNameCursor(false);
                setShowDate(true);

                // Pause 150ms after date, then reveal time badge + ONLINE
                setTimeout(() => {
                  if (!isMounted) return;
                  setShowTelemetry(true);

                  // Reveal mini indicators right after
                  setTimeout(() => {
                    if (!isMounted) return;
                    setShowMetrics(true);
                    setHasAnimated(true);
                  }, 120);
                }, 150);
              }, 200);
            }
          }, nameSpeed);
        }, 200);
      }
    }, greetingSpeed);

    return () => {
      isMounted = false;
      clearInterval(gTimer);
    };
  }, [greetingFull, nameFull, shouldReduceMotion, hasAnimated]);

  // Keep displayed text in sync if language/profile changes after animation
  useEffect(() => {
    if (hasAnimated) {
      setDisplayedGreeting(greetingFull);
      setDisplayedName(nameFull);
    }
  }, [greetingFull, nameFull, hasAnimated]);

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8 pb-8">
      {/* ═══════════════════════════════════════════════════════════════
          1. BLACK HOLE HERO — Command Center & Observatory Viewport
          - The 3D Black Hole visual remains 100% UNTOUCHED on the right
          - The hero frame acts as an astronomical command center bay
          - Dominant user name: 36-44px desktop, 28-32px mobile
          - Mini status indicators: KEBIASAAN, TARGET, KEUANGAN
          ═══════════════════════════════════════════════════════════════ */}
      <FadeIn direction="up" duration={0.35}>
        <div className="hero-frame border border-[#D9DDD9] shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-[20px] overflow-hidden bg-[#0A0E12]">
          <div className="relative overflow-hidden min-h-[290px] sm:min-h-[320px] md:min-h-[340px]">
            {/* 3D Interactive Black Hole Canvas (Untouched) */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
              <DashboardScene />
            </div>

            {/* Seamless cinematic gradient overlay:
                Deep space overlay on the left keeping text 100% crisp and readable,
                transparent on the right so the glowing accretion disk shines unobstructed */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(8,12,16,0.96) 0%, rgba(10,14,18,0.90) 45%, rgba(13,18,24,0.55) 72%, rgba(13,18,24,0.15) 88%, transparent 100%)",
              }}
            />

            {/* Mobile-specific vertical gradient for top-text clarity */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none sm:hidden"
              style={{
                background: "linear-gradient(to bottom, rgba(8,12,16,0.85) 0%, rgba(8,12,16,0.3) 65%, transparent 100%)",
              }}
            />

            {/* Subtle bottom vignette */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(8,12,16,0.75) 0%, transparent 30%)",
              }}
            />

            {/* Subtle Black Hole Ambient Warm Reflection onto Text Area */}
            <div
              className="absolute inset-y-0 left-0 w-full max-w-xl pointer-events-none z-[2] overflow-hidden"
              aria-hidden="true"
            >
              <div
                className={`absolute -top-12 -bottom-12 right-2 sm:right-6 w-72 sm:w-96 rounded-full blur-3xl pointer-events-none ${
                  shouldReduceMotion ? "opacity-[0.05]" : "animate-hero-ambient"
                }`}
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(200, 169, 107, 0.38) 0%, rgba(245, 241, 233, 0.20) 40%, transparent 75%)",
                }}
              />
            </div>

            {/* Content overlay — left-aligned, spacious & strong hierarchy */}
            <div className="relative z-10 p-4 sm:p-7 md:p-8 lg:p-9 flex flex-col justify-center min-h-[290px] sm:min-h-[320px] md:min-h-[340px]">
              <div className="max-w-lg space-y-3 sm:space-y-4">
                {/* 1. Telemetry Indicator (Time + ONLINE badge):
                    Reserved in layout so no layout shift occurs, fades in after date */}
                <div className="min-h-[28px] flex items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: showTelemetry ? 1 : 0,
                      y: showTelemetry ? 0 : 5,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0.05 : 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono shadow-sm backdrop-blur-md w-fit ${
                      showTelemetry ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#08BFD7]" />
                    <span className="text-[#ECEEEA]">{currentTime || "00:00:00"}</span>
                    <span className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1.5 text-[10px] text-[#059669]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-telemetry-pulse" />
                      <span className="font-medium tracking-[0.05em]">ONLINE</span>
                    </div>
                  </motion.div>
                </div>

                {/* 2 & 3. Greeting, Refined User Name, & Date */}
                <div>
                  {/* Greeting: typed char-by-char with gentle blinking cursor */}
                  <p className="text-sm sm:text-[15px] text-[#A7A29A] font-normal leading-normal mb-1 min-h-[22px] flex items-center">
                    <span>{displayedGreeting}</span>
                    {showGreetingCursor && (
                      <span
                        className={`inline-block w-[1.5px] h-[13px] bg-[#A7A29A] ml-0.5 align-middle transition-opacity duration-200 ${
                          isTypingGreeting ? "animate-typing-cursor opacity-100" : "opacity-0"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </p>

                  {/* Name: typed char-by-char with subtle warm-white reflection cursor */}
                  <div className="min-h-[34px] sm:min-h-[44px] flex items-center">
                    <h1 className="relative inline-block text-[22px] xs:text-[25px] sm:text-3xl md:text-4xl lg:text-[40px] font-semibold text-white tracking-[-0.01em] leading-[1.15] cursor-default select-none transition-[filter,opacity] duration-200 hover:brightness-110 overflow-hidden">
                      <span>{displayedName}</span>
                      {showNameCursor && (
                        <span
                          className={`inline-block w-[2px] h-[20px] sm:h-[30px] bg-[#F5F1E9] cursor-warm-glow ml-1 align-middle transition-opacity duration-200 ${
                            isTypingName ? "animate-typing-cursor opacity-100" : "opacity-0"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      {/* Single soft light sheen sweep across the name once when typing completes */}
                      {!isTypingName && displayedName.length > 0 && !shouldReduceMotion && (
                        <span
                          className="pointer-events-none absolute inset-0 -top-1 -bottom-1 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px] animate-hero-sweep"
                          aria-hidden="true"
                        />
                      )}
                    </h1>
                  </div>

                  {/* Date: appears after name finishes (fade-in + slight reveal) */}
                  <div className="min-h-[20px] mt-1 flex items-center">
                    <motion.p
                      initial={false}
                      animate={{
                        opacity: showDate ? 1 : 0,
                        y: showDate ? 0 : 4,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0.05 : 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="text-[12px] sm:text-[13px] text-[#8A9197] font-normal"
                    >
                      <span suppressHydrationWarning>{todayFormatted}</span>
                    </motion.p>
                  </div>
                </div>

                {/* 4. Mini Status Indicators: appears after badge */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: showMetrics ? 1 : 0,
                    y: showMetrics ? 0 : 6,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0.05 : 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`pt-2 grid grid-cols-3 gap-1.5 sm:gap-3 ${
                    showMetrics ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  {/* Kebiasaan */}
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/10 shadow-sm text-left">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.03em] text-[#A7A29A] font-normal">
                      <span className="text-[#059669]">◌</span>
                      <span className="truncate">{t.nav.habits}</span>
                    </div>
                    <div className="text-[11px] sm:text-[13px] font-mono font-medium text-white mt-0.5 truncate">
                      {completedTodayCount} / {habits.length}
                    </div>
                  </div>

                  {/* Target */}
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/10 shadow-sm text-left">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.03em] text-[#A7A29A] font-normal">
                      <span className="text-[#08BFD7]">◎</span>
                      <span className="truncate">{t.nav.goals}</span>
                    </div>
                    <div className="text-[11px] sm:text-[13px] font-mono font-medium text-white mt-0.5 truncate">
                      {focusGoals.length} {t.common.active}
                    </div>
                  </div>

                  {/* Keuangan */}
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/10 shadow-sm text-left">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.03em] text-[#A7A29A] font-normal">
                      <span className="text-[#C8A96B]">◇</span>
                      <span className="truncate">{t.nav.finance}</span>
                    </div>
                    <div className="text-[11px] sm:text-[13px] font-mono font-medium text-white mt-0.5 truncate">
                      {formatCurrency(actualBalance)}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════════════
          2. SUMMARY CARDS ROW — 4 Modules (Light Space Observatory)
          - White surfaces, subtle #D9DDD9 border, soft ambient shadow
          - 3-tier hierarchy: TOP (label+icon) -> MIDDLE (value) -> BOTTOM (action)
          - Semantic accents: Hari Ini (cyan), Target (cyan/blue),
            Pembelajaran (warm gold), Keuangan (warm gold)
          ═══════════════════════════════════════════════════════════════ */}
      <StaggerContainer staggerDelay={0.04} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Module 1: HARI INI */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[138px] sm:h-[148px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.02em] text-[#687078] uppercase">{t.home.today}</span>
              <Activity className="w-4 h-4 text-[#08BFD7] shrink-0" />
            </div>
            <div>
              <div className="text-[24px] sm:text-[28px] font-semibold text-[#20252A] tracking-[-0.01em] leading-none">
                {habitCompletionRate}%
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 rounded-full bg-[#ECEEEA] overflow-hidden">
                <div
                  className="h-full bg-[#08BFD7] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${habitCompletionRate}%` }}
                />
              </div>
              <div className="text-[11px] sm:text-[12px] text-[#687078] font-normal mt-1.5 flex justify-between">
                <span>{completedTodayCount} selesai</span>
                <span className="text-[#8A9197]">{pendingHabitCount} tersisa</span>
              </div>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Module 2: TARGET */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[138px] sm:h-[148px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.02em] text-[#687078] uppercase">{t.nav.goals}</span>
              <Target className="w-4 h-4 text-[#08BFD7] shrink-0" />
            </div>
            <div>
              <div className="text-[24px] sm:text-[28px] font-semibold text-[#20252A] tracking-[-0.01em] leading-none">
                {focusGoals.length}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-normal text-[#687078] truncate leading-none">
                {focusGoals.length > 0 ? focusGoals[0].title : "Belum ada target aktif"}
              </div>
              <Link
                href="/goals"
                className="text-[11px] font-medium text-[#08BFD7] hover:underline mt-1.5 inline-flex items-center gap-1"
              >
                <span>{t.home.allGoals}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Module 3: PEMBELAJARAN */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[138px] sm:h-[148px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.02em] text-[#687078] uppercase">{t.nav.learning}</span>
              <BookOpen className="w-4 h-4 text-[#C8A96B] shrink-0" />
            </div>
            <div>
              <div className="text-[13px] font-normal text-[#20252A] line-clamp-2 leading-snug">
                {recentLearning ? recentLearning.topic : "Belum ada catatan pembelajaran"}
              </div>
            </div>
            <div className="pt-0.5">
              <Link
                href="/learning"
                className="text-[11px] font-medium text-[#08BFD7] hover:underline inline-flex items-center gap-1"
              >
                <span>{t.home.viewLearning}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Module 4: KEUANGAN */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[138px] sm:h-[148px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.02em] text-[#687078] uppercase">{t.nav.finance}</span>
              <Wallet className="w-4 h-4 text-[#C8A96B] shrink-0" />
            </div>
            <div>
              <div className="text-[20px] sm:text-[24px] font-semibold text-[#20252A] tracking-[-0.01em] truncate leading-none">
                {formatCurrency(actualBalance)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#8A9197] font-normal truncate">
                Tercatat: <span className="text-[#687078] font-mono">{formatCurrency(calculatedBalance)}</span>
              </div>
              <Link
                href="/finance"
                className="text-[11px] font-medium text-[#08BFD7] hover:underline mt-1.5 inline-flex items-center gap-1"
              >
                <span>{t.home.viewFinance}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* ═══════════════════════════════════════════════════════════════
          3. ACTIONABLE CONTENT — HARI INI & FOKUS SAAT INI (2-Column)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
        {/* TODAY'S HABITS (HARI INI) */}
        <div className="lg:col-span-7 space-y-2.5">
          <SectionHeader
            title={t.home.today}
            icon={Activity}
            iconColor="text-[#08BFD7]"
            countBadge={habits.length > 0 ? `${completedTodayCount}/${habits.length}` : undefined}
          />

          <div className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm">
            {habits.length === 0 ? (
              <EmptyState
                title="Belum ada aktivitas tercatat"
                description="Tambahkan catatan atau kebiasaan pertamamu hari ini untuk mulai melacak progres."
                actionLabel={t.habits.createHabit}
                actionHref="/habits"
              />
            ) : (
              <div className="space-y-2">
                {habits.map((habit) => {
                  const isDone = habit.completedDates?.includes(todayStr);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-150 text-left cursor-pointer group ${
                        isDone
                          ? "bg-[#FAFAF8] border-[#E6EAE5] text-[#8A9197]"
                          : "bg-white border-[#D9DDD9] hover:border-[#08BFD7]/50 hover:bg-[#F8F9F7]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 transition-transform duration-150 group-hover:scale-105" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#8A9197] group-hover:text-[#08BFD7] shrink-0 transition-colors" />
                        )}
                        <span
                          className={`text-xs sm:text-sm truncate transition-all duration-150 ${
                            isDone
                              ? "text-[#8A9197] line-through font-normal"
                              : "text-[#20252A] font-medium group-hover:text-[#08BFD7]"
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ml-2 transition-opacity ${
                          isDone
                            ? "text-[#059669] bg-[#059669]/10"
                            : "text-[#8A9197] opacity-0 group-hover:opacity-100 bg-[#FAFAF8]"
                        }`}
                      >
                        {isDone ? t.common.done : t.common.markDone}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOKUS SAAT INI (ACTIONABLE FOCUS SECTION) */}
        <div className="lg:col-span-5 space-y-2.5">
          <SectionHeader
            title="Fokus Saat Ini"
            icon={Target}
            iconColor="text-[#08BFD7]"
            actionHref="/goals"
            actionLabel={t.home.allGoals}
          />

          <div className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm">
            {!primaryFocus ? (
              <EmptyState
                title="Belum ada fokus hari ini"
                description="Tentukan satu hal utama yang ingin kamu selesaikan untuk menjaga momentum pertumbuhan."
                actionLabel="+ Tentukan Fokus"
                actionHref="/goals"
              />
            ) : (
              <div className="space-y-3">
                <Link
                  href="/goals"
                  className="p-3.5 rounded-xl bg-[rgba(8,191,215,0.03)] border border-[#08BFD7]/30 hover:border-[#08BFD7] transition-all block group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#687078] mb-1">
                    <span className="uppercase tracking-[0.04em] font-medium">TARGET UTAMA</span>
                    <span className="text-[#08BFD7] font-semibold font-mono text-xs">{primaryFocus.percent}%</span>
                  </div>
                  <h3 className="text-xs sm:text-[13px] font-medium text-[#20252A] group-hover:text-[#08BFD7] transition-colors line-clamp-1 mb-2">
                    {primaryFocus.title}
                  </h3>
                  <div className="w-full h-2 rounded-full bg-[#ECEEEA] overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-[#08BFD7] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, primaryFocus.percent))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8A9197] font-normal">
                    <span>{t.common.inProgress}</span>
                    {primaryFocus.deadline && <span>Batas: {primaryFocus.deadline}</span>}
                  </div>
                </Link>

                {/* Additional focus goals if any */}
                {focusGoals.length > 1 && (
                  <div className="pt-2 space-y-1.5 border-t border-[#D9DDD9]">
                    <div className="text-[10px] font-normal text-[#8A9197] uppercase tracking-[0.04em] px-0.5">
                      Target Aktif Lainnya
                    </div>
                    {focusGoals.slice(1, 3).map((g) => (
                      <Link
                        key={g.id}
                        href="/goals"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F5F2] border border-[#D9DDD9] text-xs transition-colors"
                      >
                        <span className="text-[#20252A] font-normal hover:text-[#08BFD7] truncate text-[11px] max-w-[200px]">
                          {g.title}
                        </span>
                        <span className="text-[10px] font-mono font-normal text-[#687078] shrink-0 ml-2">
                          {g.percent}%
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          4. SECONDARY INFORMATION — Learning & Weekly Reflection (2-Column)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Recent Learning */}
        <div>
          <div className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#C8A96B]">
                <BookOpen className="w-4 h-4 text-[#C8A96B] shrink-0" />
                <h2 className="text-[13px] sm:text-[14px] font-semibold tracking-[0.02em] uppercase text-[#20252A]">
                  {t.home.recentLearning}
                </h2>
              </div>
              {recentLearning ? (
                <div>
                  <h3 className="text-xs sm:text-[13px] font-semibold text-[#20252A] mb-1 line-clamp-1">
                    {recentLearning.topic}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#687078] line-clamp-2 leading-[1.6]">
                    {recentLearning.understood}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-[13px] text-[#8A9197] leading-[1.6] py-2">
                  Belum ada catatan pembelajaran terbaru.
                </p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9DDD9] flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#8A9197]">
                {recentLearning?.date || todayFormatted}
              </span>
              <Link
                href="/learning"
                className="text-xs font-medium text-[#08BFD7] hover:underline flex items-center gap-1"
              >
                <span>{t.home.viewLearning}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Weekly Reflection */}
        <div>
          <div className="p-4 sm:p-5 bg-white border border-[#D9DDD9] rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C8A96B] mb-2">
                <Sparkles className="w-4 h-4 text-[#C8A96B] shrink-0" />
                <h2 className="text-[13px] sm:text-[14px] font-semibold tracking-[0.02em] uppercase text-[#20252A]">
                  {t.home.weeklyReflection}
                </h2>
              </div>
              <p className="text-[10px] font-mono text-[#8A9197] mb-1.5">{currentWeekRange}</p>
              <p className="text-xs sm:text-[13px] text-[#687078] leading-[1.6]">
                {t.home.reflectionPending}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#D9DDD9] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8A9197]">{currentWeekRange}</span>
              <Link
                href="/journey/reflections/new"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-[#D9DDD9] hover:border-[#C8A96B] text-xs font-medium text-[#20252A] hover:text-[#C8A96B] transition-all shadow-sm cursor-pointer"
              >
                <span>{t.home.reflectThisWeek}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. PRIVATE VAULT BANNER (BRANKAS PRIVASI) — Full Width
          ═══════════════════════════════════════════════════════════════ */}
      <FadeIn direction="up" duration={0.3}>
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#D9DDD9] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-sm">
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#08BFD7]/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8A96B]/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#F4F5F2] border border-[#D9DDD9] text-[#08BFD7] flex items-center justify-center shadow-sm shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-[15px] font-semibold text-[#20252A] truncate">{t.vault.title}</h3>
                <span
                  className={`text-[9.5px] font-mono font-medium px-2 py-0.5 rounded border shrink-0 ${
                    vaultStats.isUnlocked
                      ? "bg-[#059669]/10 text-[#059669] border-[#059669]/25"
                      : "bg-[#C8A96B]/15 text-[#A88540] border-[#C8A96B]/30"
                  }`}
                >
                  {vaultStats.isUnlocked ? "TERBUKA" : "TERKUNCI"}
                </span>
              </div>
              <p className="text-xs text-[#687078] truncate">
                {t.vault.subtitle} ·{" "}
                <span className="font-mono text-[#8A9197]">
                  {vaultStats.totalFolders} Folder · {vaultStats.totalItems} Berkas
                </span>
              </p>
            </div>
          </div>

          <Link
            href="/vault"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#08BFD7] hover:bg-[#07AEC4] text-white text-xs font-medium shadow-[0_2px_8px_rgba(8,191,215,0.22)] transition-all cursor-pointer shrink-0 group relative z-10 text-center"
          >
            <span>{vaultStats.isUnlocked ? "Buka Folder Privasi" : "Buka Kunci Brankas"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
