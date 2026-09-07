"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
      scale: shouldReduceMotion ? 1 : 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.35,
        ease: [0.22, 1, 0.36, 1] as const, // modern ease-out cubic
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -6,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.2,
      },
    },
  };

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
