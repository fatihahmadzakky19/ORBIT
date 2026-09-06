import { Decimal } from "@prisma/client/runtime/library";

/**
 * Format currency to Indonesian Rupiah (IDR)
 * e.g., 4750000 -> "Rp4.750.000"
 */
export function formatCurrency(
  amount: number | string | Decimal | null | undefined
): string {
  if (amount === null || amount === undefined) return "Rp0";
  const num = typeof amount === "object" && "toNumber" in amount 
    ? (amount as Decimal).toNumber() 
    : Number(amount);

  if (isNaN(num)) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace(/\s/g, "");
}

/**
 * Format compact currency for cards: e.g. Rp10M, Rp750k
 */
export function formatCompactCurrency(
  amount: number | string | Decimal | null | undefined
): string {
  if (amount === null || amount === undefined) return "Rp0";
  const num = typeof amount === "object" && "toNumber" in amount 
    ? (amount as Decimal).toNumber() 
    : Number(amount);

  if (isNaN(num)) return "Rp0";

  if (Math.abs(num) >= 1_000_000_000) {
    return `Rp${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `Rp${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `Rp${(num / 1_000).toFixed(0)}k`;
  }

  return `Rp${num}`;
}

/**
 * Format duration minutes into "90 min" or "1h 30m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Format progress percentage cleanly
 */
export function formatPercent(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  const pct = Math.round((current / target) * 100);
  return Math.min(Math.max(pct, 0), 100);
}
