"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Edit2,
  Check,
  ShieldCheck,
  Clock,
  Bookmark,
  Info,
  Layers,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  getStoredIbadahMode,
  setStoredIbadahMode,
  getStoredIbadahActivities,
  addStoredCustomIbadah,
  updateStoredCustomIbadah,
  deleteStoredCustomIbadah,
  toggleStoredActivityActive,
  getStoredIbadahRecords,
  toggleStoredIbadahRecord,
  resetStoredIbadahForDate,
  getStoredIbadahReflection,
  saveStoredIbadahReflection,
  calculateIbadahStreak,
  getIbadah7DayRecap,
  getIbadahWeeklyDetail,
  getIbadahHeatmapData,
  exportIbadahToCSV,
  importIbadahFromCSV,
  getStoredQuranReadings,
  addStoredQuranReading,
  updateStoredQuranReading,
  deleteStoredQuranReading,
  getStoredQuranStats,
  StoredIbadahActivity,
  StoredIbadahRecord,
  StoredIbadahReflection,
  StoredQuranReading,
  showOrbitToast,
  ORBIT_DATA_CHANGED_EVENT,
} from "@/lib/storage";
import {
  getIbadahInitialDataAction,
  toggleIbadahRecordAction,
  createCustomIbadahAction,
  updateCustomIbadahAction,
  deleteCustomIbadahAction,
  toggleActivityActiveAction,
  saveIbadahReflectionAction,
  resetIbadahDailyAction,
  createQuranReadingAction,
  updateQuranReadingAction,
  deleteQuranReadingAction,
} from "@/features/ibadah/server/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TilawahModal } from "@/features/ibadah/components/TilawahModal";
import { TilawahSection } from "@/features/ibadah/components/TilawahSection";
import { ActivityModal } from "@/features/ibadah/components/ActivityModal";

// Helper: Format Gregorian Date in Indonesian
function formatGregorianFull(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Helper: Format dynamic Islamic / Hijri Date using native Intl API
function formatHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
}

function getIsoDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MOOD_OPTIONS = [
  { id: "tenang", label: "Tenang", icon: "🕊️" },
  { id: "bersyukur", label: "Bersyukur", icon: "🤲" },
  { id: "bersemangat", label: "Bersemangat", icon: "✨" },
  { id: "lelah", label: "Lelah", icon: "🌿" },
  { id: "penguatan", label: "Butuh Penguatan", icon: "🤍" },
];

