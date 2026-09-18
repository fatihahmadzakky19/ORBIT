"use client";

import { getTodayInTimezone } from "@/lib/date";

export const ORBIT_DATA_CHANGED_EVENT = "orbit_data_changed";
export const ORBIT_TOAST_EVENT = "orbit_toast";

export const STORAGE_KEYS = {
  PROFILE: "orbit_profile",
  HABITS: "orbit_habits",
  GOALS: "orbit_goals",
  LEARNING_NOTES: "orbit_learning_notes",
  LEARNING_FOLDERS: "orbit_learning_folders",
  LEARNING_DOCUMENTS: "orbit_learning_documents",
  ACTIVITIES: "orbit_activities",
  FINANCE_TRANSACTIONS: "orbit_finance_transactions",
  FINANCE_CATEGORIES: "orbit_finance_categories",
  FINANCE_ACTUAL_BALANCE: "orbit_finance_actual_balance",
  FINANCE_CALCULATED_BALANCE: "orbit_finance_calculated_balance",
  IBADAH_ACTIVITIES: "orbit_ibadah_activities",
  IBADAH_RECORDS: "orbit_ibadah_records",
  IBADAH_REFLECTIONS: "orbit_ibadah_reflections",
  IBADAH_MODE: "orbit_ibadah_mode",
  IBADAH_TILAWAH: "orbit_ibadah_tilawah",
} as const;

export function notifyDataChanged(moduleName?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ORBIT_DATA_CHANGED_EVENT, { detail: { module: moduleName, timestamp: Date.now() } })
  );
}

export function showOrbitToast(message: string, type: "success" | "error" | "info" = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ORBIT_TOAST_EVENT, { detail: { message, type, timestamp: Date.now() } })
  );
}

// -------------------------------------------------------------
// Activities & Habit Completion
// -------------------------------------------------------------
export interface StoredActivity {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  note?: string;
  habitId?: string;
  createdAt: string;
}

export function addStoredActivity(data: {
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  note?: string;
  habitId?: string;
}): StoredActivity {
  const newActivity: StoredActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const list: StoredActivity[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([newActivity, ...list]));

      // If linked to a habit, or matches a habit name, mark it done for that date
      const rawHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (rawHabits) {
        const habits = JSON.parse(rawHabits);
        if (Array.isArray(habits)) {
          let updated = false;
          const newHabits = habits.map((h: any) => {
            if (h.id === data.habitId || h.name?.toLowerCase() === data.title?.toLowerCase()) {
              updated = true;
              const dates: string[] = Array.isArray(h.completedDates) ? h.completedDates : [];
              if (!dates.includes(data.date)) {
                return {
                  ...h,
                  completedDates: [...dates, data.date],
                  evidence: [
                    ...(h.evidence || []),
                    { date: `${data.date} ${data.time}`, title: data.title, duration: `${data.durationMinutes} min` },
                  ],
                };
              }
            }
            return h;
          });
          if (updated) {
            localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(newHabits));
          }
        }
      }
    } catch (e) {
      console.error("Failed to add stored activity", e);
    }
  }

  notifyDataChanged("activities");
  return newActivity;
}

// -------------------------------------------------------------
// Learning Folders
// -------------------------------------------------------------
export interface StoredFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export function getStoredFolders(): StoredFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_FOLDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredFolders(folders: StoredFolder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING_FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error("Failed to save folders", e);
  }
  notifyDataChanged("learning");
}

