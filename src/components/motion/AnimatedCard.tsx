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
        className={`group relative rounded-[14px] border border-[#252B30] bg-[#11161B] transition-all duration-180 ${
          glowOnHover
            ? "hover:border-[#363737] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            : "hover:border-[#363737] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
        } ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
