"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowLeft,
  ArrowRight,
  X,
  Trash2,
  Upload,
  Link as LinkIcon,
  Search,
  Maximize2,
  File,
  FilePlus,
  Download,
  Eye,
  FileCode,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export interface LearningMedia {
  id: string;
  type: "photo" | "video" | "file";
  url: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  content?: string; // Text content if created directly
}

export interface LearningFolder {
  id: string;
  name: string;
  createdAt: string;
  parentId?: string | null;
}

// Helper to recursively collect all descendant folder IDs (for cascade delete)
function getAllDescendantFolderIds(folderId: string, allFolders: LearningFolder[]): string[] {
  const children = allFolders.filter((f) => f.parentId === folderId);
  return [folderId, ...children.flatMap((c) => getAllDescendantFolderIds(c.id, allFolders))];
}

// Helper to get full breadcrumb path from root down to current folder
function getBreadcrumbPath(startId: string | null, allFolders: LearningFolder[]): LearningFolder[] {
  const path: LearningFolder[] = [];
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

// Helper to get formatted full path name of a folder (e.g. "Root / Folder A / Folder B")
function getFolderFullPath(folder: LearningFolder, allFolders: LearningFolder[]): string {
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

export interface LearningItem {
  id: string;
  topic: string;
  date: string;
  understood: string;
  source?: string;
  folderId?: string | null;
  media?: LearningMedia[];
  relatedActivity?: string;
  relatedGoal?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to extract YouTube embed URL if applicable
function getEmbedVideoUrl(url: string): string | null {
  try {
    if (url.includes("youtube.com/watch")) {
      const parsed = new URL(url);
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      const id = parts[1]?.split(/[?#]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function LearningPage() {
  const { t } = useLanguage();

  // State
  const [folders, setFolders] = useState<LearningFolder[]>([]);
  const [learnings, setLearnings] = useState<LearningItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedLearning, setSelectedLearning] = useState<LearningItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [filePreviewModal, setFilePreviewModal] = useState<{ title: string; content: string } | null>(null);

  // Form states - Folder
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  // Form states - Note
  const [newTopic, setNewTopic] = useState("");
  const [newUnderstood, setNewUnderstood] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newFolderId, setNewFolderId] = useState<string | null>(null);
  const [newMediaList, setNewMediaList] = useState<LearningMedia[]>([]);

  // Media input sub-states
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [activeMediaTab, setActiveMediaTab] = useState<"photo" | "video" | "file">("photo");

  // Custom File Creator sub-state
  const [newCustomFileName, setNewCustomFileName] = useState("");
  const [newCustomFileContent, setNewCustomFileContent] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFolders = localStorage.getItem("orbit_learning_folders");
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
      const savedNotes = localStorage.getItem("orbit_learning_notes");
      if (savedNotes) {
        setLearnings(JSON.parse(savedNotes));
      }
    } catch (e) {
      console.error("Failed to load learning data from localStorage", e);
    }
  }, []);

  // Save folders to localStorage
  const saveFoldersToStorage = (updated: LearningFolder[]) => {
    setFolders(updated);
    try {
      localStorage.setItem("orbit_learning_folders", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save folders", e);
    }
  };

  // Save notes to localStorage
  const saveNotesToStorage = (updated: LearningItem[]) => {
    setLearnings(updated);
    try {
      localStorage.setItem("orbit_learning_notes", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save notes", e);
    }
  };

  // Open Create Folder Modal with designated parent
  const handleOpenCreateFolder = (parentId: string | null = currentFolderId) => {
    setNewFolderName("");
    setNewFolderParentId(parentId);
    setIsCreatingFolder(true);
  };

  // Create Folder (supports nested parentId)
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folder: LearningFolder = {
      id: `fld_${Date.now()}`,
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
      parentId: newFolderParentId ?? currentFolderId ?? null,
    };
    const updated = [...folders, folder];
    saveFoldersToStorage(updated);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  // Delete Folder (cascade deletes nested subfolders and reassigns orphaned notes)
  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t.learning.deleteFolderConfirm)) return;

    const idsToDelete = new Set(getAllDescendantFolderIds(folderId, folders));
    const updatedFolders = folders.filter((f) => !idsToDelete.has(f.id));
    saveFoldersToStorage(updatedFolders);

    // Reassign orphaned notes inside deleted folders to root (null)
    const updatedNotes = learnings.map((n) =>
      n.folderId && idsToDelete.has(n.folderId) ? { ...n, folderId: null } : n
    );
    saveNotesToStorage(updatedNotes);

    if (currentFolderId && idsToDelete.has(currentFolderId)) {
      const targetFolder = folders.find((f) => f.id === folderId);
      setCurrentFolderId(targetFolder?.parentId || null);
    }
  };

  // Handle Photo File Upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewMediaList((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: "photo",
            url: reader.result as string,
            caption: file.name,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Photo URL Add
  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setNewMediaList((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: "photo",
        url: photoUrlInput.trim(),
      },
    ]);
    setPhotoUrlInput("");
  };

  // Handle Video File Upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewMediaList((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: "video",
            url: reader.result as string,
            caption: file.name,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Video URL Add
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setNewMediaList((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: "video",
        url: videoUrlInput.trim(),
      },
    ]);
    setVideoUrlInput("");
  };

  // Handle Document File Upload (PDF, Word, Code, TXT, etc.)
  const handleGenericFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = formatFileSize(file.size);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewMediaList((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: "file",
            url: reader.result as string,
            fileName: file.name,
            fileSize: sizeStr,
            caption: file.name,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Creating a Custom Document File directly in the app
  const handleAddCustomCreatedFile = () => {
    if (!newCustomFileName.trim()) return;
    const fileName = newCustomFileName.trim();
    const content = newCustomFileContent;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const sizeStr = formatFileSize(blob.size);
    const url = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

    setNewMediaList((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: "file",
        url,
        fileName,
        fileSize: sizeStr,
        content,
        caption: fileName,
      },
    ]);

    setNewCustomFileName("");
    setNewCustomFileContent("");
  };

  // Remove media attachment before saving
  const handleRemoveMedia = (id: string) => {
    setNewMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  // Open note creation modal
  const handleOpenCreateNote = (focusFileTab: boolean = false) => {
    setNewFolderId(currentFolderId);
    setNewTopic("");
    setNewUnderstood("");
    setNewSource("");
    setNewMediaList([]);
    setPhotoUrlInput("");
    setVideoUrlInput("");
    setNewCustomFileName("");
    setNewCustomFileContent("");
    setActiveMediaTab(focusFileTab ? "file" : "photo");
    setIsCreatingNote(true);
  };

  // Save new note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const item: LearningItem = {
      id: `l_${Date.now()}`,
      topic: newTopic.trim(),
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      understood: newUnderstood.trim(),
      source: newSource.trim() || undefined,
      folderId: newFolderId || null,
      media: newMediaList.length > 0 ? newMediaList : undefined,
    };

    const updated = [item, ...learnings];
    saveNotesToStorage(updated);

    setIsCreatingNote(false);
    setNewTopic("");
    setNewUnderstood("");
    setNewSource("");
    setNewMediaList([]);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const updated = learnings.filter((l) => l.id !== id);
    saveNotesToStorage(updated);
    setSelectedLearning(null);
  };

  // Current folder details and breadcrumb path
  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const breadcrumbPath = getBreadcrumbPath(currentFolderId, folders);

  // Immediate child folders in the current view
  const currentChildFolders = folders.filter((f) =>
    currentFolderId === null
      ? !f.parentId || f.parentId === null
      : f.parentId === currentFolderId
  );

  // Filter notes based on folder and search query
  const filteredNotes = learnings.filter((item) => {
    const matchesFolder = currentFolderId ? item.folderId === currentFolderId : true;
    const matchesSearch = searchQuery
      ? item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.understood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Lightbox Modal for Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface border border-line text-main hover:bg-surface-elevated cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-line shadow-2xl"
          />
        </div>
      )}

      {/* Text File Preview Modal */}
      {filePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setFilePreviewModal(null)}
        >
          <div
            className="w-full max-w-2xl bg-surface border border-line rounded-xl shadow-2xl p-6 text-main max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-main">{filePreviewModal.title}</h3>
              </div>
              <button
                onClick={() => setFilePreviewModal(null)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-canvas rounded-lg border border-border-subtle mt-4 overflow-y-auto flex-1 font-mono text-xs text-sub leading-relaxed whitespace-pre-wrap">
              {filePreviewModal.content}
            </div>
          </div>
        </div>
      )}

      {selectedLearning ? (
        /* DETAIL VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedLearning(null)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-main transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.learning.backToLearning}</span>
          </button>

          <div className="p-6 rounded-xl bg-surface border border-line space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
              <div>
                {selectedLearning.folderId && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-accent bg-accent/10 px-2 py-0.5 rounded-full mb-2 font-medium">
                    <Folder className="w-3 h-3" />
                    {folders.find((f) => f.id === selectedLearning.folderId)?.name || "Folder"}
                  </span>
                )}
                <h1 className="text-xl font-semibold text-main">{selectedLearning.topic}</h1>
                <p className="text-xs font-mono text-dim mt-1">{selectedLearning.date}</p>
              </div>

              <button
                onClick={() => handleDeleteNote(selectedLearning.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.common.delete}</span>
              </button>
            </div>

            {/* What I Understood */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-2">
                {t.learning.whatUnderstood}
              </h2>
              <div className="p-4 rounded-lg bg-canvas border border-border-subtle text-xs text-sub leading-relaxed whitespace-pre-line font-sans">
                {selectedLearning.understood || "—"}
              </div>
            </div>

            {/* Source */}
            {selectedLearning.source && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
                  {t.learning.sourceContext}
                </h2>
                <p className="text-xs text-main bg-canvas/50 p-2.5 rounded-lg border border-border-subtle">
                  {selectedLearning.source}
                </p>
              </div>
            )}

            {/* Attached Photos & Videos Gallery */}
            {selectedLearning.media &&
              selectedLearning.media.filter((m) => m.type !== "file").length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
                    {t.learning.mediaGallery}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedLearning.media
                      .filter((m) => m.type !== "file")
                      .map((item) => {
                        if (item.type === "photo") {
                          return (
                            <div
                              key={item.id}
                              onClick={() => setLightboxImage(item.url)}
                              className="group relative rounded-lg overflow-hidden border border-line bg-canvas cursor-pointer hover:border-accent/50 transition-all aspect-video flex items-center justify-center"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.url}
                                alt={item.caption || "Learning photo"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-5 h-5" />
                              </div>
                              {item.caption && (
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-[10px] text-zinc-300 px-2.5 py-1 truncate">
                                  {item.caption}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Video
                          const embedUrl = getEmbedVideoUrl(item.url);
                          return (
                            <div
                              key={item.id}
                              className="rounded-lg overflow-hidden border border-line bg-canvas aspect-video flex flex-col justify-center"
                            >
                              {embedUrl ? (
                                <iframe
                                  src={embedUrl}
                                  title="Video player"
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={item.url}
                                  controls
                                  className="w-full h-full object-contain bg-black"
                                />
                              )}
                              {item.caption && (
                                <div className="bg-surface px-2.5 py-1 text-[10px] text-dim truncate border-t border-border-subtle">
                                  {item.caption}
                                </div>
                              )}
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
              )}

            {/* Attached Documents & Files Section */}
            {selectedLearning.media &&
              selectedLearning.media.filter((m) => m.type === "file").length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-3">
                    {t.learning.attachedFiles}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedLearning.media
                      .filter((m) => m.type === "file")
                      .map((file) => (
                        <div
                          key={file.id}
                          className="p-3 rounded-lg bg-canvas border border-line flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                              <File className="w-4 h-4 text-accent" />
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-medium text-main truncate">
                                {file.fileName || file.caption || "Document"}
                              </h4>
                              {file.fileSize && (
                                <span className="text-[10px] text-dim font-mono">
                                  {file.fileSize}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.content && (
                              <button
                                onClick={() =>
                                  setFilePreviewModal({
                                    title: file.fileName || "File",
                                    content: file.content || "",
                                  })
                                }
                                title="Lihat Isi"
                                className="p-1.5 rounded-md text-dim hover:text-accent hover:bg-surface transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={file.url}
                              download={file.fileName || "download"}
                              title={t.learning.downloadFile}
                              className="p-1.5 rounded-md text-dim hover:text-main hover:bg-surface transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Related Activity / Goal */}
            {(selectedLearning.relatedActivity || selectedLearning.relatedGoal) && (
              <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedLearning.relatedActivity && (
                  <div>
                    <span className="text-[11px] text-dim block mb-0.5">
                      {t.learning.relatedActivity}
                    </span>
                    <span className="text-xs text-main font-medium">
                      {selectedLearning.relatedActivity}
                    </span>
                  </div>
                )}
                {selectedLearning.relatedGoal && (
                  <div>
                    <span className="text-[11px] text-dim block mb-0.5">
                      {t.learning.relatedGoal}
                    </span>
                    <span className="text-xs text-accent font-medium">
                      {selectedLearning.relatedGoal}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MAIN OVERVIEW */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-main">{t.learning.title}</h1>
              <p className="text-xs text-dim mt-0.5">{t.learning.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenCreateFolder(currentFolderId)}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-main hover:text-white transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-accent" />
                <span>{currentFolderId === null ? t.learning.newFolder : t.learning.newSubfolder}</span>
              </button>

              <button
                onClick={() => handleOpenCreateNote(true)}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5 text-accent" />
                <span>{t.learning.createFile}</span>
              </button>

              <button
                onClick={() => handleOpenCreateNote(false)}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.learning.addLearning}</span>
              </button>
            </div>
          </div>

          {/* Breadcrumbs & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <button
                onClick={() => setCurrentFolderId(null)}
                className={`font-medium transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-md ${
                  currentFolderId === null
                    ? "bg-surface-elevated text-main border border-line"
                    : "text-dim hover:text-main"
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-accent" />
                <span>{t.learning.rootFolder}</span>
              </button>

              {breadcrumbPath.map((folder, index) => {
                const isLast = index === breadcrumbPath.length - 1;
                return (
                  <div key={folder.id} className="flex items-center gap-1.5">
                    <span className="text-dim">/</span>
                    {isLast ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated text-main border border-line font-medium">
                        <Folder className="w-3.5 h-3.5 text-accent" />
                        <span>{folder.name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-dim hover:text-main transition-colors cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 opacity-70" />
                        <span>{folder.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`${t.common.all}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Folders & Subfolders Section */}
          {currentChildFolders.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider font-semibold text-dim flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-accent" />
                  <span>{currentFolderId === null ? t.learning.folders : t.learning.subfolders}</span>
                  <span className="text-[10px] text-dim/60 font-mono">({currentChildFolders.length})</span>
                </div>
                <button
                  onClick={() => handleOpenCreateFolder(currentFolderId)}
                  className="text-[11px] font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ {currentFolderId === null ? t.learning.newFolder : t.learning.newSubfolder}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentChildFolders.map((folder) => {
                  const directNotesCount = learnings.filter((l) => l.folderId === folder.id).length;
                  const subfoldersCount = folders.filter((f) => f.parentId === folder.id).length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="group p-3.5 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Folder className="w-4 h-4 text-accent" />
                        </div>
                        <div className="truncate">
                          <h3 className="text-xs font-medium text-main truncate group-hover:text-accent transition-colors">
                            {folder.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-dim">
                            <span>{directNotesCount} {t.learning.fileCount}</span>
                            {subfoldersCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{subfoldersCount} {t.learning.subfolders}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        title={t.common.delete}
                        className="p-1.5 rounded-md text-dim hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / Files Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-dim flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{t.learning.notes}</span>
              <span className="text-[10px] text-dim/60 font-mono">({filteredNotes.length})</span>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface border border-dashed border-border-subtle">
                <p className="text-xs text-dim mb-1">
                  {currentFolderId ? t.learning.emptyFolder : t.learning.noLearnings}
                </p>
                <p className="text-[11px] text-dim/70 mb-4">
                  {currentFolderId ? t.learning.emptyFolderDesc : ""}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenCreateFolder(currentFolderId)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent/40 text-xs font-medium text-accent hover:text-white transition-all cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-accent" />
                    <span>{currentFolderId ? t.learning.createSubfolder : t.learning.newFolder}</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreateNote(false)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.learning.addLearning}</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreateNote(true)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>{t.learning.createFile}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotes.map((item) => {
                  const hasPhotos = item.media?.some((m) => m.type === "photo");
                  const hasVideos = item.media?.some((m) => m.type === "video");
                  const fileCount = item.media?.filter((m) => m.type === "file").length || 0;
                  const itemFolder = folders.find((f) => f.id === item.folderId);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLearning(item)}
                      className="p-4 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium text-main group-hover:text-accent transition-colors">
                              {item.topic}
                            </h3>
                            {itemFolder && currentFolderId === null && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">
                                <Folder className="w-2.5 h-2.5" />
                                {itemFolder.name}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-sub line-clamp-2 leading-relaxed">
                            {item.understood}
                          </p>

                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <span className="text-[11px] font-mono text-dim">{item.date}</span>

                            {item.source && (
                              <span className="text-[11px] text-dim truncate max-w-xs">
                                · {item.source}
                              </span>
                            )}

                            {/* Attached media & file indicators */}
                            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                              {fileCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-mono">
                                  <File className="w-2.5 h-2.5" />
                                  <span>{fileCount} Berkas</span>
                                </span>
                              )}
                              {hasPhotos && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-dim bg-canvas px-1.5 py-0.5 rounded border border-border-subtle">
                                  <ImageIcon className="w-2.5 h-2.5 text-accent" />
                                  <span>Foto</span>
                                </span>
                              )}
                              {hasVideos && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-dim bg-canvas px-1.5 py-0.5 rounded border border-border-subtle">
                                  <Video className="w-2.5 h-2.5 text-rose-400" />
                                  <span>Video</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-dim group-hover:text-main shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* CREATE FOLDER MODAL */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-main">{t.learning.newFolder}</h2>
              </div>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              {/* Folder Location (Parent) */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.folderLocation}
                </label>
                <select
                  value={newFolderParentId || ""}
                  onChange={(e) => setNewFolderParentId(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">📂 {t.learning.rootLocation}</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {getFolderFullPath(f, folders)}
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
                  {t.learning.folderName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.learning.folderPlaceholder}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3 py-2 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {t.learning.createFolder}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NOTE & FILE MODAL */}
      {isCreatingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-line rounded-xl shadow-2xl p-6 text-main my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">{t.learning.addLearning}</h2>
              <button
                onClick={() => setIsCreatingNote(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.selectFolder}
                </label>
                <select
                  value={newFolderId || ""}
                  onChange={(e) => setNewFolderId(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">📂 {t.learning.noFolder}</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {getFolderFullPath(f, folders)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Title */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.topic} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Server Components, Clean Architecture"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              {/* What I Understood */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.whatUnderstood}
                </label>
                <textarea
                  rows={3}
                  placeholder="Takeaways, mental models, or core insights..."
                  value={newUnderstood}
                  onChange={(e) => setNewUnderstood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-medium text-sub mb-1">
                  {t.learning.sourceContext} ({t.common.optional})
                </label>
                <input
                  type="text"
                  placeholder="e.g. Book, Documentation, Video Course"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                />
              </div>

              {/* Attach Media & Files Section */}
              <div className="pt-2 border-t border-border-subtle space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-medium text-sub">
                    Lampirkan Media & Berkas
                  </label>
                  <div className="flex items-center gap-1 bg-canvas p-0.5 rounded-lg border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab("photo")}
                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                        activeMediaTab === "photo"
                          ? "bg-accent text-white"
                          : "text-dim hover:text-main"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {t.learning.addPhoto}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab("video")}
                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                        activeMediaTab === "video"
                          ? "bg-accent text-white"
                          : "text-dim hover:text-main"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {t.learning.addVideo}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab("file")}
                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                        activeMediaTab === "file"
                          ? "bg-accent text-white"
                          : "text-dim hover:text-main"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {t.learning.addFile}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Photo Input Tab */}
                {activeMediaTab === "photo" && (
                  <div className="p-3 rounded-lg bg-canvas border border-border-subtle space-y-2.5">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-line hover:border-accent/40 text-xs text-main hover:text-accent cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-dim">or</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3 h-3 text-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="https://example.com/photo.png"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          className="w-full pl-7 pr-2.5 py-1.5 rounded-md bg-surface border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        disabled={!photoUrlInput.trim()}
                        className="px-3 py-1.5 rounded-md bg-surface-elevated border border-border-subtle text-xs text-main hover:border-line disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Input Tab */}
                {activeMediaTab === "video" && (
                  <div className="p-3 rounded-lg bg-canvas border border-border-subtle space-y-2.5">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-line hover:border-accent/40 text-xs text-main hover:text-accent cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-dim">or</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3 h-3 text-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="YouTube link or MP4 URL"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          className="w-full pl-7 pr-2.5 py-1.5 rounded-md bg-surface border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVideoUrl}
                        disabled={!videoUrlInput.trim()}
                        className="px-3 py-1.5 rounded-md bg-surface-elevated border border-border-subtle text-xs text-main hover:border-line disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* File & Document Input Tab */}
                {activeMediaTab === "file" && (
                  <div className="p-3 rounded-lg bg-canvas border border-border-subtle space-y-3">
                    {/* Option 1: Upload Existing File from computer */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-sub block">
                        1. {t.learning.uploadFile} (PDF, DOC, TXT, MD, Code, ZIP, dll)
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-line hover:border-accent/40 text-xs text-main hover:text-accent cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        <span>Pilih Berkas dari Perangkat</span>
                        <input
                          type="file"
                          onChange={handleGenericFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="border-t border-border-subtle pt-2.5 space-y-2">
                      <span className="text-[11px] font-medium text-sub block">
                        2. {t.learning.createFile} (Ketik Dokumen / Kode Langsung)
                      </span>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={t.learning.filePlaceholder}
                          value={newCustomFileName}
                          onChange={(e) => setNewCustomFileName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md bg-surface border border-line text-xs text-main placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                        <textarea
                          rows={2}
                          placeholder={t.learning.fileContent}
                          value={newCustomFileContent}
                          onChange={(e) => setNewCustomFileContent(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md bg-surface border border-line text-xs font-mono text-main placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCreatedFile}
                          disabled={!newCustomFileName.trim()}
                          className="px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          + Tambahkan Dokumen File Ini
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attached Media & Files Previews */}
                {newMediaList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] text-dim font-medium">
                      Lampiran Terpilih ({newMediaList.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {newMediaList.map((m) => (
                        <div
                          key={m.id}
                          className="group relative rounded-lg border border-line bg-canvas overflow-hidden p-2 flex items-center gap-2"
                        >
                          {m.type === "photo" ? (
                            <div className="w-8 h-8 rounded bg-black/40 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.url}
                                alt="Attachment"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : m.type === "video" ? (
                            <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0">
                              <Video className="w-4 h-4 text-rose-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                              <File className="w-4 h-4 text-accent" />
                            </div>
                          )}

                          <div className="truncate flex-1 min-w-0">
                            <span className="text-[10px] text-main font-medium block truncate">
                              {m.fileName || m.caption || (m.type === "photo" ? "Foto" : "Video")}
                            </span>
                            {m.fileSize && (
                              <span className="text-[9px] text-dim font-mono block">
                                {m.fileSize}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(m.id)}
                            className="p-1 rounded text-dim hover:text-rose-400 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-3 py-2 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!newTopic.trim()}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {t.quickAdd.saveLearning}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
