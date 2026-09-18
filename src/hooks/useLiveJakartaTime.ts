"use client";

import { useState, useEffect } from "react";
import {
  getJakartaDateParts,
  formatDateIndonesia,
  formatShortDateIndonesia,
  formatTimeIndonesia,
  getGreetingIndonesia,
  JakartaDateParts,
} from "@/lib/date";

export interface LiveJakartaTimeState extends JakartaDateParts {
  formattedDate: string;        // "Jumat, 18 September 2026"
  formattedShortDate: string;   // "18 Sep 2026"
  formattedTime: string;        // "09:20 WIB"
  formattedTimeWithSec: string; // "09:20:15 WIB"
  greeting: string;             // "Selamat pagi"
  isMounted: boolean;
}

/**
 * Client-side ticking clock hook anchored strictly to Asia/Jakarta (WIB).
 * Updates every 1 second, automatically handles day rollovers,
 * and cleanly disposes the interval on unmount (no memory leaks).
 */
export function useLiveJakartaTime(): LiveJakartaTimeState {
  const [parts, setParts] = useState<JakartaDateParts>(() => getJakartaDateParts());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setParts(getJakartaDateParts());

    const timer = setInterval(() => {
      setParts(getJakartaDateParts());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    ...parts,
    formattedDate: `${parts.dayName}, ${parts.day} ${parts.monthName} ${parts.year}`,
    formattedShortDate: `${parts.day} ${parts.monthNameShort} ${parts.year}`,
    formattedTime: `${parts.timeStr} WIB`,
    formattedTimeWithSec: `${parts.timeWithSecStr} WIB`,
    greeting: getGreetingIndonesia(),
    isMounted,
  };
}