export function addStoredFolder(data: { name: string; parentId?: string | null }): StoredFolder {
  const newFolder: StoredFolder = {
    id: `fld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    parentId: data.parentId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = getStoredFolders();
  saveStoredFolders([...list, newFolder]);
  return newFolder;
}

export function renameStoredFolder(id: string, newName: string): boolean {
  const list = getStoredFolders();
  const trimmed = newName.trim();
  if (!trimmed) return false;
  const updated = list.map((f) => (f.id === id ? { ...f, name: trimmed, updatedAt: new Date().toISOString() } : f));
  saveStoredFolders(updated);
  return true;
}

export function moveStoredFolder(id: string, targetParentId: string | null): boolean {
  // Prevent moving into itself
  if (id === targetParentId) return false;
  const list = getStoredFolders();
  const updated = list.map((f) => (f.id === id ? { ...f, parentId: targetParentId, updatedAt: new Date().toISOString() } : f));
  saveStoredFolders(updated);
  return true;
}

export function deleteStoredFolder(id: string): boolean {
  const list = getStoredFolders();
  // Collect all recursive descendant folder ids
  const getDescendants = (fId: string): string[] => {
    const children = list.filter((f) => f.parentId === fId);
    return [fId, ...children.flatMap((c) => getDescendants(c.id))];
  };
  const idsToDelete = new Set(getDescendants(id));
  const remainingFolders = list.filter((f) => !idsToDelete.has(f.id));
  saveStoredFolders(remainingFolders);

  // Reassign or clean orphaned notes
  const notes = getStoredLearnings();
  const updatedNotes = notes.map((n) => (n.folderId && idsToDelete.has(n.folderId) ? { ...n, folderId: null } : n));
  saveStoredLearnings(updatedNotes);

  // Reassign or clean orphaned documents
  const docs = getStoredDocuments();
  const updatedDocs = docs.map((d) => (d.folderId && idsToDelete.has(d.folderId) ? { ...d, folderId: null } : d));
  saveStoredDocuments(updatedDocs);

  return true;
}

// -------------------------------------------------------------
// Learning Documents (Files)
// -------------------------------------------------------------
export interface StoredDocument {
  id: string;
  name: string;
  content?: string;
  fileType: string;
  fileSize?: string;
  folderId?: string | null;
  learningId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export function getStoredDocuments(): StoredDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_DOCUMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDocuments(docs: StoredDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING_DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error("Failed to save documents", e);
  }
  notifyDataChanged("learning");
}

export function addStoredDocument(data: {
  name: string;
  content?: string;
  fileType?: string;
  fileSize?: string;
  folderId?: string | null;
  learningId?: string | null;
}): StoredDocument {
  const docName = data.name.trim();
  const ext = docName.includes(".") ? docName.split(".").pop() || "txt" : data.fileType || "txt";
  const size = data.fileSize || `${Math.max(1, Math.round((data.content?.length || 0) / 1024))} KB`;

  const newDoc: StoredDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: docName,
    content: data.content || "",
    fileType: ext.toLowerCase(),
    fileSize: size,
    folderId: data.folderId || null,
    learningId: data.learningId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = getStoredDocuments();
  saveStoredDocuments([newDoc, ...list]);
  return newDoc;
}

export function renameStoredDocument(id: string, newName: string): boolean {
  const list = getStoredDocuments();
  const trimmed = newName.trim();
  if (!trimmed) return false;
  const updated = list.map((d) => (d.id === id ? { ...d, name: trimmed, updatedAt: new Date().toISOString() } : d));
  saveStoredDocuments(updated);
  return true;
}

export function moveStoredDocument(id: string, targetFolderId: string | null): boolean {
  const list = getStoredDocuments();
  const updated = list.map((d) => (d.id === id ? { ...d, folderId: targetFolderId, updatedAt: new Date().toISOString() } : d));
  saveStoredDocuments(updated);
  return true;
}

export function duplicateStoredDocument(id: string): StoredDocument | null {
  const list = getStoredDocuments();
  const original = list.find((d) => d.id === id);
  if (!original) return null;

  const parts = original.name.split(".");
  const ext = parts.length > 1 ? `.${parts.pop()}` : "";
  const baseName = parts.join(".");
  const copyName = `${baseName} (Salinan)${ext}`;

  const copyDoc: StoredDocument = {
    ...original,
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: copyName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStoredDocuments([copyDoc, ...list]);
  return copyDoc;
}

export function deleteStoredDocument(id: string): boolean {
  const list = getStoredDocuments();
  const updated = list.filter((d) => d.id !== id);
  saveStoredDocuments(updated);
  return true;
}

// -------------------------------------------------------------
// Learnings / Notes
// -------------------------------------------------------------
export interface StoredLearning {
  id: string;
  topic: string;
  understood: string;
  source?: string;
  date: string;
  folderId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export function getStoredLearnings(): StoredLearning[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredLearnings(notes: StoredLearning[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING_NOTES, JSON.stringify(notes));
    localStorage.setItem("orbit_learnings", JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save learning notes", e);
  }
  notifyDataChanged("learning");
}

export function addStoredLearning(data: {
  topic: string;
  understood?: string;
  source?: string;
  date?: string;
  folderId?: string | null;
}): StoredLearning {
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const newLearning: StoredLearning = {
    id: `lrn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    topic: data.topic.trim(),
    understood: (data.understood || "").trim(),
    source: (data.source || "").trim(),
    date: dateStr,
    folderId: data.folderId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = getStoredLearnings();
  saveStoredLearnings([newLearning, ...list]);
  return newLearning;
}

export function renameStoredLearning(id: string, topic: string, understood?: string): boolean {
  const list = getStoredLearnings();
  const trimmed = topic.trim();
  if (!trimmed) return false;
  const updated = list.map((l) =>
    l.id === id
      ? {
          ...l,
          topic: trimmed,
          understood: understood !== undefined ? understood : l.understood,
          updatedAt: new Date().toISOString(),
        }
      : l
  );
  saveStoredLearnings(updated);
  return true;
}

export function moveStoredLearning(id: string, targetFolderId: string | null): boolean {
  const list = getStoredLearnings();
  const updated = list.map((l) => (l.id === id ? { ...l, folderId: targetFolderId, updatedAt: new Date().toISOString() } : l));
  saveStoredLearnings(updated);
  return true;
}

export function duplicateStoredLearning(id: string): StoredLearning | null {
  const list = getStoredLearnings();
  const original = list.find((l) => l.id === id);
  if (!original) return null;

  const copyNote: StoredLearning = {
    ...original,
    id: `lrn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    topic: `${original.topic} (Salinan)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStoredLearnings([copyNote, ...list]);
  return copyNote;
}

export function deleteStoredLearning(id: string): boolean {
  const list = getStoredLearnings();
  const updated = list.filter((l) => l.id !== id);
  saveStoredLearnings(updated);
  return true;
}

// -------------------------------------------------------------
// Finance Transactions & Balances
// -------------------------------------------------------------
export interface StoredTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: string;
  time?: string;
  note?: string;
  goalAllocation?: string;
  createdAt: string;
}

export function getStoredFinanceTransactions(): StoredTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStoredFinanceBalances(): { actual: number; calculated: number } {
  if (typeof window === "undefined") return { actual: 0, calculated: 0 };
  try {
    const act = localStorage.getItem(STORAGE_KEYS.FINANCE_ACTUAL_BALANCE);
    const calc = localStorage.getItem(STORAGE_KEYS.FINANCE_CALCULATED_BALANCE);
    const txs = getStoredFinanceTransactions();
    const net = txs.reduce((sum, tx) => (tx.type === "INCOME" ? sum + tx.amount : sum - tx.amount), 0);

    const actualNum = act !== null ? Number(act) : net;
    const calculatedNum = calc !== null ? Number(calc) : net;

    return {
      actual: isNaN(actualNum) ? 0 : actualNum,
      calculated: isNaN(calculatedNum) ? 0 : calculatedNum,
    };
  } catch {
    return { actual: 0, calculated: 0 };
  }
}

export function addStoredTransaction(data: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  note?: string;
  date?: string;
  time?: string;
  createdAt?: string;
}): StoredTransaction {
  const now = new Date();
  const defaultHours = String(now.getHours()).padStart(2, "0");
  const defaultMinutes = String(now.getMinutes()).padStart(2, "0");
  const autoTime = data.time && data.time.trim() !== "" ? data.time.trim() : `${defaultHours}:${defaultMinutes}`;

  const newTx: StoredTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: data.type,
    amount: data.amount,
    category: data.category,
    date: data.date || "Hari Ini",
    time: autoTime,
    note: data.note || undefined,
    createdAt: data.createdAt || now.toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const txs = getStoredFinanceTransactions();
      const updatedTxs = [newTx, ...txs];
      localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(updatedTxs));

      // Update calculated balance
      const currentBalances = getStoredFinanceBalances();
      const delta = data.type === "INCOME" ? data.amount : -data.amount;
      const newCalc = currentBalances.calculated + delta;
      const newAct = currentBalances.actual === 0 ? newCalc : currentBalances.actual;

      localStorage.setItem(STORAGE_KEYS.FINANCE_CALCULATED_BALANCE, String(newCalc));
      localStorage.setItem(STORAGE_KEYS.FINANCE_ACTUAL_BALANCE, String(newAct));
    } catch (e) {
      console.error("Failed to add stored transaction", e);
    }
  }

  notifyDataChanged("finance");
  return newTx;
}

