"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Shield, User, Check, Globe, Lock, ArrowRight, Save, Camera, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";
import { getStoredProfile, saveStoredProfile, resizeAvatarImage } from "@/lib/profile";
import { isVaultUnlocked, getVaultStats } from "@/lib/vault";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultStats, setVaultStats] = useState({ totalFolders: 0, totalItems: 0 });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load saved profile and vault status
  useEffect(() => {
    const profile = getStoredProfile();
    setName(profile.name || "");
    setEmail(profile.email || "");
    if (profile.timezone) setTimezone(profile.timezone);
    if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);

    setVaultUnlocked(isVaultUnlocked());
    const stats = getVaultStats();
    setVaultStats({ totalFolders: stats.totalFolders, totalItems: stats.totalItems });
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const resized = await resizeAvatarImage(file);
      setAvatarUrl(resized);
      saveStoredProfile({ avatarUrl: resized, name, email, timezone });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto profil.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    saveStoredProfile({ avatarUrl: "", name, email, timezone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    saveStoredProfile({
      name,
      email,
      timezone,
      avatarUrl,
    });

    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }, 400);
  };

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
      <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-surface border border-line space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
            <User className="w-4 h-4 text-accent" />
            <span>{t.settings.accountProfile}</span>
          </div>

          {profileSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in duration-200 font-mono">
              <Check className="w-3.5 h-3.5" />
              <span>{t.settings.profileSaved}</span>
            </div>
          )}
        </div>

        {/* Hidden File Input for Gallery Photo */}
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarFileChange}
          accept="image/png, image/jpeg, image/webp, image/gif, image/*"
          className="hidden"
        />

        {/* Profile Avatar & Info Badge with Gallery Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
          {/* Avatar box with camera badge overlay */}
          <div className="relative group self-start shrink-0">
            <div
              onClick={() => avatarInputRef.current?.click()}
              title="Klik untuk memilih foto dari galeri"
              className="w-16 h-16 rounded-2xl bg-surface-elevated border-2 border-accent/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center text-accent text-2xl font-bold font-mono overflow-hidden cursor-pointer hover:border-accent transition-all relative"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{name ? name.trim().charAt(0).toUpperCase() : "U"}</span>
              )}

              {/* Hover camera overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            {/* Camera badge indicator on bottom right */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-canvas"
              title="Pilih foto dari galeri"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-main truncate">{name || "Pengguna ORBIT"}</div>
            <div className="text-xs text-dim font-mono truncate mb-2">{email || "fatih@orbit.local"}</div>

            {/* Gallery action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <div className="w-3.5 h-3.5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-accent" />
                )}
                <span>{avatarUrl ? "Ganti Foto Galeri" : "Pilih dari Galeri"}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Hapus foto profil dan gunakan inisial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-sub mb-1">{t.settings.name}</label>
            <input
              type="text"
              value={name}
              placeholder="Contoh: Fatih Ahmad Zakky"
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                saveStoredProfile({ name: val, email, timezone, avatarUrl });
              }}
              onBlur={() => {
                saveStoredProfile({ name, email, timezone, avatarUrl });
              }}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-sub mb-1">{t.settings.email}</label>
            <input
              type="email"
              value={email}
              placeholder="fatihahmadzakky19@gmail.com"
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                saveStoredProfile({ name, email: val, timezone, avatarUrl });
              }}
              onBlur={() => {
                saveStoredProfile({ name, email, timezone, avatarUrl });
              }}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90 active:scale-95 text-xs font-medium transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
          >
            {isSavingProfile ? (
              <>
                <Save className="w-3.5 h-3.5 animate-spin" />
                <span>{t.common.saving}</span>
              </>
            ) : profileSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.settings.profileSaved}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{t.settings.saveProfile}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Private Vault Security Card */}
      <div className="p-6 rounded-xl bg-surface border border-line space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>{t.settings.vaultSecurity}</span>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            vaultUnlocked
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            {vaultUnlocked ? "TERBUKA (UNLOCKED)" : "TERKUNCI (LOCKED)"}
          </span>
        </div>

        <p className="text-xs text-sub leading-relaxed">
          {t.settings.vaultSecurityDesc}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-dim font-mono">
            {vaultStats.totalFolders} Folder · {vaultStats.totalItems} Berkas/Catatan
          </div>

          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-all cursor-pointer group"
          >
            <span>{t.settings.openVault}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
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
            onChange={(e) => {
              setTimezone(e.target.value);
              saveStoredProfile({ timezone: e.target.value });
            }}
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

