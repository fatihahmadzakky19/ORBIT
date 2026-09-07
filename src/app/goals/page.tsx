"use client";

import { useState } from "react";
import { Plus, Target, CheckCircle2, PauseCircle, XCircle, ArrowLeft, X } from "lucide-react";

interface GoalItem {
  id: string;
  title: string;
  description?: string;
  type: "MEASURABLE" | "MILESTONE" | "HYBRID";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "CANCELLED";
  progressMode?: "NUMERIC" | "FINANCE";
  currentValue?: number;
  targetValue?: number;
  percent: number;
  deadline?: string;
  milestones?: { title: string; completed: boolean }[];
  relatedCounts?: { activities: number; learning: number; habits: number; reflections: number };
}

const INITIAL_GOALS: GoalItem[] = [];

import { useLanguage } from "@/lib/i18n/context";

export default function GoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED">("ACTIVE");
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"MEASURABLE" | "MILESTONE" | "HYBRID">("MILESTONE");
  const [newDeadline, setNewDeadline] = useState("2026-11-30");

  const filteredGoals = goals.filter((g) => {
    if (statusFilter === "ACTIVE") return g.status === "IN_PROGRESS" || g.status === "NOT_STARTED";
    return g.status === statusFilter;
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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newGoal: GoalItem = {
      id: `g_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      type: newType,
      status: "IN_PROGRESS",
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
    setGoals([newGoal, ...goals]);
    setNewTitle("");
    setNewDesc("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Detail View Modal / Section */}
      {selectedGoal ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGoal(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.goals.backToGoals}</span>
          </button>

          {/* Goal Header */}
          <div className="p-6 rounded-xl bg-surface border border-line">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-xl font-semibold text-main">{selectedGoal.title}</h1>
                <p className="text-xs text-dim mt-1">{t.common.deadline}: {selectedGoal.deadline ?? "None"}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-accent-muted text-accent font-medium">
                {getStatusLabel(selectedGoal.status)}
              </span>
            </div>

            {selectedGoal.description && (
              <p className="text-xs text-sub mt-2 leading-relaxed">{selectedGoal.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mt-5">
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
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-canvas border border-border-subtle"
                  >
                    <span className="text-xs">{m.completed ? "✓" : "○"}</span>
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
              <p className="text-xs text-dim mt-0.5">
                {t.goals.subtitle}
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
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
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === "ACTIVE"
                  ? "bg-surface-elevated text-main font-semibold"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.active} ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === "COMPLETED"
                  ? "bg-surface-elevated text-main font-semibold"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.completed} ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter("PAUSED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === "PAUSED"
                  ? "bg-surface-elevated text-main font-semibold"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.paused} ({pausedCount})
            </button>
            <button
              onClick={() => setStatusFilter("CANCELLED")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === "CANCELLED"
                  ? "bg-surface-elevated text-main font-semibold"
                  : "text-dim hover:text-sub"
              }`}
            >
              {t.common.cancelled} ({cancelledCount})
            </button>
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
                  <div>
                    <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-dim mt-1">
                      <span>{getStatusLabel(goal.status)}</span>
                      {goal.deadline && <span>· {t.common.deadline} {goal.deadline}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-sub">{goal.percent}%</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden mt-3">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${goal.percent}%` }}
                  />
                </div>
              </div>
            ))}

            {filteredGoals.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
                <p className="text-xs text-dim mb-3">{t.goals.noGoals}</p>
                <button
                  onClick={() => setIsCreating(true)}
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

      {/* Create Goal Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">{t.goals.createGoal}</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
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
                />
              </div>

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
                      className={`py-1.5 px-2 rounded-md border text-xs font-medium transition-all ${
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

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.common.deadline}
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
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
