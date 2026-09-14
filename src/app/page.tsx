"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { useProfile } from "@/lib/profile";
import { getVaultStats } from "@/lib/vault";
import { getStoredFinanceBalances, ORBIT_DATA_CHANGED_EVENT, notifyDataChanged } from "@/lib/storage";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import type { JourneyManagerHandle, JourneyPhase } from "@/components/3d/JourneyManager";

// Dynamically import 3D Scene to keep SSR fast and bundle isolated
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

function useCountUp(target: number, duration: number = 750): number {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * easeProgress));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return current;
}

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { profile } = useProfile();

  // Journey state management
  const journeyRef = useRef<JourneyManagerHandle>(null);
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("IDLE");
  const [bhHovered, setBhHovered] = useState(false);

  const handlePhaseChange = useCallback((phase: JourneyPhase) => {
    setJourneyPhase(phase);
  }, []);

  const handleHoverChange = useCallback((hovered: boolean) => {
    setBhHovered(hovered);
  }, []);

  const isJourneyActive = journeyPhase !== "IDLE";
  const isOrbitReached = journeyPhase === "EARTH_ORBIT";

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

  // Animated stat values for living OS feel
  const animatedHabitRate = useCountUp(habitCompletionRate);
  const animatedCompleted = useCountUp(completedTodayCount);
  const animatedGoals = useCountUp(focusGoals.length);
  const animatedBalance = useCountUp(actualBalance);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-4 sm:pb-8">
      {/* ═══════════════════════════════════════════════════════════════
          1. BLACK HOLE HERO — Proportional, Cinematic & Balanced
          - 3D Black hole & Space Shuttle rocket on the RIGHT
          - LEFT: Darker area for identity & telemetry
          - Click & Hover on Black hole launches cinematic journey
          ═══════════════════════════════════════════════════════════════ */}
      <FadeIn direction="up" duration={0.35}>
        <div className="hero-frame">
          <div className="relative overflow-hidden min-h-[270px] sm:min-h-[295px] md:min-h-[340px] lg:min-h-[380px]">
            {/* 3D Background — full-bleed interactive canvas */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
              <DashboardScene
                onPhaseChange={handlePhaseChange}
                onHoverChange={handleHoverChange}
                journeyRef={journeyRef}
              />
            </div>

            {/* Seamless cinematic overlay:
                left: deep charcoal overlay keeping text 100% crisp and readable
                right: transparent so the glowing accretion disk shines unobstructed */}
            <div
              className={`absolute inset-0 z-[1] pointer-events-none transition-opacity duration-700 ${isJourneyActive ? 'opacity-20' : 'opacity-100'}`}
              style={{
                background:
                  "linear-gradient(to right, rgba(2,4,8,0.96) 0%, rgba(5,10,16,0.90) 40%, rgba(8,19,28,0.50) 65%, rgba(8,19,28,0.08) 82%, transparent 100%)",
              }}
            />

            {/* Subtle bottom vignette */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(2,4,8,0.85) 0%, transparent 30%)",
              }}
            />

            {/* Subtle top vignette */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(2,4,8,0.4) 0%, transparent 15%)",
              }}
            />

            {/* Interactive Black Hole & Rocket Click Trigger Zone (Right 55% of Hero Card) */}
            {!isJourneyActive && (
              <div
                onClick={() => journeyRef.current?.startJourney()}
                onMouseEnter={() => handleHoverChange(true)}
                onMouseLeave={() => handleHoverChange(false)}
                className="absolute right-0 top-0 bottom-0 w-[55%] z-[6] cursor-pointer flex items-center justify-end pr-8 sm:pr-12 md:pr-16 group select-none"
                aria-label="Click to Enter Orbit"
                title="Klik Black Hole untuk meluncurkan perjalanan ke Bumi"
              >
                {/* Floating "ENTER ORBIT" HUD Badge */}
                <div
                  className={`transition-all duration-300 transform ${
                    bhHovered
                      ? "opacity-100 scale-100 translate-x-0"
                      : "opacity-0 scale-95 translate-x-3 pointer-events-none"
                  } px-3.5 py-1.5 rounded-lg bg-[#070A0D]/85 border border-[#00D9FF]/40 backdrop-blur-md shadow-[0_0_24px_rgba(0,217,255,0.25)] flex items-center gap-2`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-ping" />
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[#00D9FF] font-semibold uppercase">
                    Enter Orbit
                  </span>
                  <span className="text-[10px] text-[#00D9FF]">→</span>
                </div>
              </div>
            )}

            {/* Cybernetic Target Reticle HUD on Earth */}
            {(journeyPhase === "TARGET_EARTH" || journeyPhase === "APPROACH_EARTH") && (
              <div className="absolute top-1/2 right-[20%] -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center animate-fade-in">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-[#00D9FF]/40 animate-[spin_12s_linear_infinite] flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full border border-dashed border-[#00D9FF]/60 animate-[spin_8s_linear_infinite_reverse]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] shadow-[0_0_12px_#00D9FF]" />
                  {/* Crosshair markers */}
                  <div className="absolute top-0 w-0.5 h-3 bg-[#00D9FF]" />
                  <div className="absolute bottom-0 w-0.5 h-3 bg-[#00D9FF]" />
                  <div className="absolute left-0 w-3 h-0.5 bg-[#00D9FF]" />
                  <div className="absolute right-0 w-3 h-0.5 bg-[#00D9FF]" />
                </div>
                <div className="mt-3 text-center font-mono">
                  <div className="text-[11px] font-bold text-[#00D9FF] tracking-widest uppercase flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-ping" />
                    TARGET: EARTH
                  </div>
                  <div className="text-[9px] text-[#A7A29A] mt-0.5">
                    {journeyPhase === "TARGET_EARTH" ? "DISTANCE: 42,164 KM • LOCK ACQUIRED" : "DISTANCE: 1,420 KM • ORBIT INCLINATION 23.5°"}
                  </div>
                </div>
              </div>
            )}

            {/* EARTH ORBIT REACHED — Sleek Non-intrusive Cinematic HUD (Leaves Earth & Rocket fully visible) */}
            {isOrbitReached && (
              <div className="absolute bottom-5 left-6 sm:left-8 z-20 animate-fade-in pointer-events-auto">
                <div className="px-5 py-3.5 rounded-xl bg-[#070A0D]/90 border border-[#00D9FF]/35 shadow-[0_4px_30px_rgba(0,0,0,0.85),0_0_25px_rgba(0,217,255,0.15)] backdrop-blur-md max-w-sm">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[9px] font-mono tracking-[0.2em] text-[#00D9FF] uppercase mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-ping" />
                    Earth Orbit Reached
                  </div>
                  <p className="text-xs text-[#E8E1D3] font-medium tracking-tight">
                    Journey complete.
                  </p>
                  <p className="text-[10px] text-[#8A8580] mt-0.5 font-mono">
                    Space Shuttle stationed in stable Earth orbit.
                  </p>
                  <div className="flex items-center gap-2.5 pt-3">
                    <button
                      onClick={() => journeyRef.current?.replayJourney()}
                      className="journey-btn"
                    >
                      Replay Journey
                    </button>
                    <button
                      onClick={() => journeyRef.current?.returnToOrbit()}
                      className="journey-btn journey-btn-secondary"
                    >
                      Return to ORBIT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Journey phase indicator */}
            {isJourneyActive && !isOrbitReached && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="journey-phase-indicator flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-ping" />
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#00D9FF]/80 uppercase">
                    {journeyPhase === 'LAUNCH' ? 'Launching Space Shuttle...' :
                     journeyPhase === 'APPROACH_BLACK_HOLE' ? 'Gravitational Slingshot Approach...' :
                     journeyPhase === 'ENTER_EVENT_HORIZON' ? 'Crossing Event Horizon Singularity...' :
                     journeyPhase === 'WORMHOLE' ? 'Wormhole Transit — Dimensional Warp...' :
                     journeyPhase === 'SOLAR_SYSTEM' ? 'Entering Solar System...' :
                     journeyPhase === 'SOLAR_ORBIT' ? 'Solar System Panoramic Orbital Flyby...' :
                     journeyPhase === 'TARGET_EARTH' ? 'Targeting Earth...' :
                     journeyPhase === 'APPROACH_EARTH' ? 'Approaching Earth Atmosphere...' :
                     journeyPhase === 'RETURN' ? 'Returning to ORBIT...' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Content overlay — left-aligned, pointer-events only on inner text */}
            <div
              className={`relative z-10 p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col justify-center min-h-[270px] sm:min-h-[295px] md:min-h-[340px] lg:min-h-[380px] pointer-events-none transition-opacity duration-500 ${isJourneyActive ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="max-w-md space-y-2.5 sm:space-y-3 pointer-events-auto">
                {/* 1. System Telemetry (Clock + Online) */}
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-[#11161B]/90 border border-[#252B30] text-[10px] sm:text-[11px] font-mono shadow-sm backdrop-blur-md w-fit">
                  <Clock className="w-3 h-3 text-[#20C8E8]" />
                  <span className="text-[#A7A29A]">{currentTime || "00:00:00"}</span>
                  <span className="w-px h-2.5 bg-[#252B30]" />
                  <div className="flex items-center gap-1 text-[10px] text-[#00A982]">
                    <span className="font-semibold tracking-wider">ONLINE</span>
                  </div>
                </div>

                {/* 2 & 3. Secondary Greeting & Dominant User Name */}
                <div>
                  <p className="text-[11px] sm:text-xs text-[#8A8580] font-medium tracking-wide mb-0.5">
                    {greetingText},
                  </p>
                  <h1
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight"
                    style={{
                      background: "linear-gradient(135deg, #F5F1E9 0%, #E8E1D3 60%, #C5A56A 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {profile.name || "Fatih Ahmad Zakky"}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6762] font-mono mt-0.5">
                    <span suppressHydrationWarning>{todayFormatted}</span>
                  </p>
                </div>

                {/* 4. Unified Hero Metric Chips (Responsive grid for mobile) */}
                <div className="pt-0.5 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Kebiasaan */}
                  <div className="flex items-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-md bg-[#11161B]/90 border border-[#252B30] text-[11px] sm:text-xs backdrop-blur-md shadow-sm min-w-0">
                    <Activity className="w-3 h-3 text-[#00A982] shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A8580] truncate">
                      {t.nav.habits}:
                    </span>
                    <span className="font-mono font-semibold text-[#E8E1D3] text-[11px] sm:text-xs truncate">
                      {animatedCompleted}/{habits.length}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="flex items-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-md bg-[#11161B]/90 border border-[#252B30] text-[11px] sm:text-xs backdrop-blur-md shadow-sm min-w-0">
                    <Target className="w-3 h-3 text-[#20C8E8] shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A8580] truncate">
                      {t.nav.goals}:
                    </span>
                    <span className="font-mono font-semibold text-[#E8E1D3] text-[11px] sm:text-xs truncate">
                      {animatedGoals} {t.common.active}
                    </span>
                  </div>

                  {/* Keuangan */}
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-md bg-[#11161B]/90 border border-[#252B30] text-[11px] sm:text-xs backdrop-blur-md shadow-sm min-w-0">
                    <Wallet className="w-3 h-3 text-[#C5A56A] shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A8580] truncate">
                      {t.nav.finance}:
                    </span>
                    <span className="font-mono font-semibold text-[#E8E1D3] text-[11px] sm:text-xs truncate">
                      {formatCurrency(animatedBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════════════
          2. SUMMARY CARDS ROW — Consistent 4-Card Dashboard System
          - Uniform height (126px mobile / 132px desktop) and layout: TOP -> MIDDLE -> BOTTOM
          - Distinct contextual micro-visualizations
          - Animated numerical metrics (0 -> actual value)
          ═══════════════════════════════════════════════════════════════ */}
      <StaggerContainer staggerDelay={0.04} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
        {/* Metric 1: HARI INI */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-3 sm:p-4 glass-card card-accent-cyan h-[126px] sm:h-[132px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A8580]">
              <span className="text-[10px] font-mono uppercase tracking-wider">{t.home.today}</span>
              <Activity className="w-4 h-4 text-[#00A982] shrink-0" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#E8E1D3] tracking-tight leading-none">
                {animatedHabitRate}%
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 rounded-full bg-[#0A0E12] overflow-hidden border border-[#1E2226]/60">
                <div
                  className="h-full bg-[#00A982] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${animatedHabitRate}%` }}
                />
              </div>
              <div className="text-[10px] text-[#6B6762] mt-1.5 flex justify-between font-mono">
                <span>{animatedCompleted} selesai</span>
                <span>{pendingHabitCount} tersisa</span>
              </div>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 2: TARGET */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-3 sm:p-4 glass-card h-[126px] sm:h-[132px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A8580]">
              <span className="text-[10px] font-mono uppercase tracking-wider">{t.nav.goals}</span>
              <Target className="w-4 h-4 text-[#20C8E8] shrink-0" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#E8E1D3] tracking-tight leading-none">
                {animatedGoals}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8A8580] truncate leading-none">
                {focusGoals.length > 0 ? focusGoals[0].title : "Belum ada target aktif"}
              </div>
              <Link
                href="/goals"
                className="text-[10px] font-mono text-[#20C8E8] hover:underline mt-1.5 inline-flex items-center gap-1"
              >
                <span>{t.home.allGoals}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 3: PEMBELAJARAN */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-3 sm:p-4 glass-card h-[126px] sm:h-[132px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A8580]">
              <span className="text-[10px] font-mono uppercase tracking-wider">{t.nav.learning}</span>
              <BookOpen className="w-4 h-4 text-[#9B8060] shrink-0" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#E8E1D3] line-clamp-2 leading-snug">
                {recentLearning ? recentLearning.topic : "Belum ada catatan pembelajaran"}
              </div>
            </div>
            <div className="pt-0.5">
              <Link
                href="/learning"
                className="text-[10px] font-mono text-[#20C8E8] hover:underline inline-flex items-center gap-1"
              >
                <span>{t.home.viewLearning}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>

        {/* Metric 4: KEUANGAN */}
        <StaggerItem>
          <AnimatedCard interactive={true} className="p-3 sm:p-4 glass-card card-accent-gold h-[126px] sm:h-[132px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A8580]">
              <span className="text-[10px] font-mono uppercase tracking-wider">{t.nav.finance}</span>
              <Wallet className="w-4 h-4 text-[#C5A56A] shrink-0" />
            </div>
            <div>
              <div className="text-base sm:text-lg md:text-xl font-bold font-mono text-[#E8E1D3] tracking-tight truncate leading-none">
                {formatCurrency(animatedBalance)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#6B6762] font-mono truncate">
                Tercatat: <span className="text-[#8A8580]">{formatCurrency(calculatedBalance)}</span>
              </div>
              <Link
                href="/finance"
                className="text-[10px] font-mono text-[#20C8E8] hover:underline mt-1.5 inline-flex items-center gap-1"
              >
                <span>{t.home.viewFinance}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* ═══════════════════════════════════════════════════════════════
          3. ACTIONABLE CONTENT — FOKUS SAAT INI & TODAY'S HABITS
          - Answers "What should I do next?" immediately
          - High information density with helpful empty states
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5">
        {/* TODAY'S HABITS (HARI INI) */}
        <div className="lg:col-span-7 space-y-2">
          <SectionHeader
            title={t.home.today}
            icon={Activity}
            iconColor="text-[#00A982]"
            countBadge={habits.length > 0 ? `${completedTodayCount}/${habits.length}` : undefined}
          />

          <div className="p-3.5 sm:p-4 glass-card rounded-[14px]">
            {habits.length === 0 ? (
              <EmptyState
                title="Belum ada aktivitas tercatat"
                description="Tambahkan catatan atau kebiasaan pertamamu hari ini untuk melacak progres hidupmu."
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
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150 text-left cursor-pointer group ${
                        isDone
                          ? "bg-[#070A0D]/50 border-[#1E2226] text-[#6B6762]"
                          : "bg-[#14191F] border-[#252B30] hover:border-[#20C8E8]/35 hover:bg-[#171E25]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00A982] shrink-0 transition-transform duration-150 group-hover:scale-105" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#6B6762] group-hover:text-[#20C8E8] shrink-0 transition-colors" />
                        )}
                        <span
                          className={`text-xs sm:text-sm truncate transition-all duration-150 ${
                            isDone
                              ? "text-[#6B6762] line-through"
                              : "text-[#E8E1D3] font-medium group-hover:text-white"
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ml-2 transition-opacity ${
                          isDone
                            ? "text-[#00A982]/80 bg-[#00A982]/10"
                            : "text-[#8A8580] opacity-0 group-hover:opacity-100 bg-[#1A2025]"
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
        <div className="lg:col-span-5 space-y-2">
          <SectionHeader
            title="Fokus Saat Ini"
            icon={Target}
            iconColor="text-[#20C8E8]"
            actionHref="/goals"
            actionLabel={t.home.allGoals}
          />

          <div className="p-3.5 sm:p-4 glass-card rounded-[14px]">
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
                  className="p-3 rounded-lg bg-[#070A0D]/70 border border-[#252B30] hover:border-[#20C8E8]/35 transition-all duration-150 block group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8580] mb-1">
                    <span className="uppercase tracking-wider">TARGET UTAMA</span>
                    <span className="text-[#20C8E8] font-semibold">{primaryFocus.percent}%</span>
                  </div>
                  <h3 className="text-xs font-semibold text-[#E8E1D3] group-hover:text-[#20C8E8] transition-colors line-clamp-1 mb-2">
                    {primaryFocus.title}
                  </h3>
                  <div className="w-full h-1.5 rounded-full bg-[#151A1F] overflow-hidden mb-2 border border-[#1E2226]/40">
                    <div
                      className="h-full bg-gradient-to-r from-[#087F96] to-[#20C8E8] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, primaryFocus.percent))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6B6762] font-mono">
                    <span>{t.common.inProgress}</span>
                    {primaryFocus.deadline && <span>Batas: {primaryFocus.deadline}</span>}
                  </div>
                </Link>

                {/* Additional focus goals if any */}
                {focusGoals.length > 1 && (
                  <div className="pt-1 space-y-1.5 border-t border-[#1E2226]">
                    <div className="text-[10px] font-mono text-[#8A8580] uppercase tracking-wider px-0.5">
                      Target Aktif Lainnya
                    </div>
                    {focusGoals.slice(1, 3).map((g) => (
                      <Link
                        key={g.id}
                        href="/goals"
                        className="flex items-center justify-between p-2 rounded-md bg-[#0C1014] hover:bg-[#14191F] border border-[#1E2226] text-xs transition-colors"
                      >
                        <span className="text-[#A7A29A] hover:text-[#E8E1D3] truncate text-[11px] max-w-[200px]">
                          {g.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B6762] shrink-0 ml-2">
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
          4. SECONDARY INFORMATION — Learning & Weekly Reflection
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5">
        {/* Recent Learning */}
        <div className="md:col-span-6">
          <div className="p-3.5 sm:p-4 glass-card rounded-[14px] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-[#8A8580]">
                <BookOpen className="w-3.5 h-3.5 text-[#9B8060] shrink-0" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A8580]">
                  {t.home.recentLearning}
                </h2>
              </div>
              {recentLearning ? (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#E8E1D3] mb-1 line-clamp-1">
                    {recentLearning.topic}
                  </h3>
                  <p className="text-xs text-[#A7A29A] line-clamp-2 leading-relaxed">
                    {recentLearning.understood}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#6B6762] leading-relaxed py-2">
                  Belum ada catatan pembelajaran terbaru.
                </p>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E2226] flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#6B6762]">
                {recentLearning?.date || todayFormatted}
              </span>
              <Link
                href="/learning"
                className="text-xs font-mono text-[#20C8E8] hover:underline flex items-center gap-1"
              >
                <span>{t.home.viewLearning}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Weekly Reflection */}
        <div className="md:col-span-6">
          <div className="p-3.5 sm:p-4 glass-card rounded-[14px] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C5A56A] mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A56A] shrink-0" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A8580]">
                  {t.home.weeklyReflection}
                </h2>
              </div>
              <p className="text-[10px] font-mono text-[#6B6762] mb-1">{currentWeekRange}</p>
              <p className="text-xs text-[#A7A29A] leading-relaxed">
                {t.home.reflectionPending}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1E2226] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#6B6762]">{currentWeekRange}</span>
              <Link
                href="/journey/reflections/new"
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#151A1F] border border-[#252B30] hover:border-[#C5A56A]/40 text-xs font-medium text-[#E8E1D3] hover:text-[#C5A56A] transition-all duration-150 cursor-pointer shadow-sm"
              >
                <span>{t.home.reflectThisWeek}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. PRIVATE VAULT BANNER (BRANKAS PRIVASI)
          ═══════════════════════════════════════════════════════════════ */}
      <FadeIn direction="up" duration={0.3}>
        <div className="p-3.5 sm:p-5 rounded-[18px] bg-gradient-to-r from-[#11161B] to-[#14191F] border border-[#252B30] backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#20C8E8]/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C5A56A]/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-lg bg-[#151A1F] border border-[#252B30] text-[#20C8E8] flex items-center justify-center shadow-sm shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs sm:text-sm font-semibold text-[#E8E1D3] truncate">{t.vault.title}</h3>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    vaultStats.isUnlocked
                      ? "bg-[#00A982]/12 text-[#00A982] border-[#00A982]/25"
                      : "bg-[#D6A84F]/12 text-[#D6A84F] border-[#D6A84F]/25"
                  }`}
                >
                  {vaultStats.isUnlocked ? "TERBUKA" : "TERKUNCI"}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8580] truncate">
                {t.vault.subtitle} ·{" "}
                <span className="font-mono text-[#6B6762]">
                  {vaultStats.totalFolders} Folder · {vaultStats.totalItems} Berkas
                </span>
              </p>
            </div>
          </div>

          <Link
            href="/vault"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#151A1F] hover:bg-[#1A2025] border border-[#20C8E8]/30 hover:border-[#20C8E8] text-xs font-medium text-[#20C8E8] hover:text-[#E8E1D3] transition-all shadow-sm cursor-pointer shrink-0 group relative z-10 text-center"
          >
            <span>{vaultStats.isUnlocked ? "Buka Folder Privasi" : "Buka Kunci Brankas"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
