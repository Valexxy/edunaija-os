"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, Trophy, Radio, Gift, Shield, GraduationCap, Users, Building2, 
  Clock, Calendar, UserPlus, Flame, Heart, ChevronDown, Bot
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface NavBarProps {
  currentRole: "student" | "parent" | "tutor" | "school";
  onRoleChange: (newRole: "student" | "parent" | "tutor" | "school") => void;
  onOpenRegister: () => void;
}

export default function NavBar({ currentRole, onRoleChange, onOpenRegister }: NavBarProps) {
  const pathname = usePathname();
  
  // Real-time West Africa Time (WAT) Clock
  const [watTime, setWatTime] = useState("");
  const [watDate, setWatDate] = useState("");
  const [showdownCountdown, setShowdownCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WAT (UTC+1)
      const optionsTime: Intl.DateTimeFormatOptions = { 
        timeZone: "Africa/Lagos", 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit", 
        hour12: true 
      };
      const optionsDate: Intl.DateTimeFormatOptions = { 
        timeZone: "Africa/Lagos", 
        weekday: "short", 
        month: "short", 
        day: "numeric" 
      };

      setWatTime(new Intl.DateTimeFormat("en-US", optionsTime).format(now));
      setWatDate(new Intl.DateTimeFormat("en-US", optionsDate).format(now));

      // Calculate next Sunday 8:00 PM WAT
      const nextSunday = new Date();
      const day = nextSunday.getDay();
      const daysUntilSunday = (7 - day) % 7;
      nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
      nextSunday.setHours(20, 0, 0, 0); // 8:00 PM

      const diff = Math.max(0, nextSunday.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setShowdownCountdown({ days: d, hours: h, mins: m, secs: s });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    sfx.tap();
    triggerTmaHaptic("light");
  };

  const navItems = [
    { href: "/", label: "Home", icon: Zap },
    { href: "/subagents", label: "Swarm", icon: Bot, badge: "100" },
    { href: "/schools", label: "Schools", icon: Building2, badge: "Admit" },
    { href: "/showdown", label: "Showdown", icon: Radio, badge: "Live" },
    { href: "/competition", label: "Sprint", icon: Trophy },
    { href: "/referral", label: "Referral", icon: Gift },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#050508]/85 backdrop-blur-xl border-b border-white/10 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Live Time */}
          <div className="flex items-center gap-3">
            <Link href="/" onClick={handleNavClick} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-naija-green to-[#00E676] flex items-center justify-center font-black text-black text-sm shadow-[0_0_15px_rgba(0,230,118,0.4)]">
                🇳🇬
              </div>
              <div>
                <span className="font-display font-black text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  EduNaija <span className="text-[#00E676]">OS</span>
                </span>
                <div className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                  Universal Education Operating System
                </div>
              </div>
            </Link>

            {/* Live West Africa Time (WAT) Ticker */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 font-mono text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-[#00E676] animate-pulse" />
              <span className="text-zinc-300 font-semibold">{watDate}</span>
              <span className="text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/5">{watTime} WAT</span>
            </div>
          </div>

          {/* Sunday Showdown Countdown Ticker */}
          <Link 
            href="/showdown" 
            onClick={handleNavClick}
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-zinc-400 text-[11px] font-semibold">Sunday 8PM Showdown:</span>
            <span className="font-mono font-bold text-naija-gold">
              {showdownCountdown.days}d {showdownCountdown.hours}h {showdownCountdown.mins}m {showdownCountdown.secs}s
            </span>
          </Link>

          {/* Role Switcher & Onboarding Trigger */}
          <div className="flex items-center gap-2">
            {/* Persona Switcher Dropdown / Pills */}
            <div className="flex items-center bg-black/50 p-1 rounded-2xl border border-white/10 text-xs">
              {[
                { id: "student", label: "Student", icon: GraduationCap, color: "bg-[#00E676] text-black" },
                { id: "parent", label: "Parent", icon: Shield, color: "bg-emerald-500 text-white" },
                { id: "tutor", label: "Tutor", icon: Users, color: "bg-amber-400 text-black" },
                { id: "school", label: "School", icon: Building2, color: "bg-purple-500 text-white" }
              ].map(p => {
                const Icon = p.icon;
                const isActive = currentRole === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { sfx.tap(); onRoleChange(p.id as any); }}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px] ${
                      isActive ? `${p.color} shadow-sm font-extrabold` : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Register / Sign Up Button */}
            <button
              onClick={() => { sfx.tap(); onOpenRegister(); }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register / Join</span>
            </button>
          </div>

        </div>
      </header>

      {/* Floating Bottom Glass Navigation Dock */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md bg-black/85 backdrop-blur-2xl border border-white/15 rounded-3xl px-4 py-2.5 flex justify-between items-center text-xs z-50 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center gap-1 relative px-2.5 py-1 rounded-2xl transition-all ${
                isActive ? "text-[#00E676] font-extrabold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-red-500 text-white text-[8px] font-black rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}