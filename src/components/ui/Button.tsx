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
      "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08BFD7]/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variantStyles = {
      primary:
        "bg-[#08BFD7] hover:bg-[#07AEC4] text-white font-medium border border-[#08BFD7]/20 shadow-[0_1px_3px_rgba(8,191,215,0.2),0_4px_12px_rgba(8,191,215,0.12)] hover:shadow-[0_2px_8px_rgba(8,191,215,0.3)]",
      secondary:
        "bg-[#FFFFFF] hover:bg-[#F8F9F7] text-[#20252A] border border-[#D9DDD9] hover:border-[#C5CAC4] shadow-sm",
      ghost:
        "bg-transparent hover:bg-[#F4F5F2] text-[#687078] hover:text-[#20252A]",
      danger:
        "bg-[#DC2626]/10 hover:bg-[#DC2626]/16 text-[#DC2626] border border-[#DC2626]/20",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-4 text-[13px] font-medium rounded-xl gap-2",
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
