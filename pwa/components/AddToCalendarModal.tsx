"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, Check, X, Download, ExternalLink, 
  Sparkles, Radio, BookOpen, Bell
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface CalendarEventDef {
  id: string;
  title: string;
  category: "Showdown" | "JAMB UTME" | "WAEC SSCE" | "Daily Habit";
  startTime: string; // ISO
  endTime: string;   // ISO
  recurrence?: string;
  description: string;
  location: string;
}

export const CALENDAR_EVENTS: CalendarEventDef[] = [
  {
    id: "sunday-showdown",
    title: "⚔️ EduNaija Sunday National Showdown League",
    category: "Showdown",
    startTime: "20250420T190000Z", // 8PM WAT is 7PM UTC
    endTime: "20250420T200000Z",
    recurrence: "RRULE:FREQ=WEEKLY;BYDAY=SU",
    description: "Weekly live national championship league on EduNaija OS! Compete against top scholars across all 36 Nigerian states for cash prizes and tier promotions.",
    location: "EduNaija OS Arena (https://edunaija.ng/showdown)"
  },
  {
    id: "jamb-mock-2025",
    title: "🔒 JAMB UTME Official Mock Examination",
    category: "JAMB UTME",
    startTime: "20250410T080000Z",
    endTime: "20250410T110000Z",
    description: "Official JAMB nationwide mock CBT examination session. Arrive 45 minutes early with registration slip.",
    location: "Designated Accredited CBT Center"
  },
  {
    id: "waec-ssce-2025",
    title: "📝 WAEC SSCE Senior Secondary Examination Kickoff",
    category: "WAEC SSCE",
    startTime: "20250505T080000Z",
    endTime: "20250505T120000Z",
    description: "West African Senior School Certificate Examination series commencement. General Mathematics & English Language.",
    location: "Accredited Secondary School Hall"
  },
  {
    id: "daily-study-habit",
    title: "📚 EduNaija Daily Topic Mastery Sprint (30 Qs)",
    category: "Daily Habit",
    startTime: "20250415T180000Z", // 7PM WAT
    endTime: "20250415T184500Z",
    recurrence: "RRULE:FREQ=DAILY",
    description: "Daily 45-minute Socratic practice session to protect your streak and maintain 280+ predicted JAMB score.",
    location: "EduNaija OS (http://localhost:3000/quiz)"
  }
];

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
}

export default function AddToCalendarModal({
  isOpen,
  onClose,
  defaultEventId = "sunday-showdown"
}: AddToCalendarModalProps) {
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const currentEvt = CALENDAR_EVENTS.find(e => e.id === selectedEventId) || CALENDAR_EVENTS[0];

  const getGoogleCalendarUrl = (evt: CalendarEventDef) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const text = encodeURIComponent(evt.title);
    const dates = `${evt.startTime}/${evt.endTime}`;
    const details = encodeURIComponent(evt.description);
    const location = encodeURIComponent(evt.location);
    const recur = evt.recurrence ? `&recur=${encodeURIComponent(evt.recurrence)}` : "";
    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}${recur}&ctz=Africa/Lagos`;
  };

  const handleDownloadIcs = (evt: CalendarEventDef) => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EduNaija OS//Universal Academic Calendar//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${evt.id}-${Date.now()}@edunaija.ng`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `LOCATION:${evt.location}`,
      `DTSTART:${evt.startTime}`,
      `DTEND:${evt.endTime}`,
      ...(evt.recurrence ? [evt.recurrence] : []),
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: EduNaija Academic Event",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${evt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#090b14] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            onClick={() => { sfx.tap(); onClose(); }}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E676]">
              <Calendar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Add Exam &amp; Showdown to Calendar
              </h3>
              <p className="text-xs text-zinc-400">
                1-Click Google Calendar sync &amp; Apple/Outlook (.ics) export.
              </p>
            </div>
          </div>

          {/* Event Picker Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300">Select Academic Event:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CALENDAR_EVENTS.map(evt => {
                const isSelected = evt.id === selectedEventId;
                return (
                  <button
                    key={evt.id}
                    onClick={() => { sfx.tap(); setSelectedEventId(evt.id); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/50 shadow-sm shadow-emerald-950"
                        : "bg-white/5 border-white/5 hover:border-white/15 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white/10 text-emerald-300 font-bold">
                        {evt.category}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#00E676]" />}
                    </div>
                    <div className="font-bold text-xs text-white truncate">
                      {evt.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Preview Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#00E676]" /> WAT (West Africa Time)
              </span>
              <span className="text-emerald-400 font-bold">
                {currentEvt.recurrence ? "Recurring Weekly" : "Official Date"}
              </span>
            </div>
            <h4 className="font-black text-sm text-white">{currentEvt.title}</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {currentEvt.description}
            </p>
          </div>

          {/* Action Sync Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={getGoogleCalendarUrl(currentEvt)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sfx.tap();
                triggerTmaHaptic("medium");
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Calendar className="w-4 h-4 fill-current" />
              <span>Google Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => handleDownloadIcs(currentEvt)}
              className="py-2.5 px-3 rounded-xl glass-card border border-white/15 hover:border-emerald-400/40 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {downloaded ? <Check className="w-4 h-4 text-[#00E676]" /> : <Download className="w-4 h-4 text-emerald-400" />}
              <span>{downloaded ? "Downloaded!" : "Apple / Outlook (.ics)"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
