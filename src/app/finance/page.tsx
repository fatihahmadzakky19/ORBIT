"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  Calendar,
  Clock,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Sparkles,
  Tag,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import {
  getStoredFinanceTransactions,
  getStoredFinanceBalances,
  addStoredTransaction,
  updateStoredTransaction,
  deleteStoredTransaction,
  saveStoredFinanceBalances,
  getStoredCategories,
  addStoredCategory,
  deleteStoredCategory,
  StoredTransaction,
  StoredCategory,
  showOrbitToast,
  ORBIT_DATA_CHANGED_EVENT,
} from "@/lib/storage";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  createCategoryAction,
  updateActualBalanceAction,
} from "@/features/finance/server/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Date & Time Helpers
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

function parseTxDate(tx: StoredTransaction): Date {
  if (tx.createdAt) {
    const d = new Date(tx.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (tx.date) {
    const d = new Date(tx.date);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

const EMOJI_PALETTE = ["🍜", "🚗", "💡", "🛍️", "🎬", "💊", "📚", "💰", "💻", "📈", "☕", "🎮", "✈️", "🏋️", "🏠", "🎁", "📦"];
const COLOR_PALETTE = [
  "#08BFD7", // Cyan
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#C8A96B", // Gold
  "#64748B", // Slate
];

export default function FinancePage() {
  const { t } = useLanguage();

  // Primary data states
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [categories, setCategories] = useState<StoredCategory[]>([]);
  const [actualBalance, setActualBalance] = useState(0);
  const [calculatedBalance, setCalculatedBalance] = useState(0);

  // Filters & Views
  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [trendRange, setTrendRange] = useState<"7D" | "30D" | "3M" | "6M" | "1Y">("30D");

  // Interactive Chart States
  const [activeDonutSlice, setActiveDonutSlice] = useState<string | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Modals state
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [editingTx, setEditingTx] = useState<StoredTransaction | null>(null);
  const [isUpdatingActual, setIsUpdatingActual] = useState(false);
  const [actualInput, setActualInput] = useState("0");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Delete Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
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

  // Form states - Transaction
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("Food & Drink");
  const [txDate, setTxDate] = useState(getTodayDateString);
  const [txTime, setTxTime] = useState(getCurrentTimeString);
  const [txNote, setTxNote] = useState("");

  // Form states - Custom Category
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [catEmoji, setCatEmoji] = useState("🏷️");
  const [catColor, setCatColor] = useState("#08BFD7");

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load finance data
  const loadData = () => {
    const txs = getStoredFinanceTransactions();
    setTransactions(txs);
    const cats = getStoredCategories();
    setCategories(cats);
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

  // Map category to icon & color
  const categoryMetaMap = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    categories.forEach((cat) => {
      map.set(cat.name.toLowerCase(), {
        icon: cat.icon || (cat.type === "INCOME" ? "💵" : "💸"),
        color: cat.color || "#08BFD7",
      });
    });
    return map;
  }, [categories]);

  const getCategoryMeta = (catName: string) => {
    const lower = catName.toLowerCase();
    if (categoryMetaMap.has(lower)) {
      return categoryMetaMap.get(lower)!;
    }
    return { icon: "📦", color: "#64748B" };
  };

  // -------------------------------------------------------------
  // Dynamic Real-Data Metrics (Calculations)
  // -------------------------------------------------------------
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Transactions partitioned by month
  const thisMonthTxs = useMemo(() => {
    return transactions.filter((tx) => {
      const d = parseTxDate(tx);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const lastMonthTxs = useMemo(() => {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return transactions.filter((tx) => {
      const d = parseTxDate(tx);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Card 1: Total Pengeluaran (Bulan Ini) + MoM %
  const thisMonthExpenses = useMemo(() => {
    return thisMonthTxs
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [thisMonthTxs]);

  const lastMonthExpenses = useMemo(() => {
    return lastMonthTxs
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [lastMonthTxs]);

  const momExpenseDelta = useMemo(() => {
    if (lastMonthExpenses === 0) return null;
    return ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  }, [thisMonthExpenses, lastMonthExpenses]);

  // Card 2: Total Pemasukan (Bulan Ini) + MoM %
  const thisMonthIncome = useMemo(() => {
    return thisMonthTxs
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [thisMonthTxs]);

  const lastMonthIncome = useMemo(() => {
    return lastMonthTxs
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [lastMonthTxs]);

  const momIncomeDelta = useMemo(() => {
    if (lastMonthIncome === 0) return null;
    return ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
  }, [thisMonthIncome, lastMonthIncome]);

  // Card 3: Saldo & Selisih
  const balanceDifference = actualBalance - calculatedBalance;

  // Card 4: Rata-rata Pengeluaran Harian (Daily Average this month)
  const currentDayOfMonth = Math.max(1, now.getDate());
  const dailyAverageExpense = thisMonthExpenses / currentDayOfMonth;

  // Card 5: Total Transaksi Bulan Ini
  const thisMonthTxCount = thisMonthTxs.length;

  // -------------------------------------------------------------
  // Category Spending Breakdown (For Donut & Horizontal Bar)
  // -------------------------------------------------------------
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();
    // Group all expense transactions
    transactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        const cat = tx.category.trim() || "Lainnya";
        map.set(cat, (map.get(cat) || 0) + tx.amount);
      });

    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    const list = Array.from(map.entries()).map(([name, amount], index) => {
      const meta = getCategoryMeta(name);
      const percentage = (amount / total) * 100;
      return {
        name,
        amount,
        percentage,
        color: meta.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
        icon: meta.icon,
      };
    });

    // Sort highest to lowest
    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions, categoryMetaMap]);

  const totalAllExpenses = useMemo(() => {
    return categoryExpenses.reduce((sum, c) => sum + c.amount, 0);
  }, [categoryExpenses]);

  // SVG Donut Chart Geometry (Circumference C = 2 * PI * r)
  const donutRadius = 70;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~439.82

  const donutSlices = useMemo(() => {
    let currentOffset = 0;
    return categoryExpenses.map((cat) => {
      const strokeDasharray = `${(cat.percentage / 100) * donutCircumference} ${donutCircumference}`;
      const strokeDashoffset = -currentOffset;
      currentOffset += (cat.percentage / 100) * donutCircumference;
      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryExpenses, donutCircumference]);

  const activeDonutData = useMemo(() => {
    if (!activeDonutSlice) return null;
    return categoryExpenses.find((c) => c.name === activeDonutSlice) || null;
  }, [activeDonutSlice, categoryExpenses]);

  // -------------------------------------------------------------
  // Trend Chart Data (Line Chart by Range)
  // -------------------------------------------------------------
  const trendData = useMemo(() => {
    const points: { label: string; value: number }[] = [];
    const nowTime = new Date();

    if (trendRange === "7D") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(nowTime);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = d.getMonth();
        const dateNum = d.getDate();
        const dayLabel = `${dateNum} ${d.toLocaleDateString("id-ID", { month: "short" })}`;

        const dayTotal = transactions
          .filter((tx) => {
            if (tx.type !== "EXPENSE") return false;
            const td = parseTxDate(tx);
            return td.getFullYear() === y && td.getMonth() === m && td.getDate() === dateNum;
          })
          .reduce((sum, tx) => sum + tx.amount, 0);

        points.push({ label: dayLabel, value: dayTotal });
      }
    } else if (trendRange === "30D") {
      // 6 intervals of 5 days
      for (let i = 5; i >= 0; i--) {
        const dEnd = new Date(nowTime);
        dEnd.setDate(dEnd.getDate() - i * 5);
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 4);

        const label = `${dStart.getDate()}-${dEnd.getDate()} ${dEnd.toLocaleDateString("id-ID", { month: "short" })}`;

        const intervalTotal = transactions
          .filter((tx) => {
            if (tx.type !== "EXPENSE") return false;
            const td = parseTxDate(tx);
            return td >= dStart && td <= dEnd;
          })
          .reduce((sum, tx) => sum + tx.amount, 0);

        points.push({ label, value: intervalTotal });
      }
    } else {
      // Monthly intervals (3M, 6M, 1Y)
      const monthCount = trendRange === "3M" ? 3 : trendRange === "6M" ? 6 : 12;
      for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(nowTime.getFullYear(), nowTime.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });

        const monthTotal = transactions
          .filter((tx) => {
            if (tx.type !== "EXPENSE") return false;
            const td = parseTxDate(tx);
            return td.getFullYear() === y && td.getMonth() === m;
          })
          .reduce((sum, tx) => sum + tx.amount, 0);

        points.push({ label, value: monthTotal });
      }
    }

    return points;
  }, [transactions, trendRange]);

  // Generate SVG coordinates for Trend Line
  const trendMax = useMemo(() => {
    const max = Math.max(...trendData.map((p) => p.value), 0);
    return max === 0 ? 100000 : max;
  }, [trendData]);

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 30;

  const trendCoords = useMemo(() => {
    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - paddingY * 2;
    const count = trendData.length;

    return trendData.map((p, idx) => {
      const x = paddingX + (idx / Math.max(1, count - 1)) * usableWidth;
      const y = svgHeight - paddingY - (p.value / trendMax) * usableHeight;
      return { x, y, ...p };
    });
  }, [trendData, trendMax]);

  const trendPathD = useMemo(() => {
    if (trendCoords.length === 0) return "";
    return trendCoords.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [trendCoords]);

  const trendAreaD = useMemo(() => {
    if (trendCoords.length === 0) return "";
    const first = trendCoords[0];
    const last = trendCoords[trendCoords.length - 1];
    const baseline = svgHeight - paddingY;
    return `${trendPathD} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [trendPathD, trendCoords]);

  // -------------------------------------------------------------
  // Filtered Transactions List
  // -------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      // Category Filter
      if (categoryFilter !== "ALL" && tx.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = tx.note && tx.note.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchNote && !matchCat && !matchAmount) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  // -------------------------------------------------------------
  // Automated Financial Insights
  // -------------------------------------------------------------
  const financialInsights = useMemo(() => {
    const insights: { title: string; desc: string; type: "positive" | "neutral" | "warning" }[] = [];

    // 1. Dominant Expense Category
    if (categoryExpenses.length > 0) {
      const top = categoryExpenses[0];
      insights.push({
        title: `Kategori ${top.name} Terbesar`,
        desc: `${top.icon} Menyumbang ${top.percentage.toFixed(1)}% (${formatCurrency(top.amount)}) dari total pengeluaran Anda.`,
        type: "neutral",
      });
    }

    // 2. MoM comparison
    if (momExpenseDelta !== null) {
      if (momExpenseDelta < 0) {
        insights.push({
          title: "Pengeluaran Menurun",
          desc: `Hemat ${Math.abs(momExpenseDelta).toFixed(1)}% dibandingkan bulan lalu. Keuangan Anda dalam tren positif!`,
          type: "positive",
        });
      } else if (momExpenseDelta > 15) {
        insights.push({
          title: "Pengeluaran Meningkat",
          desc: `Naik ${momExpenseDelta.toFixed(1)}% dibandingkan bulan lalu. Perhatikan pos belanja sekunder.`,
          type: "warning",
        });
      } else {
        insights.push({
          title: "Arus Kas Stabil",
          desc: `Pengeluaran berada di kisaran normal bulan lalu (${momExpenseDelta > 0 ? "+" : ""}${momExpenseDelta.toFixed(1)}%).`,
          type: "neutral",
        });
      }
    }

    // 3. Daily Burn
    if (thisMonthExpenses > 0) {
      insights.push({
        title: "Laju Pengeluaran Harian",
        desc: `Rata-rata ${formatCurrency(Math.round(dailyAverageExpense))} per hari di bulan ini.`,
        type: "neutral",
      });
    }

    return insights;
  }, [categoryExpenses, momExpenseDelta, thisMonthExpenses, dailyAverageExpense]);

  // -------------------------------------------------------------
  // Form Handlers: Add / Edit Transaction
  // -------------------------------------------------------------
  const handleOpenAddTx = () => {
    setTxType("EXPENSE");
    setTxAmount("");
    setTxCategory(categories[0]?.name || "Food & Drink");
    setTxDate(getTodayDateString());
    setTxTime(getCurrentTimeString());
    setTxNote("");
    setEditingTx(null);
    setIsAddingTx(true);
  };

  const handleOpenEditTx = (tx: StoredTransaction) => {
    setOpenMenuId(null);
    setEditingTx(tx);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxDate(tx.date.includes("-") ? tx.date : getTodayDateString());
    setTxTime(tx.time || getCurrentTimeString());
    setTxNote(tx.note || "");
    setIsAddingTx(true);
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(txAmount);
    if (isNaN(amt) || amt <= 0) return;

    const autoTime = txTime?.trim() || getCurrentTimeString();

    if (editingTx) {
      // Update existing
      updateStoredTransaction(editingTx.id, {
        type: txType,
        amount: amt,
        category: txCategory,
        date: txDate,
        time: autoTime,
        note: txNote || undefined,
      });
      updateTransactionAction(editingTx.id, {
        amount: amt,
        category: txCategory,
        type: txType,
        date: txDate,
        note: txNote,
      }).catch(() => {});
      showOrbitToast("Transaksi berhasil diperbarui");
    } else {
      // Create new
      addStoredTransaction({
        type: txType,
        amount: amt,
        category: txCategory,
        date: txDate,
        time: autoTime,
        note: txNote || undefined,
        createdAt: `${txDate}T${autoTime}:00`,
      });
      createTransactionAction({
        type: txType,
        amount: amt,
        category: txCategory,
        date: `${txDate}T${autoTime}:00`,
        note: txNote,
      }).catch(() => {});
      showOrbitToast("Transaksi berhasil dicatat");
    }

    setIsAddingTx(false);
    setEditingTx(null);
    loadData();
  };

  const handleOpenDeleteTx = (tx: StoredTransaction) => {
    setOpenMenuId(null);
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Transaksi?",
      description: `Transaksi ${tx.type === "INCOME" ? "pemasukan" : "pengeluaran"} sebesar ${formatCurrency(tx.amount)} akan dihapus. Saldo akan dihitung ulang secara otomatis.`,
      onConfirm: () => {
        deleteStoredTransaction(tx.id);
        deleteTransactionAction(tx.id).catch(() => {});
        showOrbitToast("Transaksi telah dihapus");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadData();
      },
    });
  };

  const handleUpdateActualBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(actualInput);
    if (!isNaN(val)) {
      setActualBalance(val);
      saveStoredFinanceBalances(val, undefined);
      updateActualBalanceAction(val).catch(() => {});
      showOrbitToast("Saldo riil berhasil diperbarui");
      setIsUpdatingActual(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    addStoredCategory({
      name: catName.trim(),
      type: catType,
      icon: catEmoji,
      color: catColor,
    });
    createCategoryAction({
      name: catName.trim(),
      type: catType,
      icon: catEmoji,
      color: catColor,
    }).catch(() => {});

    showOrbitToast(`Kategori "${catName}" berhasil ditambahkan`);
    setCatName("");
    setIsAddingCategory(false);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* --------------------------------------------------------- */}
      {/* Header & Main Action */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-main tracking-tight">
              {t.finance?.title || "Keuangan"}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#08BFD7]/10 text-[#08BFD7] border border-[#08BFD7]/20">
              Financial Intelligence
            </span>
          </div>
          <p className="text-xs text-dim mt-0.5">
            {t.finance?.subtitle || "Arus kas riil, pelacakan pengeluaran, dan observasi saldo komparatif."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-[#D9DDD9] hover:border-[#08BFD7] text-xs font-medium text-[#20252A] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Tag className="w-3.5 h-3.5 text-[#08BFD7]" />
            <span>+ Kategori</span>
          </button>
          <button
            onClick={handleOpenAddTx}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-[#08BFD7] hover:bg-[#07ABC1] text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.finance?.addTransaction || "Tambah Transaksi"}</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 5 FINANCIAL SUMMARY CARDS */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Pengeluaran Bulan Ini */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Pengeluaran (Bulan Ini)
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ArrowDownCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#20252A] font-mono mt-2 truncate">
              {formatCurrency(thisMonthExpenses)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center gap-1.5 text-xs">
            {momExpenseDelta !== null ? (
              <>
                {momExpenseDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className={momExpenseDelta > 0 ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}>
                  {momExpenseDelta > 0 ? "+" : ""}
                  {momExpenseDelta.toFixed(1)}%
                </span>
                <span className="text-[#8F96A3]">vs bln lalu</span>
              </>
            ) : (
              <span className="text-[#8F96A3]">Bulan pertama</span>
            )}
          </div>
        </div>

        {/* Card 2: Total Pemasukan Bulan Ini */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Pemasukan (Bulan Ini)
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#20252A] font-mono mt-2 truncate">
              {formatCurrency(thisMonthIncome)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center gap-1.5 text-xs">
            {momIncomeDelta !== null ? (
              <>
                {momIncomeDelta >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={momIncomeDelta >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                  {momIncomeDelta >= 0 ? "+" : ""}
                  {momIncomeDelta.toFixed(1)}%
                </span>
                <span className="text-[#8F96A3]">vs bln lalu</span>
              </>
            ) : (
              <span className="text-[#8F96A3]">Bulan pertama</span>
            )}
          </div>
        </div>

        {/* Card 3: Saldo Riil & Selisih */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Saldo Riil (Dompet)
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#20252A] font-mono mt-2 truncate">
              {formatCurrency(actualBalance)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center justify-between text-xs">
            <span
              className={
                balanceDifference === 0
                  ? "text-emerald-600 font-medium"
                  : balanceDifference > 0
                  ? "text-[#08BFD7] font-medium"
                  : "text-amber-600 font-medium"
              }
            >
              {balanceDifference === 0
                ? "✓ Sinkron"
                : `${balanceDifference > 0 ? "+" : ""}${formatCurrency(balanceDifference)}`}
            </span>
            <button
              onClick={() => {
                setActualInput(actualBalance.toString());
                setIsUpdatingActual(true);
              }}
              className="text-[#08BFD7] hover:underline cursor-pointer font-medium"
            >
              Sesuaikan →
            </button>
          </div>
        </div>

        {/* Card 4: Rata-rata Harian */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Rata-Rata Harian
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#20252A] font-mono mt-2 truncate">
              {formatCurrency(Math.round(dailyAverageExpense))}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] text-xs text-[#8F96A3]">
            {currentDayOfMonth} hari berjalan
          </div>
        </div>

        {/* Card 5: Transaksi Bulan Ini */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A7282]">
                Aktivitas Bulan Ini
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#20252A] font-mono mt-2">
              {thisMonthTxCount} Transaksi
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F0F2EE] flex items-center gap-2 text-xs text-[#6A7282]">
            <span className="text-emerald-600 font-medium">
              +{thisMonthTxs.filter((t) => t.type === "INCOME").length}
            </span>
            <span>·</span>
            <span className="text-red-500 font-medium">
              -{thisMonthTxs.filter((t) => t.type === "EXPENSE").length}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* AUTOMATED FINANCIAL INSIGHTS */}
      {/* --------------------------------------------------------- */}
      {financialInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {financialInsights.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] flex items-start gap-2.5 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#08BFD7]/10 text-[#08BFD7] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#20252A]">{item.title}</h4>
                <p className="text-[11px] text-[#6A7282] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* CHARTS GRID: DONUT CHART & CATEGORY SPENDING BAR */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* DONUT CHART (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#D9DDD9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#08BFD7]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
                Distribusi Pengeluaran
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8F96A3]">
              {categoryExpenses.length} Kategori
            </span>
          </div>

          {/* SVG Donut Visual */}
          <div className="relative flex items-center justify-center my-4">
            {categoryExpenses.length > 0 ? (
              <svg width="200" height="200" viewBox="0 0 200 200" className="rotate-[-90deg] overflow-visible">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#F0F2EE"
                  strokeWidth="22"
                />

                {/* Slices */}
                {donutSlices.map((slice) => {
                  const isHovered = activeDonutSlice === slice.name;
                  return (
                    <circle
                      key={slice.name}
                      cx="100"
                      cy="100"
                      r={donutRadius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 26 : 22}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveDonutSlice(slice.name)}
                      onMouseLeave={() => setActiveDonutSlice(null)}
                      onClick={() =>
                        setActiveDonutSlice(activeDonutSlice === slice.name ? null : slice.name)
                      }
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="w-44 h-44 rounded-full border-4 border-dashed border-[#D9DDD9] flex items-center justify-center text-xs text-[#8F96A3] text-center p-4">
                Belum ada data pengeluaran
              </div>
            )}

            {/* Center Content in Donut */}
            {categoryExpenses.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                <span className="text-[10px] uppercase font-medium tracking-wider text-[#6A7282] truncate max-w-[120px]">
                  {activeDonutData ? activeDonutData.name : "Total Pengeluaran"}
                </span>
                <span className="text-sm font-bold font-mono text-[#20252A] mt-0.5">
                  {formatCompactCurrency(activeDonutData ? activeDonutData.amount : totalAllExpenses)}
                </span>
                <span className="text-[11px] font-semibold text-[#08BFD7]">
                  {activeDonutData ? `${activeDonutData.percentage.toFixed(1)}%` : "100%"}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Legend with exact percentages */}
          <div className="space-y-1.5 pt-3 border-t border-[#F0F2EE] max-h-40 overflow-y-auto pr-1">
            {categoryExpenses.slice(0, 6).map((cat) => {
              const isSelected = activeDonutSlice === cat.name;
              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setActiveDonutSlice(cat.name)}
                  onMouseLeave={() => setActiveDonutSlice(null)}
                  onClick={() =>
                    setActiveDonutSlice(activeDonutSlice === cat.name ? null : cat.name)
                  }
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected ? "bg-[#08BFD7]/10" : "hover:bg-[#F8F9F7]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-[#20252A]">
                      {cat.icon} {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="text-[#6A7282]">{formatCurrency(cat.amount)}</span>
                    <span className="font-semibold text-[#20252A] bg-[#F0F2EE] px-1.5 py-0.5 rounded">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HORIZONTAL CATEGORY SPENDING BAR (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#D9DDD9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C8A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
                Peringkat Pengeluaran Kategori
              </h3>
            </div>
            <span className="text-[11px] text-[#8F96A3]">Tertinggi ke Terendah</span>
          </div>

          <div className="my-3 space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {categoryExpenses.length > 0 ? (
              categoryExpenses.map((cat, idx) => {
                const maxAmount = categoryExpenses[0].amount || 1;
                const barWidth = `${Math.max(4, (cat.amount / maxAmount) * 100)}%`;

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs">{cat.icon}</span>
                        <span className="font-medium text-[#20252A] truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#6A7282]">{cat.percentage.toFixed(1)}%</span>
                        <span className="font-semibold text-[#20252A]">{formatCurrency(cat.amount)}</span>
                      </div>
                    </div>
                    {/* Progress Bar with smooth fill */}
                    <div className="h-2 rounded-full bg-[#F0F2EE] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: barWidth,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#8F96A3] italic text-center py-8">
                Belum ada transaksi pengeluaran yang tercatat.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0F2EE] flex items-center justify-between text-[11px] text-[#8F96A3]">
            <span>Total Pengeluaran Tercatat:</span>
            <span className="font-bold font-mono text-[#20252A] text-xs">
              {formatCurrency(totalAllExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* MONTHLY EXPENSE TREND (SMOOTH SVG LINE CHART) */}
      {/* --------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-white border border-[#D9DDD9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F2EE]">
          <div className="flex items-center gap-2">
            <LineIcon className="w-4 h-4 text-[#08BFD7]" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
                Tren Pengeluaran
              </h3>
              <p className="text-[11px] text-[#8F96A3]">
                Fluktuasi intensitas belanja berdasarkan interval waktu
              </p>
            </div>
          </div>

          {/* Time Range Filter Pills */}
          <div className="flex items-center p-1 bg-[#F8F9F7] rounded-xl border border-[#D9DDD9] text-[11px] font-medium text-[#6A7282] self-start sm:self-auto">
            {(["7D", "30D", "3M", "6M", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTrendRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendRange === r ? "bg-white text-[#08BFD7] font-semibold shadow-xs" : "hover:text-[#20252A]"
                }`}
              >
                {r === "7D" ? "7 Hari" : r === "30D" ? "30 Hari" : r === "3M" ? "3 Bulan" : r === "6M" ? "6 Bulan" : "1 Tahun"}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Line Chart Container */}
        <div className="relative w-full overflow-x-auto py-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#08BFD7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#08BFD7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#F0F2EE" strokeDasharray="3 3" />
            <line
              x1={paddingX}
              y1={svgHeight / 2}
              x2={svgWidth - paddingX}
              y2={svgHeight / 2}
              stroke="#F0F2EE"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="#EAECE8"
            />

            {/* Filled Area */}
            {trendAreaD && <path d={trendAreaD} fill="url(#trendGradient)" />}

            {/* Line Path */}
            {trendPathD && (
              <path
                d={trendPathD}
                fill="none"
                stroke="#08BFD7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Point Circles */}
            {trendCoords.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#08BFD7"
                  strokeWidth="2.5"
                  className="transition-all hover:r-6 cursor-pointer"
                  onMouseEnter={() => setHoveredTrendPoint(pt)}
                  onMouseLeave={() => setHoveredTrendPoint(null)}
                />
                {/* X-axis Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8F96A3"
                  fontFamily="monospace"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredTrendPoint && (
            <div
              className="absolute pointer-events-none -top-2 px-2.5 py-1.5 rounded-lg bg-[#20252A] text-white text-[11px] shadow-lg transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredTrendPoint.x / svgWidth) * 100}%`,
              }}
            >
              <div className="font-semibold">{hoveredTrendPoint.label}</div>
              <div className="text-[#08BFD7] font-mono">{formatCurrency(hoveredTrendPoint.value)}</div>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* RECENT TRANSACTIONS TABLE / LIST */}
      {/* --------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-white border border-[#D9DDD9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F2EE]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6A7282]">
              Riwayat Transaksi
            </h3>
            <p className="text-[11px] text-[#8F96A3]">
              Daftar seluruh arus pengeluaran dan pemasukan
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter Buttons */}
            <div className="flex items-center p-1 bg-[#F8F9F7] rounded-xl border border-[#D9DDD9] text-[11px] font-medium text-[#6A7282]">
              {(["ALL", "EXPENSE", "INCOME"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTypeFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    typeFilter === mode ? "bg-white text-[#08BFD7] font-semibold shadow-xs" : "hover:text-[#20252A]"
                  }`}
                >
                  {mode === "ALL" ? "Semua" : mode === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-[11px] text-[#464D59] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search inside transactions */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F96A3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi berdasarkan catatan atau kategori..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] placeholder-[#8F96A3] focus:outline-none focus:border-[#08BFD7]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F96A3] hover:text-[#20252A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Transaction Rows */}
        <div className="space-y-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const meta = getCategoryMeta(tx.category);
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className="group p-3 rounded-xl bg-[#FAFBF9] border border-[#EAECE8] hover:border-[#08BFD7]/40 hover:bg-white transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#D9DDD9] flex items-center justify-center text-base shrink-0 shadow-2xs">
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#20252A] truncate">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8F96A3]">
                        <span className="text-[#6A7282]">{tx.category}</span>
                        <span>·</span>
                        <span>{tx.date}</span>
                        {tx.time && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[#08BFD7]">{tx.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Menu */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-semibold font-mono ${
                        isIncome ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>

                    {/* "..." Menu */}
                    <div
                      className="relative shrink-0"
                      ref={openMenuId === tx.id ? menuRef : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="p-1.5 rounded-lg text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === tx.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white border border-[#D9DDD9] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1 z-30 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTx(tx)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#20252A] hover:bg-[#F4F5F2] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#08BFD7]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteTx(tx)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#8F96A3] italic bg-[#F8F9F7] rounded-xl border border-dashed border-[#D9DDD9]">
              Tidak ada transaksi yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT TRANSACTION */}
      {/* --------------------------------------------------------- */}
      {isAddingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 sm:p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <h3 className="text-sm font-semibold text-[#20252A]">
                {editingTx ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsAddingTx(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A] hover:bg-[#F0F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTx} className="space-y-3.5 mt-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F9F7] rounded-xl border border-[#D9DDD9]">
                <button
                  type="button"
                  onClick={() => setTxType("EXPENSE")}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    txType === "EXPENSE"
                      ? "bg-red-500 text-white shadow-xs"
                      : "text-[#6A7282] hover:text-[#20252A]"
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("INCOME")}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    txType === "INCOME"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-[#6A7282] hover:text-[#20252A]"
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Jumlah (Nominal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#6A7282]">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    autoFocus
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-sm font-mono font-semibold text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Kategori
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7] cursor-pointer"
                >
                  {categories
                    .filter((c) => c.type === txType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date & Auto-Time Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                    Waktu (Otomatis)
                  </label>
                  <input
                    type="time"
                    value={txTime}
                    onChange={(e) => setTxTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                  />
                </div>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="Contoh: Makan siang nasi padang, Beli pulsa..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsAddingTx(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2] hover:bg-[#EAECE8] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] cursor-pointer shadow-xs"
                >
                  {editingTx ? "Simpan Perubahan" : "Catat Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: UPDATE ACTUAL BALANCE */}
      {/* --------------------------------------------------------- */}
      {isUpdatingActual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 sm:p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <h3 className="text-sm font-semibold text-[#20252A]">Sesuaikan Saldo Riil</h3>
              <button
                onClick={() => setIsUpdatingActual(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateActualBalance} className="space-y-3 mt-3">
              <p className="text-xs text-[#6A7282]">
                Masukkan total saldo nyata di rekening / dompet fisik Anda saat ini untuk menghitung selisih rekonsiliasi.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#6A7282]">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  autoFocus
                  value={actualInput}
                  onChange={(e) => setActualInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-sm font-mono font-semibold text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsUpdatingActual(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1]"
                >
                  Simpan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: CREATE CUSTOM CATEGORY */}
      {/* --------------------------------------------------------- */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-[#D9DDD9] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 sm:p-5 text-[#20252A] animate-in zoom-in-95 duration-150 relative my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#08BFD7]" />
                <h3 className="text-sm font-semibold text-[#20252A]">Tambah Kategori Baru</h3>
              </div>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="p-1 rounded-md text-[#8F96A3] hover:text-[#20252A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Langganan SaaS, Kopi..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F7] border border-[#D9DDD9] text-xs text-[#20252A] focus:outline-none focus:border-[#08BFD7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Jenis
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType("EXPENSE")}
                    className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      catType === "EXPENSE" ? "bg-red-500 text-white" : "bg-[#F4F5F2] text-[#6A7282]"
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType("INCOME")}
                    className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      catType === "INCOME" ? "bg-emerald-600 text-white" : "bg-[#F4F5F2] text-[#6A7282]"
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Ikon Emoji
                </label>
                <div className="flex items-center gap-1.5 flex-wrap p-2 bg-[#F8F9F7] rounded-xl border border-[#D9DDD9]">
                  {EMOJI_PALETTE.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCatEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center cursor-pointer transition-transform ${
                        catEmoji === emoji ? "bg-white ring-2 ring-[#08BFD7] scale-110 shadow-xs" : "hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-[11px] font-medium text-[#6A7282] uppercase tracking-wider mb-1">
                  Aksen Warna
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#F8F9F7] rounded-xl border border-[#D9DDD9]">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        catColor === color ? "ring-2 ring-offset-2 ring-[#20252A] scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2EE]">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#464D59] bg-[#F4F5F2]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#08BFD7] hover:bg-[#07ABC1] cursor-pointer shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* CONFIRM DIALOG */}
      {/* --------------------------------------------------------- */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  );
}
