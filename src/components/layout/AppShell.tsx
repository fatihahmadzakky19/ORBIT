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
      <div className="min-h-screen flex bg-canvas text-main font-sans selection:bg-accent/30 relative overflow-x-hidden">
        {/* Ambient atmospheric lighting */}
        <div className="fixed -top-24 -right-24 ambient-glow-indigo z-0 opacity-80" />
        <div className="fixed top-1/2 -left-28 ambient-glow-cyan z-0 opacity-60" />

        {/* Desktop Sidebar */}
        <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative z-10">
          <Header onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto w-full">
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

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-elevated/90 backdrop-blur-md border border-line shadow-2xl text-xs text-main animate-in slide-in-from-bottom-2 fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}

