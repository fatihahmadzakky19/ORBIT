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
      glowOnHover = false,
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
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.05 : 0.35,
          delay,
          ease: [0.25, 1, 0.5, 1] as const,
        }}
        whileHover={
          interactive && !shouldReduceMotion
            ? {
                y: -1.5,
                transition: { duration: 0.18, ease: "easeOut" },
              }
            : undefined
        }
        whileTap={
          interactive && !shouldReduceMotion
            ? {
                scale: 0.99,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        className={`group relative rounded-[14px] border border-[#D9DDD9] bg-[#FFFFFF] shadow-sm transition-all duration-180 ${
          glowOnHover
            ? "hover:border-[#08BFD7]/40 hover:shadow-[0_4px_16px_rgba(8,191,215,0.12)]"
            : "hover:border-[#C5CAC4] hover:shadow-md"
        } ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