export default function IbadahPage() {
  const { t } = useLanguage();

  // State: Selected Date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const selectedDateStr = useMemo(() => getIsoDateString(currentDate), [currentDate]);

  // State: Mode (Harian vs Ramadhan)
  const [mode, setMode] = useState<"DAILY" | "RAMADHAN">("DAILY");

  // State: Data
  const [activities, setActivities] = useState<StoredIbadahActivity[]>([]);
  const [records, setRecords] = useState<StoredIbadahRecord[]>([]);
  const [reflection, setReflection] = useState<StoredIbadahReflection | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  // State: Tilawah Al-Qur'an
  const [todayTilawah, setTodayTilawah] = useState<StoredQuranReading[]>([]);
  const [recentTilawah, setRecentTilawah] = useState<StoredQuranReading[]>([]);
  const [tilawahStats, setTilawahStats] = useState({
    pagesThisWeek: 0,
    juzThisWeek: 0,
    durationMinutesThisWeek: 0,
    lastSurah: "-",
    weeklyTargetPages: 35,
    weeklyProgress: 0,
  });

  // State: Modals & Dialogs
  const [isTilawahModalOpen, setIsTilawahModalOpen] = useState(false);
  const [editingTilawah, setEditingTilawah] = useState<StoredQuranReading | null>(null);
  const [deletingTilawahId, setDeletingTilawahId] = useState<string | null>(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<StoredIbadahActivity | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Month navigation in Heatmap & Weekly Analytics
  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => new Date());

  useEffect(() => {
    setViewMonthDate((prev) => {
      if (
        prev.getFullYear() === currentDate.getFullYear() &&
        prev.getMonth() === currentDate.getMonth()
      ) {
        return prev;
      }
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    });
  }, [currentDate]);

  const viewYear = viewMonthDate.getFullYear();
  const viewMonth = viewMonthDate.getMonth();
  const viewMonthName = viewMonthDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const isViewingCurrentMonth = useMemo(() => {
    const now = new Date();
    return viewYear === now.getFullYear() && viewMonth === now.getMonth();
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    setViewMonthDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonthDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleCurrentMonth = () => {
    setViewMonthDate(new Date());
  };

  // Hidden CSV file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from storage
  const loadLocalData = () => {
    const currentMode = getStoredIbadahMode();
    setMode(currentMode);

    const allActs = getStoredIbadahActivities();
    setActivities(allActs);

    const todayRecs = getStoredIbadahRecords(selectedDateStr);
    setRecords(todayRecs);

    const ref = getStoredIbadahReflection(selectedDateStr);
    setReflection(ref);
    setReflectionText(ref?.content || "");
    setSelectedMood(ref?.mood || "");

    const tToday = getStoredQuranReadings(selectedDateStr);
    setTodayTilawah(tToday);

    const tAll = getStoredQuranReadings();
    setRecentTilawah(tAll.slice(0, 10));

    const tStats = getStoredQuranStats();
    setTilawahStats(tStats);
  };

  useEffect(() => {
    loadLocalData();

    // Background sync with database server actions
    getIbadahInitialDataAction(selectedDateStr)
      .then((res) => {
        if (res.success) {
          if (res.activities && res.activities.length > 0) {
            setActivities(res.activities as any);
          }
          if (res.records) {
            setRecords(res.records as any);
          }
          if (res.reflection) {
            setReflection(res.reflection as any);
            setReflectionText(res.reflection.content || "");
            setSelectedMood(res.reflection.mood || "");
          }
          if (res.todayTilawah) {
            setTodayTilawah(res.todayTilawah as any);
          }
          if (res.recentTilawah) {
            setRecentTilawah(res.recentTilawah as any);
          }
        }
      })
      .catch((e) => {
        console.warn("DB offline or sync fallback to localStorage:", e);
      });
  }, [selectedDateStr]);

  // Listen to cross-module storage updates
  useEffect(() => {
    const handleDataChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ module?: string }>;
      if (!customEvent.detail?.module || customEvent.detail?.module === "ibadah") {
        loadLocalData();
      }
    };
    window.addEventListener(ORBIT_DATA_CHANGED_EVENT, handleDataChanged);
    return () => window.removeEventListener(ORBIT_DATA_CHANGED_EVENT, handleDataChanged);
  }, [selectedDateStr]);

  // Mode Switcher
  const handleModeChange = (newMode: "DAILY" | "RAMADHAN") => {
    setMode(newMode);
    setStoredIbadahMode(newMode);
    showOrbitToast(
      newMode === "RAMADHAN"
        ? "Mode Ramadhan aktif. Semoga hari-hari Anda penuh berkah!"
        : "Mode Harian aktif."
    );
  };

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split("-").map(Number);
      setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2]));
    }
  };

  // Filter activities relevant to current mode and active status
  const activeList = useMemo(() => {
    return activities.filter((a) => {
      const modeMatch = a.mode === "BOTH" || a.mode === mode;
      const activeMatch = a.isActive !== false;
      return modeMatch && activeMatch;
    });
  }, [activities, mode]);

  const wajibList = useMemo(() => {
    return activeList.filter((a) => a.type === "WAJIB");
  }, [activeList]);

  const sunnahAndCustomList = useMemo(() => {
    return activeList.filter((a) => a.type === "SUNNAH" || a.type === "CUSTOM");
  }, [activeList]);

  // Record mapping
  const recordMap = useMemo(() => {
    const map = new Map<string, StoredIbadahRecord>();
    for (const r of records) {
      map.set(r.activityId, r);
    }
    return map;
  }, [records]);

  // Progress Calculations
  const totalItemsCount = activeList.length;
  const completedItemsCount = activeList.filter((a) => recordMap.get(a.id)?.completed).length;
  const completionPercentage =
    totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  const wajibCompletedCount = wajibList.filter((a) => recordMap.get(a.id)?.completed).length;
  const wajibTotalCount = wajibList.length;
  const isWajibFull = wajibTotalCount > 0 && wajibCompletedCount === wajibTotalCount;

  const sunnahCompletedCount = sunnahAndCustomList.filter(
    (a) => recordMap.get(a.id)?.completed
  ).length;
  const sunnahTotalCount = sunnahAndCustomList.length;

  // Streak & Analytics Calculations
  const streakData = useMemo(() => {
    return calculateIbadahStreak();
  }, [records]);

  const recap7Days = useMemo(() => {
    return getIbadah7DayRecap(selectedDateStr);
  }, [selectedDateStr, records]);

  const weeklyDetail = useMemo(() => {
    return getIbadahWeeklyDetail(viewYear, viewMonth);
  }, [viewYear, viewMonth, records]);

  const heatmapData = useMemo(() => {
    return getIbadahHeatmapData(viewYear, viewMonth);
  }, [viewYear, viewMonth, records]);

  // Heatmap Days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Toggle Amalan Checklist
  const handleToggle = (activityId: string) => {
    const updated = toggleStoredIbadahRecord(activityId, selectedDateStr);
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.activityId === activityId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    toggleIbadahRecordAction({
      activityId,
      date: selectedDateStr,
      completed: updated.completed,
    }).catch((err) => {
      console.warn("Server action toggle error:", err);
    });
  };

  // Reset Hari Ini
  const handleConfirmReset = () => {
    resetStoredIbadahForDate(selectedDateStr);
    setRecords([]);
    setIsResetConfirmOpen(false);
    resetIbadahDailyAction(selectedDateStr).catch(() => {});
    showOrbitToast("Semua amalan hari ini berhasil diatur ulang.");
  };

  // Save Reflection
  const handleSaveReflection = async () => {
    if (!reflectionText.trim() && !selectedMood) return;
    setIsSavingReflection(true);
    const saved = saveStoredIbadahReflection(selectedDateStr, reflectionText, selectedMood);
    setReflection(saved);

    try {
      await saveIbadahReflectionAction({
        date: selectedDateStr,
        content: reflectionText,
        mood: selectedMood,
      });
    } catch {
      // Ignored if offline
    }

    setIsSavingReflection(false);
    showOrbitToast("Refleksi & Doa tersimpan dengan baik.", "success");
  };

  // Save Custom Activity (Add or Edit)
  const handleSaveActivity = async (data: {
    id?: string;
    name: string;
    type: "WAJIB" | "SUNNAH" | "CUSTOM";
    mode: "DAILY" | "RAMADHAN" | "BOTH";
    targetCount: number;
    unit: string;
    isActive: boolean;
  }) => {
    if (data.id) {
      // Edit
      updateStoredCustomIbadah(data.id, data);
      setActivities((prev) =>
        prev.map((a) => (a.id === data.id ? ({ ...a, ...data } as StoredIbadahActivity) : a))
      );
      updateCustomIbadahAction({
        id: data.id,
        name: data.name,
        type: data.type,
        mode: data.mode,
        targetCount: data.targetCount,
        unit: data.unit,
        isActive: data.isActive,
      }).catch(() => {});
      showOrbitToast(`Amalan "${data.name}" berhasil diperbarui.`);
    } else {
      // Add
      const newAct = addStoredCustomIbadah({
        name: data.name,
        type: data.type,
        mode: data.mode,
        targetCount: data.targetCount,
        unit: data.unit,
      });
      setActivities((prev) => [...prev, newAct]);
      createCustomIbadahAction({
        name: newAct.name,
        type: newAct.type,
        mode: newAct.mode,
        targetCount: newAct.targetCount,
        unit: newAct.unit,
        isActive: data.isActive,
      }).catch(() => {});
      showOrbitToast(`Amalan kustom "${newAct.name}" berhasil ditambahkan.`);
    }
  };

  // Delete Custom Activity
  const handleConfirmDeleteCustom = async () => {
    if (!deletingActivityId) return;
    const act = activities.find((a) => a.id === deletingActivityId);
    deleteStoredCustomIbadah(deletingActivityId);
    setActivities((prev) => prev.filter((a) => a.id !== deletingActivityId));
    setRecords((prev) => prev.filter((r) => r.activityId !== deletingActivityId));
    const targetId = deletingActivityId;
    setDeletingActivityId(null);

    deleteCustomIbadahAction(targetId).catch(() => {});
    showOrbitToast(`Amalan "${act?.name || "Kustom"}" telah dihapus.`);
  };

  // Toggle Activity Active Status
  const handleToggleActive = (id: string, currentActive: boolean) => {
    const newStatus = !currentActive;
    toggleStoredActivityActive(id, newStatus);
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: newStatus } : a))
    );
    toggleActivityActiveAction(id, newStatus).catch(() => {});
    showOrbitToast(`Status amalan telah diubah menjadi ${newStatus ? "Aktif" : "Nonaktif"}.`);
  };

  // Tilawah Handlers
  const handleSaveTilawah = async (data: {
    id?: string;
    date: string;
    startSurah: string;
    startAyah?: number;
    endSurah?: string;
    endAyah?: number;
    juz?: number;
    startPage?: number;
    endPage?: number;
    pagesRead: number;
    durationMinutes?: number;
    notes?: string;
  }) => {
    if (data.id) {
      // Update
      const updated = updateStoredQuranReading(data.id, data);
      if (updated) {
        if (updated.date === selectedDateStr) {
          setTodayTilawah((prev) => prev.map((r) => (r.id === data.id ? updated : r)));
        }
        setRecentTilawah((prev) => prev.map((r) => (r.id === data.id ? updated : r)));
      }
      updateQuranReadingAction(data as any).catch(() => {});
      showOrbitToast("Catatan tilawah berhasil diperbarui.");
    } else {
      // Create
      const newReading = addStoredQuranReading({
        date: data.date,
        startSurah: data.startSurah,
        startAyah: data.startAyah,
        endSurah: data.endSurah,
        endAyah: data.endAyah,
        juz: data.juz,
        startPage: data.startPage,
        endPage: data.endPage,
        pagesRead: data.pagesRead,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      });

      if (newReading.date === selectedDateStr) {
        setTodayTilawah((prev) => [newReading, ...prev]);
      }
      setRecentTilawah((prev) => [newReading, ...prev].slice(0, 10));

      createQuranReadingAction(data as any).catch(() => {});
      showOrbitToast("Catatan tilawah berhasil ditambahkan.");
    }

    setTilawahStats(getStoredQuranStats());
  };

  const handleConfirmDeleteTilawah = async () => {
    if (!deletingTilawahId) return;
    deleteStoredQuranReading(deletingTilawahId);
    setTodayTilawah((prev) => prev.filter((r) => r.id !== deletingTilawahId));
    setRecentTilawah((prev) => prev.filter((r) => r.id !== deletingTilawahId));
    setTilawahStats(getStoredQuranStats());

    const targetId = deletingTilawahId;
    setDeletingTilawahId(null);
    deleteQuranReadingAction(targetId).catch(() => {});
    showOrbitToast("Catatan tilawah telah dihapus.");
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportIbadahToCSV();
    if (!csv) {
      showOrbitToast("Belum ada data rekaman ibadah untuk diekspor.", "info");
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orbit-ibadah-${selectedDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showOrbitToast("Data ibadah berhasil diekspor ke CSV.", "success");
  };

  // Import CSV
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const result = importIbadahFromCSV(text);
      if (result.successCount > 0) {
        loadLocalData();
        showOrbitToast(`Berhasil mengimpor ${result.successCount} rekaman ibadah!`, "success");
      } else {
        showOrbitToast("Format CSV tidak sesuai atau tidak ada baris data yang valid.", "error");
      }
    };
    reader.readAsText(file);
  };

  // SVG Progress Ring calculations
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPercentage / 100) * ringCircumference;

  return (
    <div className="space-y-6 md:space-y-7 animate-in fade-in duration-200 pb-16">
      {/* ── 1. PAGE HEADER (Section A) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#181E24]">
              Ibadah
            </h1>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#181E24]/5 text-[#6A7282] border border-[#181E24]/10">
              Personal Spiritual OS
            </span>
          </div>
          <p className="text-xs text-[#6A7282] mt-1 leading-relaxed">
            Catat amalan harian, rawat konsistensi batin, dan pantau perjalanan spiritual.
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-[#F0F2F0] p-1 rounded-xl border border-[#D9DDD9]">
          <button
            onClick={() => handleModeChange("DAILY")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === "DAILY"
                ? "bg-white text-[#181E24] shadow-sm font-semibold"
                : "text-[#6A7282] hover:text-[#181E24]"
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${mode === "DAILY" ? "text-[#C8A96B]" : "text-[#8A9197]"}`} />
            <span>Mode Harian</span>
          </button>
          <button
            onClick={() => handleModeChange("RAMADHAN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === "RAMADHAN"
                ? "bg-[#181E24] text-white shadow-sm font-semibold"
                : "text-[#6A7282] hover:text-[#181E24]"
            }`}
          >
            <Moon
              className={`w-3.5 h-3.5 ${
                mode === "RAMADHAN" ? "text-[#C8A96B] fill-[#C8A96B]/30" : "text-[#8A9197]"
              }`}
            />
            <span>Mode Ramadhan</span>
          </button>
        </div>
      </header>

      {/* ── 2. DATE / DAY CONTROL BAR (Section B) ── */}
      <div className="bg-white rounded-2xl border border-[#D9DDD9] p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Date Navigator & Labels */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between sm:justify-start flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="w-8 h-8 rounded-xl border border-[#D9DDD9] hover:bg-[#F7F8F5] flex items-center justify-center text-[#20252A] transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-xl border border-[#D9DDD9] hover:bg-[#F7F8F5] text-xs font-medium text-[#20252A] transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextDay}
              className="w-8 h-8 rounded-xl border border-[#D9DDD9] hover:bg-[#F7F8F5] flex items-center justify-center text-[#20252A] transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <label className="relative cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9DDD9] bg-[#FAFBF8] hover:bg-white text-xs text-[#20252A] font-medium transition-colors">
            <CalendarIcon className="w-3.5 h-3.5 text-[#059669]" />
            <input
              type="date"
              value={selectedDateStr}
              onChange={handleDateSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            <span>Pilih Tanggal</span>
          </label>

          <div className="flex items-center gap-2 ml-1 text-xs">
            <span className="font-semibold text-[#181E24]">
              {formatGregorianFull(currentDate)}
            </span>
            <span className="text-[#8A9197]">•</span>
            <span className="text-[#059669] font-medium inline-flex items-center gap-1">
              <Moon className="w-3 h-3 text-[#C8A96B]" />
              {formatHijriDate(currentDate)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Secondary Tools + Primary + Tambah Amalan */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-[#E5E7EB]">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-1.5 rounded-lg border border-[#D9DDD9] hover:bg-red-50 hover:border-red-200 text-[#6A7282] hover:text-red-600 transition-colors"
            title="Reset amalan hari ini"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTriggerImport}
            className="p-1.5 rounded-lg border border-[#D9DDD9] hover:bg-[#F7F8F5] text-[#6A7282] hover:text-[#181E24] transition-colors"
            title="Impor CSV"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg border border-[#D9DDD9] hover:bg-[#F7F8F5] text-[#6A7282] hover:text-[#181E24] transition-colors"
            title="Ekspor CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium shadow-sm transition-all ml-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Tambah Amalan</span>
          </button>
        </div>
      </div>

      {/* ── 3. TODAY OVERVIEW (Section C) ── */}
      <div className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left: Progress Utama Hari Ini (Col 1-5) */}
          <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#E5E7EB] pb-4 md:pb-0 md:pr-4">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  stroke="#EDF2F7"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  stroke="#059669"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono tracking-tight text-[#181E24]">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#181E24] block">
                Pencapaian Hari Ini
              </span>
              <span className="text-xs text-[#6A7282] mt-0.5 block">
                {completedItemsCount} dari {totalItemsCount} amalan selesai
              </span>
              <div className="w-32 bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${completionPercentage}%` }}
                  className="h-full bg-[#059669] rounded-full transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right: 3 Small Refined Metric Blocks (Col 6-12) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-2.5">
            {/* Metric 1: Konsistensi */}
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#6A7282]">
                <span className="text-[10px] uppercase tracking-wider font-medium">
                  Konsistensi
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[#181E24]">
                  {streakData.currentStreak}
                </span>
                <span className="text-[10px] text-[#6A7282] ml-1">hari</span>
              </div>
              <span className="text-[10px] text-[#8A9197] mt-0.5 block truncate">
                Rekor: {streakData.bestStreak} hari
              </span>
            </div>

            {/* Metric 2: Ibadah Wajib */}
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#6A7282]">
                <span className="text-[10px] uppercase tracking-wider font-medium">Wajib</span>
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    isWajibFull ? "text-emerald-600" : "text-[#8A9197]"
                  }`}
                />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[#181E24]">
                  {wajibCompletedCount} / {wajibTotalCount}
                </span>
                <span className="text-[10px] text-[#6A7282] ml-1">waktu</span>
              </div>
              <span className="text-[10px] text-[#8A9197] mt-0.5 block truncate">
                {isWajibFull ? "Lengkap Sempurna" : `Sisa ${wajibTotalCount - wajibCompletedCount}`}
              </span>
            </div>

            {/* Metric 3: Sunnah & Pribadi */}
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#6A7282]">
                <span className="text-[10px] uppercase tracking-wider font-medium">Sunnah</span>
                <Sparkles className="w-3.5 h-3.5 text-[#08BFD7]" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[#181E24]">
                  {sunnahCompletedCount} / {sunnahTotalCount}
                </span>
                <span className="text-[10px] text-[#6A7282] ml-1">amalan</span>
              </div>
              <span className="text-[10px] text-[#8A9197] mt-0.5 block truncate">
                {sunnahTotalCount > 0
                  ? `${Math.round((sunnahCompletedCount / sunnahTotalCount) * 100)}% tercapai`
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. SPIRITUAL INSIGHT (Section D) ── */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#6A7282]">
          <Info className="w-3.5 h-3.5 text-[#059669] shrink-0" />
          <p className="leading-relaxed">
            {completedItemsCount === 0 ? (
              "Belum ada aktivitas tercatat hari ini. Mulai harimu dengan ketenangan dan niat lurus."
            ) : completionPercentage === 100 ? (
              "Alhamdulillah, seluruh amalan hari ini telah tertunaikan. Semoga Allah menerima setiap ketaatan Anda."
            ) : (
              <>
                Kamu telah menyelesaikan <strong>{completionPercentage}%</strong> amalan hari ini.
                Pertahankan ritme ini untuk menjaga kontinuitas spiritual.
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── RAMADHAN MODE BANNER (Section 13) ── */}
      {mode === "RAMADHAN" && (
        <div className="bg-gradient-to-r from-[#181E24] to-[#20252A] rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#C8A96B]/20 text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/30">
              <Moon className="w-3.5 h-3.5 fill-[#C8A96B]/30" />
            </span>
            <div>
              <span className="text-xs font-semibold text-white block">
                Fokus Utama Bulan Ramadhan
              </span>
              <p className="text-[11px] text-[#A0AEC0] mt-0.5">
                Target harian: Sahur, Sholat 5 Waktu, Tilawah Al-Qur'an, Tarawih, Dzikir & Sedekah.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C8A96B] bg-white/10 px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3 h-3" />
            <span>Lipatgandakan Amalan</span>
          </div>
        </div>
      )}

      {/* ── 5. CHECKLIST SECTION: WAJIB & SUNNAH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Column 1: Ibadah Wajib (Section 4) ── */}
        <section className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <h2 className="text-sm font-semibold text-[#181E24]">Ibadah Wajib</h2>
              </div>
              <p className="text-[11px] text-[#6A7282] mt-0.5">
                Amalan utama yang menjadi fondasi hari ini.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
              {wajibCompletedCount} / {wajibTotalCount}
            </span>
          </div>

          <div className="space-y-1.5">
            {wajibList.map((item) => {
              const rec = recordMap.get(item.id);
              const isDone = Boolean(rec?.completed);

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                    isDone
                      ? "bg-[#FAFDF9] border-[#A7F3D0]/70"
                      : "bg-[#FAFBF8] border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Tandai ${item.name}`}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-[#059669] text-white"
                          : "border border-[#CBD5E1] hover:border-[#059669] text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div>
                      <span
                        className={`text-xs sm:text-sm font-medium transition-colors ${
                          isDone
                            ? "text-[#6A7282] line-through decoration-[#059669]/40"
                            : "text-[#181E24]"
                        }`}
                      >
                        {item.name}
                      </span>
                      {rec?.completedAt && isDone && (
                        <span className="text-[10px] text-[#8A9197] ml-2 font-mono">
                          {new Date(rec.completedAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-[#6A7282] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                    {item.targetCount} {item.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Column 2: Sunnah & Amalan Tambahan (Section 5) ── */}
        <section className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#08BFD7]" />
                <h2 className="text-sm font-semibold text-[#181E24]">
                  Sunnah & Amalan Tambahan
                </h2>
              </div>
              <p className="text-[11px] text-[#6A7282] mt-0.5">
                Amalan penyempurna untuk memperkaya kualitas spiritual.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-[#08BFD7] bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200/50">
              {sunnahCompletedCount} / {sunnahTotalCount}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {sunnahAndCustomList.map((item) => {
              const rec = recordMap.get(item.id);
              const isDone = Boolean(rec?.completed);

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-150 ${
                    isDone
                      ? "bg-[#FAFDF9] border-[#A7F3D0]/70"
                      : "bg-[#FAFBF8] border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-white"
                  }`}
                >
                  <div
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <button
                      type="button"
                      aria-label={`Tandai ${item.name}`}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-[#059669] text-white"
                          : "border border-[#CBD5E1] hover:border-[#059669] text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-medium transition-colors ${
                            isDone
                              ? "text-[#6A7282] line-through decoration-[#059669]/40"
                              : "text-[#181E24]"
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.isCustom && (
                          <span className="text-[9px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            Kustom
                          </span>
                        )}
                      </div>
                      {rec?.completedAt && isDone && (
                        <span className="text-[10px] text-[#8A9197] font-mono">
                          {new Date(rec.completedAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-[#6A7282] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                      {item.targetCount} {item.unit}
                    </span>
                    {item.isCustom && (
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingActivity(item);
                            setIsActivityModalOpen(true);
                          }}
                          className="p-1 rounded text-[#8A9197] hover:text-[#181E24]"
                          title="Edit amalan"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingActivityId(item.id);
                          }}
                          className="p-1 rounded text-[#8A9197] hover:text-red-500"
                          title="Hapus amalan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── 6. FITUR UTAMA BARU: TILAWAH AL-QUR'AN (Sections 6, 7, 8, 9) ── */}
      <TilawahSection
        todayReadings={todayTilawah}
        recentReadings={recentTilawah}
        stats={tilawahStats}
        onOpenAddModal={() => {
          setEditingTilawah(null);
          setIsTilawahModalOpen(true);
        }}
        onEditReading={(reading) => {
          setEditingTilawah(reading);
          setIsTilawahModalOpen(true);
        }}
        onDeleteReading={(id) => setDeletingTilawahId(id)}
      />

      {/* ── 7. REKAP MINGGUAN & KALENDER HEATMAP (Section 12) ── */}
      <div className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 md:p-6 shadow-sm space-y-6">
        <div className="border-b border-[#E5E7EB] pb-3">
          <h2 className="text-sm font-semibold text-[#181E24]">
            Analisis & Rekapitulasi Ibadah
          </h2>
          <p className="text-xs text-[#6A7282] mt-0.5">
            Pantau tren konsistensi 7 hari, capaian mingguan, dan sebaran amalan sepanjang bulan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Rekap 7 Hari Terakhir (Col 1-5) */}
          <div className="lg:col-span-5 bg-[#FAFBF8] rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#181E24]">Rekap 7 Hari Terakhir</span>
              <p className="text-[11px] text-[#6A7282] mt-0.5">
                Persentase penyelesaian amalan harian
              </p>
            </div>

            <div className="flex items-end justify-between gap-2 h-32 pt-6 pb-1">
              {recap7Days.map((d) => {
                const isSelected = d.date === selectedDateStr;
                return (
                  <div
                    key={d.date}
                    onClick={() => {
                      const parts = d.date.split("-").map(Number);
                      setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2]));
                    }}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                  >
                    <span className="text-[9px] font-mono text-[#6A7282] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.percentage}%
                    </span>
                    <div className="w-full bg-[#E5E7EB] rounded-t-lg h-20 relative flex items-end overflow-hidden">
                      <div
                        style={{ height: `${Math.max(d.percentage, 4)}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? "bg-[#059669]"
                            : d.percentage >= 80
                            ? "bg-[#10B981]"
                            : d.percentage >= 50
                            ? "bg-[#34D399]"
                            : "bg-[#A7F3D0]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? "text-[#059669] font-bold underline" : "text-[#6A7282]"
                      }`}
                    >
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rincian Mingguan (Col 6-12) */}
          <div className="lg:col-span-7 bg-[#FAFBF8] rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#181E24]">
                Rincian Mingguan — {viewMonthName}
              </span>
              <p className="text-[11px] text-[#6A7282] mt-0.5">
                Performa pencapaian target ibadah per pekan
              </p>
            </div>

            <div className="space-y-2.5 mt-3">
              {weeklyDetail.map((w) => (
                <div key={w.weekNum} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#181E24]">
                      Minggu {w.weekNum}{" "}
                      <span className="text-[10px] text-[#6A7282] font-normal">
                        ({w.startDate.slice(8)} - {w.endDate.slice(8)})
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#6A7282]">
                        {w.completed} amalan
                      </span>
                      <span className="font-mono font-semibold text-[#181E24]">
                        {w.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${w.rate}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        w.rate >= 80
                          ? "bg-[#059669]"
                          : w.rate >= 50
                          ? "bg-[#10B981]"
                          : "bg-[#08BFD7]"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kalender Heatmap with Month Navigation */}
        <div className="border-t border-[#E5E7EB] pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#181E24]">
                Kalender Heatmap — {viewMonthName}
              </span>

              {/* Month Navigation */}
              <div className="flex items-center gap-1 bg-[#F0F2F0] p-0.5 rounded-lg border border-[#D9DDD9]">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-white text-[#6A7282] hover:text-[#181E24] transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-white text-[#6A7282] hover:text-[#181E24] transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isViewingCurrentMonth && (
                <button
                  type="button"
                  onClick={handleCurrentMonth}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#059669] hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Kembali ke Bulan Ini
                </button>
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#6A7282]">
              <span>Kurang</span>
              <span className="w-2.5 h-2.5 rounded bg-[#E5E7EB]" />
              <span className="w-2.5 h-2.5 rounded bg-[#A7F3D0]" />
              <span className="w-2.5 h-2.5 rounded bg-[#34D399]" />
              <span className="w-2.5 h-2.5 rounded bg-[#059669]" />
              <span>Penuh</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <span key={day} className="text-[11px] font-medium text-[#8A9197] py-1">
                {day}
              </span>
            ))}

            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty_${idx}`} className="h-8 sm:h-9 rounded-lg bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
                dayNum
              ).padStart(2, "0")}`;
              const pct = heatmapData[dateStr] || 0;
              const isSelected = dateStr === selectedDateStr;

              let bgClass = "bg-[#E5E7EB]/60 text-[#6A7282]";
              if (pct >= 80) bgClass = "bg-[#059669] text-white font-medium";
              else if (pct >= 50) bgClass = "bg-[#34D399] text-[#181E24] font-medium";
              else if (pct > 0) bgClass = "bg-[#A7F3D0] text-[#181E24]";

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setCurrentDate(new Date(viewYear, viewMonth, dayNum));
                  }}
                  className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-150 relative cursor-pointer ${bgClass} ${
                    isSelected ? "ring-2 ring-offset-1 ring-[#181E24] font-bold shadow-sm" : ""
                  }`}
                  title={`${dateStr}: ${pct}% selesai`}
                >
                  <span>{dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 8. REFLEKSI & DOA (Section I) ── */}
      <div className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#181E24]">
              Refleksi, Doa & Evaluasi Batin
            </h2>
            <p className="text-xs text-[#6A7282] mt-0.5">
              Dokumentasikan apa yang disyukuri, evaluasi kekurangan diri, atau doa yang dipanjatkan hari ini.
            </p>
          </div>

          {/* Mood Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id === selectedMood ? "" : m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                  selectedMood === m.id
                    ? "bg-[#059669]/10 text-[#059669] border border-[#059669]/40 font-medium"
                    : "bg-[#FAFBF8] border border-[#E5E7EB] text-[#6A7282] hover:text-[#181E24]"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            rows={3}
            placeholder="Tuliskan renungan, rasa syukur, atau permohonan ampun hari ini..."
            className="w-full p-3 rounded-xl border border-[#D9DDD9] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] text-xs md:text-sm text-[#20252A] placeholder-[#8A9197] leading-relaxed resize-y bg-[#FAFBF8]"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8A9197]">
              {reflection?.updatedAt ? (
                <>
                  Terakhir disimpan:{" "}
                  {new Date(reflection.updatedAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              ) : (
                "Catatan disimpan otomatis untuk tanggal aktif."
              )}
            </span>

            <button
              onClick={handleSaveReflection}
              disabled={isSavingReflection || (!reflectionText.trim() && !selectedMood)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#181E24] hover:bg-[#20252A] text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingReflection ? "Menyimpan..." : "Simpan Refleksi"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 9. MODALS & CONFIRMATION DIALOGS ── */}
      <TilawahModal
        isOpen={isTilawahModalOpen}
        onClose={() => {
          setIsTilawahModalOpen(false);
          setEditingTilawah(null);
        }}
        onSave={handleSaveTilawah}
        initialData={editingTilawah}
        defaultDate={selectedDateStr}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        initialData={editingActivity}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Amalan Hari Ini?"
        description={`Apakah Anda yakin ingin mengatur ulang semua rekaman amalan pada tanggal ${selectedDateStr}? Status amalan akan kembali kosong.`}
        confirmLabel="Ya, Atur Ulang"
        cancelLabel="Batal"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingActivityId)}
        onClose={() => setDeletingActivityId(null)}
        onConfirm={handleConfirmDeleteCustom}
        title="Hapus Amalan Kustom?"
        description="Amalan kustom ini dan semua catatan riwayatnya akan dihapus permanen dari daftar."
        confirmLabel="Hapus Amalan"
        cancelLabel="Batal"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTilawahId)}
        onClose={() => setDeletingTilawahId(null)}
        onConfirm={handleConfirmDeleteTilawah}
        title="Hapus Catatan Tilawah?"
        description="Catatan bacaan Al-Qur'an ini akan dihapus permanen dari riwayat tilawah."
        confirmLabel="Hapus Catatan"
        cancelLabel="Batal"
        isDestructive={true}
      />
    </div>
  );
}
