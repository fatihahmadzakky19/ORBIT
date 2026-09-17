"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Check, Sparkles } from "lucide-react";
import { StoredIbadahActivity, IbadahType, IbadahMode } from "@/lib/storage";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: IbadahType;
    mode: IbadahMode;
    targetCount: number;
    unit: string;
    isActive: boolean;
  }) => Promise<void>;
  initialData?: StoredIbadahActivity | null;
}

export function ActivityModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ActivityModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<IbadahType>("SUNNAH");
  const [mode, setMode] = useState<IbadahMode>("BOTH");
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState("kali");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setMode(initialData.mode);
      setTargetCount(initialData.targetCount || 1);
      setUnit(initialData.unit || "kali");
      setIsActive(initialData.isActive !== false);
    } else {
      setName("");
      setType("SUNNAH");
      setMode("BOTH");
      setTargetCount(1);
      setUnit("kali");
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        type,
        mode,
        targetCount: targetCount > 0 ? targetCount : 1,
        unit: unit.trim() || "kali",
        isActive,
      });
      onClose();
    } catch (err) {
      console.error("Error saving activity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#D9DDD9] shadow-xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            {initialData ? (
              <Edit2 className="w-4 h-4 text-[#059669]" />
            ) : (
              <Plus className="w-4 h-4 text-[#059669]" />
            )}
            <h3 className="text-sm font-semibold text-[#181E24]">
              {initialData ? "Edit Amalan" : "Tambah Amalan Kustom"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F7F8F5] text-[#8A9197] hover:text-[#181E24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#181E24] mb-1">Nama Amalan</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Sholat Hajat, Sedekah Subuh, Baca Al-Kahfi"
              className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181E24] mb-1">Kategori</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IbadahType)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              >
                <option value="SUNNAH">Sunnah</option>
                <option value="WAJIB">Wajib</option>
                <option value="CUSTOM">Pribadi / Kustom</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Mode Tampilan</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as IbadahMode)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              >
                <option value="BOTH">Keduanya (Harian & Ramadhan)</option>
                <option value="DAILY">Hanya Harian</option>
                <option value="RAMADHAN">Khusus Ramadhan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181E24] mb-1">Target Hitungan</label>
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181E24] mb-1">Satuan</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kali, rakaat, juz, lembar"
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDD9] text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBF8]">
            <div>
              <span className="font-medium text-[#181E24] block">Status Amalan</span>
              <span className="text-[10px] text-[#6A7282]">
                {isActive ? "Aktif dan muncul di checklist" : "Dinonaktifkan sementara"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-[#059669] border border-emerald-200"
                  : "bg-gray-100 text-[#8A9197] border border-gray-200"
              }`}
            >
              {isActive ? "Aktif" : "Nonaktif"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#D9DDD9] font-medium text-[#6A7282] hover:bg-[#F7F8F5]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-medium shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : initialData ? "Perbarui" : "Tambahkan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
