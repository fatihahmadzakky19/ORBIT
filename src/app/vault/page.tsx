"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Unlock,
  FolderPlus,
  Folder,
  FileText,
  File,
  FileCode,
  Image as ImageIcon,
  Key,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Plus,
  Check,
  Search,
  ExternalLink,
  MoreVertical,
  X,
  Copy,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  VaultFolder,
  VaultItem,
  FOLDER_COLORS,
  isVaultUnlocked,
  unlockVault,
  lockVault,
  getVaultFolders,
  createVaultFolder,
  deleteVaultFolder,
  updateVaultFolder,
  getVaultItems,
  createVaultItem,
  deleteVaultItem,
  DEFAULT_VAULT_PASSWORD,
} from "@/lib/vault";
import { FadeIn } from "@/components/motion/FadeIn";
import { AnimatedCard } from "@/components/motion/AnimatedCard";

function getVaultBreadcrumbPath(startId: string | null, allFolders: VaultFolder[]): VaultFolder[] {
  const path: VaultFolder[] = [];
  let currId = startId;
  const visited = new Set<string>();
  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const f = allFolders.find((item) => item.id === currId);
    if (!f) break;
    path.unshift(f);
    currId = f.parentId || null;
  }
  return path;
}

function getVaultFolderFullPath(folder: VaultFolder, allFolders: VaultFolder[]): string {
  const parts = [folder.name];
  let curr = folder;
  const visited = new Set<string>([folder.id]);
  while (curr.parentId && !visited.has(curr.parentId)) {
    visited.add(curr.parentId);
    const parent = allFolders.find((p) => p.id === curr.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    curr = parent;
  }
  return parts.join(" / ");
}

export default function VaultPage() {
  const { t } = useLanguage();

  // Authentication State
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Vault Content State
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [isAddCredentialOpen, setIsAddCredentialOpen] = useState(false);
  const [credTitle, setCredTitle] = useState("");
  const [credUsername, setCredUsername] = useState("");
  const [credSecret, setCredSecret] = useState("");
  const [credNote, setCredNote] = useState("");

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check initial unlock state
  useEffect(() => {
    const isAuth = isVaultUnlocked();
    setUnlocked(isAuth);
    if (isAuth) {
      loadVaultData();
    }
  }, []);

  const loadVaultData = () => {
    setFolders(getVaultFolders());
    setItems(getVaultItems());
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingAuth(true);
    setAuthError(false);

    setTimeout(() => {
      const success = unlockVault(passwordInput);
      if (success) {
        setUnlocked(true);
        setPasswordInput("");
        setAuthError(false);
        loadVaultData();
      } else {
        setAuthError(true);
      }
      setIsCheckingAuth(false);
    }, 350);
  };

  const handleLock = () => {
    lockVault();
    setUnlocked(false);
    setSelectedFolderId(null);
    setPreviewItem(null);
  };

  const handleOpenCreateFolder = (parentId: string | null = selectedFolderId) => {
    setNewFolderName("");
    setNewFolderDesc("");
    setNewFolderColor(FOLDER_COLORS[0].value);
    setNewFolderParentId(parentId);
    setIsCreateFolderOpen(true);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createVaultFolder(newFolderName, newFolderDesc, newFolderColor, newFolderParentId ?? selectedFolderId ?? null);
    setFolders(getVaultFolders());
    setNewFolderName("");
    setNewFolderDesc("");
    setIsCreateFolderOpen(false);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (confirm(`Hapus folder "${folderName}" beserta seluruh isinya?`)) {
      deleteVaultFolder(folderId);
      const updated = getVaultFolders();
      setFolders(updated);
      setItems(getVaultItems());
      if (selectedFolderId === folderId || !updated.some((f) => f.id === selectedFolderId)) {
        setSelectedFolderId(null);
      }
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || !noteTitle.trim()) return;

    createVaultItem({
      folderId: selectedFolderId,
      title: noteTitle.trim(),
      type: "note",
      content: noteContent,
    });

    setItems(getVaultItems());
    setNoteTitle("");
    setNoteContent("");
    setIsAddNoteOpen(false);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || !credTitle.trim()) return;

    createVaultItem({
      folderId: selectedFolderId,
      title: credTitle.trim(),
      type: "credential",
      username: credUsername,
      secret: credSecret,
      content: credNote,
    });

    setItems(getVaultItems());
    setCredTitle("");
    setCredUsername("");
    setCredSecret("");
    setCredNote("");
    setIsAddCredentialOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolderId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (localStorage usually limited to 5-10MB)
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran berkas maksimal 3MB untuk penyimpanan lokal terenkripsi.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      createVaultItem({
        folderId: selectedFolderId,
        title: file.name,
        type: "file",
        content: base64Data,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
      setItems(getVaultItems());
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Hapus "${title}" dari brankas privasi?`)) {
      deleteVaultItem(id);
      setItems(getVaultItems());
      if (previewItem?.id === id) {
        setPreviewItem(null);
      }
    }
  };

  const handleDownloadFile = (item: VaultItem) => {
    if (!item.content) return;
    const a = document.createElement("a");
    a.href = item.content;
    a.download = item.fileName || item.title;
    a.click();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);
  const breadcrumbPath = getVaultBreadcrumbPath(selectedFolderId, folders);
  const currentChildFolders = folders.filter((f) =>
    selectedFolderId === null
      ? !f.parentId || f.parentId === null
      : f.parentId === selectedFolderId
  );
  const currentFolderItems = items.filter((item) => {
    if (selectedFolderId) {
      return item.folderId === selectedFolderId;
    }
    return true;
  });

  const filteredItems = currentFolderItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // 1. LOCKED VIEW (Password authentication screen)
  // -------------------------------------------------------------
  if (!unlocked) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <FadeIn direction="up" duration={0.4}>
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface/90 border border-line backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#C5A56A]/[0.05] rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Lock Icon */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-surface-elevated border border-accent/40 shadow-[0_0_25px_rgba(34,211,238,0.2)] flex items-center justify-center text-accent mb-6">
              <Lock className="w-8 h-8 stroke-[1.75]" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400" />
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-main tracking-tight mb-2">
              {t.vault.lockedTitle}
            </h1>
            <p className="text-xs text-sub leading-relaxed mb-6">
              {t.vault.lockedSubtitle}
            </p>

            {/* Password Form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder={t.vault.enterPasswordPlaceholder}
                  autoFocus
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-canvas border text-sm text-main placeholder:text-dim font-mono focus:outline-none transition-all ${
                    authError
                      ? "border-rose-500/80 ring-1 ring-rose-500/30"
                      : "border-line focus:border-accent focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dim hover:text-main p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{t.vault.wrongPassword}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isCheckingAuth || !passwordInput}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium text-sm shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCheckingAuth ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>{t.vault.unlockButton}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-dim">
              <span className="flex items-center gap-1.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                PROTECTED AREA
              </span>
              <span className="font-mono text-sub">ORBIT VAULT v1.0</span>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. UNLOCKED VIEW (Folder & Files Manager)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface/80 border border-line backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-main">{t.vault.title}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {t.vault.unlockedStatus}
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">{t.vault.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick Lock Button */}
          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-rose-500/30 hover:border-rose-500/60 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.vault.lockButton}</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb & Navigation if inside folder */}
      {selectedFolder && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <button
              onClick={() => setSelectedFolderId(null)}
              className="inline-flex items-center gap-1 text-dim hover:text-accent font-medium transition-colors cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{t.vault.folders}</span>
            </button>

            {breadcrumbPath.map((folder, index) => {
              const isLast = index === breadcrumbPath.length - 1;
              return (
                <div key={folder.id} className="flex items-center gap-1.5">
                  <span className="text-dim">/</span>
                  {isLast ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-elevated text-main border border-line font-medium">
                      <Folder className="w-3.5 h-3.5 text-accent" />
                      <span>{folder.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-dim hover:text-main transition-colors cursor-pointer"
                    >
                      <Folder className="w-3.5 h-3.5 opacity-70" />
                      <span>{folder.name}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCreateFolder(selectedFolderId)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-accent transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Sub-Folder Baru</span>
            </button>
            <span className="text-xs font-mono text-dim">
              {currentFolderItems.length} {t.vault.itemsCount}
            </span>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* ROOT VIEW: LIST OF ALL FOLDERS */}
      {/* -------------------------------------------------------- */}
      {!selectedFolderId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-dim flex items-center gap-2">
              <Folder className="w-4 h-4 text-accent" />
              <span>{t.vault.folders}</span>
            </h2>

            <button
              onClick={() => handleOpenCreateFolder(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.vault.createFolder}</span>
            </button>
          </div>

          {currentChildFolders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-line bg-surface/40">
              <FolderPlus className="w-10 h-10 text-dim mx-auto mb-3 opacity-50" />
              <p className="text-xs text-dim mb-4">{t.vault.emptyFolders}</p>
              <button
                onClick={() => handleOpenCreateFolder(null)}
                className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium cursor-pointer"
              >
                {t.vault.createFolder}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentChildFolders.map((folder) => {
                const folderItems = items.filter((item) => item.folderId === folder.id);
                const subfoldersCount = folders.filter((f) => f.parentId === folder.id).length;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="p-5 rounded-xl bg-surface/90 border border-line hover:border-accent/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-200 cursor-pointer group relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: folder.color }}
                    />

                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                      >
                        <Folder className="w-5 h-5 fill-current opacity-80" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, folder.name);
                        }}
                        title="Hapus Folder"
                        className="p-1 text-dim hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-semibold text-main group-hover:text-accent transition-colors truncate">
                      {folder.name}
                    </h3>

                    {folder.description && (
                      <p className="text-xs text-sub mt-1 line-clamp-2 leading-relaxed">
                        {folder.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-dim">
                      <span>{folderItems.length} berkas/catatan</span>
                      <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                        Buka →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* FOLDER DETAIL VIEW: FILES & PRIVATE NOTES */}
      {/* -------------------------------------------------------- */}
      {selectedFolder && (
        <div className="space-y-5">
          {/* Folder Hero Banner */}
          <div className="p-6 rounded-2xl bg-surface border border-line relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: selectedFolder.color }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${selectedFolder.color}20`, color: selectedFolder.color }}
                >
                  <Folder className="w-6 h-6 fill-current opacity-80" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-main">{selectedFolder.name}</h2>
                  <p className="text-xs text-sub mt-0.5">
                    {selectedFolder.description || "Folder berkas dan catatan terenkripsi."}
                  </p>
                </div>
              </div>

              {/* Action Buttons inside Folder */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Upload File Input Hidden */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => handleOpenCreateFolder(selectedFolderId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-accent hover:text-white transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Sub-Folder</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-colors cursor-pointer"
                >
                  <File className="w-3.5 h-3.5" />
                  <span>{t.vault.addFile}</span>
                </button>

                <button
                  onClick={() => setIsAddNoteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.vault.addNote}</span>
                </button>

                <button
                  onClick={() => setIsAddCredentialOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-xs font-medium text-main hover:text-accent transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Kredensial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subfolders in this folder */}
          {currentChildFolders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-dim">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-accent" />
                  <span>Sub-Folder ({currentChildFolders.length})</span>
                </div>
                <button
                  onClick={() => handleOpenCreateFolder(selectedFolderId)}
                  className="text-[11px] font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Sub-Folder Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentChildFolders.map((subfolder) => {
                  const subItemsCount = items.filter((item) => item.folderId === subfolder.id).length;
                  return (
                    <div
                      key={subfolder.id}
                      onClick={() => setSelectedFolderId(subfolder.id)}
                      className="p-3.5 rounded-xl bg-surface/90 border border-line hover:border-accent/50 transition-all duration-200 cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${subfolder.color || "#06b6d4"}20`, color: subfolder.color || "#06b6d4" }}
                        >
                          <Folder className="w-4 h-4 fill-current opacity-80" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-medium text-main truncate group-hover:text-accent transition-colors">
                            {subfolder.name}
                          </h4>
                          <span className="text-[10px] text-dim">
                            {subItemsCount} {t.vault.itemsCount}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(subfolder.id, subfolder.name);
                        }}
                        className="p-1 rounded text-dim hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search bar inside folder */}
          {currentFolderItems.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari file atau catatan dalam folder ini..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-line bg-surface/40">
              <FileText className="w-10 h-10 text-dim mx-auto mb-3 opacity-50" />
              <p className="text-xs text-dim mb-4">{t.vault.emptyFolderItems}</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-main hover:text-accent cursor-pointer"
                >
                  {t.vault.addFile}
                </button>
                <button
                  onClick={() => setIsAddNoteOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium cursor-pointer"
                >
                  {t.vault.addNote}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  className="p-4 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-accent shrink-0 mt-0.5">
                      {item.type === "note" ? (
                        <FileText className="w-4 h-4" />
                      ) : item.type === "credential" ? (
                        <Key className="w-4 h-4 text-amber-400" />
                      ) : item.mimeType?.startsWith("image/") ? (
                        <ImageIcon className="w-4 h-4 text-sky-400" />
                      ) : (
                        <FileCode className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-main group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </div>

                      {item.type === "note" && item.content && (
                        <p className="text-[11px] text-sub line-clamp-2 mt-0.5 leading-relaxed">
                          {item.content}
                        </p>
                      )}

                      {item.type === "credential" && (
                        <p className="text-[11px] font-mono text-dim mt-0.5 truncate">
                          User: {item.username || "-"} · ••••••••
                        </p>
                      )}

                      {item.type === "file" && (
                        <p className="text-[11px] font-mono text-dim mt-0.5">
                          {formatFileSize(item.fileSize)} · {item.fileName}
                        </p>
                      )}

                      <div className="text-[10px] font-mono text-dim mt-2">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.type === "file" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(item);
                        }}
                        title="Unduh Berkas"
                        className="p-1.5 text-dim hover:text-accent transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id, item.title);
                      }}
                      title="Hapus"
                      className="p-1.5 text-dim hover:text-rose-400 transition-colors"
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

      {/* -------------------------------------------------------- */}
      {/* MODAL: CREATE NEW FOLDER */}
      {/* -------------------------------------------------------- */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-main flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-accent" />
                <span>{t.vault.createFolder}</span>
              </h3>
              <button
                onClick={() => setIsCreateFolderOpen(false)}
                className="text-dim hover:text-main p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              {/* Folder Location (Parent) */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Lokasi Folder
                </label>
                <select
                  value={newFolderParentId || ""}
                  onChange={(e) => setNewFolderParentId(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">📂 Direktori Utama (Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {getVaultFolderFullPath(f, folders)}
                    </option>
                  ))}
                </select>
                {newFolderParentId && (
                  <p className="text-[11px] text-accent mt-1 flex items-center gap-1">
                    <span>↳ Folder ini akan berada di dalam:</span>
                    <strong className="underline">{folders.find((f) => f.id === newFolderParentId)?.name}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.vault.folderName} *
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: Dokumen Pajak & Rekening"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.vault.folderDesc}
                </label>
                <textarea
                  rows={2}
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Catatan kecil tentang isi folder ini..."
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1.5">
                  Warna Folder
                </label>
                <div className="flex items-center gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setNewFolderColor(col.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newFolderColor === col.value ? "scale-125 border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs text-sub hover:text-main"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MODAL: CREATE SECRET NOTE */}
      {/* -------------------------------------------------------- */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-surface border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-main flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span>{t.vault.addNote}</span>
              </h3>
              <button
                onClick={() => setIsAddNoteOpen(false)}
                className="text-dim hover:text-main p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.vault.noteTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Contoh: Kode Pemulihan Akun / Ide Rahasia"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.vault.noteContent}
                </label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={t.vault.notePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main font-mono focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs text-sub hover:text-main"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MODAL: ADD CREDENTIAL */}
      {/* -------------------------------------------------------- */}
      {isAddCredentialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-main flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Simpan Kredensial / Akun</span>
              </h3>
              <button
                onClick={() => setIsAddCredentialOpen(false)}
                className="text-dim hover:text-main p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Nama Layanan / Akun *
                </label>
                <input
                  type="text"
                  required
                  value={credTitle}
                  onChange={(e) => setCredTitle(e.target.value)}
                  placeholder="Contoh: GitHub Private Key / Rekening Bank"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Password / Token Rahasia *
                </label>
                <input
                  type="text"
                  required
                  value={credSecret}
                  onChange={(e) => setCredSecret(e.target.value)}
                  placeholder="Kata sandi atau token rahasia"
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={credNote}
                  onChange={(e) => setCredNote(e.target.value)}
                  placeholder="PIN, petunjuk, atau tanggal kedaluwarsa..."
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCredentialOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs text-sub hover:text-main"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  Simpan Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MODAL: PREVIEW ITEM */}
      {/* -------------------------------------------------------- */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col p-6 rounded-2xl bg-surface border border-line shadow-2xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-accent shrink-0">
                  {previewItem.type === "note" ? (
                    <FileText className="w-4 h-4" />
                  ) : previewItem.type === "credential" ? (
                    <Key className="w-4 h-4 text-amber-400" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-main truncate">
                    {previewItem.title}
                  </h3>
                  <p className="text-[10px] font-mono text-dim">
                    {new Date(previewItem.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="text-dim hover:text-main p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 py-1">
              {previewItem.type === "note" && (
                <div className="p-4 rounded-xl bg-canvas border border-line text-xs font-mono text-main whitespace-pre-wrap leading-relaxed">
                  {previewItem.content || "(Catatan kosong)"}
                </div>
              )}

              {previewItem.type === "credential" && (
                <div className="space-y-3 p-4 rounded-xl bg-canvas border border-line text-xs">
                  {previewItem.username && (
                    <div>
                      <span className="text-dim block text-[11px] mb-0.5">Username / Email:</span>
                      <span className="font-mono text-main font-medium">{previewItem.username}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-dim block text-[11px] mb-0.5">Password / Rahasia:</span>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-elevated border border-border-subtle">
                      <span className="font-mono text-accent font-semibold">
                        {previewItem.secret}
                      </span>
                      <button
                        onClick={() => {
                          if (previewItem.secret) {
                            navigator.clipboard.writeText(previewItem.secret);
                            setCopiedSecret(true);
                            setTimeout(() => setCopiedSecret(false), 2000);
                          }
                        }}
                        className="text-xs text-dim hover:text-main flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSecret ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {previewItem.content && (
                    <div className="pt-2 border-t border-border-subtle">
                      <span className="text-dim block text-[11px] mb-0.5">Catatan Tambahan:</span>
                      <p className="text-sub whitespace-pre-wrap">{previewItem.content}</p>
                    </div>
                  )}
                </div>
              )}

              {previewItem.type === "file" && (
                <div className="space-y-4">
                  {previewItem.mimeType?.startsWith("image/") && previewItem.content ? (
                    <div className="rounded-xl overflow-hidden border border-line bg-black/40 flex items-center justify-center max-h-72">
                      <img
                        src={previewItem.content}
                        alt={previewItem.fileName || previewItem.title}
                        className="max-h-72 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl bg-canvas border border-line">
                      <File className="w-12 h-12 text-dim mx-auto mb-2 opacity-60" />
                      <div className="text-xs font-semibold text-main">{previewItem.fileName}</div>
                      <div className="text-[10px] font-mono text-dim mt-1">
                        {formatFileSize(previewItem.fileSize)} · {previewItem.mimeType}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <button
                onClick={() => handleDeleteItem(previewItem.id, previewItem.title)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Item</span>
              </button>

              {previewItem.type === "file" && (
                <button
                  onClick={() => handleDownloadFile(previewItem)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
