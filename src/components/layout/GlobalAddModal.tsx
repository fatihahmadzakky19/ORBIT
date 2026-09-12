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
import { useLanguage } from "@/lib/i18n/context";

import { addStoredActivity, addStoredLearning, addStoredTransaction } from "@/lib/storage";

interface GlobalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (type: string, message: string) => void;
}

type RecordType = "NONE" | "ACTIVITY" | "LEARNING" | "EXPENSE" | "INCOME";

export function GlobalAddModal({ isOpen, onClose, onSuccess }: GlobalAddModalProps) {
  const { t } = useLanguage();
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

    // 1. Immediately persist to localStorage
    addStoredActivity({
      title: activityTitle.trim(),
      date: activityDate,
      time: activityTime,
      durationMinutes: Number(activityDuration) || 60,
      note: activityNote.trim() || undefined,
    });

    // 2. Background attempt to persist to server if database is configured
    try {
      createActivityAction({
        title: activityTitle,
        date: activityDate,
        time: activityTime,
        durationMinutes: Number(activityDuration) || 60,
        note: activityNote,
      }).catch(() => {});
    } catch {}

    onSuccess?.("activity", `${t.quickAdd.activityTitle}: "${activityTitle}"`);
    handleReset();
  };

  const handleSaveLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningTopic.trim()) return;
    setIsSubmitting(true);

    // 1. Immediately persist to localStorage
    addStoredLearning({
      topic: learningTopic.trim(),
      understood: learningUnderstood.trim(),
      source: learningSource.trim(),
    });

    // 2. Background attempt to persist to server if database is configured
    try {
      createLearningAction({
        topic: learningTopic,
        understood: learningUnderstood,
        source: learningSource,
      }).catch(() => {});
    } catch {}

    onSuccess?.("learning", `${t.quickAdd.learningTitle}: "${learningTopic}"`);
    handleReset();
  };

  const handleSaveTransaction = async (type: "EXPENSE" | "INCOME") => {
    if (!txAmount || Number(txAmount) <= 0) return;
    setIsSubmitting(true);

    const amountNum = Number(txAmount);

    // 1. Immediately persist to localStorage
    addStoredTransaction({
      type,
      amount: amountNum,
      category: txCategory,
      note: txNote.trim() || undefined,
      date: txDate,
    });

    // 2. Background attempt to persist to server if database is configured
    try {
      createTransactionAction({
        type,
        amount: amountNum,
        category: txCategory,
        note: txNote,
      }).catch(() => {});
    } catch {}

    onSuccess?.(
      type.toLowerCase(),
      type === "EXPENSE" ? t.quickAdd.expenseTitle : t.quickAdd.incomeTitle
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
              <h2 className="text-base font-semibold text-main">{t.quickAdd.title}</h2>
              <button
                onClick={handleReset}
                className="p-1 rounded text-dim hover:text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-sub mb-4">{t.quickAdd.subtitle}</p>

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
                    {t.quickAdd.activityTitle}
                  </div>
                  <div className="text-xs text-dim">{t.quickAdd.activityDesc}</div>
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
                    {t.quickAdd.learningTitle}
                  </div>
                  <div className="text-xs text-dim">{t.quickAdd.learningDesc}</div>
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
                    {t.quickAdd.expenseTitle}
                  </div>
                  <div className="text-xs text-dim">{t.quickAdd.expenseDesc}</div>
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
                    {t.quickAdd.incomeTitle}
                  </div>
                  <div className="text-xs text-dim">{t.quickAdd.incomeDesc}</div>
                </div>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={handleReset}
                className="text-xs text-dim hover:text-sub px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                {t.common.cancel}
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
                <span>{t.common.back}</span>
              </button>
              <h2 className="text-sm font-semibold text-main">{t.quickAdd.activityTitle}</h2>
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
                  {t.quickAdd.whatDidYouDo}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.quickAdd.activityPlaceholder}
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    {t.common.date} *
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
                    {t.common.time}
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
                  {t.common.duration} ({t.common.minutes})
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

              {/* Progressive Disclosure */}
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
                  <span>
                    {showActivityContext ? t.quickAdd.hideContext : t.quickAdd.addContext}
                  </span>
                </button>

                {showActivityContext && (
                  <div className="mt-3 p-3 rounded-lg bg-canvas border border-border-subtle space-y-3 animate-in fade-in duration-100">
                    <div>
                      <label className="block text-[11px] text-dim mb-1">
                        {t.common.note} ({t.common.optional})
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
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !activityTitle.trim()}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? t.common.saving : t.quickAdd.saveActivity}
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
                <span>{t.common.back}</span>
              </button>
              <h2 className="text-sm font-semibold text-main">{t.quickAdd.learningTitle}</h2>
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
                  {t.quickAdd.whatDidYouLearn}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.quickAdd.topicPlaceholder}
                  value={learningTopic}
                  onChange={(e) => setLearningTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.quickAdd.whatDidYouUnderstand}
                </label>
                <textarea
                  rows={3}
                  placeholder={t.quickAdd.understoodPlaceholder}
                  value={learningUnderstood}
                  onChange={(e) => setLearningUnderstood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.common.source} ({t.common.optional})
                </label>
                <input
                  type="text"
                  placeholder={t.quickAdd.sourcePlaceholder}
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
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !learningTopic.trim()}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? t.common.saving : t.quickAdd.saveLearning}
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
                <span>{t.common.back}</span>
              </button>
              <h2 className="text-sm font-semibold text-main">
                {selectedType === "EXPENSE"
                  ? t.quickAdd.expenseTitle
                  : t.quickAdd.incomeTitle}
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
                  {t.common.amount} (Rp) *
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
                    {t.common.category} *
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                  >
                    {selectedType === "EXPENSE" ? (
                      <>
                        <option value="Food">Food / Makanan</option>
                        <option value="Transport">Transport</option>
                        <option value="Education">Education / Belajar</option>
                        <option value="Internet">Internet</option>
                        <option value="Health">Health / Kesehatan</option>
                        <option value="Other">Other / Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary / Gaji</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Gift">Gift / Hadiah</option>
                        <option value="Investment">Investment / Investasi</option>
                        <option value="Other">Other / Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-sub mb-1">
                    {t.common.date} *
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
                  {t.common.note} ({t.common.optional})
                </label>
                <input
                  type="text"
                  placeholder="Catatan..."
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
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !txAmount || Number(txAmount) <= 0}
                className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting
                  ? t.common.saving
                  : selectedType === "EXPENSE"
                  ? t.quickAdd.saveExpense
                  : t.quickAdd.saveIncome}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
