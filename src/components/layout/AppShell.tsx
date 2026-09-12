"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { GlobalAddModal } from "./GlobalAddModal";
import { CheckCircle2 } from "lucide-react";
import { LanguageProvider } from "@/lib/i18n/context";
import { PageTransition } from "@/components/motion/PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex bg-canvas text-main font-sans selection:bg-accent/25 relative overflow-x-hidden">
        {/* Subtle deep space atmospheric ambient glows — warm accretion disk top-right, subtle cyan bottom-left */}
        <div className="fixed -top-32 -right-32 ambient-glow-warm z-0 opacity-70 pointer-events-none" />
        <div className="fixed top-1/2 -left-32 ambient-glow-deep z-0 opacity-50 pointer-events-none" />

        {/* Desktop Sidebar */}
        <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative z-10">
          <Header onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

          <main className="flex-1 px-4 py-5 md:px-8 md:py-6 max-w-5xl mx-auto w-full">
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
          <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#11161B]/95 backdrop-blur-md border border-[#252B30] shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-xs text-main animate-in slide-in-from-bottom-2 fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#00A982] shrink-0" />
            <span className="font-medium text-[#E8E1D3]">{toastMessage}</span>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}