export function updateStoredTransaction(id: string, data: Partial<StoredTransaction>): boolean {
  if (typeof window === "undefined") return false;
  try {
    const txs = getStoredFinanceTransactions();
    const updatedTxs = txs.map((t) => (t.id === id ? { ...t, ...data } : t));
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(updatedTxs));

    // Recalculate net balance
    const net = updatedTxs.reduce((sum, tx) => (tx.type === "INCOME" ? sum + tx.amount : sum - tx.amount), 0);
    localStorage.setItem(STORAGE_KEYS.FINANCE_CALCULATED_BALANCE, String(net));

    notifyDataChanged("finance");
    return true;
  } catch (e) {
    console.error("Failed to update stored transaction", e);
    return false;
  }
}

export function deleteStoredTransaction(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const txs = getStoredFinanceTransactions();
    const updatedTxs = txs.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(updatedTxs));

    // Recalculate net balance
    const net = updatedTxs.reduce((sum, tx) => (tx.type === "INCOME" ? sum + tx.amount : sum - tx.amount), 0);
    localStorage.setItem(STORAGE_KEYS.FINANCE_CALCULATED_BALANCE, String(net));

    notifyDataChanged("finance");
    return true;
  } catch (e) {
    console.error("Failed to delete stored transaction", e);
    return false;
  }
}

export function saveStoredFinanceBalances(actual?: number, calculated?: number) {
  if (typeof window === "undefined") return;
  try {
    if (actual !== undefined) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_ACTUAL_BALANCE, String(actual));
    }
    if (calculated !== undefined) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_CALCULATED_BALANCE, String(calculated));
    }
  } catch (e) {
    console.error("Failed to save finance balances", e);
  }
  notifyDataChanged("finance");
}

