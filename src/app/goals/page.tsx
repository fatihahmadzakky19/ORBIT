"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  X,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  getTodayDateString,
  getEndOfWeekDateString,
  getEndOfMonthDateString,
  getEndOfYearDateString,
  getPreciseCountdown,
  addDaysDateString,
  addWeeksDateString,
  addMonthsDateString,
  formatShortDate,
  formatFullDate,
} from "@/lib/date";
import { format } from "date-fns";

export type GoalTimeframe = "DAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  type: "MEASURABLE" | "MILESTONE" | "HYBRID";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "CANCELLED";
  timeframe?: GoalTimeframe;
  progressMode?: "NUMERIC" | "FINANCE";
  currentValue?: number;
  targetValue?: number;
  percent: number;
  deadline?: string;
  milestones?: { title: string; completed: boolean }[];
  relatedCounts?: { activities: number; learning: number; habits: number; reflections: number };
}

const INITIAL_GOALS: GoalItem[] = [];

export default function GoalsPage() {
  const { t } = useLanguage();

  // Real-time ticking clock (updates every second)
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED">("ACTIVE");
  const [timeframeFilter, setTimeframeFilter] = useState<"ALL" | GoalTimeframe>("ALL");
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"MEASURABLE" | "MILESTONE" | "HYBRID">("MILESTONE");
  const [newTimeframe, setNewTimeframe] = useState<GoalTimeframe>("MONTH");
  const [newDeadline, setNewDeadline] = useState(getEndOfMonthDateString());

  // Editing deadline state inside detail view
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [editDeadlineValue, setEditDeadlineValue] = useState("");

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbit_goals");
      if (saved) {
        setGoals(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load goals from localStorage", e);
    }
  }, []);

  // Save goals to localStorage
  const saveGoals = (updated: GoalItem[]) => {
    setGoals(updated);
    try {
      localStorage.setItem("orbit_goals", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save goals", e);
    }
  };

  // Helper to change timeframe preset in real-time
  const handleSelectTimeframe = (tf: GoalTimeframe) => {
    setNewTimeframe(tf);
    switch (tf) {
      case "DAY":
        setNewDeadline(getTodayDateString(now));
        break;
      case "WEEK":
        setNewDeadline(getEndOfWeekDateString(now));
        break;
      case "MONTH":
        setNewDeadline(getEndOfMonthDateString(now));
        break;
      case "YEAR":
        setNewDeadline(getEndOfYearDateString(now));
        break;
      case "CUSTOM":
      default:
        break;
    }
  };

  // Quick adjust deadline helpers for modal
  const handleAdjustDeadlineDays = (days: number) => {
    setNewDeadline((prev) => addDaysDateString(prev || getTodayDateString(now), days));
    setNewTimeframe("CUSTOM");
  };

  const handleAdjustDeadlineWeeks = (weeks: number) => {
    setNewDeadline((prev) => addWeeksDateString(prev || getTodayDateString(now), weeks));
    setNewTimeframe("CUSTOM");
  };

  const handleAdjustDeadlineMonths = (months: number) => {
    setNewDeadline((prev) => addMonthsDateString(prev || getTodayDateString(now), months));
    setNewTimeframe("CUSTOM");
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    const matchesStatus =
      statusFilter === "ACTIVE"
        ? g.status === "IN_PROGRESS" || g.status === "NOT_STARTED"
        : g.status === statusFilter;

    const matchesTimeframe =
      timeframeFilter === "ALL" ? true : g.timeframe === timeframeFilter;

    return matchesStatus && matchesTimeframe;
  });

  const activeCount = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED").length;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;
  const pausedCount = goals.filter((g) => g.status === "PAUSED").length;
  const cancelledCount = goals.filter((g) => g.status === "CANCELLED").length;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
      case "NOT_STARTED":
        return t.common.inProgress;
      case "COMPLETED":
        return t.common.completed;
      case "PAUSED":
        return t.common.paused;
      case "CANCELLED":
        return t.common.cancelled;
      default:
        return status;
    }
  };

  const getTimeframeLabel = (tf?: GoalTimeframe) => {
    switch (tf) {
      case "DAY":
        return t.goals.timeframeDay;
      case "WEEK":
        return t.goals.timeframeWeek;
      case "MONTH":
        return t.goals.timeframeMonth;
      case "YEAR":
        return t.goals.timeframeYear;
      case "CUSTOM":
        return t.goals.timeframeCustom;
      default:
        return null;
    }
  };

  // High-precision live countdown display
  const renderLiveCountdown = (deadline?: string, compact: boolean = false) => {
    if (!deadline) return null;
    const { isOverdue, days, hours, minutes, seconds } = getPreciseCountdown(deadline, now);

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {t.goals.overdue.replace("{count}", String(days))} ({hours}h {minutes}m {seconds}s)
          </span>
        </span>
      );
    }

    if (days === 0 && hours === 0 && minutes === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse font-medium">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{seconds}s tersisa!</span>
        </span>
      );
    }

    if (compact) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-sub border border-border-subtle font-medium">
          <Clock className="w-3 h-3 text-accent shrink-0" />
          <span>
            {days > 0 ? `${days}d ` : ""}
            {hours}h {minutes}m {seconds}s
          </span>
        </span>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
        <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
        <span>
          {days > 0 ? `${days} ${t.goals.days} ` : ""}
          {hours} {t.goals.hours} {minutes} {t.goals.minutes} {seconds} {t.goals.seconds}
        </span>
      </div>
    );
  };

  const handleOpenCreateModal = () => {
    setNewTitle("");
    setNewDesc("");
    setNewType("MILESTONE");
    setNewTimeframe("MONTH");
    setNewDeadline(getEndOfMonthDateString(now));
    setIsCreating(true);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: GoalItem = {
      id: `g_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      type: newType,
      status: "IN_PROGRESS",
      timeframe: newTimeframe,
      percent: 0,
      deadline: newDeadline,
      milestones:
        newType !== "MEASURABLE"
          ? [
              { title: "Kickoff & Planning", completed: false },
              { title: "Core Milestone", completed: false },
            ]
          : undefined,
      relatedCounts: { activities: 0, learning: 0, habits: 0, reflections: 0 },
    };

    const updated = [newGoal, ...goals];
    saveGoals(updated);

    setIsCreating(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (!window.confirm(t.goals.deleteGoalConfirm)) return;
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    setSelectedGoal(null);
  };

  const handleSaveEditedDeadline = (newDate: string) => {
    if (!selectedGoal || !newDate) return;
    const updated = goals.map((g) =>
      g.id === selectedGoal.id ? { ...g, deadline: newDate } : g
    );
    saveGoals(updated);
    setSelectedGoal({ ...selectedGoal, deadline: newDate });
    setIsEditingDeadline(false);
  };

  const handleToggleMilestone = (milestoneIndex: number) => {
    if (!selectedGoal || !selectedGoal.milestones) return;
    const newMilestones = selectedGoal.milestones.map((m, idx) =>
      idx === milestoneIndex ? { ...m, completed: !m.completed } : m
    );

    const completedCount = newMilestones.filter((m) => m.completed).length;
    const newPercent = Math.round((completedCount / newMilestones.length) * 100);

    const updatedGoal: GoalItem = {
      ...selectedGoal,
      milestones: newMilestones,
      percent: newPercent,
      status: newPercent === 100 ? "COMPLETED" : "IN_PROGRESS",
    };

    const updated = goals.map((g) => (g.id === selectedGoal.id ? updatedGoal : g));
    saveGoals(updated);
    setSelectedGoal(updatedGoal);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real-Time Live Clock Header Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-surface/60 border border-border-subtle text-xs text-dim">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-sub font-medium">LIVE TIME:</span>
          <span className="font-mono text-main">{format(now, "EEEE, d MMM yyyy · HH:mm:ss")}</span>
        </div>
        <span className="text-[11px] text-dim hidden sm:inline">ORBIT Real-time Engine</span>
      </div>

      {/* Detail View Section */}
      {selectedGoal ? (
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedGoal(null);
              setIsEditingDeadline(false);
            }}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.goals.backToGoals}</span>
          </button>

          {/* Goal Header */}
          <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-main">{selectedGoal.title}</h1>
                  {selectedGoal.timeframe && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {getTimeframeLabel(selectedGoal.timeframe)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-dim">
                  {selectedGoal.deadline ? formatFullDate(selectedGoal.deadline) : "Tidak ada batas waktu"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-accent-muted text-accent font-medium">
                  {getStatusLabel(selectedGoal.status)}
                </span>
                <button
                  onClick={() => handleDeleteGoal(selectedGoal.id)}
                  title={t.goals.deleteGoal}
                  className="p-1.5 rounded-md text-dim hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedGoal.description && (
              <p className="text-xs text-sub leading-relaxed">{selectedGoal.description}</p>
            )}

            {/* Real-time Deadline & Countdown Box */}
            <div className="p-4 rounded-lg bg-canvas border border-border-subtle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-main">
                    {t.common.deadline}: {selectedGoal.deadline ? formatShortDate(selectedGoal.deadline) : "—"}
                  </span>
                </div>
                <div>{renderLiveCountdown(selectedGoal.deadline)}</div>
              </div>

              {/* Editable Deadline Controls */}
              <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                {!isEditingDeadline ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditDeadlineValue(selectedGoal.deadline || getTodayDateString(now));
                        setIsEditingDeadline(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t.goals.editDeadline}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 w-full pt-1">
                    <input
                      type="date"
                      value={editDeadlineValue}
                      onChange={(e) => setEditDeadlineValue(e.target.value)}
                      className="px-2.5 py-1 rounded bg-surface border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => handleSaveEditedDeadline(editDeadlineValue)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>{t.common.save}</span>
                    </button>
                    <button
                      onClick={() => setIsEditingDeadline(false)}
                      className="px-2.5 py-1 rounded text-xs text-dim hover:text-main cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                )}

                {/* Quick extension shortcuts */}
                <div className="flex items-center gap-1.5 text-xs text-dim">
                  <span>+ Tambah:</span>
                  <button
                    onClick={() =>
                      handleSaveEditedDeadline(
                        addDaysDateString(selectedGoal.deadline || getTodayDateString(now), 1)
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface border border-border-subtle hover:border-line text-[11px] text-main cursor-pointer"
                  >
                    +1 Hari
                  </button>
                  <button
                    onClick={() =>
                      handleSaveEditedDeadline(
                        addWeeksDateString(selectedGoal.deadline || getTodayDateString(now), 1)
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface border border-border-subtle hover:border-line text-[11px] text-main cursor-pointer"
                  >
                    +1 Minggu
                  </button>
                  <button
                    onClick={() =>
                      handleSaveEditedDeadline(
                        addMonthsDateString(selectedGoal.deadline || getTodayDateString(now), 1)
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface border border-border-subtle hover:border-line text-[11px] text-main cursor-pointer"
                  >
                    +1 Bulan
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-dim">{t.common.progress}</span>
                <span className="text-main font-semibold">{selectedGoal.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${selectedGoal.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestones if applicable */}
          {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
            <div className="p-6 rounded-xl bg-surface border border-line">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
                {t.goals.milestones}
              </h2>
              <div className="space-y-2">
                {selectedGoal.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleMilestone(idx)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-canvas border border-border-subtle hover:border-accent/40 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors ${
                        m.completed
                          ? "bg-accent border-accent text-white"
                          : "border-border-subtle text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <span
                      className={`text-xs ${
                        m.completed ? "line-through text-dim" : "text-main"
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Journey context */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
              {t.goals.relatedJourney}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <div className="text-lg font-mono font-semibold text-main">
                  {selectedGoal.relatedCounts?.activities ?? 0}
                </div>
                <div className="text-[11px] text-dim mt-0.5">{t.goals.activities}</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <div className="text-lg font-mono font-semibold text-main">
                  {selectedGoal.relatedCounts?.learning ?? 0}
                </div>
                <div className="text-[11px] text-dim mt-0.5">{t.goals.learning}</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <div className="text-lg font-mono font-semibold text-main">
                  {selectedGoal.relatedCounts?.habits ?? 0}
                </div>
                <div className="text-[11px] text-dim mt-0.5">{t.goals.habits}</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <div className="text-lg font-mono font-semibold text-main">
                  {selectedGoal.relatedCounts?.reflections ?? 0}
                </div>
                <div className="text-[11px] text-dim mt-0.5">{t.goals.reflections}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar with Filter & Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-main">{t.goals.title}</h1>
              <p className="text-xs text-dim mt-0.5">{t.goals.subtitle}</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.goals.createGoal}</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 border-b border-line pb-2 text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-surface-elevated text-main font-semibold border border-line"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.active} ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === "COMPLETED"
                  ? "bg-surface-elevated text-main font-semibold border border-line"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.completed} ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter("PAUSED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === "PAUSED"
                  ? "bg-surface-elevated text-main font-semibold border border-line"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.paused} ({pausedCount})
            </button>
            <button
              onClick={() => setStatusFilter("CANCELLED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === "CANCELLED"
                  ? "bg-surface-elevated text-main font-semibold border border-line"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.cancelled} ({cancelledCount})
            </button>
          </div>

          {/* Timeframe Filter Buttons (Hari, Minggu, Bulan, Tahun) */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pt-1">
            <span className="text-[11px] text-dim font-medium mr-1">{t.goals.timeframe}:</span>
            {(
              [
                { key: "ALL", label: t.goals.allTimeframes },
                { key: "DAY", label: t.goals.timeframeDay },
                { key: "WEEK", label: t.goals.timeframeWeek },
                { key: "MONTH", label: t.goals.timeframeMonth },
                { key: "YEAR", label: t.goals.timeframeYear },
              ] as const
            ).map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframeFilter(tf.key)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  timeframeFilter === tf.key
                    ? "bg-accent text-white font-medium shadow-xs"
                    : "bg-surface border border-border-subtle text-dim hover:text-main"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Goal Cards List */}
          <div className="space-y-3">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors truncate">
                        {goal.title}
                      </h3>
                      {goal.timeframe && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 shrink-0">
                          {getTimeframeLabel(goal.timeframe)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-dim mt-1 flex-wrap">
                      <span>{getStatusLabel(goal.status)}</span>
                      {goal.deadline && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{formatShortDate(goal.deadline)}</span>
                          {renderLiveCountdown(goal.deadline, true)}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-sub font-semibold">{goal.percent}%</span>
                    <ChevronRight className="w-4 h-4 text-dim group-hover:text-main transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden mt-3">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${goal.percent}%` }}
                  />
                </div>
              </div>
            ))}

            {filteredGoals.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
                <p className="text-xs text-dim mb-3">{t.goals.noGoals}</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.goals.createGoal}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* CREATE GOAL MODAL WITH REAL-TIME DATE & TIME CONTROLS */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl p-6 text-main my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-main">{t.goals.createGoal}</h2>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {format(now, "HH:mm:ss")} · {format(now, "d MMM yyyy")}
                </span>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.goals.whatToAchieve}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Get my first job"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.goals.description}
                </label>
                <textarea
                  rows={2}
                  placeholder="Context, scope, or motivation..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              {/* Goal Type */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.goals.goalType}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["MILESTONE", "MEASURABLE", "HYBRID"] as const).map((tType) => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => setNewType(tType)}
                      className={`py-1.5 px-2 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        newType === tType
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border-subtle bg-canvas text-dim hover:text-sub"
                      }`}
                    >
                      {tType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe Limitation (Hari, Minggu, Bulan, Tahun, Kustom) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-sub">
                    {t.goals.timeframe} *
                  </label>
                  <span className="text-[10px] text-dim">Pilih batasan rentang</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { key: "DAY", label: t.goals.timeframeDay },
                      { key: "WEEK", label: t.goals.timeframeWeek },
                      { key: "MONTH", label: t.goals.timeframeMonth },
                      { key: "YEAR", label: t.goals.timeframeYear },
                      { key: "CUSTOM", label: t.goals.timeframeCustom },
                    ] as const
                  ).map((tf) => (
                    <button
                      key={tf.key}
                      type="button"
                      onClick={() => handleSelectTimeframe(tf.key)}
                      className={`py-1.5 px-1 rounded-md border text-xs font-medium text-center transition-all cursor-pointer ${
                        newTimeframe === tf.key
                          ? "border-accent bg-accent text-white shadow-xs"
                          : "border-border-subtle bg-canvas text-dim hover:text-sub hover:border-line"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline Date Picker & Live Real-time Countdown Box */}
              <div className="p-3 rounded-xl bg-canvas border border-line space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-sub flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{t.common.deadline}</span>
                  </label>
                  {/* Live ticking counter */}
                  <div>{renderLiveCountdown(newDeadline, true)}</div>
                </div>

                {/* Date Input */}
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => {
                    setNewDeadline(e.target.value);
                    setNewTimeframe("CUSTOM");
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-xs font-mono text-main focus:outline-none focus:border-accent cursor-pointer"
                />

                {/* Quick Interactive Adjustments (Bisa langsung diubah secara real-time) */}
                <div className="pt-1">
                  <span className="text-[10px] text-dim block mb-1.5">
                    Ubah tenggat waktu secara instan:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustDeadlineDays(1)}
                      className="py-1 px-1.5 rounded bg-surface border border-border-subtle hover:border-accent/40 text-[11px] text-main hover:text-accent text-center transition-colors cursor-pointer"
                    >
                      +1 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustDeadlineDays(3)}
                      className="py-1 px-1.5 rounded bg-surface border border-border-subtle hover:border-accent/40 text-[11px] text-main hover:text-accent text-center transition-colors cursor-pointer"
                    >
                      +3 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustDeadlineWeeks(1)}
                      className="py-1 px-1.5 rounded bg-surface border border-border-subtle hover:border-accent/40 text-[11px] text-main hover:text-accent text-center transition-colors cursor-pointer"
                    >
                      +1 Minggu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustDeadlineMonths(1)}
                      className="py-1 px-1.5 rounded bg-surface border border-border-subtle hover:border-accent/40 text-[11px] text-main hover:text-accent text-center transition-colors cursor-pointer"
                    >
                      +1 Bulan
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {t.goals.createGoal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
