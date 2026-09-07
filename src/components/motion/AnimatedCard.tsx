"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import React, { forwardRef } from "react";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
  glowOnHover?: boolean;
  className?: string;
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      children,
      interactive = true,
      glowOnHover = true,
      className = "",
      delay = 0,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.05 : 0.4,
          delay,
          ease: [0.25, 1, 0.5, 1] as const,
        }}
        whileHover={
          interactive && !shouldReduceMotion
            ? {
                y: -3,
                transition: { duration: 0.2, ease: "easeOut" },
              }
            : undefined
        }
        whileTap={
          interactive && !shouldReduceMotion
            ? {
                scale: 0.985,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        className={`group relative rounded-xl border border-line/80 bg-surface/70 backdrop-blur-md transition-shadow duration-300 ${
          glowOnHover ? "hover:shadow-[0_8px_30px_rgba(129,140,248,0.08)] hover:border-accent/40" : ""
        } ${className}`}
        {...props}
      >
        {/* Subtle top border highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none rounded-t-xl" />
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