// -------------------------------------------------------------
// Transaction Categories
// -------------------------------------------------------------
export interface StoredCategory {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string;
  color?: string;
  createdAt: string;
}

export const DEFAULT_FINANCE_CATEGORIES: StoredCategory[] = [
  { id: "cat_food", name: "Food & Drink", type: "EXPENSE", icon: "🍜", color: "#F59E0B", createdAt: "2026-01-01" },
  { id: "cat_transport", name: "Transport", type: "EXPENSE", icon: "🚗", color: "#3B82F6", createdAt: "2026-01-01" },
  { id: "cat_bills", name: "Bills & Utilities", type: "EXPENSE", icon: "💡", color: "#EF4444", createdAt: "2026-01-01" },
  { id: "cat_shopping", name: "Shopping", type: "EXPENSE", icon: "🛍️", color: "#EC4899", createdAt: "2026-01-01" },
  { id: "cat_entertainment", name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#8B5CF6", createdAt: "2026-01-01" },
  { id: "cat_health", name: "Health & Care", type: "EXPENSE", icon: "💊", color: "#10B981", createdAt: "2026-01-01" },
  { id: "cat_education", name: "Education", type: "EXPENSE", icon: "📚", color: "#06B6D4", createdAt: "2026-01-01" },
  { id: "cat_salary", name: "Salary", type: "INCOME", icon: "💰", color: "#10B981", createdAt: "2026-01-01" },
  { id: "cat_freelance", name: "Freelance / Projects", type: "INCOME", icon: "💻", color: "#08BFD7", createdAt: "2026-01-01" },
  { id: "cat_investment", name: "Investments", type: "INCOME", icon: "📈", color: "#C8A96B", createdAt: "2026-01-01" },
  { id: "cat_other", name: "Other", type: "EXPENSE", icon: "📦", color: "#64748B", createdAt: "2026-01-01" },
];

export function getStoredCategories(): StoredCategory[] {
  if (typeof window === "undefined") return DEFAULT_FINANCE_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(DEFAULT_FINANCE_CATEGORIES));
      return DEFAULT_FINANCE_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FINANCE_CATEGORIES;
  } catch {
    return DEFAULT_FINANCE_CATEGORIES;
  }
}

export function addStoredCategory(data: {
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string;
  color?: string;
}): StoredCategory {
  const newCat: StoredCategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    type: data.type,
    icon: data.icon || (data.type === "INCOME" ? "💵" : "💸"),
    color: data.color || "#08BFD7",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const cats = getStoredCategories();
      const updated = [...cats, newCat];
      localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add category", e);
    }
  }

  notifyDataChanged("finance");
  return newCat;
}

export function deleteStoredCategory(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const cats = getStoredCategories();
    const updated = cats.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(updated));
    notifyDataChanged("finance");
    return true;
  } catch (e) {
    console.error("Failed to delete category", e);
    return false;
  }
}

// -------------------------------------------------------------
// IBADAH TRACKER (Spiritual Dashboard)
// -------------------------------------------------------------

export type IbadahType = "WAJIB" | "SUNNAH" | "CUSTOM";
export type IbadahMode = "DAILY" | "RAMADHAN" | "BOTH";

export interface StoredIbadahActivity {
  id: string;
  name: string;
  type: IbadahType;
  mode: IbadahMode;
  targetCount: number;
  unit: string;
  order: number;
  isActive?: boolean;
  isCustom: boolean;
  createdAt?: string;
}

export interface StoredQuranReading {
  id: string;
  date: string; // YYYY-MM-DD
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
  createdAt: string;
  updatedAt: string;
}

export interface StoredIbadahRecord {
  id: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count: number;
  notes?: string;
  completedAt?: string;
}

export interface StoredIbadahReflection {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  updatedAt?: string;
}

export const DEFAULT_IBADAH_ACTIVITIES: StoredIbadahActivity[] = [
  // ── Wajib 5 Waktu (Daily & Ramadhan) ──
  { id: "wajib_subuh", name: "Sholat Subuh", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 1, isCustom: false },
  { id: "wajib_dzuhur", name: "Sholat Dzuhur", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 2, isCustom: false },
  { id: "wajib_ashar", name: "Sholat Ashar", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 3, isCustom: false },
  { id: "wajib_maghrib", name: "Sholat Maghrib", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 4, isCustom: false },
  { id: "wajib_isya", name: "Sholat Isya", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 5, isCustom: false },

  // ── Sunnah Harian (Daily) ──
  { id: "sunnah_dhuha", name: "Sholat Dhuha", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 6, isCustom: false },
  { id: "sunnah_tahajud", name: "Sholat Tahajud", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 7, isCustom: false },
  { id: "sunnah_witir", name: "Sholat Witir", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 8, isCustom: false },
  { id: "sunnah_rawatib", name: "Sholat Rawatib", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 9, isCustom: false },
  { id: "sunnah_puasa", name: "Puasa Sunnah", type: "SUNNAH", mode: "DAILY", targetCount: 1, unit: "hari", order: 10, isCustom: false },
  { id: "sunnah_tilawah", name: "Tilawah Al-Qur'an", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "halaman", order: 11, isCustom: false },
  { id: "sunnah_dzikir_pagi", name: "Dzikir Pagi", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 12, isCustom: false },
  { id: "sunnah_dzikir_petang", name: "Dzikir Petang", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 13, isCustom: false },
  { id: "sunnah_sedekah", name: "Sedekah", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 14, isCustom: false },

  // ── Khusus Ramadhan ──
  { id: "ramadhan_puasa", name: "Puasa Ramadhan", type: "WAJIB", mode: "RAMADHAN", targetCount: 1, unit: "hari", order: 15, isCustom: false },
  { id: "ramadhan_sahur", name: "Sahur", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 16, isCustom: false },
  { id: "ramadhan_tarawih", name: "Sholat Tarawih", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 17, isCustom: false },
  { id: "ramadhan_itikaf", name: "I'tikaf di Masjid", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 18, isCustom: false },
  { id: "ramadhan_doa", name: "Doa & Munajat", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 19, isCustom: false },
];

