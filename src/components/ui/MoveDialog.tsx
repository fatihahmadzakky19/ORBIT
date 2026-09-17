"use client";

import { useState, useEffect } from "react";
import { Folder, FolderTree, ArrowRight, X, Home } from "lucide-react";
import { StoredFolder } from "@/lib/storage";

interface MoveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolderId: string | null) => void;
  itemName: string;
  itemType?: "folder" | "note" | "document";
  currentFolderId?: string | null;
  folders: StoredFolder[];
  movingFolderId?: string; // If moving a folder, we exclude it and its descendants
}

// Helper to find all descendants of a folder
function getFolderDescendants(folderId: string, allFolders: StoredFolder[]): Set<string> {
  const descendants = new Set<string>([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of allFolders) {
      if (f.parentId && descendants.has(f.parentId) && !descendants.has(f.id)) {
        descendants.add(f.id);
        changed = true;
      }
    }
  }
  return descendants;
}

export function MoveDialog({
  isOpen,
  onClose,
  onMove,
  itemName,
  itemType = "note",
  currentFolderId = null,
  folders,
  movingFolderId,
}: MoveDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId);
    }
  }, [isOpen, currentFolderId]);

  if (!isOpen) return null;

  // If moving a folder, exclude itself and all descendants to prevent loops
  const excludedIds = movingFolderId ? getFolderDescendants(movingFolderId, folders) : new Set<string>();
  const availableFolders = folders.filter((f) => !excludedIds.has(f.id));

  const handleConfirm = () => {
    onMove(selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#20252A]">Pindahkan Item</h3>
              <p className="text-[11px] text-[#6A7282] truncate max-w-[260px]">
                {itemName} ({itemType === "folder" ? "Folder" : itemType === "document" ? "Dokumen" : "Catatan"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Folder Picker List */}
        <div className="my-3 overflow-y-auto flex-1 space-y-1.5 pr-1 py-1">
          <p className="text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-2">
            Pilih Folder Tujuan:
          </p>

          {/* Root / Beranda Option */}
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
              selectedFolderId === null
                ? "bg-[#08BFD7]/10 text-[#08BFD7] font-semibold border border-[#08BFD7]/30"
                : "bg-[#F8F9F7] text-[#20252A] border border-transparent hover:bg-[#F0F2EE]"
            }`}
          >
            <Home className="w-4 h-4 shrink-0 text-[#6A7282]" />
            <span className="flex-1 truncate">Beranda (Tanpa Folder / Root)</span>
            {selectedFolderId === null && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#08BFD7]/20">Aktif</span>}
          </button>

          {/* User Folders */}
          {availableFolders.map((f) => {
            const isSelected = selectedFolderId === f.id;
            const isCurrent = currentFolderId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFolderId(f.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#08BFD7]/10 text-[#08BFD7] font-semibold border border-[#08BFD7]/30"
                    : "bg-[#F8F9F7] text-[#20252A] border border-transparent hover:bg-[#F0F2EE]"
                }`}
              >
                <Folder className="w-4 h-4 shrink-0 text-[#C8A96B]" />
                <span className="flex-1 truncate">{f.name}</span>
                {isCurrent && (
                  <span className="text-[10px] text-[#6A7282] bg-white px-1.5 py-0.5 rounded border border-[#D9DDD9]">
                    Lokasi Sekarang
                  </span>
                )}
                {isSelected && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#08BFD7]/20 text-[#08BFD7]">
                    Dipilih
                  </span>
                )}
              </button>
            );
          })}

          {availableFolders.length === 0 && (
            <p className="text-xs text-[#6A7282] italic py-2 text-center">
              Belum ada folder lain yang tersedia.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F2EE]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] active:scale-95 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedFolderId === currentFolderId}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Pindahkan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
