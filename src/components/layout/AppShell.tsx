"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { GlobalAddModal } from "./GlobalAddModal";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { LanguageProvider } from "@/lib/i18n/context";
import { PageTransition } from "@/components/motion/PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: "success" | "error" | "info" }>;
      if (customEvent.detail?.message) {
        showToast(customEvent.detail.message, customEvent.detail.type || "success");
      }
    };
    window.addEventListener("orbit_toast", handleToast);
    return () => window.removeEventListener("orbit_toast", handleToast);
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-[100dvh] flex bg-canvas text-main font-sans selection:bg-accent/25 relative overflow-x-hidden">
        {/* Subtle deep space atmospheric ambient glows — warm accretion disk top-right, subtle cyan bottom-left */}
        <div className="fixed -top-32 -right-32 ambient-glow-warm z-0 opacity-70 pointer-events-none" />
        <div className="fixed top-1/2 -left-32 ambient-glow-deep z-0 opacity-50 pointer-events-none" />

        {/* Desktop Sidebar */}
        <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0 relative z-10">
          <Header onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

          <main className="flex-1 px-3.5 sm:px-5 md:px-8 py-3.5 sm:py-5 md:py-6 max-w-5xl mx-auto w-full">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Global Quick Add Modal */}
        <GlobalAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={(_, msg) => showToast(msg)}
        />

        {/* Toast Notification — observatory telemetry style */}
        {toastMessage && (
          <div
            className={`fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-xs text-[#20252A] animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              toastType === "error"
                ? "border-red-300"
                : toastType === "info"
                ? "border-[#08BFD7]/40"
                : "border-[#D9DDD9]"
            }`}
          >
            {toastType === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : toastType === "info" ? (
              <Info className="w-4 h-4 text-[#08BFD7] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            )}
            <span className="font-medium text-[#20252A]">{toastMessage}</span>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}
