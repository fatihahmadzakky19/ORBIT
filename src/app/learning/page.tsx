"use client";

import { useState } from "react";
import { Plus, BookOpen, ArrowLeft, ArrowRight, X } from "lucide-react";

interface LearningItem {
  id: string;
  topic: string;
  date: string;
  understood: string;
  source?: string;
  relatedActivity?: string;
  relatedGoal?: string;
}

const INITIAL_LEARNINGS: LearningItem[] = [
  {
    id: "l1",
    topic: "Array Methods",
    date: "06 September 2026 · 19:30",
    understood:
      "map() transforms each item into a new array.\nfilter() selects items based on a true/false condition.\nreduce() accumulates values into a single result without mutating.",
    source: "YouTube tutorial & MDN docs",
    relatedActivity: "Belajar JavaScript",
    relatedGoal: "Get First Job",
  },
  {
    id: "l2",
    topic: "JavaScript Functions & Closures",
    date: "04 September 2026 · 20:15",
    understood:
      "Learned callback functions and how scope retains access to variables declared in parent scopes.",
    source: "JavaScript The Definitive Guide",
    relatedActivity: "Frontend practice",
    relatedGoal: "Get First Job",
  },
  {
    id: "l3",
    topic: "Git Branching & Merge Conflicts",
    date: "02 September 2026 · 16:00",
    understood:
      "Understanding branch isolation and resolving merge conflicts systematically in VS Code.",
    source: "Project bug fix",
    relatedActivity: "Portfolio development",
    relatedGoal: "Build Portfolio v1",
  },
];

import { useLanguage } from "@/lib/i18n/context";

export default function LearningPage() {
  const { t } = useLanguage();
  const [learnings, setLearnings] = useState<LearningItem[]>(INITIAL_LEARNINGS);
  const [selectedLearning, setSelectedLearning] = useState<LearningItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newTopic, setNewTopic] = useState("");
  const [newUnderstood, setNewUnderstood] = useState("");
  const [newSource, setNewSource] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    const item: LearningItem = {
      id: `l_${Date.now()}`,
      topic: newTopic,
      date: "Today · Just now",
      understood: newUnderstood,
      source: newSource || undefined,
    };
    setLearnings([item, ...learnings]);
    setNewTopic("");
    setNewUnderstood("");
    setNewSource("");
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setLearnings(learnings.filter((l) => l.id !== id));
    setSelectedLearning(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {selectedLearning ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedLearning(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.learning.backToLearning}</span>
          </button>

          <div className="p-6 rounded-xl bg-surface border border-line space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-main">{selectedLearning.topic}</h1>
              <p className="text-xs font-mono text-dim mt-1">{selectedLearning.date}</p>
            </div>

            {/* What I Understood */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-2">
                {t.learning.whatUnderstood}
              </h2>
              <div className="p-4 rounded-lg bg-canvas border border-border-subtle text-xs text-sub leading-relaxed whitespace-pre-line">
                {selectedLearning.understood}
              </div>
            </div>

            {/* Source */}
            {selectedLearning.source && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
                  {t.learning.sourceContext}
                </h2>
                <p className="text-xs text-main">{selectedLearning.source}</p>
              </div>
            )}

            {/* Related */}
            {(selectedLearning.relatedActivity || selectedLearning.relatedGoal) && (
              <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedLearning.relatedActivity && (
                  <div>
                    <span className="text-[11px] text-dim block mb-0.5">{t.learning.relatedActivity}</span>
                    <span className="text-xs text-main font-medium">
                      {selectedLearning.relatedActivity}
                    </span>
                  </div>
                )}
                {selectedLearning.relatedGoal && (
                  <div>
                    <span className="text-[11px] text-dim block mb-0.5">{t.learning.relatedGoal}</span>
                    <span className="text-xs text-accent font-medium">
                      {selectedLearning.relatedGoal}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-border-subtle flex justify-end gap-2">
              <button
                onClick={() => handleDelete(selectedLearning.id)}
                className="px-3 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-main">{t.learning.title}</h1>
              <p className="text-xs text-dim mt-0.5">
                {t.learning.subtitle}
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.learning.addLearning}</span>
            </button>
          </div>

          {/* Learning Cards List */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-dim">
              {t.learning.recent}
            </div>

            {learnings.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedLearning(item)}
                className="p-5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                      {item.topic}
                    </h3>
                    <p className="text-xs text-sub mt-1 line-clamp-2 leading-relaxed">
                      {item.understood}
                    </p>
                    <span className="inline-block text-[11px] font-mono text-dim mt-2">
                      {item.date}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dim group-hover:text-main shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Learning Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">{t.learning.addLearning}</h2>
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
                  {t.learning.topic} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Array Methods"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.quickAdd.whatDidYouUnderstand}
                </label>
                <textarea
                  rows={3}
                  placeholder="Takeaways and core understanding..."
                  value={newUnderstood}
                  onChange={(e) => setNewUnderstood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.sourceContext} ({t.common.optional})
                </label>
                <input
                  type="text"
                  placeholder="e.g. YouTube tutorial, MDN, Book"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
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
                  disabled={!newTopic.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {t.quickAdd.saveLearning}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
