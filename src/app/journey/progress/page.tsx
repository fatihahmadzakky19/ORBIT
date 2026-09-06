"use client";

import { JourneyTabs } from "@/components/layout/JourneyTabs";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ProgressPage() {
  const currentGoals = [
    {
      title: "Get First Job",
      status: "In Progress",
      percent: 65,
      detail: "Milestones: 3 / 5",
      color: "bg-accent",
    },
    {
      title: "Save Rp10M",
      status: "In Progress",
      percent: 40,
      detail: "Rp4M / Rp10M",
      color: "bg-cyan-400",
    },
    {
      title: "Portfolio Website v1",
      status: "Completed",
      percent: 100,
      detail: "Deployed to Vercel",
      color: "bg-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold text-main">Journey</h1>
        <p className="text-xs text-dim mt-0.5">
          Evaluate directional progress towards your core goals.
        </p>
      </div>

      <JourneyTabs />

      {/* Current Goals Progress */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
          Current Goals
        </h2>

        <div className="space-y-4">
          {currentGoals.map((g) => (
            <div key={g.title} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sm font-medium text-main">{g.title}</span>
                <span className="font-mono text-sub">{g.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas overflow-hidden">
                <div
                  className={`h-full ${g.color} rounded-full transition-all duration-500`}
                  style={{ width: `${g.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-dim">
                <span>{g.status}</span>
                <span>{g.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Over Time Milestone Map */}
      <div className="p-6 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          Progress Over Time (2026)
        </h2>

        <div className="flex items-center justify-between py-6 px-4 rounded-lg bg-canvas border border-border-subtle relative">
          <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-line -translate-y-1/2 z-0" />

          {/* Jan */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-surface-elevated border-2 border-line mb-2" />
            <span className="text-xs font-mono text-dim">Jan</span>
            <span className="text-[10px] text-dim text-center mt-1 hidden sm:block">
              School term
            </span>
          </div>

          {/* Mar */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-surface-elevated border-2 border-line mb-2" />
            <span className="text-xs font-mono text-dim">Mar</span>
            <span className="text-[10px] text-dim text-center mt-1 hidden sm:block">
              Final exam prep
            </span>
          </div>

          {/* Jun */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-surface-elevated border-2 border-line mb-2" />
            <span className="text-xs font-mono text-dim">Jun</span>
            <span className="text-[10px] text-dim text-center mt-1 hidden sm:block">
              Graduation
            </span>
          </div>

          {/* Sep */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-canvas mb-2 shadow-sm" />
            <span className="text-xs font-mono text-accent font-semibold">Sep (Now)</span>
            <span className="text-[10px] text-sub text-center mt-1 hidden sm:block">
              Job hunt & ORBIT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
