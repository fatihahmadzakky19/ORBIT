"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Circle, ArrowLeft, X } from "lucide-react";

interface HabitItem {
  id: string;
  name: string;
  completedToday: boolean;
  thisWeekRatio: string; // e.g. "5 / 7"
  daysWeek: { day: string; status: "DONE" | "MISSED" | "EMPTY" }[];
  evidence: { date: string; title: string; duration: string }[];
}

const INITIAL_HABITS: HabitItem[] = [
  {
    id: "h1",
    name: "Coding",
    completedToday: true,
    thisWeekRatio: "5 / 7",
    daysWeek: [
      { day: "Mon", status: "DONE" },
      { day: "Tue", status: "DONE" },
      { day: "Wed", status: "MISSED" },
      { day: "Thu", status: "DONE" },
      { day: "Fri", status: "DONE" },
      { day: "Sat", status: "DONE" },
      { day: "Sun", status: "EMPTY" },
    ],
    evidence: [
      { date: "06 Sep", title: "Belajar JavaScript Array Methods", duration: "90 min" },
      { date: "05 Sep", title: "Frontend development practice", duration: "120 min" },
      { date: "04 Sep", title: "Refactoring components", duration: "60 min" },
    ],
  },
  {
    id: "h2",
    name: "Exercise",
    completedToday: false,
    thisWeekRatio: "4 / 7",
    daysWeek: [
      { day: "Mon", status: "DONE" },
      { day: "Tue", status: "DONE" },
      { day: "Wed", status: "MISSED" },
      { day: "Thu", status: "DONE" },
      { day: "Fri", status: "MISSED" },
      { day: "Sat", status: "DONE" },
      { day: "Sun", status: "EMPTY" },
    ],
    evidence: [
      { date: "05 Sep", title: "Morning run & stretching", duration: "30 min" },
      { date: "03 Sep", title: "Bodyweight workout", duration: "45 min" },
    ],
  },
  {
    id: "h3",
    name: "Reading",
    completedToday: false,
    thisWeekRatio: "6 / 7",
    daysWeek: [
      { day: "Mon", status: "DONE" },
      { day: "Tue", status: "DONE" },
      { day: "Wed", status: "DONE" },
      { day: "Thu", status: "DONE" },
      { day: "Fri", status: "DONE" },
      { day: "Sat", status: "DONE" },
      { day: "Sun", status: "EMPTY" },
    ],
    evidence: [
      { date: "05 Sep", title: "Atomic Habits chapter 4", duration: "25 min" },
      { date: "04 Sep", title: "System Design basics", duration: "30 min" },
    ],
  },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [selectedHabit, setSelectedHabit] = useState<HabitItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const toggleToday = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const next = !h.completedToday;
          return {
            ...h,
            completedToday: next,
            thisWeekRatio: next ? "6 / 7" : "5 / 7",
          };
        }
        return h;
      })
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newH: HabitItem = {
      id: `h_${Date.now()}`,
      name: newHabitName,
      completedToday: false,
      thisWeekRatio: "0 / 7",
      daysWeek: [
        { day: "Mon", status: "EMPTY" },
        { day: "Tue", status: "EMPTY" },
        { day: "Wed", status: "EMPTY" },
        { day: "Thu", status: "EMPTY" },
        { day: "Fri", status: "EMPTY" },
        { day: "Sat", status: "EMPTY" },
        { day: "Sun", status: "EMPTY" },
      ],
      evidence: [],
    };
    setHabits([...habits, newH]);
    setNewHabitName("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {selectedHabit ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedHabit(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Habits</span>
          </button>

          {/* Habit Header */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-main">{selectedHabit.name}</h1>
                <p className="text-xs text-dim mt-0.5">Daily · Active</p>
              </div>
              <span className="text-xs font-mono text-sub bg-surface-elevated px-2.5 py-1 rounded">
                This week: {selectedHabit.thisWeekRatio} days
              </span>
            </div>

            {/* This Week Days Breakdown */}
            <div className="pt-4 border-t border-border-subtle">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
                This Week Rhythm
              </h2>
              <div className="grid grid-cols-7 gap-2 text-center">
                {selectedHabit.daysWeek.map((d, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-canvas border border-border-subtle">
                    <div className="text-xs text-dim mb-1">{d.day}</div>
                    <div className="text-sm font-semibold">
                      {d.status === "DONE" && <span className="text-emerald-400">✓</span>}
                      {d.status === "MISSED" && <span className="text-dim">✕</span>}
                      {d.status === "EMPTY" && <span className="text-sub">○</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence from Activities */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
              Evidence (Linked Activities)
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
                    <span className="text-xs font-mono text-sub">{ev.duration}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dim">No activities linked yet as evidence.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-main">Habits</h1>
              <p className="text-xs text-dim mt-0.5">
                Daily patterns maintained through real actions. No streaks, no arbitrary score.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Habit</span>
            </button>
          </div>

          {/* Habit List */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-dim">
              Today
            </div>

            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => setSelectedHabit(habit)}
                className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                    {habit.name}
                  </h3>
                  <div className="text-xs font-mono text-dim mt-1">
                    This week: {habit.thisWeekRatio} days
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleToday(habit.id, e)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    habit.completedToday
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-surface-elevated text-sub hover:text-main border border-line"
                  }`}
                >
                  {habit.completedToday ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark as done</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Habit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">Create Habit</h2>
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
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding Practice"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
