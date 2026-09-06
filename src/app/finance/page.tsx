"use client";

import { useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface TransactionItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: string;
  note?: string;
  goalAllocation?: string;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx1",
    type: "EXPENSE",
    amount: 25000,
    category: "Food",
    date: "06 Sep 2026",
    note: "Lunch",
  },
  {
    id: "tx2",
    type: "INCOME",
    amount: 3000000,
    category: "Salary",
    date: "05 Sep 2026",
    note: "Monthly stipend / salary",
    goalAllocation: "Save Rp10M",
  },
  {
    id: "tx3",
    type: "EXPENSE",
    amount: 15000,
    category: "Transport",
    date: "04 Sep 2026",
    note: "Bus fare",
  },
  {
    id: "tx4",
    type: "EXPENSE",
    amount: 150000,
    category: "Internet",
    date: "02 Sep 2026",
    note: "Monthly fiber broadband",
  },
];

export default function FinancePage() {
  const [actualBalance, setActualBalance] = useState(4750000);
  const [calculatedBalance, setCalculatedBalance] = useState(4800000);
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const [isUpdatingActual, setIsUpdatingActual] = useState(false);
  const [actualInput, setActualInput] = useState(actualBalance.toString());
  const [isAddingTx, setIsAddingTx] = useState(false);

  // New Tx Form State
  const [newTxType, setNewTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxCat, setNewTxCat] = useState("Food");
  const [newTxNote, setNewTxNote] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "ALL") return true;
    return tx.type === filterType;
  });

  const difference = actualBalance - calculatedBalance;

  const handleUpdateActual = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(actualInput);
    if (!isNaN(val)) {
      setActualBalance(val);
      setIsUpdatingActual(false);
    }
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newTxAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newTx: TransactionItem = {
      id: `tx_${Date.now()}`,
      type: newTxType,
      amount: amt,
      category: newTxCat,
      date: "Today",
      note: newTxNote || undefined,
    };

    setTransactions([newTx, ...transactions]);
    if (newTxType === "INCOME") {
      setCalculatedBalance((prev) => prev + amt);
    } else {
      setCalculatedBalance((prev) => prev - amt);
    }

    setNewTxAmount("");
    setNewTxNote("");
    setIsAddingTx(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-main">Finance</h1>
          <p className="text-xs text-dim mt-0.5">
            Honest financial tracking. Actual vs Calculated balances displayed side-by-side.
          </p>
        </div>
        <button
          onClick={() => setIsAddingTx(true)}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* DUAL BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Actual Balance */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Actual Balance
            </div>
            <div className="text-2xl font-mono font-semibold text-main">
              {formatCurrency(actualBalance)}
            </div>
            <p className="text-xs text-dim mt-1">
              Physical cash & bank accounts you verified today.
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
              Update Actual Balance
            </button>
            <span className="text-[11px] font-mono text-dim">Updated today</span>
          </div>
        </div>

        {/* Calculated Balance */}
        <div className="p-5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Calculated Balance
            </div>
            <div className="text-2xl font-mono font-semibold text-main">
              {formatCurrency(calculatedBalance)}
            </div>
            <p className="text-xs text-dim mt-1">
              Starting balance + recorded Incomes - recorded Expenses.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
            <span className="text-dim">Difference:</span>
            <span className={difference < 0 ? "text-rose-400" : "text-emerald-400"}>
              {difference >= 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference)}
            </span>
          </div>
        </div>
      </div>

      {/* THIS MONTH METRICS */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          September 2026 Net Flow
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">Income</div>
            <div className="text-sm md:text-base font-mono font-semibold text-emerald-400">
              +Rp 3.000.000
            </div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">Expense</div>
            <div className="text-sm md:text-base font-mono font-semibold text-rose-400">
              -Rp 1.250.000
            </div>
          </div>
          <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
            <div className="text-xs text-dim mb-1">Net Flow</div>
            <div className="text-sm md:text-base font-mono font-semibold text-accent">
              +Rp 1.750.000
            </div>
          </div>
        </div>
      </div>

      {/* BUDGETS */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-dim mb-4">
          September Budgets
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-main font-medium">Food</span>
              <span className="text-sub">Rp 750.000 / Rp 1.000.000 (75%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: "75%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-main font-medium">Transport</span>
              <span className="text-sub">Rp 300.000 / Rp 500.000 (60%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: "60%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-main font-medium">Education</span>
              <span className="text-sub">Rp 100.000 / Rp 500.000 (20%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-canvas overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "20%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS LOG */}
      <div className="p-5 rounded-xl bg-surface border border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
            Transactions
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
                {f}
              </button>
            ))}
          </div>
        </div>

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
                  <div className="text-[11px] font-mono text-dim mt-0.5">{tx.date}</div>
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
      </div>

      {/* Update Actual Balance Modal */}
      {isUpdatingActual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-surface border border-line rounded-xl shadow-2xl p-6 text-main">
            <h2 className="text-sm font-semibold text-main mb-3">Update Actual Balance</h2>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  Save
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
              <h2 className="text-sm font-semibold text-main">Add Transaction</h2>
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
                  Expense
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
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Amount (Rp) *</label>
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
                <label className="block text-xs font-medium text-sub mb-1">Category</label>
                <input
                  type="text"
                  value={newTxCat}
                  onChange={(e) => setNewTxCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-xs text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Note (optional)</label>
                <input
                  type="text"
                  placeholder="Notes..."
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
