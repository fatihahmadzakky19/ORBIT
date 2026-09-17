"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  FileCode,
  FilePlus,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Download,
  Move,
  ChevronRight,
  ArrowLeft,
  Eye,
  X,
  Filter,
  ArrowUpDown,
  Upload,
  Calendar,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  StoredFolder,
  StoredDocument,
  StoredLearning,
  getStoredFolders,
  saveStoredFolders,
  addStoredFolder,
  renameStoredFolder,
  moveStoredFolder,
  deleteStoredFolder,
  getStoredDocuments,
  saveStoredDocuments,
  addStoredDocument,
  renameStoredDocument,
  moveStoredDocument,
  duplicateStoredDocument,
  deleteStoredDocument,
  getStoredLearnings,
  saveStoredLearnings,
  addStoredLearning,
  renameStoredLearning,
  moveStoredLearning,
  duplicateStoredLearning,
  deleteStoredLearning,
  showOrbitToast,
  ORBIT_DATA_CHANGED_EVENT,
} from "@/lib/storage";
import {
  createFolderAction,
  renameFolderAction,
  moveFolderAction,
  deleteFolderAction,
  createDocumentAction,
  renameDocumentAction,
  moveDocumentAction,
  deleteDocumentAction,
  createLearningAction,
  renameLearningAction,
  moveLearningAction,
  deleteLearningAction,
} from "@/features/learning/server/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RenameDialog } from "@/components/ui/RenameDialog";
import { MoveDialog } from "@/components/ui/MoveDialog";

