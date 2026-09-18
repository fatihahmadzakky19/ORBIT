"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, BookOpen, Clock, Calendar, Check } from "lucide-react";
import { QURAN_SURAHS, searchSurahs, QuranSurah } from "../data/surahs";
import { StoredQuranReading } from "@/lib/storage";

interface TilawahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
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
  }) => Promise<void>;
  initialData?: StoredQuranReading | null;
  defaultDate: string;
}

export function TilawahModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
}: TilawahModalProps) {
  const [date, setDate] = useState(defaultDate);
  const [startSurah, setStartSurah] = useState("Al-Baqarah");
  const [startAyah, setStartAyah] = useState<number | "">("");
  const [endSurah, setEndSurah] = useState("Al-Baqarah");
  const [endAyah, setEndAyah] = useState<number | "">("");
  const [juz, setJuz] = useState<number | "">("");
  const [startPage, setStartPage] = useState<number | "">("");
  const [endPage, setEndPage] = useState<number | "">("");
  const [pagesRead, setPagesRead] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search dropdown states
  const [startSearchQuery, setStartSearchQuery] = useState("");
  const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
  const [endSearchQuery, setEndSearchQuery] = useState("");
  const [isEndDropdownOpen, setIsEndDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setStartSurah(initialData.startSurah);
      setStartAyah(initialData.startAyah ?? "");
      setEndSurah(initialData.endSurah || initialData.startSurah);
      setEndAyah(initialData.endAyah ?? "");
      setJuz(initialData.juz ?? "");
      setStartPage(initialData.startPage ?? "");
      setEndPage(initialData.endPage ?? "");
      setPagesRead(initialData.pagesRead || 1);
      setDurationMinutes(initialData.durationMinutes ?? "");
      setNotes(initialData.notes || "");
    } else {
      setDate(defaultDate);
      setStartSurah("Al-Baqarah");
      setStartAyah("");
      setEndSurah("Al-Baqarah");
      setEndAyah("");
      setJuz("");
      setStartPage("");
      setEndPage("");
      setPagesRead(1);
      setDurationMinutes("");
      setNotes("");
    }
  }, [initialData, defaultDate, isOpen]);

  // Auto-calculate pagesRead when startPage and endPage change
  useEffect(() => {
    if (typeof startPage === "number" && typeof endPage === "number" && endPage >= startPage) {
      setPagesRead(endPage - startPage + 1);
    }
  }, [startPage, endPage]);

  // When startSurah changes, auto-suggest its startJuz if juz is empty
  const handleSelectStartSurah = (surah: QuranSurah) => {
    setStartSurah(surah.name);
    setEndSurah(surah.name);
    if (!juz) setJuz(surah.startJuz);
    setIsStartDropdownOpen(false);
    setStartSearchQuery("");
  };

  const handleSelectEndSurah = (surah: QuranSurah) => {
    setEndSurah(surah.name);
    setIsEndDropdownOpen(false);
    setEndSearchQuery("");
  };

  const filteredStartSurahs = useMemo(() => searchSurahs(startSearchQuery), [startSearchQuery]);
  const filteredEndSurahs = useMemo(() => searchSurahs(endSearchQuery), [endSearchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startSurah.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        date,
        startSurah,
        startAyah: typeof startAyah === "number" ? startAyah : undefined,
        endSurah: endSurah || startSurah,
        endAyah: typeof endAyah === "number" ? endAyah : undefined,
        juz: typeof juz === "number" ? juz : undefined,
        startPage: typeof startPage === "number" ? startPage : undefined,
        endPage: typeof endPage === "number" ? endPage : undefined,
        pagesRead: pagesRead > 0 ? pagesRead : 1,
        durationMinutes: typeof durationMinutes === "number" ? durationMinutes : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Error saving tilawah:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D9DDD9] shadow-xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 my-auto max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-200/60">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#181E24]">
                {initialData ? "Edit Catatan Tilawah" : "Catat Tilawah Al-Qur'an"}
              </h3>
              <p className="text-[11px] text-[#6A7282]">
                Dokumentasikan progres bacaan ayat, juz, dan durasi membaca hari ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F7F8F5] text-[#8A9197] hover:text-[#181E24] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tanggal */}
          <div>
            <label className="block font-medium text-[#181E24] mb-1">Tanggal Bacaan</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] bg-[#FAFBF8]"
            />
          </div>

          {/* Surah & Ayat Mulai */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <label className="block font-medium text-[#181E24] mb-1">Surah Mulai</label>
              <div
                onClick={() => setIsStartDropdownOpen(!isStartDropdownOpen)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] bg-white cursor-pointer flex items-center justify-between hover:border-[#059669]"
              >
                <span className="font-medium text-[#181E24]">{startSurah}</span>
                <span className="text-[10px] text-[#8A9197]">Pilih ▼</span>
              </div>

              {isStartDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl border border-[#D9DDD9] shadow-lg max-h-56 overflow-y-auto p-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#F7F8F5] rounded-lg border border-[#E5E7EB] mb-1.5">
                    <Search className="w-3.5 h-3.5 text-[#8A9197]" />
                    <input
                      type="text"
                      placeholder="Cari surah (misal: Baqarah, 2)..."
                      value={startSearchQuery}
                      onChange={(e) => setStartSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {filteredStartSurahs.map((s) => (
                    <div
                      key={s.number}
                      onClick={() => handleSelectStartSurah(s)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-[#059669] cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium">
                        {s.number}. {s.name}
                      </span>
                      <span className="text-[10px] text-[#8A9197]">{s.totalAyahs} ayat</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Ayat Mulai</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={startAyah}
                onChange={(e) => setStartAyah(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>
          </div>

          {/* Surah & Ayat Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <label className="block font-medium text-[#181E24] mb-1">Surah Selesai</label>
              <div
                onClick={() => setIsEndDropdownOpen(!isEndDropdownOpen)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] bg-white cursor-pointer flex items-center justify-between hover:border-[#059669]"
              >
                <span className="font-medium text-[#181E24]">{endSurah}</span>
                <span className="text-[10px] text-[#8A9197]">Pilih ▼</span>
              </div>

              {isEndDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl border border-[#D9DDD9] shadow-lg max-h-56 overflow-y-auto p-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#F7F8F5] rounded-lg border border-[#E5E7EB] mb-1.5">
                    <Search className="w-3.5 h-3.5 text-[#8A9197]" />
                    <input
                      type="text"
                      placeholder="Cari surah selesai..."
                      value={endSearchQuery}
                      onChange={(e) => setEndSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {filteredEndSurahs.map((s) => (
                    <div
                      key={s.number}
                      onClick={() => handleSelectEndSurah(s)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-[#059669] cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium">
                        {s.number}. {s.name}
                      </span>
                      <span className="text-[10px] text-[#8A9197]">{s.totalAyahs} ayat</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Ayat Selesai</label>
              <input
                type="number"
                min="1"
                placeholder="25"
                value={endAyah}
                onChange={(e) => setEndAyah(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>
          </div>

          {/* Juz, Halaman & Durasi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-[#181E24] mb-1">Juz (1-30)</label>
              <input
                type="number"
                min="1"
                max="30"
                placeholder="1"
                value={juz}
                onChange={(e) => setJuz(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Halaman Mulai</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Halaman Selesai</label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Durasi (Menit)</label>
              <input
                type="number"
                min="1"
                placeholder="20"
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(e.target.value ? parseInt(e.target.value, 10) : "")
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>
          </div>

          {/* Jumlah Halaman Dibaca */}
          <div className="bg-[#FAFBF8] rounded-xl border border-[#E5E7EB] p-2.5 flex items-center justify-between">
            <span className="text-[#6A7282]">Total Halaman Terhitung:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={pagesRead}
                onChange={(e) => setPagesRead(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 rounded-lg border border-[#D9DDD9] text-center font-semibold text-[#181E24] bg-white focus:outline-none"
              />
              <span className="text-[#6A7282]">halaman</span>
            </div>
          </div>

          {/* Catatan / Refleksi Bacaan */}
          <div>
            <label className="block font-medium text-[#181E24] mb-1">Catatan / Renungan Ayat</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Misal: Membaca setelah sholat Subuh, tadabbur ayat tentang sabar..."
              className="w-full p-2.5 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D9DDD9] font-medium text-[#6A7282] hover:bg-[#F7F8F5]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !startSurah.trim()}
              className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-medium shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Tilawah"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
