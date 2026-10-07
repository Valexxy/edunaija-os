"use client";

import React from "react";
import { motion } from "framer-motion";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  shimmerColor?: string;
  background?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  onClick,
  className = "",
  shimmerColor = "#00E676",
  background = "rgba(10, 14, 26, 0.95)",
}) => {
  return (
    <button
      onClick={() => {
        sfx.tap();
        triggerTmaHaptic("light");
        if (onClick) onClick();
      }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-2xl p-[1.5px] font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg ${className}`}
    >
      {/* 2026 Rotating Conic Gradient Beam */}
      <span
        className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, #0000 0%, ${shimmerColor} 50%, #0000 100%)`,
        }}
      />

      {/* Button Interior */}
      <span
        className="inline-flex h-full w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-black backdrop-blur-3xl transition-colors group-hover:bg-opacity-80"
        style={{ background }}
      >
        {children}
      </span>
    </button>
  );
};
