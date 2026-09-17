"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { StoredQuranReading } from "@/lib/storage";

interface TilawahSectionProps {
  todayReadings: StoredQuranReading[];
  recentReadings: StoredQuranReading[];
  stats: {
    pagesThisWeek: number;
    juzThisWeek: number;
    durationMinutesThisWeek: number;
    lastSurah: string;
    weeklyTargetPages: number;
    weeklyProgress: number;
  };
  onOpenAddModal: () => void;
  onEditReading: (reading: StoredQuranReading) => void;
  onDeleteReading: (id: string) => void;
}

export function TilawahSection({
  todayReadings,
  recentReadings,
  stats,
  onOpenAddModal,
  onEditReading,
  onDeleteReading,
}: TilawahSectionProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Pick primary reading for today (or latest if multiple)
  const primaryToday = todayReadings[0];
  const totalPagesToday = todayReadings.reduce((sum, r) => sum + (r.pagesRead || 0), 0);
  const dailyTargetPages = 5; // default 5 pages/day
  const dailyProgress = Math.min(100, Math.round((totalPagesToday / dailyTargetPages) * 100));

  return (
    <div className="bg-white rounded-2xl border border-[#D9DDD9] p-4 sm:p-5 md:p-6 shadow-sm space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#181E24]">Tilawah Al-Qur'an</h2>
              <span className="text-[10px] font-medium px-2 py-0.2 rounded-md bg-emerald-50 text-[#059669] border border-emerald-200/60">
                Kalamullah
              </span>
            </div>
            <p className="text-xs text-[#6A7282] mt-0.5">
              Pantau kemajuan bacaan harian, juz, halaman, dan tadabbur ayat suci.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium shadow-sm transition-all duration-150 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Catat Tilawah</span>
        </button>
      </div>

      {/* ── Main Display: Today's Status & Reading Card ── */}
      {primaryToday ? (
        <div className="bg-[#FAFBF8] rounded-xl border border-[#E5E7EB] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#059669] uppercase bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                BACAAN HARI INI
              </span>
              <span className="text-xs font-medium text-[#181E24]">
                {primaryToday.startSurah}
                {primaryToday.startAyah && ` : ${primaryToday.startAyah}`}
                {primaryToday.endSurah &&
                  primaryToday.endSurah !== primaryToday.startSurah &&
                  ` s/d ${primaryToday.endSurah}`}
                {primaryToday.endAyah && ` – ${primaryToday.endAyah}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditReading(primaryToday)}
                className="p-1 rounded-lg text-[#6A7282] hover:text-[#181E24] hover:bg-white transition-colors"
                title="Edit bacaan ini"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteReading(primaryToday.id)}
                className="p-1 rounded-lg text-[#8A9197] hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Hapus bacaan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-[#8A9197] block">Juz</span>
              <span className="font-semibold text-[#181E24]">
                {primaryToday.juz ? `Juz ${primaryToday.juz}` : "-"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8A9197] block">Halaman</span>
              <span className="font-semibold text-[#181E24]">
                {primaryToday.startPage && primaryToday.endPage
                  ? `${primaryToday.startPage} – ${primaryToday.endPage} (${primaryToday.pagesRead} hal)`
                  : `${primaryToday.pagesRead} halaman`}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8A9197] block">Durasi Baca</span>
              <span className="font-semibold text-[#181E24]">
                {primaryToday.durationMinutes ? `${primaryToday.durationMinutes} menit` : "-"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8A9197] block">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
              </span>
            </div>
          </div>

          {/* Notes */}
          {primaryToday.notes && (
            <div className="pt-2 border-t border-[#E5E7EB]/60 text-xs text-[#6A7282] italic flex items-start gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
              <span>&ldquo;{primaryToday.notes}&rdquo;</span>
            </div>
          )}

          {/* Today Target Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#6A7282]">Target Harian: 5 halaman</span>
              <span className="font-mono font-semibold text-[#181E24]">
                {totalPagesToday} / {dailyTargetPages} halaman ({dailyProgress}%)
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${dailyProgress}%` }}
                className="h-full bg-[#059669] rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAFBF8] rounded-xl border border-dashed border-[#D9DDD9] p-5 text-center flex flex-col items-center justify-center space-y-2">
          <BookOpen className="w-6 h-6 text-[#A0AEC0]" />
          <p className="text-xs text-[#6A7282] max-w-sm">
            Belum ada bacaan Al-Qur&apos;an tercatat pada tanggal ini. Luangkan waktu sejenak untuk
            membaca dan mentadabburi kalam-Nya.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-1 px-3 py-1.5 rounded-lg border border-[#D9DDD9] bg-white hover:bg-emerald-50 hover:text-[#059669] hover:border-emerald-200 text-xs font-medium text-[#181E24] transition-colors cursor-pointer"
          >
            + Catat Bacaan Hari Ini
          </button>
        </div>
      )}

      {/* ── Tilawah Weekly Statistics (Section 9) ── */}
      <div>
        <span className="text-xs font-semibold text-[#181E24] block mb-2">
          Statistik Tilawah Pekan Ini
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#F7F8F5] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#8A9197] uppercase tracking-wider block">
              Halaman
            </span>
            <span className="text-lg font-bold font-mono text-[#181E24]">
              {stats.pagesThisWeek}
            </span>
            <span className="text-[10px] text-[#6A7282] ml-1">halaman</span>
          </div>

          <div className="bg-[#F7F8F5] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#8A9197] uppercase tracking-wider block">
              Juz Dibaca
            </span>
            <span className="text-lg font-bold font-mono text-[#181E24]">
              {stats.juzThisWeek}
            </span>
            <span className="text-[10px] text-[#6A7282] ml-1">juz</span>
          </div>

          <div className="bg-[#F7F8F5] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#8A9197] uppercase tracking-wider block">
              Total Waktu
            </span>
            <span className="text-lg font-bold font-mono text-[#181E24]">
              {stats.durationMinutesThisWeek >= 60
                ? `${Math.floor(stats.durationMinutesThisWeek / 60)}j ${
                    stats.durationMinutesThisWeek % 60
                  }m`
                : `${stats.durationMinutesThisWeek}m`}
            </span>
          </div>

          <div className="bg-[#F7F8F5] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#8A9197] uppercase tracking-wider block">
              Surah Terakhir
            </span>
            <span className="text-sm font-semibold text-[#181E24] truncate block mt-1">
              {stats.lastSurah || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tilawah History (Section 8) ── */}
      {recentReadings.length > 0 && (
        <div className="border-t border-[#E5E7EB] pt-4">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-[#181E24] hover:text-[#059669] transition-colors"
          >
            <span>Riwayat Tilawah Terkini ({recentReadings.length})</span>
            <span className="flex items-center gap-1 text-[11px] text-[#8A9197] font-normal">
              {isHistoryExpanded ? "Sembunyikan" : "Lihat Semua"}
              {isHistoryExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          {isHistoryExpanded && (
            <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
              {recentReadings.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBF8] hover:bg-white text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-[#8A9197] min-w-[70px]">
                      {new Date(r.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div>
                      <span className="font-medium text-[#181E24]">
                        {r.startSurah}
                        {r.startAyah && ` : ${r.startAyah}`}
                        {r.endSurah && r.endSurah !== r.startSurah && ` s/d ${r.endSurah}`}
                        {r.endAyah && ` – ${r.endAyah}`}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[#6A7282] mt-0.5">
                        <span>{r.pagesRead} halaman</span>
                        {r.juz && <span>• Juz {r.juz}</span>}
                        {r.durationMinutes && <span>• {r.durationMinutes} menit</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditReading(r)}
                      className="p-1 rounded hover:bg-[#F0F2F0] text-[#8A9197] hover:text-[#181E24]"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteReading(r.id)}
                      className="p-1 rounded hover:bg-red-50 text-[#8A9197] hover:text-red-500"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
