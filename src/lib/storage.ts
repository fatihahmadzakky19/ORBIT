"use client";

export const ORBIT_DATA_CHANGED_EVENT = "orbit_data_changed";

export const STORAGE_KEYS = {
  PROFILE: "orbit_profile",
  HABITS: "orbit_habits",
  GOALS: "orbit_goals",
  LEARNING_NOTES: "orbit_learning_notes",
  LEARNING_FOLDERS: "orbit_learning_folders",
  ACTIVITIES: "orbit_activities",
  FINANCE_TRANSACTIONS: "orbit_finance_transactions",
  FINANCE_ACTUAL_BALANCE: "orbit_finance_actual_balance",
  FINANCE_CALCULATED_BALANCE: "orbit_finance_calculated_balance",
} as const;

export function notifyDataChanged(moduleName?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ORBIT_DATA_CHANGED_EVENT, { detail: { module: moduleName, timestamp: Date.now() } })
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
// Learnings
// -------------------------------------------------------------
export interface StoredLearning {
  id: string;
  topic: string;
  understood: string;
  source?: string;
  date: string;
  folderId?: string | null;
  createdAt: string;
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
  };

  if (typeof window !== "undefined") {
    try {
      // Save to orbit_learning_notes (used by /learning and goals)
      const rawNotes = localStorage.getItem(STORAGE_KEYS.LEARNING_NOTES);
      const notes: StoredLearning[] = rawNotes ? JSON.parse(rawNotes) : [];
      const updatedNotes = [newLearning, ...notes];
      localStorage.setItem(STORAGE_KEYS.LEARNING_NOTES, JSON.stringify(updatedNotes));

      // Also sync to orbit_learnings (used by dashboard HomePage)
      localStorage.setItem("orbit_learnings", JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Failed to add stored learning", e);
    }
  }

  notifyDataChanged("learning");
  return newLearning;
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
}): StoredTransaction {
  const newTx: StoredTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: data.type,
    amount: data.amount,
    category: data.category,
    date: data.date || "Hari Ini",
    note: data.note || undefined,
    createdAt: new Date().toISOString(),
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