export function getStoredIbadahMode(): "DAILY" | "RAMADHAN" {
  if (typeof window === "undefined") return "DAILY";
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.IBADAH_MODE);
    return saved === "RAMADHAN" ? "RAMADHAN" : "DAILY";
  } catch {
    return "DAILY";
  }
}

export function setStoredIbadahMode(mode: "DAILY" | "RAMADHAN"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.IBADAH_MODE, mode);
    notifyDataChanged("ibadah");
  } catch (e) {
    console.error("Failed to save ibadah mode", e);
  }
}

export function getStoredIbadahActivities(mode?: "DAILY" | "RAMADHAN"): StoredIbadahActivity[] {
  if (typeof window === "undefined") {
    return mode
      ? DEFAULT_IBADAH_ACTIVITIES.filter((a) => a.mode === "BOTH" || a.mode === mode)
      : DEFAULT_IBADAH_ACTIVITIES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IBADAH_ACTIVITIES);
    let activities: StoredIbadahActivity[];
    if (!raw) {
      activities = DEFAULT_IBADAH_ACTIVITIES;
      localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(activities));
    } else {
      activities = JSON.parse(raw);
      if (!Array.isArray(activities) || activities.length === 0) {
        activities = DEFAULT_IBADAH_ACTIVITIES;
        localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(activities));
      }
    }

    if (!mode) return activities;
    return activities.filter((a) => a.mode === "BOTH" || a.mode === mode);
  } catch {
    return DEFAULT_IBADAH_ACTIVITIES;
  }
}

export function addStoredCustomIbadah(data: {
  name: string;
  type: IbadahType;
  mode: IbadahMode;
  targetCount?: number;
  unit?: string;
}): StoredIbadahActivity {
  const current = getStoredIbadahActivities();
  const maxOrder = current.reduce((max, a) => Math.max(max, a.order || 0), 0);
  const newActivity: StoredIbadahActivity = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    type: data.type,
    mode: data.mode || "BOTH",
    targetCount: data.targetCount && data.targetCount > 0 ? data.targetCount : 1,
    unit: data.unit?.trim() || (data.type === "WAJIB" ? "waktu" : "kali"),
    order: maxOrder + 1,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const updated = [...current, newActivity];
      localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add custom ibadah activity", e);
    }
  }

  notifyDataChanged("ibadah");
  return newActivity;
}

export function deleteStoredCustomIbadah(activityId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStoredIbadahActivities();
    const updated = current.filter((a) => a.id !== activityId);
    localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(updated));

    // Also remove records associated with this activity
    const rawRecords = localStorage.getItem(STORAGE_KEYS.IBADAH_RECORDS);
    if (rawRecords) {
      const records: StoredIbadahRecord[] = JSON.parse(rawRecords);
      const filtered = records.filter((r) => r.activityId !== activityId);
      localStorage.setItem(STORAGE_KEYS.IBADAH_RECORDS, JSON.stringify(filtered));
    }

    notifyDataChanged("ibadah");
    return true;
  } catch (e) {
    console.error("Failed to delete custom ibadah activity", e);
    return false;
  }
}

export function getStoredIbadahRecords(dateStr?: string): StoredIbadahRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IBADAH_RECORDS);
    if (!raw) return [];
    const list: StoredIbadahRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (dateStr) {
      return list.filter((r) => r.date === dateStr);
    }
    return list;
  } catch {
    return [];
  }
}

