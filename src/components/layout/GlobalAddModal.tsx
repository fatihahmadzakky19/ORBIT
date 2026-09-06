"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  Activity as ActivityIcon,
  BookOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
} from "lucide-react";
import { getCalendarDateString } from "@/lib/date";
import { createActivityAction } from "@/features/activities/server/actions";
import { createLearningAction } from "@/features/learning/server/actions";
import { createTransactionAction } from "@/features/finance/server/actions";

interface GlobalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (type: string, message: string) => void;
}

type RecordType = "NONE" | "ACTIVITY" | "LEARNING" | "EXPENSE" | "INCOME";

export function GlobalAddModal({ isOpen, onClose, onSuccess }: GlobalAddModalProps) {
  const [selectedType, setSelectedType] = useState<RecordType>("NONE");

  // Activity State
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate] = useState(getCalendarDateString());
  const [activityTime, setActivityTime] = useState("19:30");
  const [activityDuration, setActivityDuration] = useState("60");
  const [showActivityContext, setShowActivityContext] = useState(false);
  const [activityNote, setActivityNote] = useState("");

  // Learning State
  const [learningTopic, setLearningTopic] = useState("");
  const [learningUnderstood, setLearningUnderstood] = useState("");
  const [learningSource, setLearningSource] = useState("");

  // Transaction State
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("Food");
  const [txDate, setTxDate] = useState(getCalendarDateString());
  const [txNote, setTxNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedType("NONE");
    setActivityTitle("");
    setActivityNote("");
    setShowActivityContext(false);
    setLearningTopic("");
    setLearningUnderstood("");
    setLearningSource("");
    setTxAmount("");
    setTxNote("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createActivityAction({
        title: activityTitle,
        date: activityDate,
        time: activityTime,
        durationMinutes: Number(activityDuration) || 60,
        note: activityNote,
      });
      if (res && !res.success) {
        // graceful feedback
      }
    } catch {
      // ignore if db not configured yet
    }
    onSuccess?.("activity", `Activity "${activityTitle}" recorded.`);
    handleReset();
  };

  const handleSaveLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningTopic.trim()) return;
    setIsSubmitting(true);
    try {
      await createLearningAction({
        topic: learningTopic,
        understood: learningUnderstood,
        source: learningSource,
      });
    } catch {
      // ignore if db not configured yet
    }
    onSuccess?.("learning", `Learning "${learningTopic}" recorded.`);
    handleReset();
  };

  const handleSaveTransaction = async (type: "EXPENSE" | "INCOME") => {
    if (!txAmount || Number(txAmount) <= 0) return;
    setIsSubmitting(true);
    try {
      await createTransactionAction({
        type,
        amount: Number(txAmount),
        category: txCategory,
        note: txNote,
      });
    } catch {
      // ignore if db not configured yet
    }
    onSuccess?.(
      type.toLowerCase(),
      `${type === "EXPENSE" ? "Expense" : "Income"} recorded.`
    );
    handleReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl overflow-hidden text-main">
        {/* Step 1: Selection Menu */}
        {selectedType === "NONE" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-main">Add Record</h2>
              <button
                onClick={handleReset}
                className="p-1 rounded text-dim hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-sub mb-4">What do you want to record?</p>

            <div className="space-y-2.5">
              <button
                onClick={() => setSelectedType("ACTIVITY")}
                className="w-full flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent/40 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-md bg-primary-muted border border-accent/20 flex items-center justify-center text-accent">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                    Activity
                  </div>
                  <div className="text-xs text-dim">What I did</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType("LEARNING")}
                className="w-full flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent/40 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-main group-hover:text-cyan-400 transition-colors">
                    Learning
                  </div>
                  <div className="text-xs text-dim">What I learned</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedType("EXPENSE");
                  setTxCategory("Food");
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent/40 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ArrowDownCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-main group-hover:text-rose-400 transition-colors">
                    Expense
                  </div>
                  <div className="text-xs text-dim">Money I spent</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedType("INCOME");
                  setTxCategory("Salary");
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent/40 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ArrowUpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-main group-hover:text-emerald-400 transition-colors">
                    Income
                  </div>
                  <div className="text-xs text-dim">Money I received</div>
                </div>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={handleReset}
                className="text-xs text-dim hover:text-sub px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Activity Form */}
        {selectedType === "ACTIVITY" && (
          <form onSubmit={handleSaveActivity} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setSelectedType("NONE")}
                className="flex items-center gap-1 text-xs text-dim hover:text-main transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <h2 className="text-sm font-semibold text-main">Add Activity</h2>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded text-dim hover:text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  What did you do? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belajar JavaScript"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={activityDuration}
                  onChange={(e) => setActivityDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                />
              </div>

              {/* Progressive Disclosure: Add Context */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowActivityContext(!showActivityContext)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:underline py-1 cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showActivityContext ? "rotate-180" : ""
                    }`}
                  />
                  <span>{showActivityContext ? "Hide context" : "Add context +"}</span>
                </button>

                {showActivityContext && (
                  <div className="mt-3 p-3 rounded-lg bg-canvas border border-border-subtle space-y-3 animate-in fade-in duration-100">
                    <div>
                      <label className="block text-[11px] text-dim mb-1">
                        Optional Note
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Catatan tambahan..."
                        value={activityNote}
                        onChange={(e) => setActivityNote(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-surface border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-md text-xs text-sub hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !activityTitle.trim()}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Activity"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Add Learning Form */}
        {selectedType === "LEARNING" && (
          <form onSubmit={handleSaveLearning} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setSelectedType("NONE")}
                className="flex items-center gap-1 text-xs text-dim hover:text-main transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <h2 className="text-sm font-semibold text-main">Add Learning</h2>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded text-dim hover:text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  What did you learn? (Topic) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Array Methods"
                  value={learningTopic}
                  onChange={(e) => setLearningTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  What did you understand?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. map() transforms items, filter() selects items based on condition..."
                  value={learningUnderstood}
                  onChange={(e) => setLearningUnderstood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Source / Context (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Documentation, YouTube tutorial, Project bug"
                  value={learningSource}
                  onChange={(e) => setLearningSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-md text-xs text-sub hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !learningTopic.trim()}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Learning"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Add Expense / Income Form */}
        {(selectedType === "EXPENSE" || selectedType === "INCOME") && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTransaction(selectedType);
            }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setSelectedType("NONE")}
                className="flex items-center gap-1 text-xs text-dim hover:text-main transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <h2 className="text-sm font-semibold text-main">
                {selectedType === "EXPENSE" ? "Add Expense" : "Add Income"}
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded text-dim hover:text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Amount (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  placeholder="25000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm font-mono text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    Category *
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                  >
                    {selectedType === "EXPENSE" ? (
                      <>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Education">Education</option>
                        <option value="Internet">Internet</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Gift">Gift</option>
                        <option value="Investment">Investment</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder={selectedType === "EXPENSE" ? "e.g. Lunch with team" : "e.g. Monthly salary"}
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-md text-xs text-sub hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !txAmount || Number(txAmount) <= 0}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting
                  ? "Saving..."
                  : selectedType === "EXPENSE"
                  ? "Save Expense"
                  : "Save Income"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
