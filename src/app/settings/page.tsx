"use client";

import { useState } from "react";
import { Download, Shield, User, Clock, Check, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        user: { name, email, timezone, locale },
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

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-main">{t.settings.title}</h1>
        <p className="text-xs text-dim mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Account Profile */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <User className="w-4 h-4" />
          <span>{t.settings.accountProfile}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-sub mb-1">{t.settings.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-sub mb-1">{t.settings.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Preferences & Language */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <Globe className="w-4 h-4" />
          <span>{t.settings.preferences}</span>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-medium text-sub mb-1">
            {t.settings.language}
          </label>
          <p className="text-[11px] text-dim mb-3">
            {t.settings.languageDesc}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  locale === lang.code
                    ? "border-accent bg-accent-muted text-accent font-semibold shadow-xs"
                    : "border-border-subtle bg-canvas text-sub hover:text-main hover:border-line"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="pt-4 border-t border-border-subtle">
          <label className="block text-xs font-medium text-sub mb-1">
            {t.settings.timezone} (Crucial for Daily Habits & Monday Week Cycles)
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET - UTC+1)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      {/* Data Ownership & Export */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <Shield className="w-4 h-4" />
          <span>{t.settings.dataOwnership}</span>
        </div>

        <p className="text-xs text-sub leading-relaxed">
          {t.settings.dataOwnershipDesc}
        </p>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all cursor-pointer"
        >
          {exported ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.settings.exportedSuccess}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? t.common.saving : t.settings.exportButton}</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button className="text-xs text-rose-400 hover:underline cursor-pointer">
          {t.settings.logout}
        </button>
      </div>
    </div>
  );
}