// Helper to highlight matching keywords safely
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#08BFD7]/25 text-[#08BFD7] px-0.5 rounded font-medium">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Download file utility
function triggerFileDownload(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LearningPage() {
  const { t } = useLanguage();

  // Data states
  const [folders, setFolders] = useState<StoredFolder[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [learnings, setLearnings] = useState<StoredLearning[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Search & Filter & Sort states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FOLDER" | "NOTE" | "DOCUMENT">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "A_Z" | "Z_A">("NEWEST");

  // Drag and Drop state
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Action Menu dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newUnderstood, setNewUnderstood] = useState("");
  const [newSource, setNewSource] = useState("");

  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocType, setNewDocType] = useState("txt");

  // Detail & Preview Modals
  const [selectedNote, setSelectedNote] = useState<StoredLearning | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StoredDocument | null>(null);

  // Reusable Dialogs states
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [renameDialogState, setRenameDialogState] = useState<{
    isOpen: boolean;
    title: string;
    initialValue: string;
    onRename: (val: string) => void;
  }>({
    isOpen: false,
    title: "",
    initialValue: "",
    onRename: () => {},
  });

  const [moveDialogState, setMoveDialogState] = useState<{
    isOpen: boolean;
    itemName: string;
    itemType: "folder" | "note" | "document";
    currentFolderId: string | null;
    movingFolderId?: string;
    onMove: (targetId: string | null) => void;
  }>({
    isOpen: false,
    itemName: "",
    itemType: "note",
    currentFolderId: null,
    onMove: () => {},
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load data from storage
  const loadData = () => {
    setFolders(getStoredFolders());
    setDocuments(getStoredDocuments());
    setLearnings(getStoredLearnings());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(ORBIT_DATA_CHANGED_EVENT, loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener(ORBIT_DATA_CHANGED_EVENT, loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Current folder object & breadcrumb path
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [currentFolderId, folders]);

  const breadcrumbs = useMemo(() => {
    const path: StoredFolder[] = [];
    let currId = currentFolderId;
    const visited = new Set<string>();
    while (currId && !visited.has(currId)) {
      visited.add(currId);
      const f = folders.find((item) => item.id === currId);
      if (!f) break;
      path.unshift(f);
      currId = f.parentId || null;
    }
    return path;
  }, [currentFolderId, folders]);

  // -------------------------------------------------------------
  // Filtered & Sorted Lists
  // -------------------------------------------------------------
  const filteredFolders = useMemo(() => {
    let list = folders;
    // In search mode, search everywhere; otherwise only within currentFolderId
    if (!debouncedQuery) {
      list = list.filter((f) => (f.parentId || null) === currentFolderId);
    } else {
      list = list.filter((f) => f.name.toLowerCase().includes(debouncedQuery));
    }

    return [...list].sort((a, b) => {
      if (sortBy === "A_Z") return a.name.localeCompare(b.name);
      if (sortBy === "Z_A") return b.name.localeCompare(a.name);
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [folders, currentFolderId, debouncedQuery, sortBy]);

  const filteredNotes = useMemo(() => {
    let list = learnings;
    if (!debouncedQuery) {
      list = list.filter((n) => (n.folderId || null) === currentFolderId);
    } else {
      list = list.filter(
        (n) =>
          n.topic.toLowerCase().includes(debouncedQuery) ||
          n.understood.toLowerCase().includes(debouncedQuery) ||
          (n.source && n.source.toLowerCase().includes(debouncedQuery))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === "A_Z") return a.topic.localeCompare(b.topic);
      if (sortBy === "Z_A") return b.topic.localeCompare(a.topic);
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [learnings, currentFolderId, debouncedQuery, sortBy]);

  const filteredDocs = useMemo(() => {
    let list = documents;
    if (!debouncedQuery) {
      list = list.filter((d) => (d.folderId || null) === currentFolderId);
    } else {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(debouncedQuery) ||
          (d.content && d.content.toLowerCase().includes(debouncedQuery))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === "A_Z") return a.name.localeCompare(b.name);
      if (sortBy === "Z_A") return b.name.localeCompare(a.name);
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, currentFolderId, debouncedQuery, sortBy]);

  // Overall counts for badges
  const totalItemsInCurrent =
    (currentFolderId ? 0 : 0) +
    folders.filter((f) => (f.parentId || null) === currentFolderId).length +
    learnings.filter((n) => (n.folderId || null) === currentFolderId).length +
    documents.filter((d) => (d.folderId || null) === currentFolderId).length;

  // -------------------------------------------------------------
  // Folder Handlers
  // -------------------------------------------------------------
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const parent = newFolderParentId ?? currentFolderId ?? null;
    const created = addStoredFolder({ name: newFolderName, parentId: parent });
    createFolderAction({ name: newFolderName, parentId: parent }).catch(() => {});
    showOrbitToast(`Folder "${created.name}" berhasil dibuat`);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleOpenRenameFolder = (folder: StoredFolder) => {
    setOpenMenuId(null);
    setRenameDialogState({
      isOpen: true,
      title: "Ubah Nama Folder",
      initialValue: folder.name,
      onRename: (newName) => {
        renameStoredFolder(folder.id, newName);
        renameFolderAction({ id: folder.id, name: newName }).catch(() => {});
        showOrbitToast(`Nama folder diubah menjadi "${newName}"`);
      },
    });
  };

  const handleOpenMoveFolder = (folder: StoredFolder) => {
    setOpenMenuId(null);
    setMoveDialogState({
      isOpen: true,
      itemName: folder.name,
      itemType: "folder",
      currentFolderId: folder.parentId || null,
      movingFolderId: folder.id,
      onMove: (targetId) => {
        moveStoredFolder(folder.id, targetId);
        moveFolderAction({ id: folder.id, targetParentId: targetId }).catch(() => {});
        showOrbitToast(`Folder dipindahkan`);
      },
    });
  };

  const handleOpenDeleteFolder = (folder: StoredFolder) => {
    setOpenMenuId(null);
    setConfirmDialogState({
      isOpen: true,
      title: `Hapus Folder "${folder.name}"?`,
      description:
        "Semua subfolder dan item di dalam folder ini akan dihapus atau dipindahkan ke beranda. Tindakan ini tidak dapat dibatalkan.",
      onConfirm: () => {
        deleteStoredFolder(folder.id);
        deleteFolderAction(folder.id).catch(() => {});
        if (currentFolderId === folder.id) {
          setCurrentFolderId(folder.parentId || null);
        }
        showOrbitToast(`Folder "${folder.name}" telah dihapus`);
        setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // -------------------------------------------------------------
  // Document Handlers
  // -------------------------------------------------------------
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const ext = newDocType.toLowerCase();
    const formattedName = newDocName.includes(".") ? newDocName : `${newDocName}.${ext}`;
    const created = addStoredDocument({
      name: formattedName,
      content: newDocContent,
      fileType: ext,
      folderId: currentFolderId,
    });
    createDocumentAction({
      name: formattedName,
      content: newDocContent,
      fileType: ext,
      folderId: currentFolderId,
    }).catch(() => {});
    showOrbitToast(`Dokumen "${created.name}" berhasil dibuat`);
    setNewDocName("");
    setNewDocContent("");
    setIsCreatingDoc(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const textContent = typeof reader.result === "string" ? reader.result : "";
      const created = addStoredDocument({
        name: file.name,
        content: textContent,
        fileType: file.name.split(".").pop() || "txt",
        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        folderId: currentFolderId,
      });
      createDocumentAction({
        name: file.name,
        content: textContent,
        fileType: file.name.split(".").pop() || "txt",
        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        folderId: currentFolderId,
      }).catch(() => {});
      showOrbitToast(`File "${file.name}" berhasil diunggah`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleOpenRenameDocument = (doc: StoredDocument) => {
    setOpenMenuId(null);
    setRenameDialogState({
      isOpen: true,
      title: "Ubah Nama Dokumen",
      initialValue: doc.name,
      onRename: (newName) => {
        renameStoredDocument(doc.id, newName);
        renameDocumentAction({ id: doc.id, name: newName }).catch(() => {});
        showOrbitToast(`Dokumen diubah menjadi "${newName}"`);
      },
    });
  };

  const handleOpenMoveDocument = (doc: StoredDocument) => {
    setOpenMenuId(null);
    setMoveDialogState({
      isOpen: true,
      itemName: doc.name,
      itemType: "document",
      currentFolderId: doc.folderId || null,
      onMove: (targetId) => {
        moveStoredDocument(doc.id, targetId);
        moveDocumentAction({ id: doc.id, targetFolderId: targetId }).catch(() => {});
        showOrbitToast(`Dokumen dipindahkan`);
      },
    });
  };

  const handleDuplicateDocument = (doc: StoredDocument) => {
    setOpenMenuId(null);
    const copy = duplicateStoredDocument(doc.id);
    if (copy) {
      createDocumentAction({
        name: copy.name,
        content: copy.content,
        fileType: copy.fileType,
        fileSize: copy.fileSize,
        folderId: copy.folderId,
      }).catch(() => {});
      showOrbitToast(`Dokumen diduplikasi: "${copy.name}"`);
    }
  };

  const handleOpenDeleteDocument = (doc: StoredDocument) => {
    setOpenMenuId(null);
    setConfirmDialogState({
      isOpen: true,
      title: `Hapus Dokumen "${doc.name}"?`,
      description: "File dokumen ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      onConfirm: () => {
        deleteStoredDocument(doc.id);
        deleteDocumentAction(doc.id).catch(() => {});
        showOrbitToast(`Dokumen "${doc.name}" telah dihapus`);
        setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // -------------------------------------------------------------
  // Note Handlers
  // -------------------------------------------------------------
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    const created = addStoredLearning({
      topic: newTopic,
      understood: newUnderstood,
      source: newSource,
      folderId: currentFolderId,
    });
    createLearningAction({
      topic: newTopic,
      understood: newUnderstood,
      source: newSource,
      folderId: currentFolderId,
    }).catch(() => {});
    showOrbitToast(`Catatan "${created.topic}" berhasil ditambahkan`);
    setNewTopic("");
    setNewUnderstood("");
    setNewSource("");
    setIsCreatingNote(false);
  };

  const handleOpenRenameNote = (note: StoredLearning) => {
    setOpenMenuId(null);
    setRenameDialogState({
      isOpen: true,
      title: "Ubah Judul Catatan",
      initialValue: note.topic,
      onRename: (newName) => {
        renameStoredLearning(note.id, newName);
        renameLearningAction({ id: note.id, topic: newName }).catch(() => {});
        showOrbitToast(`Catatan diubah menjadi "${newName}"`);
      },
    });
  };

  const handleOpenMoveNote = (note: StoredLearning) => {
    setOpenMenuId(null);
    setMoveDialogState({
      isOpen: true,
      itemName: note.topic,
      itemType: "note",
      currentFolderId: note.folderId || null,
      onMove: (targetId) => {
        moveStoredLearning(note.id, targetId);
        moveLearningAction({ id: note.id, targetFolderId: targetId }).catch(() => {});
        showOrbitToast(`Catatan dipindahkan`);
      },
    });
  };

  const handleDuplicateNote = (note: StoredLearning) => {
    setOpenMenuId(null);
    const copy = duplicateStoredLearning(note.id);
    if (copy) {
      createLearningAction({
        topic: copy.topic,
        understood: copy.understood,
        source: copy.source,
        folderId: copy.folderId,
      }).catch(() => {});
      showOrbitToast(`Catatan diduplikasi: "${copy.topic}"`);
    }
  };

  const handleOpenDeleteNote = (note: StoredLearning) => {
    setOpenMenuId(null);
    setConfirmDialogState({
      isOpen: true,
      title: `Hapus Catatan "${note.topic}"?`,
      description: "Catatan pembelajaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      onConfirm: () => {
        deleteStoredLearning(note.id);
        deleteLearningAction(note.id).catch(() => {});
        showOrbitToast(`Catatan "${note.topic}" telah dihapus`);
        setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // -------------------------------------------------------------
  // Drag and Drop Logic
  // -------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, type: "folder" | "document" | "note", id: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type, id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDrop = (targetFolderId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const { type, id } = JSON.parse(dataStr);
      if (!id || !type) return;

      if (type === "folder") {
        if (id === targetFolderId) return;
        moveStoredFolder(id, targetFolderId);
        moveFolderAction({ id, targetParentId: targetFolderId }).catch(() => {});
        showOrbitToast("Folder berhasil dipindahkan via seret");
      } else if (type === "document") {
        moveStoredDocument(id, targetFolderId);
        moveDocumentAction({ id, targetFolderId }).catch(() => {});
        showOrbitToast("Dokumen berhasil dipindahkan via seret");
      } else if (type === "note") {
        moveStoredLearning(id, targetFolderId);
        moveLearningAction({ id, targetFolderId }).catch(() => {});
        showOrbitToast("Catatan berhasil dipindahkan via seret");
      }
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* --------------------------------------------------------- */}
      {/* Header & Primary Actions */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-main tracking-tight">
              {t.learning?.title || "Pembelajaran"}
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#08BFD7]/10 text-[#08BFD7] border border-[#08BFD7]/20">
              PKM Core
            </span>
          </div>
          <p className="text-xs text-dim mt-0.5">
            {t.learning?.subtitle || "Arsip pengetahuan terstruktur, catatan reflektif, dan dokumen studi."}
          </p>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Create Folder */}
          <button
            onClick={() => {
              setNewFolderName("");
              setNewFolderParentId(currentFolderId);
              setIsCreatingFolder(true);
            }}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#08BFD7] hover:bg-[#F8F9F7] text-xs font-medium text-[#20252A] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Folder Baru</span>
          </button>

          {/* Create Document */}
          <button
            onClick={() => {
              setNewDocName("");
              setNewDocContent("");
              setNewDocType("txt");
              setIsCreatingDoc(true);
            }}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#08BFD7] hover:bg-[#F8F9F7] text-xs font-medium text-[#20252A] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#08BFD7]" />
            <span>Buat Dokumen</span>
          </button>

          {/* Add Learning Note */}
          <button
            onClick={() => {
              setNewTopic("");
              setNewUnderstood("");
              setNewSource("");
              setIsCreatingNote(true);
            }}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#08BFD7] hover:bg-[#07ABC1] text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Pelajaran</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 4 OBSERVATORY PKM METRIC CARDS (Matches Reference Style) */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pelajaran */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Total Pelajaran
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#20252A] font-mono mt-2">
              {learnings.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-xs">
            <span className="text-[#8F96A3]">Catatan pemahaman</span>
            <button
              onClick={() => setFilterType("NOTE")}
              className="text-[#08BFD7] hover:underline font-medium cursor-pointer"
            >
              Lihat catatan →
            </button>
          </div>
        </div>

        {/* Card 2: Folder Terorganisir */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Folder Direktori
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center">
                <Folder className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#20252A] font-mono mt-2">
              {folders.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-xs">
            <span className="text-[#8F96A3]">Arsip kategori</span>
            <button
              onClick={() => setFilterType("FOLDER")}
              className="text-[#08BFD7] hover:underline font-medium cursor-pointer"
            >
              Kelola folder →
            </button>
          </div>
        </div>

        {/* Card 3: Dokumen Studi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                File & Dokumen
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                <FileCode className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#20252A] font-mono mt-2">
              {documents.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-xs">
            <span className="text-[#8F96A3]">Kode & catatan teks</span>
            <button
              onClick={() => setFilterType("DOCUMENT")}
              className="text-[#08BFD7] hover:underline font-medium cursor-pointer"
            >
              Buka dokumen →
            </button>
          </div>
        </div>

        {/* Card 4: Status PKM */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Aktivitas Terbaru
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-semibold text-[#20252A] font-mono mt-2 truncate">
              {learnings[0]?.topic || "Belum ada materi"}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-xs">
            <span className="text-[#8F96A3]">
              {learnings[0]?.date ? `Update: ${learnings[0].date}` : "Mulai belajar"}
            </span>
            <span className="text-emerald-600 font-medium">Aktif</span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* Navigation Breadcrumb Bar */}
      {/* --------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#D9DDD9] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5">
          {/* Back button if inside a folder */}
          {currentFolder && (
            <button
              onClick={() => setCurrentFolderId(currentFolder.parentId || null)}
              className="p-1 rounded-md text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors cursor-pointer mr-1"
              title="Kembali ke folder sebelumnya"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Root Link */}
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`font-medium transition-colors cursor-pointer hover:underline ${
              currentFolderId === null ? "text-[#08BFD7] font-semibold" : "text-[#6A7282]"
            }`}
          >
            Pembelajaran
          </button>

          {/* Trail of ancestor folders */}
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.id} className="flex items-center gap-2 shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-[#A0A8B4]" />
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`font-medium transition-colors cursor-pointer hover:underline ${
                    isLast ? "text-[#20252A] font-semibold" : "text-[#6A7282]"
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload Document directly into current view */}
        <label className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#F8F9F7] border border-[#D9DDD9] hover:bg-[#EAECE8] text-[11px] font-medium text-[#464D59] transition-all cursor-pointer shrink-0">
          <Upload className="w-3 h-3 text-[#6A7282]" />
          <span className="hidden sm:inline">Upload File</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* --------------------------------------------------------- */}
      {/* Search, Filter Pills & Sort Bar */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A7282]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari folder, dokumen, catatan, atau isi materi..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#D9DDD9] text-xs text-[#20252A] placeholder-[#8F96A3] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7] transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F96A3] hover:text-[#20252A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#D9DDD9] text-[11px] font-medium text-[#6A7282] shrink-0">
            {(
              [
                { key: "ALL", label: "Semua" },
                { key: "FOLDER", label: "Folder" },
                { key: "NOTE", label: "Catatan" },
                { key: "DOCUMENT", label: "Dokumen" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterType(item.key)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === item.key
                    ? "bg-[#08BFD7]/10 text-[#08BFD7] font-semibold"
                    : "hover:text-[#20252A]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-xl border border-[#D9DDD9] text-[11px] font-medium text-[#464D59] shrink-0">
            <ArrowUpDown className="w-3 h-3 text-[#6A7282]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
              <option value="A_Z">A - Z</option>
              <option value="Z_A">Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* Drag & Drop Hint Banner */}
      {/* --------------------------------------------------------- */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9]/70 text-[11px] text-[#6A7282]">
        <Sparkles className="w-3.5 h-3.5 text-[#08BFD7] shrink-0" />
        <span>
          <strong>Tips OS:</strong> Anda dapat menyeret (drag & drop) catatan, dokumen, atau subfolder langsung ke atas folder tujuan untuk memindahkannya seketika.
        </span>
      </div>

      {/* --------------------------------------------------------- */}
      {/* SECTION: FOLDERS */}
      {/* --------------------------------------------------------- */}
      {(filterType === "ALL" || filterType === "FOLDER") && filteredFolders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
              Folder ({filteredFolders.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredFolders.map((folder) => {
              const childFoldersCount = folders.filter((f) => f.parentId === folder.id).length;
              const childNotesCount = learnings.filter((n) => n.folderId === folder.id).length;
              const childDocsCount = documents.filter((d) => d.folderId === folder.id).length;
              const totalInside = childFoldersCount + childNotesCount + childDocsCount;
              const isDragTarget = dragOverFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "folder", folder.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(folder.id);
                  }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => handleFolderDrop(folder.id, e)}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`group relative p-3.5 rounded-xl bg-white border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md ${
                    isDragTarget
                      ? "border-[#08BFD7] ring-2 ring-[#08BFD7]/30 bg-[#08BFD7]/5 scale-[1.02]"
                      : "border-[#D9DDD9] hover:border-[#08BFD7]/60 hover:bg-[#FAFBF9]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Folder className="w-4 h-4 fill-[#C8A96B]/20" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#20252A] truncate">
                        <HighlightText text={folder.name} query={debouncedQuery} />
                      </p>
                      <p className="text-[10px] text-[#6A7282] mt-0.5">
                        {totalInside === 0 ? "Kosong" : `${totalInside} item`}
                      </p>
                    </div>
                  </div>

                  {/* "..." Action Menu Button */}
                  <div
                    className="relative shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    ref={openMenuId === folder.id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
                      className="p-1.5 rounded-lg text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
                      title="Menu Aksi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === folder.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[#D9DDD9] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenRenameFolder(folder)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#08BFD7]" />
                          <span>Ubah Nama</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMoveFolder(folder)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Move className="w-3.5 h-3.5 text-[#C8A96B]" />
                          <span>Pindahkan</span>
                        </button>
                        <div className="my-1 border-t border-[#F0F2EE]" />
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteFolder(folder)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* SECTION: DOCUMENTS (FILES) */}
      {/* --------------------------------------------------------- */}
      {(filterType === "ALL" || filterType === "DOCUMENT") && filteredDocs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
              Dokumen & File ({filteredDocs.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredDocs.map((doc) => {
              return (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "document", doc.id)}
                  onClick={() => setPreviewDoc(doc)}
                  className="group relative p-3.5 rounded-xl bg-white border border-[#D9DDD9] hover:border-[#08BFD7]/60 hover:bg-[#FAFBF9] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#20252A] truncate">
                        <HighlightText text={doc.name} query={debouncedQuery} />
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F4F5F2] text-[#6A7282] border border-[#EAECE8]">
                          {doc.fileType}
                        </span>
                        <span className="text-[10px] text-[#8F96A3]">{doc.fileSize || "1 KB"}</span>
                      </div>
                    </div>
                  </div>

                  {/* "..." Action Menu */}
                  <div
                    className="relative shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    ref={openMenuId === doc.id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      className="p-1.5 rounded-lg text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
                      title="Menu Aksi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === doc.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[#D9DDD9] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setPreviewDoc(doc);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#08BFD7]" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            triggerFileDownload(doc.name, doc.content || "");
                            showOrbitToast(`Mengunduh ${doc.name}`);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#059669]" />
                          <span>Unduh File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRenameDocument(doc)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#6A7282]" />
                          <span>Ubah Nama</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMoveDocument(doc)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Move className="w-3.5 h-3.5 text-[#C8A96B]" />
                          <span>Pindahkan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateDocument(doc)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>Duplikasi</span>
                        </button>
                        <div className="my-1 border-t border-[#F0F2EE]" />
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteDocument(doc)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* SECTION: LEARNING NOTES */}
      {/* --------------------------------------------------------- */}
      {(filterType === "ALL" || filterType === "NOTE") && filteredNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
              Catatan Pembelajaran ({filteredNotes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredNotes.map((note) => {
              return (
                <div
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "note", note.id)}
                  onClick={() => setSelectedNote(note)}
                  className="group relative p-4 rounded-xl bg-white border border-[#D9DDD9] hover:border-[#08BFD7]/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-[#20252A] leading-snug line-clamp-1">
                          <HighlightText text={note.topic} query={debouncedQuery} />
                        </h3>
                      </div>

                      {/* "..." Action Menu */}
                      <div
                        className="relative shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        ref={openMenuId === note.id ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                          className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
                          title="Menu Aksi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === note.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[#D9DDD9] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedNote(note);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#08BFD7]" />
                              <span>Lihat Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRenameNote(note)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#6A7282]" />
                              <span>Ubah Judul</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenMoveNote(note)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                            >
                              <Move className="w-3.5 h-3.5 text-[#C8A96B]" />
                              <span>Pindahkan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateNote(note)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] transition-colors text-left cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#8B5CF6]" />
                              <span>Duplikasi</span>
                            </button>
                            <div className="my-1 border-t border-[#F0F2EE]" />
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteNote(note)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Takeaway / Content Snippet */}
                    <p className="text-xs text-[#6A7282] mt-2.5 line-clamp-2 leading-relaxed">
                      <HighlightText text={note.understood} query={debouncedQuery} />
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-4 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-[11px] text-[#8F96A3]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{note.date}</span>
                    </div>
                    {note.source && (
                      <span className="truncate max-w-[140px] text-[#6A7282] italic">
                        {note.source}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* EMPTY STATES */}
      {/* --------------------------------------------------------- */}
      {filteredFolders.length === 0 && filteredDocs.length === 0 && filteredNotes.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#D9DDD9] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center mx-auto">
            {debouncedQuery ? <Search className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#20252A]">
              {debouncedQuery
                ? `Tidak ada hasil untuk "${searchInput}"`
                : currentFolder
                ? `Folder "${currentFolder.name}" masih kosong`
                : "Belum ada materi pembelajaran"}
            </h3>
            <p className="text-xs text-[#6A7282] max-w-md mx-auto mt-1 leading-relaxed">
              {debouncedQuery
                ? "Coba gunakan kata kunci lain atau bersihkan pencarian untuk melihat seluruh arsip pengetahuan."
                : currentFolder
                ? "Mulai simpan pemahaman Anda di folder ini dengan menambahkan catatan baru atau membuat dokumen."
                : "Mulailah mencatat hal penting yang Anda pelajari hari ini atau susun materi ke dalam folder."}
            </p>
          </div>

          {debouncedQuery ? (
            <button
              onClick={() => setSearchInput("")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#08BFD7] bg-[#08BFD7]/10 hover:bg-[#08BFD7]/20 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bersihkan Pencarian</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setNewTopic("");
                  setNewUnderstood("");
                  setNewSource("");
                  setIsCreatingNote(true);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] transition-all cursor-pointer shadow-xs"
              >
                + Tambah Pelajaran
              </button>
              <button
                onClick={() => {
                  setNewDocName("");
                  setNewDocContent("");
                  setIsCreatingDoc(true);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#20252A] bg-[#F8F9F7] border border-[#D9DDD9] hover:bg-[#EAECE8] transition-all cursor-pointer"
              >
                + Buat Dokumen
              </button>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: CREATE FOLDER */}
      {/* --------------------------------------------------------- */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#C8A96B]" />
                <h3 className="text-sm font-semibold text-[#20252A]">Folder Baru</h3>
              </div>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5 mt-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1.5">
                  Nama Folder
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: Pemrograman, Bahasa Inggris..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                />
              </div>

              {currentFolder && (
                <div className="p-2 rounded-lg bg-[#F8F9F7] text-[11px] text-[#6A7282]">
                  Lokasi: <span className="font-medium text-[#20252A]">{currentFolder.name}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] cursor-pointer shadow-xs"
                >
                  Buat Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: CREATE DOCUMENT */}
      {/* --------------------------------------------------------- */}
      {isCreatingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-[#08BFD7]" />
                <h3 className="text-sm font-semibold text-[#20252A]">Buat Dokumen Baru</h3>
              </div>
              <button
                onClick={() => setIsCreatingDoc(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 mt-3.5 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                    Nama File
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="catatan-kuliah"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                    Format
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] cursor-pointer"
                  >
                    <option value="txt">.txt (Teks)</option>
                    <option value="md">.md (Markdown)</option>
                    <option value="json">.json (Data)</option>
                    <option value="ts">.ts (TypeScript)</option>
                    <option value="py">.py (Python)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Isi Dokumen
                </label>
                <textarea
                  rows={8}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Tuliskan isi teks, rangkuman, kode, atau sintaks di sini..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs font-mono text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsCreatingDoc(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] cursor-pointer shadow-xs"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: CREATE LEARNING NOTE */}
      {/* --------------------------------------------------------- */}
      {isCreatingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#08BFD7]" />
                <h3 className="text-sm font-semibold text-[#20252A]">Tambah Pelajaran Baru</h3>
              </div>
              <button
                onClick={() => setIsCreatingNote(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5 mt-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Topik / Konsep Utama
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Contoh: Async Await di Node.js, Formula IRR..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Pemahaman Utama (What You Understood)
                </label>
                <textarea
                  rows={4}
                  required
                  value={newUnderstood}
                  onChange={(e) => setNewUnderstood(e.target.value)}
                  placeholder="Jelaskan dengan kata-kata sendiri apa inti dari konsep ini..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Sumber Materi (Opsional)
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Buku, Dokumentasi, YouTube, Artikel..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] focus:ring-1 focus:ring-[#08BFD7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] cursor-pointer shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: DOCUMENT PREVIEW */}
      {/* --------------------------------------------------------- */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <FileCode className="w-5 h-5 text-[#08BFD7] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#20252A] truncate">{previewDoc.name}</h3>
                  <p className="text-[11px] text-[#6A7282]">
                    Format: {previewDoc.fileType.toUpperCase()} · Ukuran: {previewDoc.fileSize || "1 KB"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    triggerFileDownload(previewDoc.name, previewDoc.content || "");
                    showOrbitToast(`Mengunduh ${previewDoc.name}`);
                  }}
                  className="p-1.5 rounded-lg text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors"
                  title="Unduh File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-[#6A7282] hover:text-[#20252A] hover:bg-[#F4F5F2] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="my-3 overflow-y-auto flex-1 p-3 rounded-xl bg-[#F8F9F7] border border-[#EAECE8]">
              <pre className="text-xs font-mono text-[#20252A] whitespace-pre-wrap break-words leading-relaxed">
                {previewDoc.content || "(File ini kosong)"}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F0F2EE] text-xs">
              <span className="text-[11px] text-[#8F96A3]">
                Dibuat: {new Date(previewDoc.createdAt).toLocaleDateString("id-ID")}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#20252A] bg-[#F4F5F2] hover:bg-[#EAECE8]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: NOTE DETAIL */}
      {/* --------------------------------------------------------- */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#08BFD7]" />
                <h3 className="text-sm font-semibold text-[#20252A]">Detail Pembelajaran</h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 overflow-y-auto flex-1 space-y-4 pr-1">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#08BFD7] bg-[#08BFD7]/10 px-2 py-0.5 rounded-md">
                  Topik
                </span>
                <h2 className="text-base font-semibold text-[#20252A] mt-1.5">
                  {selectedNote.topic}
                </h2>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#6A7282]">
                  Pemahaman & Rangkuman
                </span>
                <p className="text-xs text-[#333A44] bg-[#F8F9F7] p-3 rounded-xl border border-[#EAECE8] mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.understood}
                </p>
              </div>

              {selectedNote.source && (
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#6A7282]">
                    Sumber
                  </span>
                  <p className="text-xs text-[#20252A] mt-0.5">{selectedNote.source}</p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-[#8F96A3]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tanggal Belajar: {selectedNote.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F2EE]">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#20252A] bg-[#F4F5F2] hover:bg-[#EAECE8]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* REUSABLE DIALOGS: CONFIRM, RENAME, MOVE */}
      {/* --------------------------------------------------------- */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen}
        onClose={() => setConfirmDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialogState.onConfirm}
        title={confirmDialogState.title}
        description={confirmDialogState.description}
      />

      <RenameDialog
        isOpen={renameDialogState.isOpen}
        onClose={() => setRenameDialogState((prev) => ({ ...prev, isOpen: false }))}
        onRename={renameDialogState.onRename}
        title={renameDialogState.title}
        initialValue={renameDialogState.initialValue}
      />

      <MoveDialog
        isOpen={moveDialogState.isOpen}
        onClose={() => setMoveDialogState((prev) => ({ ...prev, isOpen: false }))}
        onMove={moveDialogState.onMove}
        itemName={moveDialogState.itemName}
        itemType={moveDialogState.itemType}
        currentFolderId={moveDialogState.currentFolderId}
        movingFolderId={moveDialogState.movingFolderId}
        folders={folders}
      />
    </div>
  );
}
