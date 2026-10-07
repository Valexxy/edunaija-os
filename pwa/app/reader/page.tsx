"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, Award } from "lucide-react";
import BionicReader from "@/components/BionicReader";

export default function ReaderPage() {
  const [classTier, setClassTier] = useState("SSS");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("edunaija_class_tier");
      if (storedTier) setClassTier(storedTier);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07080C] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cockpit</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Class Context:</span>
            <span className="font-bold text-[#00E676] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {classTier}
            </span>
          </div>
        </div>

        {/* Bionic Reader Main Container */}
        <BionicReader userTier={classTier} />
      </div>
    </div>
  );
}
