"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface BackButtonProps {
  href?: string;
  label?: string;
  fallbackHref?: string;
  className?: string;
}

export default function BackButton({
  href,
  label = "Back",
  fallbackHref = "/student",
  className = ""
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    sfx.tap();
    triggerTmaHaptic("light");

    if (href) {
      router.push(href);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group ${className}`}
      title="Return to previous screen (or Cockpit)"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
}
