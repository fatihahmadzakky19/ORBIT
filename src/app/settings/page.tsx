"use client";

import { useState } from "react";
import { Download, Shield, User, Clock, Check } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Alex");
  const [email, setEmail] = useState("alex@example.com");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      // Generate sample JSON export download
      const sampleExport = {
        exportedAt: new Date().toISOString(),
        user: { name, email, timezone },
        version: "0.2.0",
        summary: "ORBIT Full Personal Life Evolution Archive",
      };
      const blob = new Blob([JSON.stringify(sampleExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orbit_archive_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      setTimeout(() => setExported(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-main">Settings</h1>
        <p className="text-xs text-dim mt-0.5">
          Manage your personal preferences, privacy, and full data archive ownership.
        </p>
      </div>

      {/* Account Profile */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <User className="w-4 h-4" />
          <span>Account Profile</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-sub mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-sub mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Preferences & Timezone */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <Clock className="w-4 h-4" />
          <span>Preferences & Timezone</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-sub mb-1">
            Timezone (Crucial for Daily Habits & Monday Week Cycles)
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      {/* Data Ownership & Export */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <Shield className="w-4 h-4" />
          <span>Data Ownership & Long-Term Archive</span>
        </div>

        <p className="text-xs text-sub leading-relaxed">
          ORBIT is built to preserve your life records for 5+ years. You can export your entire database records (Activities, Learning, Goals, Habits, Finance, Reflections) as raw JSON at any time.
        </p>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all cursor-pointer"
        >
          {exported ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Archive Exported Successfully</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export Full Data (JSON)"}</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button className="text-xs text-rose-400 hover:underline cursor-pointer">
          Log out of ORBIT
        </button>
      </div>
    </div>
  );
}