export function toggleStoredIbadahRecord(activityId: string, dateStr: string): StoredIbadahRecord | null {
  const todayStr = getTodayInTimezone("Asia/Jakarta");
  if (dateStr < todayStr) {
    showOrbitToast("Catatan ibadah untuk tanggal yang sudah berlalu tidak dapat diubah.", "error");
    return null;
  }
  if (dateStr > todayStr) {
    showOrbitToast("Ibadah untuk tanggal mendatang belum dapat dicatat.", "error");
    return null;
  }

  const records = getStoredIbadahRecords();
  const existingIndex = records.findIndex((r) => r.activityId === activityId && r.date === dateStr);
  const nowIso = new Date().toISOString();

  let targetRecord: StoredIbadahRecord;

  if (existingIndex >= 0) {
    const prev = records[existingIndex];
    targetRecord = {
      ...prev,
      completed: !prev.completed,
      count: !prev.completed ? 1 : 0,
      completedAt: !prev.completed ? nowIso : undefined,
    };
    records[existingIndex] = targetRecord;
  } else {
    targetRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      activityId,
      date: dateStr,
      completed: true,
      count: 1,
      completedAt: nowIso,
    };
    records.push(targetRecord);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.IBADAH_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error("Failed to update ibadah record", e);
    }
  }

  notifyDataChanged("ibadah");
  return targetRecord;
}

export function resetStoredIbadahForDate(dateStr: string): boolean {
  if (typeof window === "undefined") return false;
  const todayStr = getTodayInTimezone("Asia/Jakarta");
  if (dateStr !== todayStr) {
    showOrbitToast("Hanya amalan hari ini yang dapat di-reset.", "error");
    return false;
  }
  try {
    const records = getStoredIbadahRecords();
    const filtered = records.filter((r) => r.date !== dateStr);
    localStorage.setItem(STORAGE_KEYS.IBADAH_RECORDS, JSON.stringify(filtered));
    notifyDataChanged("ibadah");
    return true;
  } catch (e) {
    console.error("Failed to reset ibadah for date", e);
    return false;
  }
}

export function getStoredIbadahReflection(dateStr: string): StoredIbadahReflection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IBADAH_REFLECTIONS);
    if (!raw) return null;
    const list: StoredIbadahReflection[] = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    return list.find((r) => r.date === dateStr) || null;
  } catch {
    return null;
  }
}

