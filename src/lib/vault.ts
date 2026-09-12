"use client";

export interface VaultFolder {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  parentId?: string | null;
}

export interface VaultItem {
  id: string;
  folderId: string;
  title: string;
  type: "file" | "note" | "credential";
  content?: string; // Text content or Base64 Data URL
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  username?: string;
  secret?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const VAULT_PASSWORD_KEY = "orbit_vault_password";
export const VAULT_FOLDERS_KEY = "orbit_vault_folders";
export const VAULT_ITEMS_KEY = "orbit_vault_items";
export const VAULT_SESSION_KEY = "orbit_vault_unlocked";
export const VAULT_CHANGE_EVENT = "orbit_vault_changed";

export const DEFAULT_VAULT_PASSWORD = "Fatih190110";

export const FOLDER_COLORS = [
  { name: "Cyan", value: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)" },
  { name: "Sky", value: "#0284c7", bg: "rgba(2, 132, 199, 0.12)", border: "rgba(2, 132, 199, 0.3)" },
  { name: "Indigo", value: "#6366f1", bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.3)" },
  { name: "Emerald", value: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)" },
  { name: "Amber", value: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" },
  { name: "Rose", value: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.3)" },
  { name: "Purple", value: "#a855f7", bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.3)" },
];

export function getVaultPassword(): string {
  if (typeof window === "undefined") return DEFAULT_VAULT_PASSWORD;
  try {
    const saved = localStorage.getItem(VAULT_PASSWORD_KEY);
    return saved || DEFAULT_VAULT_PASSWORD;
  } catch {
    return DEFAULT_VAULT_PASSWORD;
  }
}

export function setVaultPassword(newPassword: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(VAULT_PASSWORD_KEY, newPassword);
    return true;
  } catch {
    return false;
  }
}

export function isVaultUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(VAULT_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function unlockVault(password: string): boolean {
  if (typeof window === "undefined") return false;
  const currentPassword = getVaultPassword();
  if (password === currentPassword) {
    try {
      sessionStorage.setItem(VAULT_SESSION_KEY, "true");
      window.dispatchEvent(new CustomEvent(VAULT_CHANGE_EVENT, { detail: { isUnlocked: true } }));
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function lockVault(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(VAULT_CHANGE_EVENT, { detail: { isUnlocked: false } }));
  } catch {}
}

const DEFAULT_FOLDERS: VaultFolder[] = [
  {
    id: "folder-docs",
    name: "Dokumen Rahasia",
    color: "#06b6d4",
    description: "Kumpulan berkas penting, sertifikat, dan identitas pribadi",
    createdAt: new Date().toISOString(),
  },
  {
    id: "folder-notes",
    name: "Catatan Pribadi",
    color: "#6366f1",
    description: "Ide, jurnal rahasia, rencana strategis",
    createdAt: new Date().toISOString(),
  },
];

export function getVaultFolders(): VaultFolder[] {
  if (typeof window === "undefined") return DEFAULT_FOLDERS;
  try {
    const raw = localStorage.getItem(VAULT_FOLDERS_KEY);
    if (!raw) {
      localStorage.setItem(VAULT_FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_FOLDERS;
  } catch {
    return DEFAULT_FOLDERS;
  }
}

export function saveVaultFolders(folders: VaultFolder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VAULT_FOLDERS_KEY, JSON.stringify(folders));
    window.dispatchEvent(new CustomEvent(VAULT_CHANGE_EVENT));
  } catch {}
}

export function createVaultFolder(
  name: string,
  description?: string,
  color?: string,
  parentId?: string | null
): VaultFolder {
  const folders = getVaultFolders();
  const newFolder: VaultFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Folder Baru",
    color: color || FOLDER_COLORS[0].value,
    description: description?.trim() || "",
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
  };
  const updated = [newFolder, ...folders];
  saveVaultFolders(updated);
  return newFolder;
}

export function updateVaultFolder(id: string, data: Partial<VaultFolder>): VaultFolder | null {
  const folders = getVaultFolders();
  let updatedFolder: VaultFolder | null = null;
  const updated = folders.map((f) => {
    if (f.id === id) {
      updatedFolder = { ...f, ...data };
      return updatedFolder;
    }
    return f;
  });
  if (updatedFolder) {
    saveVaultFolders(updated);
  }
  return updatedFolder;
}

export function deleteVaultFolder(id: string): boolean {
  const folders = getVaultFolders();
  const idsToDelete = new Set<string>([id]);
  let added = true;
  while (added) {
    added = false;
    folders.forEach((f) => {
      if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
        idsToDelete.add(f.id);
        added = true;
      }
    });
  }

  const filtered = folders.filter((f) => !idsToDelete.has(f.id));
  saveVaultFolders(filtered);

  // Also remove items in this folder and any subfolders
  const items = getVaultItems();
  const remainingItems = items.filter((item) => !idsToDelete.has(item.folderId));
  saveVaultItems(remainingItems);
  return true;
}

export function getVaultItems(folderId?: string): VaultItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (folderId) {
      return parsed.filter((item: VaultItem) => item.folderId === folderId);
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveVaultItems(items: VaultItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(VAULT_CHANGE_EVENT));
  } catch {}
}

export function createVaultItem(
  item: Omit<VaultItem, "id" | "createdAt">
): VaultItem {
  const items = getVaultItems();
  const newItem: VaultItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...items];
  saveVaultItems(updated);
  return newItem;
}

export function deleteVaultItem(id: string): boolean {
  const items = getVaultItems();
  const filtered = items.filter((item) => item.id !== id);
  saveVaultItems(filtered);
  return true;
}

export function getVaultStats() {
  const folders = getVaultFolders();
  const items = getVaultItems();
  const isUnlocked = isVaultUnlocked();
  return {
    totalFolders: folders.length,
    totalItems: items.length,
    isUnlocked,
  };
}
