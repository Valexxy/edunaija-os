"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface BentoModuleCardProps {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  tag?: string;
  icon?: any;
  imageSrc?: string;
  imageAlt?: string;
  accentGlow?: "emerald" | "cyan" | "purple" | "amber" | "rose";
  colSpan?: "col-span-12" | "col-span-12 md:col-span-8" | "col-span-12 md:col-span-6" | "col-span-12 md:col-span-4" | "col-span-12 md:col-span-3";
  actionLabel?: string;
  children?: ReactNode;
}

export default function BentoModuleCard({
  title,
  subtitle,
  description,
  href,
  badge,
  badgeColor = "emerald",
  tag,
  icon: Icon,
  imageSrc,
  imageAlt,
  accentGlow = "emerald",
  colSpan = "col-span-12 md:col-span-6",
  actionLabel = "Open Module",
  children
}: BentoModuleCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const glowStyles = {
    emerald: "hover:border-emerald-500/40 hover:shadow-[0_0_35px_rgba(0,230,118,0.18)] group-hover:text-[#00E676]",
    cyan: "hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(0,229,255,0.18)] group-hover:text-cyan-300",
    purple: "hover:border-purple-500/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.18)] group-hover:text-purple-300",
    amber: "hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(255,179,0,0.18)] group-hover:text-amber-300",
    rose: "hover:border-rose-500/40 hover:shadow-[0_0_35px_rgba(244,63,94,0.18)] group-hover:text-rose-300",
  }[accentGlow];

  const spotlightRgba = {
    emerald: "rgba(0, 230, 118, 0.16)",
    cyan: "rgba(0, 229, 255, 0.16)",
    purple: "rgba(168, 85, 247, 0.16)",
    amber: "rgba(255, 179, 0, 0.16)",
    rose: "rgba(244, 63, 94, 0.16)",
  }[accentGlow];

  const handleClick = () => {
    sfx.tap();
    triggerTmaHaptic("light");
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className={`${colSpan} group relative rounded-3xl bg-[#0b0f19]/80 backdrop-blur-2xl border border-white/10 ${glowStyles} transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer p-5 sm:p-6 active:scale-[0.99]`}
    >
      {/* 2026 Interactive Cursor Spotlight Beam */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              280px circle at ${mouseX}px ${mouseY}px,
              ${spotlightRgba},
              transparent 80%
            )
          `,
        }}
      />
      {/* Specular Top Edge Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Optional Background Contextual Artwork / Image Placeholder */}
      {imageSrc && (
        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
          <img
            src={imageSrc}
            alt={imageAlt || title}
            className="w-full h-full object-cover object-center filter saturate-150 contrast-125 scale-105 group-hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent" />
        </div>
      )}

      {/* Card Content Top Header */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            {tag && (
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400">
                {tag}
              </span>
            )}
          </div>

          {badge && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00E676] border border-emerald-500/30 uppercase">
              {badge}
            </span>
          )}
        </div>

        <div>
          <div className="text-[11px] font-mono text-zinc-400">
            {subtitle}
          </div>
          <h3 className="text-base sm:text-lg font-display font-black text-white group-hover:translate-x-0.5 transition-transform">
            {title}
          </h3>
          <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {children}
      </div>

      {/* Card Footer Action Strip */}
      <div className="relative z-10 pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-zinc-300 group-hover:text-white">
        <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
          <Sparkles className="w-3 h-3 text-[#00E676]" />
          {actionLabel}
        </span>
        <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00E676] group-hover:text-black group-hover:border-transparent transition-all">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