export function saveStoredIbadahReflection(
  dateStr: string,
  content: string,
  mood?: string
): StoredIbadahReflection {
  let list: StoredIbadahReflection[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IBADAH_REFLECTIONS);
      if (raw) list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }

  const existingIdx = list.findIndex((r) => r.date === dateStr);
  const updatedItem: StoredIbadahReflection = {
    id: existingIdx >= 0 ? list[existingIdx].id : `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: dateStr,
    content: content.trim(),
    mood: mood || undefined,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    list[existingIdx] = updatedItem;
  } else {
    list.push(updatedItem);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.IBADAH_REFLECTIONS, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save ibadah reflection", e);
    }
  }

  notifyDataChanged("ibadah");
  return updatedItem;
}

// -------------------------------------------------------------
// Ibadah Calculations & Analytics
// -------------------------------------------------------------

export function calculateIbadahStreak(): { currentStreak: number; bestStreak: number } {
  if (typeof window === "undefined") return { currentStreak: 0, bestStreak: 0 };
  try {
    const records = getStoredIbadahRecords();
    const activities = getStoredIbadahActivities();
    const wajibIds = new Set(activities.filter((a) => a.type === "WAJIB").map((a) => a.id));

    // Group completed activities by date
    const dateCompletions: Record<string, number> = {};
    for (const r of records) {
      if (r.completed) {
        dateCompletions[r.date] = (dateCompletions[r.date] || 0) + 1;
      }
    }

    // Sort unique dates ascending
    const sortedDates = Object.keys(dateCompletions).sort();
    if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

    // Calculate streaks (a day counts if at least 1 ibadah is logged, or all wajib)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check backwards from today or yesterday
    const todayStr = getTodayInTimezone("Asia/Jakarta");
    const today = parseLocalDateSafe(todayStr);
    
    // Check if today is completed
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDateSafe(yesterday);

    let checkDate = new Date(today);
    if (!dateCompletions[todayStr] && dateCompletions[yesterdayStr]) {
      // Haven't done today yet, but did yesterday -> streak continues from yesterday
      checkDate = yesterday;
    }

    while (true) {
      const dStr = formatLocalDateSafe(checkDate);
      if (dateCompletions[dStr] && dateCompletions[dStr] > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Best streak historical walk
    let prevDate: Date | null = null;
    for (const dStr of sortedDates) {
      const d = new Date(dStr);
      if (prevDate) {
        const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = d;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return { currentStreak, bestStreak };
  } catch {
    return { currentStreak: 0, bestStreak: 0 };
  }
}

function parseLocalDateSafe(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

function formatLocalDateSafe(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getIbadah7DayRecap(endDateStr?: string): {
  date: string;
  dayName: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}[] {
  const result = [];
  const base = parseLocalDateSafe(endDateStr);
  const activities = getStoredIbadahActivities();
  const totalCount = activities.length || 1;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    const dStr = formatLocalDateSafe(d);
    const records = getStoredIbadahRecords(dStr);
    const completedCount = records.filter((r) => r.completed).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
    result.push({
      date: dStr,
      dayName,
      completedCount,
      totalCount,
      percentage,
    });
  }

  return result;
}

export function getIbadahWeeklyDetail(
  yearOrDate?: number | string,
  maybeMonth?: number
): {
  weekNum: number;
  startDate: string;
  endDate: string;
  rate: number;
  completed: number;
  total: number;
}[] {
  let year: number;
  let month: number; // 0-indexed

  if (typeof yearOrDate === "number" && typeof maybeMonth === "number") {
    year = yearOrDate;
    month = maybeMonth;
  } else if (typeof yearOrDate === "string") {
    const parsed = parseLocalDateSafe(yearOrDate);
    year = parsed.getFullYear();
    month = parsed.getMonth();
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const activities = getStoredIbadahActivities();
  const dailyTarget = activities.length || 1;

  const weeks = [];
  // Calculate weeks for the selected month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let currentStart = new Date(firstDay);
  let weekNum = 1;

  while (currentStart <= lastDay) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    if (currentEnd > lastDay) {
      currentEnd.setTime(lastDay.getTime());
    }

    const startStr = formatLocalDateSafe(currentStart);
    const endStr = formatLocalDateSafe(currentEnd);

    // Count completions in this week
    let weekCompleted = 0;
    let daysInWeek = 0;

    const iter = new Date(currentStart);
    while (iter <= currentEnd) {
      daysInWeek++;
      const iStr = formatLocalDateSafe(iter);
      const records = getStoredIbadahRecords(iStr);
      weekCompleted += records.filter((r) => r.completed).length;
      iter.setDate(iter.getDate() + 1);
    }

    const weekTotal = daysInWeek * dailyTarget;
    const rate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    weeks.push({
      weekNum,
      startDate: startStr,
      endDate: endStr,
      rate,
      completed: weekCompleted,
      total: weekTotal,
    });

    weekNum++;
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return weeks;
}

export function getIbadahHeatmapData(year: number, month: number): Record<string, number> {
  const result: Record<string, number> = {};
  if (typeof window === "undefined") return result;

  const activities = getStoredIbadahActivities();
  const totalCount = activities.length || 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const records = getStoredIbadahRecords(dStr);
    const completedCount = records.filter((r) => r.completed).length;
    const percentage = Math.min(100, Math.round((completedCount / totalCount) * 100));
    result[dStr] = percentage;
  }

  return result;
}

// -------------------------------------------------------------
// CSV Export & Import
// -------------------------------------------------------------

export function exportIbadahToCSV(): string {
  if (typeof window === "undefined") return "";
  const records = getStoredIbadahRecords();
  const activities = getStoredIbadahActivities();
  const actMap = new Map(activities.map((a) => [a.id, a]));

  const headers = ["Date", "ActivityID", "ActivityName", "Type", "Completed", "Count", "CompletedAt"];
  const rows = records.map((r) => {
    const act = actMap.get(r.activityId);
    return [
      r.date,
      r.activityId,
      `"${(act?.name || r.activityId).replace(/"/g, '""')}"`,
      act?.type || "CUSTOM",
      r.completed ? "1" : "0",
      r.count || 1,
      r.completedAt || "",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function importIbadahFromCSV(csvText: string): { successCount: number; errorCount: number } {
  if (typeof window === "undefined") return { successCount: 0, errorCount: 0 };
  try {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return { successCount: 0, errorCount: 0 };

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const dateIdx = headers.indexOf("date");
    const actIdIdx = headers.indexOf("activityid");
    const completedIdx = headers.indexOf("completed");
    const countIdx = headers.indexOf("count");
    const completedAtIdx = headers.indexOf("completedat");

    if (dateIdx === -1 || actIdIdx === -1) {
      return { successCount: 0, errorCount: lines.length - 1 };
    }

    const currentRecords = getStoredIbadahRecords();
    const recordMap = new Map<string, StoredIbadahRecord>();
    for (const r of currentRecords) {
      recordMap.set(`${r.activityId}_${r.date}`, r);
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",");
      const date = cols[dateIdx]?.trim();
      const activityId = cols[actIdIdx]?.trim();
      if (!date || !activityId) {
        errorCount++;
        continue;
      }

      const completed = completedIdx !== -1 ? cols[completedIdx]?.trim() === "1" || cols[completedIdx]?.trim().toLowerCase() === "true" : true;
      const count = countIdx !== -1 ? parseInt(cols[countIdx], 10) || 1 : 1;
      const completedAt = completedAtIdx !== -1 ? cols[completedAtIdx]?.trim() : undefined;

      const key = `${activityId}_${date}`;
      recordMap.set(key, {
        id: recordMap.get(key)?.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        activityId,
        date,
        completed,
        count,
        completedAt: completedAt || (completed ? new Date().toISOString() : undefined),
      });
      successCount++;
    }

    localStorage.setItem(STORAGE_KEYS.IBADAH_RECORDS, JSON.stringify(Array.from(recordMap.values())));
    notifyDataChanged("ibadah");
    return { successCount, errorCount };
  } catch (e) {
    console.error("Failed to import CSV", e);
    return { successCount: 0, errorCount: 1 };
  }
}

