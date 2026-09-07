"use client";

import { useState } from "react";
import { JourneyTabs } from "@/components/layout/JourneyTabs";
import { ArrowLeft, Sparkles, Calendar, BookOpen, Target, Award } from "lucide-react";

import { useLanguage } from "@/lib/i18n/context";

interface TimelineEvent {
  id: string;
  date: string;
  month: string;
  year: string;
  title: string;
  category: "GOAL" | "LEARNING" | "REFLECTION" | "MILESTONE" | "LIFE_EVENT";
  description?: string;
  relatedActivity?: string;
  relatedGoal?: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "te1",
    date: "06 September 2026",
    month: "September",
    year: "2026",
    title: "Learned JavaScript Array Methods",
    category: "LEARNING",
    description: "Deepened understanding of map(), filter(), reduce() without mutating state.",
    relatedActivity: "Belajar JavaScript (90 min)",
    relatedGoal: "Get First Job",
  },
  {
    id: "te2",
    date: "05 September 2026",
    month: "September",
    year: "2026",
    title: "Started applying for frontend developer roles",
    category: "MILESTONE",
    description: "Sent out first batch of 5 job applications with customized cover notes.",
    relatedGoal: "Get First Job",
  },
  {
    id: "te3",
    date: "31 August 2026",
    month: "August",
    year: "2026",
    title: "Weekly Reflection — Week 35",
    category: "REFLECTION",
    description: "Reflected on shift in confidence and sticking to morning routines.",
  },
  {
    id: "te4",
    date: "20 August 2026",
    month: "August",
    year: "2026",
    title: "Completed Portfolio Website v1",
    category: "GOAL",
    description: "Fully responsive personal site showcasing fullstack and frontend projects.",
    relatedGoal: "Build Portfolio v1",
  },
  {
    id: "te5",
    date: "10 August 2026",
    month: "August",
    year: "2026",
    title: "Created first financial goal (Save Rp10M)",
    category: "LIFE_EVENT",
    description: "Committed to personal financial independence and consistent emergency savings.",
  },
  {
    id: "te6",
    date: "01 August 2026",
    month: "August",
    year: "2026",
    title: "Graduated from SMK & Started ORBIT",
    category: "LIFE_EVENT",
    description: "Entered new life chapter and decided to actively document the journey.",
  },
];

export default function TimelinePage() {
  const { t, locale } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Group events by Month
  const months = ["September", "August"];

  const getMonthName = (month: string) => {
    if (locale === "id") {
      if (month === "August") return "Agustus";
    }
    return month;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold text-main">{t.journey.title}</h1>
        <p className="text-xs text-dim mt-0.5">
          {t.journey.subtitle}
        </p>
      </div>

      <JourneyTabs />

      {selectedEvent ? (
        <div className="space-y-4 max-w-lg">
          <button
            onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.journey.backToTimeline}</span>
          </button>

          <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
            <div>
              <span className="text-xs font-mono text-dim">{selectedEvent.date}</span>
              <h2 className="text-lg font-semibold text-main mt-1">{selectedEvent.title}</h2>
            </div>

            {selectedEvent.description && (
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle text-xs text-sub leading-relaxed">
                {selectedEvent.description}
              </div>
            )}

            {(selectedEvent.relatedActivity || selectedEvent.relatedGoal) && (
              <div className="pt-3 border-t border-border-subtle space-y-2 text-xs">
                {selectedEvent.relatedActivity && (
                  <div>
                    <span className="text-[11px] text-dim block">{t.learning.relatedActivity}</span>
                    <span className="text-main font-medium">{selectedEvent.relatedActivity}</span>
                  </div>
                )}
                {selectedEvent.relatedGoal && (
                  <div>
                    <span className="text-[11px] text-dim block">{t.learning.relatedGoal}</span>
                    <span className="text-accent font-medium">{selectedEvent.relatedGoal}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-sm font-semibold text-dim font-mono">2026</div>

          {months.map((month) => {
            const eventsInMonth = TIMELINE_EVENTS.filter((e) => e.month === month);

            return (
              <div key={month} className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-dim pl-1">
                  {getMonthName(month)}
                </h3>

                <div className="border-l-2 border-line ml-3 pl-5 space-y-4">
                  {eventsInMonth.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="relative p-3.5 rounded-lg bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[27px] top-4 w-3 h-3 rounded-full bg-surface-elevated border-2 border-accent group-hover:bg-accent transition-colors" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                          {ev.title}
                        </span>
                        <span className="text-[11px] font-mono text-dim">{ev.date.split(" ")[0]} {ev.date.split(" ")[1].slice(0, 3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
