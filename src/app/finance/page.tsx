"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, X, Calendar, Clock, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import {
  getStoredFinanceTransactions,
  getStoredFinanceBalances,
  addStoredTransaction,
  saveStoredFinanceBalances,
  ORBIT_DATA_CHANGED_EVENT,
  StoredTransaction,
} from "@/lib/storage";

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentTimeString(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12 && !isNaN(year)) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
  } catch {}
  return dateStr;
}

function formatFullPreview(dateStr: string, timeStr?: string): string {
  const effectiveTime = timeStr?.trim() || getCurrentTimeString();
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, monthIdx, day);
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const dayName = dayNames[dateObj.getDay()];
      const monthName = monthNames[monthIdx];
      return `${dayName}, ${day} ${monthName} ${year} · ${effectiveTime}`;
    }
  } catch {}
  return `${dateStr} ${effectiveTime}`;
}

export default function FinancePage() {
  const { t } = useLanguage();
  const [actualBalance, setActualBalance] = useState(0);
  const [calculatedBalance, setCalculatedBalance] = useState(0);
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [budgets] = useState<{ category: string; spent: number; limit: number }[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const [isUpdatingActual, setIsUpdatingActual] = useState(false);
  const [actualInput, setActualInput] = useState("0");
  const [isAddingTx, setIsAddingTx] = useState(false);

  // New Tx Form State
  const [newTxType, setNewTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxCat, setNewTxCat] = useState("Food");
  const [newTxDate, setNewTxDate] = useState(getTodayDateString);
  const [newTxTime, setNewTxTime] = useState(getCurrentTimeString);
  const [newTxNote, setNewTxNote] = useState("");

  const loadData = () => {
    const txs = getStoredFinanceTransactions();
    setTransactions(txs);
    const balances = getStoredFinanceBalances();
    setActualBalance(balances.actual);
    setCalculatedBalance(balances.calculated);
    setActualInput(balances.actual.toString());
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

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "ALL") return true;
    return tx.type === filterType;
  });

  const difference = actualBalance - calculatedBalance;

  const totalIncome = transactions
    .filter((tx) => tx.type === "INCOME")
    .reduce((acc, tx) => acc + tx.amount, 0);
  const totalExpense = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => acc + tx.amount, 0);
  const netFlow = totalIncome - totalExpense;

  const handleUpdateActual = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(actualInput);
    if (!isNaN(val)) {
      setActualBalance(val);
      saveStoredFinanceBalances(val, undefined);
      setIsUpdatingActual(false);
    }
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newTxAmount);
    if (isNaN(amt) || amt <= 0) return;

    const formattedDate = formatDisplayDate(newTxDate);
    const autoTime = newTxTime?.trim() || getCurrentTimeString();

    addStoredTransaction({
      type: newTxType,
      amount: amt,
      category: newTxCat,
      note: newTxNote || undefined,
      date: formattedDate,
      time: autoTime,
      createdAt: `${newTxDate}T${autoTime}:00`,
    });

    loadData();
    setNewTxAmount("");
    setNewTxNote("");
    setNewTxDate(getTodayDateString());
    setNewTxTime(getCurrentTimeString());
    setIsAddingTx(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-main">{t.finance.title}</h1>
          <p className="text-xs text-dim mt-0.5">
            {t.finance.subtitle}
          </p>
        </div>
        <button
          onClick={() => setIsAddingTx(true)}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.finance.addTransaction}</span>
        </button>
      </div>

      {/* DUAL BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Actual Balance */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              {t.common.actualBalance}
            </div>
            <div className="text-2xl font-mono font-semibold text-main">
              {formatCurrency(actualBalance)}
            </div>
            <p className="text-xs text-dim mt-1">
              {t.finance.actualDesc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
            <button
              onClick={() => {
                setActualInput(actualBalance.toString());
                setIsUpdatingActual(true);
              }}
              className="text-xs text-accent hover:underline cursor-pointer"
            >
              {t.finance.updateActual}
            </button>
            <span className="text-[11px] font-mono text-dim">{t.finance.updatedToday}</span>
          </div>
        </div>

        {/* Calculated Balance */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              {t.common.calculatedBalance}
            </div>
            <div className="text-2xl font-mono font-semibold text-main">
              {formatCurrency(calculatedBalance)}
            </div>
            <p className="text-xs text-dim mt-1">
              {t.finance.calculatedDesc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
            <span className="text-dim">{t.common.difference}:</span>
            <span className={difference < 0 ? "text-rose-400" : "text-emerald-400"}>
              {difference >= 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference)}
            </span>
          </div>
        </div>
      </div>

      {/* THIS MONTH METRICS */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          September 2026 {t.finance.netFlow}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">{t.common.income}</div>
            <div className="text-sm md:text-base font-mono font-semibold text-emerald-400">
              +{formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">{t.common.expense}</div>
            <div className="text-sm md:text-base font-mono font-semibold text-rose-400">
              -{formatCurrency(totalExpense)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">{t.finance.netFlow}</div>
            <div className="text-sm md:text-base font-mono font-semibold text-accent">
              {netFlow >= 0 ? `+${formatCurrency(netFlow)}` : formatCurrency(netFlow)}
            </div>
          </div>
        </div>
      </div>

      {/* BUDGETS */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          September {t.finance.budgets}
        </h2>
        {budgets.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-lg border border-dashed border-border-subtle bg-canvas/40">
            <p className="text-xs text-dim">{t.finance.noBudgets}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((b) => (
              <div key={b.category}>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-main font-medium">{b.category}</span>
                  <span className="text-sub">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (b.spent / b.limit) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRANSACTIONS LOG */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
            {t.finance.transactions}
          </h2>
          <div className="flex items-center gap-1.5 text-xs">
            {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === f
                    ? "bg-surface-elevated text-main font-medium"
                    : "text-dim hover:text-sub"
                }`}
              >
                {f === "ALL" ? t.common.all : f === "INCOME" ? t.common.income : t.common.expense}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border-subtle">
            <p className="text-xs text-dim mb-3">{t.finance.noTransactions}</p>
            <button
              onClick={() => setIsAddingTx(true)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-elevated border border-border-subtle hover:border-line text-xs font-medium text-sub hover:text-main transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.finance.addTransaction}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-border-subtle"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    tx.type === "INCOME"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {tx.type === "INCOME" ? (
                    <ArrowUpCircle className="w-4 h-4" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-main">
                    {tx.category} {tx.note && <span className="text-dim">· {tx.note}</span>}
                  </div>
                  <div className="text-[11px] font-mono text-dim mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#6B6762]" />
                      <span>{tx.date}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#8A8580]">
                      <span className="text-[#3A3F45]">·</span>
                      <Clock className="w-3 h-3 text-[#20C8E8]" />
                      <span className="text-[#E6E1DA] font-medium">
                        {tx.time || (tx.createdAt?.includes("T") ? tx.createdAt.split("T")[1]?.slice(0, 5) : "00:00")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-mono font-semibold ${
                    tx.type === "INCOME" ? "text-emerald-400" : "text-main"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </div>
                {tx.goalAllocation && (
                  <span className="text-[10px] text-accent block font-mono mt-0.5">
                    → {tx.goalAllocation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Update Actual Balance Modal */}
      {isUpdatingActual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <h2 className="text-sm font-semibold text-main mb-3">{t.finance.updateBalanceTitle}</h2>
            <form onSubmit={handleUpdateActual} className="space-y-3">
              <input
                type="number"
                required
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm font-mono text-main focus:outline-none focus:border-accent"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingActual(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-main">{t.finance.addTransaction}</h2>
              <button
                onClick={() => setIsAddingTx(false)}
                className="p-1 rounded text-dim hover:text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewTxType("EXPENSE")}
                  className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    newTxType === "EXPENSE"
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                      : "border-border-subtle text-dim"
                  }`}
                >
                  {t.common.expense}
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType("INCOME")}
                  className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    newTxType === "INCOME"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-border-subtle text-dim"
                  }`}
                >
                  {t.common.income}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">{t.common.amount} (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="50000"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-sm font-mono text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">{t.common.category}</label>
                <input
                  type="text"
                  value={newTxCat}
                  onChange={(e) => setNewTxCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              {/* Waktu & Tanggal Transaksi (Tanggal, Bulan, Tahun, Jam, Menit) */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-sub flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#20C8E8]" />
                    <span>Waktu & Tanggal *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTxDate(getTodayDateString());
                      setNewTxTime(getCurrentTimeString());
                    }}
                    className="text-[10px] font-mono text-[#20C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Set Sekarang</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-dim font-mono mb-1">Tanggal (Hari/Bulan/Tahun)</span>
                    <input
                      type="date"
                      required
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="block text-[10px] text-dim font-mono">Jam (Jam:Menit)</span>
                      <span className="text-[9px] text-[#20C8E8] font-mono">Otomatis</span>
                    </div>
                    <input
                      type="time"
                      value={newTxTime}
                      onChange={(e) => setNewTxTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-canvas border border-line text-xs font-mono text-main focus:outline-none focus:border-accent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Pratinjau Tanggal & Jam Real-Time */}
                {newTxDate && (
                  <div className="text-[10px] font-mono text-[#8A8580] bg-[#0C1014] px-2.5 py-1.5 rounded-md border border-[#1E2226] flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3 h-3 text-[#20C8E8] shrink-0" />
                      <span className="truncate">{formatFullPreview(newTxDate, newTxTime)}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400/90 font-mono shrink-0">
                      Auto-Timestamp
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">{t.common.note} ({t.common.optional})</label>
                <input
                  type="text"
                  placeholder="Catatan transaksi..."
                  value={newTxNote}
                  onChange={(e) => setNewTxNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddingTx(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-sub hover:text-main cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