// -------------------------------------------------------------
// Tilawah Al-Qur'an Storage Helpers
// -------------------------------------------------------------

export function getStoredQuranReadings(dateStr?: string): StoredQuranReading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IBADAH_TILAWAH);
    if (!raw) return [];
    const list: StoredQuranReading[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (dateStr) {
      return list.filter((r) => r.date === dateStr);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function addStoredQuranReading(
  data: Omit<StoredQuranReading, "id" | "createdAt" | "updatedAt">
): StoredQuranReading {
  const current = getStoredQuranReadings();
  const nowIso = new Date().toISOString();
  const newReading: StoredQuranReading = {
    id: `til_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...data,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (typeof window !== "undefined") {
    try {
      const updated = [newReading, ...current];
      localStorage.setItem(STORAGE_KEYS.IBADAH_TILAWAH, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add quran reading", e);
    }
  }

  notifyDataChanged("ibadah");
  return newReading;
}

export function updateStoredQuranReading(
  id: string,
  data: Partial<StoredQuranReading>
): StoredQuranReading | null {
  const current = getStoredQuranReadings();
  const idx = current.findIndex((r) => r.id === id);
  if (idx < 0) return null;

  const updated: StoredQuranReading = {
    ...current[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  current[idx] = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.IBADAH_TILAWAH, JSON.stringify(current));
    } catch (e) {
      console.error("Failed to update quran reading", e);
    }
  }

  notifyDataChanged("ibadah");
  return updated;
}

export function deleteStoredQuranReading(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStoredQuranReadings();
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.IBADAH_TILAWAH, JSON.stringify(filtered));
    notifyDataChanged("ibadah");
    return true;
  } catch (e) {
    console.error("Failed to delete quran reading", e);
    return false;
  }
}

export function getStoredQuranStats(): {
  pagesThisWeek: number;
  juzThisWeek: number;
  durationMinutesThisWeek: number;
  lastSurah: string;
  weeklyTargetPages: number;
  weeklyProgress: number;
} {
  const readings = getStoredQuranReadings();
  const now = new Date();
  
  // Calculate start of current week (Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekReadings = readings.filter((r) => {
    const d = parseLocalDateSafe(r.date);
    return d >= startOfWeek;
  });

  const pagesThisWeek = thisWeekReadings.reduce((sum, r) => sum + (r.pagesRead || 0), 0);
  const durationMinutesThisWeek = thisWeekReadings.reduce(
    (sum, r) => sum + (r.durationMinutes || 0),
    0
  );

  // Set of unique juz read this week
  const juzSet = new Set<number>();
  thisWeekReadings.forEach((r) => {
    if (r.juz) juzSet.add(r.juz);
  });

  const lastSurah = readings.length > 0 ? readings[0].endSurah || readings[0].startSurah : "-";
  const weeklyTargetPages = 35; // Standard 5 pages/day default target
  const weeklyProgress = Math.min(100, Math.round((pagesThisWeek / weeklyTargetPages) * 100));

  return {
    pagesThisWeek,
    juzThisWeek: juzSet.size,
    durationMinutesThisWeek,
    lastSurah,
    weeklyTargetPages,
    weeklyProgress,
  };
}

// -------------------------------------------------------------
// Extended Amalan Management (Update, Toggle Active, Reorder)
// -------------------------------------------------------------

export function updateStoredCustomIbadah(
  id: string,
  data: Partial<StoredIbadahActivity>
): StoredIbadahActivity | null {
  if (typeof window === "undefined") return null;
  try {
    const list = getStoredIbadahActivities();
    const idx = list.findIndex((a) => a.id === id);
    if (idx < 0) return null;

    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(list));
    notifyDataChanged("ibadah");
    return updated;
  } catch (e) {
    console.error("Failed to update activity", e);
    return null;
  }
}

export function toggleStoredActivityActive(id: string, isActive: boolean): boolean {
  return Boolean(updateStoredCustomIbadah(id, { isActive }));
}

export function reorderStoredActivities(activityIds: string[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getStoredIbadahActivities();
    const map = new Map(list.map((a) => [a.id, a]));
    const reordered: StoredIbadahActivity[] = [];

    activityIds.forEach((id, index) => {
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, order: index + 1 });
        map.delete(id);
      }
    });

    // Append any remaining items
    map.forEach((item) => reordered.push(item));

    localStorage.setItem(STORAGE_KEYS.IBADAH_ACTIVITIES, JSON.stringify(reordered));
    notifyDataChanged("ibadah");
    return true;
  } catch (e) {
    console.error("Failed to reorder activities", e);
    return false;
  }
}


