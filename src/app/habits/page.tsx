"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  ArrowLeft,
  X,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  getTodayDateString,
  getCurrentWeekDays,
  WeekDayInfo,
  formatFullDate,
} from "@/lib/date";
import { format } from "date-fns";

export interface HabitItem {
  id: string;
  name: string;
  completedDates: string[]; // List of "YYYY-MM-DD"
  createdAt: string;
  evidence: { date: string; title: string; duration: string }[];
}

const INITIAL_HABITS: HabitItem[] = [];

export default function HabitsPage() {
  const { t, locale } = useLanguage();

  // Real-time ticking clock
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [selectedHabit, setSelectedHabit] = useState<HabitItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const todayStr = getTodayDateString(now);
  const currentWeekDays = getCurrentWeekDays(now);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbit_habits");
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized: HabitItem[] = parsed.map((h: any) => ({
          id: h.id,
          name: h.name,
          completedDates: Array.isArray(h.completedDates)
            ? h.completedDates
            : h.completedToday
            ? [getTodayDateString(new Date())]
            : [],
          createdAt: h.createdAt || new Date().toISOString(),
          evidence: Array.isArray(h.evidence) ? h.evidence : [],
        }));
        setHabits(normalized);
      }
    } catch (e) {
      console.error("Failed to load habits from localStorage", e);
    }
  }, []);

  // Save to localStorage
  const saveHabits = (updated: HabitItem[]) => {
    setHabits(updated);
    try {
      localStorage.setItem("orbit_habits", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save habits", e);
    }
  };

  // Day Name Translation
  const getDayLabel = (dayName: string) => {
    if (locale === "de") {
      const deMap: Record<string, string> = {
        Mon: "Mo",
        Tue: "Di",
        Wed: "Mi",
        Thu: "Do",
        Fri: "Fr",
        Sat: "Sa",
        Sun: "So",
      };
      return deMap[dayName] || dayName;
    }
    if (locale === "id") {
      const idMap: Record<string, string> = {
        Mon: "Sen",
        Tue: "Sel",
        Wed: "Rab",
        Thu: "Kam",
        Fri: "Jum",
        Sat: "Sab",
        Sun: "Min",
      };
      return idMap[dayName] || dayName;
    }
    return dayName;
  };

  // Toggle completion for a specific date (realtime)
  // STRICT RULE: If the day is in the past, it CANNOT be filled in!
  const toggleDate = (habitId: string, dateStr: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Prevent filling past days or future days
    if (dateStr < todayStr) {
      // Past day: cannot backfill!
      return;
    }
    if (dateStr > todayStr) {
      // Future day: cannot mark ahead of time!
      return;
    }

    const timeString = format(now, "HH:mm");
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;

      const isCompleted = h.completedDates.includes(dateStr);
      let newDates: string[];
      let newEvidence = [...h.evidence];

      if (isCompleted) {
        // Unmark
        newDates = h.completedDates.filter((d) => d !== dateStr);
        newEvidence = newEvidence.filter((ev) => !ev.date.startsWith(dateStr));
      } else {
        // Mark completed
        newDates = [...h.completedDates, dateStr];
        newEvidence = [
          {
            date: `${dateStr} · ${timeString}`,
            title: `Check-in: ${h.name}`,
            duration: "Realtime",
          },
          ...newEvidence,
        ];
      }

      return {
        ...h,
        completedDates: newDates,
        evidence: newEvidence,
      };
    });

    saveHabits(updated);

    if (selectedHabit && selectedHabit.id === habitId) {
      const updatedSelected = updated.find((h) => h.id === habitId);
      if (updatedSelected) setSelectedHabit(updatedSelected);
    }
  };

  // Create new habit
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newH: HabitItem = {
      id: `h_${Date.now()}`,
      name: newHabitName.trim(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      evidence: [],
    };

    const updated = [newH, ...habits];
    saveHabits(updated);
    setNewHabitName("");
    setIsCreating(false);
  };

  // Delete habit
  const handleDeleteHabit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(t.habits.deleteHabitConfirm)) return;

    const updated = habits.filter((h) => h.id !== id);
    saveHabits(updated);
    setSelectedHabit(null);
  };

  // Calculate weekly completed count
  const getThisWeekCount = (habit: HabitItem) => {
    return currentWeekDays.filter((d) => habit.completedDates.includes(d.dateStr)).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real-Time Live Clock Header Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-surface/60 border border-border-subtle text-xs text-dim">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-sub font-medium">HARI INI:</span>
          <span className="font-mono text-main font-semibold" suppressHydrationWarning>
            {mounted ? format(now, "EEEE, d MMM yyyy · HH:mm:ss") : "--:--:--"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-accent font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Habit Tracker</span>
        </div>
      </div>

      {selectedHabit ? (
        /* DETAIL VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedHabit(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.habits.backToHabits}</span>
          </button>

          {/* Habit Header */}
          <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-main">{selectedHabit.name}</h1>
                <p className="text-xs text-dim mt-1">
                  Ritme Harian · {t.habits.thisWeek}:{" "}
                  <span className="font-mono text-accent font-semibold">
                    {getThisWeekCount(selectedHabit)} / 7 {t.goals.days}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleDate(selectedHabit.id, todayStr)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedHabit.completedDates.includes(todayStr)
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-accent text-white hover:opacity-90 active:scale-95 shadow-xs"
                  }`}
                >
                  {selectedHabit.completedDates.includes(todayStr) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.habits.completedToday}</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>{t.common.markDone} ({t.habits.today})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteHabit(selectedHabit.id)}
                  title={t.habits.deleteHabit}
                  className="p-1.5 rounded-md text-dim hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive 7 Days Weekly Rhythm in Detail */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                  {t.habits.rhythm}
                </h2>
                <div className="flex items-center gap-3 text-[11px] text-dim">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Selesai
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400/60" />
                    {t.habits.missedDay} (Terkunci)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {t.habits.today} (Aktif)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {currentWeekDays.map((d) => {
                  const isDone = selectedHabit.completedDates.includes(d.dateStr);
                  const isPast = d.dateStr < todayStr;
                  const isFuture = d.dateStr > todayStr;
                  const isToday = d.dateStr === todayStr;

                  const canClick = isToday;

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={!canClick}
                      onClick={() => canClick && toggleDate(selectedHabit.id, d.dateStr)}
                      title={
                        isDone
                          ? "Selesai"
                          : isPast
                          ? `${t.habits.cannotBackfill} (${d.dateStr})`
                          : isFuture
                          ? "Hari belum tiba"
                          : "Klik untuk menandai hari ini selesai"
                      }
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-xs"
                          : isToday
                          ? "bg-surface-elevated border-accent ring-1 ring-accent/40 text-main cursor-pointer hover:border-accent"
                          : isPast
                          ? "bg-canvas/40 border-dashed border-border-subtle/50 text-dim/50 cursor-not-allowed opacity-50"
                          : "bg-canvas/20 border-dashed border-border-subtle/30 text-dim/30 cursor-not-allowed opacity-30"
                      }`}
                    >
                      <span className="text-[11px] font-medium block">
                        {getDayLabel(d.dayName)}
                      </span>
                      <span className="text-xs font-mono font-semibold block">
                        {d.dayNum}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-xs"
                            : isToday
                            ? "bg-surface border border-accent text-accent animate-pulse"
                            : isPast
                            ? "bg-canvas text-rose-400/60 text-[10px]"
                            : "bg-canvas text-dim/30"
                        }`}
                      >
                        {isDone ? "✓" : isPast ? "✕" : "○"}
                      </div>

                      <span className="text-[9px] font-medium tracking-tight mt-0.5 block truncate max-w-full">
                        {isDone ? (
                          <span className="text-emerald-400">Selesai</span>
                        ) : isToday ? (
                          <span className="text-accent font-semibold">Hari ini</span>
                        ) : isPast ? (
                          <span className="text-rose-400/70">{t.habits.missedDay}</span>
                        ) : (
                          <span className="text-dim/50">{t.habits.futureDay}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Evidence from Activities */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
              {t.habits.evidence}
            </h2>
            {selectedHabit.evidence.length > 0 ? (
              <div className="space-y-2">
                {selectedHabit.evidence.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-border-subtle"
                  >
                    <div>
                      <div className="text-xs font-medium text-main">{ev.title}</div>
                      <div className="text-[11px] font-mono text-dim mt-0.5">{ev.date}</div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ✓ Selesai
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dim">{t.habits.noEvidence}</p>
            )}
          </div>
        </div>
      ) : (
        /* MAIN HABITS LIST */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-main">{t.habits.title}</h1>
              <p className="text-xs text-dim mt-0.5">{t.habits.subtitle}</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.habits.createHabit}</span>
            </button>
          </div>

          {/* Habit List */}
          <div className="space-y-3">
            {habits.length > 0 && (
              <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-dim">
                <span>{t.habits.today}</span>
                <span className="text-[11px] font-normal normal-case text-dim">
                  Hanya hari ini yang dapat diisi · Hari terlewat otomatis terkunci
                </span>
              </div>
            )}

            {habits.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
                <p className="text-xs text-dim mb-3">{t.habits.noHabits}</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.habits.createHabit}</span>
                </button>
              </div>
            ) : (
              habits.map((habit) => {
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const thisWeekCount = getThisWeekCount(habit);

                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit)}
                    className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group space-y-4"
                  >
                    {/* Top Row: Name, Ratio, and Today's Toggle Button */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-main group-hover:text-accent transition-colors">
                          {habit.name}
                        </h3>
                        <div className="text-xs font-mono text-dim mt-0.5">
                          {t.habits.thisWeek}:{" "}
                          <span className="text-accent font-medium">
                            {thisWeekCount} / 7
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleDate(habit.id, todayStr, e)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isCompletedToday
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs"
                            : "bg-surface-elevated text-sub hover:text-main border border-line hover:border-accent/40"
                        }`}
                      >
                        {isCompletedToday ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.common.completed}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>{t.common.markDone}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* REAL-TIME WEEKLY RHYTHM BAR: Locked for past & future, active for today */}
                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-1 sm:gap-2">
                      {currentWeekDays.map((d) => {
                        const isDone = habit.completedDates.includes(d.dateStr);
                        const isPast = d.dateStr < todayStr;
                        const isFuture = d.dateStr > todayStr;
                        const isToday = d.dateStr === todayStr;

                        const canClick = isToday;

                        return (
                          <div
                            key={d.dateStr}
                            onClick={(e) => {
                              if (canClick) {
                                toggleDate(habit.id, d.dateStr, e);
                              } else {
                                e.stopPropagation();
                              }
                            }}
                            title={
                              isDone
                                ? `${getDayLabel(d.dayName)}: Selesai`
                                : isPast
                                ? `${getDayLabel(d.dayName)}: ${t.habits.missedDay} (${t.habits.cannotBackfill})`
                                : isFuture
                                ? `${getDayLabel(d.dayName)}: ${t.habits.futureDay}`
                                : `${getDayLabel(d.dayName)}: Hari ini (Klik untuk menyelesaikan)`
                            }
                            className={`flex-1 py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                              isDone
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold shadow-xs"
                                : isToday
                                ? "bg-surface-elevated border-accent ring-1 ring-accent/30 text-accent font-medium cursor-pointer hover:scale-105"
                                : isPast
                                ? "bg-canvas/40 border-dashed border-border-subtle/50 text-dim/40 cursor-not-allowed opacity-50"
                                : "bg-canvas/20 border-dashed border-border-subtle/30 text-dim/30 cursor-not-allowed opacity-30"
                            }`}
                          >
                            <span className="text-[10px] font-medium block leading-none">
                              {getDayLabel(d.dayName)}
                            </span>

                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : isToday
                                  ? "text-accent border border-accent/40"
                                  : isPast
                                  ? "text-rose-400/60"
                                  : "text-dim/30"
                              }`}
                            >
                              {isDone ? "✓" : isPast ? "✕" : "○"}
                            </div>

                            <span className="text-[9px] font-mono opacity-70 block leading-none">
                              {d.dayNum}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* CREATE HABIT MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">{t.habits.createHabit}</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.habits.habitName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Olahraga Pagi, Membaca Buku, Coding"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {t.habits.saveHabit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
