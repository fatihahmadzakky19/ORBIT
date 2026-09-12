"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  children: React.ReactNode;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20C8E8]/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#0C4A57] to-[#0F5A6B] hover:from-[#0E5463] hover:to-[#12687A] text-[#E8E1D3] hover:text-white border border-[#20C8E8]/30 shadow-[0_0_12px_rgba(32,200,232,0.12)] hover:shadow-[0_0_18px_rgba(32,200,232,0.22)]",
      secondary:
        "bg-[#151A1F] hover:bg-[#1A2025] text-[#E8E1D3] border border-[#252B30] hover:border-[#363737]",
      ghost:
        "bg-transparent hover:bg-[#151A1F] text-[#8A8580] hover:text-[#E8E1D3]",
      danger:
        "bg-[#C85C5C]/12 hover:bg-[#C85C5C]/22 text-[#C85C5C] border border-[#C85C5C]/30",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
      md: "h-9 px-3.5 text-xs rounded-lg gap-2",
      icon: "w-8 h-8 rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
