"use client";

import { useState, useEffect } from "react";
import { Users, Flame, Clock, MessageSquare, AlertCircle, Sparkles, Plus, Share2, Shield } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface SquadMember {
  id: string;
  user_key: string;
  member_name: string;
  state: string;
  role: string;
  today_questions_solved: number;
  status: "active" | "pending" | "dey_sleep";
  last_active_at: string;
}

interface Squad {
  id: string;
  code: string;
  name: string;
  motto: string;
  subject_focus: string;
  grade_level: string;
  streak_days: number;
  last_study_date_wat: string;
  pomodoro_cycle_state: string;
  current_member_count: number;
  members: SquadMember[];
}

export default function StudySquadCard({ grade }: { grade: string }) {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadMotto, setNewSquadMotto] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Load squads
  const fetchSquads = async () => {
    try {
      const res = await fetch(`/api/backend/competition/squads/list?grade=${encodeURIComponent(grade)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.squads) {
          setSquads(data.squads);
          if (data.squads.length > 0 && !selectedSquad) {
            setSelectedSquad(data.squads[0]);
          }
        }
      }
    } catch (err) {
      console.error("Squad fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, [grade]);

  // Pomodoro timer tick
  useEffect(() => {
    if (!isPomoRunning) return;
    const timer = setInterval(() => {
      setPomoSeconds((s) => {
        if (s <= 1) {
          sfx.correct();
          return 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPomoRunning]);

  const formatPomoTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) return;
    sfx.tap();
    try {
      const res = await fetch("/api/backend/competition/squads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSquadName,
          motto: newSquadMotto || "Together We Scale JAMB & WASSCE",
          grade_level: grade,
          subject_focus: "All Subjects",
          creator_key: "STU-LOCAL-USER"
        })
      });
      if (res.ok) {
        sfx.correct();
        setToast("Squad successfully created!");
        setShowCreateModal(false);
        setNewSquadName("");
        fetchSquads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinSquad = async () => {
    if (!joinCode.trim()) return;
    sfx.tap();
    try {
      const res = await fetch("/api/backend/competition/squads/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: joinCode,
          user_key: "STU-LOCAL-USER"
        })
      });
      if (res.ok) {
        sfx.correct();
        setToast("Joined Squad successfully!");
        setJoinCode("");
        fetchSquads();
      } else {
        sfx.wrong();
        setToast("Invalid code or Squad full!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNudgeMember = async (member: SquadMember, sqName: string) => {
    sfx.tap();
    triggerTmaHaptic("heavy");
    try {
      const res = await fetch("/api/backend/competition/squads/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_user_key: member.user_key,
          sender_name: "Squad Leader",
          squad_name: sqName
        })
      });
      if (res.ok) {
        const data = await res.json();
        window.open(data.whatsapp_url, "_blank");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex justify-between items-center">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-75">✕</button>
        </div>
      )}

      {/* Squad Blood Pact & Co-op Hero */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-black border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#00E676] flex items-center justify-center text-slate-950 font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Co-Op Study Squad</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                  Blood Pact Active
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">All 3–6 squad scholars must solve 5 questions before 23:59 WAT</p>
            </div>
          </div>

          {/* Synchronized 25/5 Pomodoro Cycle */}
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Co-op Pomodoro</span>
            </div>
            <div className="text-xl font-mono font-black text-white">{formatPomoTime(pomoSeconds)}</div>
          </div>
        </div>

        {/* Squad Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {squads.map((sq) => (
            <button
              key={sq.id}
              onClick={() => {
                sfx.tap();
                setSelectedSquad(sq);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedSquad?.id === sq.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{sq.name}</span>
              <span className="text-[10px] opacity-80">({sq.streak_days}d streak)</span>
            </button>
          ))}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-dashed border-white/20 whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Squad</span>
          </button>
        </div>

        {/* Selected Squad Details */}
        {selectedSquad && (
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white text-sm">{selectedSquad.name}</div>
                <div className="text-[11px] text-zinc-400 italic">"{selectedSquad.motto}"</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
                  Code: {selectedSquad.code}
                </span>
              </div>
            </div>

            {/* Squad Members Roster */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Squad Scholars & Daily Blood Pact Status:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedSquad.members?.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      m.status === "dey_sleep" || m.status === "pending" || m.today_questions_solved < 5
                        ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                        : "bg-slate-900/80 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        m.today_questions_solved < 5 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {m.member_name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-xs truncate max-w-[120px]">{m.member_name}</div>
                        <div className="text-[10px] text-zinc-400">{m.today_questions_solved}/5 questions completed</div>
                      </div>
                    </div>

                    {m.today_questions_solved < 5 ? (
                      <button
                        onClick={() => handleNudgeMember(m, selectedSquad.name)}
                        className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm cursor-pointer transition"
                        title="Alert on WhatsApp: Daily session due before 23:59 WAT"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Remind on WhatsApp</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        ✓ Goal Achieved
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Share Code for WhatsApp Invite */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-400">Want to add your study buddy?</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Join my EduNaija Co-op Study Squad '${selectedSquad.name}'! Use code: ${selectedSquad.code} at https://edunaija.com/competition. Let's hit 300+ in JAMB together!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-1 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3 h-3" />
                <span>Invite on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Join Via Code Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter 6-digit squad code (e.g. SQ-LAG-300)"
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
        />
        <button
          onClick={handleJoinSquad}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer transition"
        >
          Join
        </button>
      </div>

      {/* Modal: Create Squad */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Create Co-Op Study Squad</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Squad Name:</label>
                <input
                  type="text"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="e.g. Ogbaru Distinction Eagles"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Squad Motto:</label>
                <input
                  type="text"
                  value={newSquadMotto}
                  onChange={(e) => setNewSquadMotto(e.target.value)}
                  placeholder="e.g. No Sleep Till 300+ in UTME!"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                ⚡ <strong>Blood Pact Rule:</strong> Squad streaks are shared. If any member goes inactive past 23:59 WAT, the entire squad streak is at risk unless revived with BrainCoins!
              </div>

              <button
                onClick={handleCreateSquad}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer"
              >
                Seal Blood Pact &amp; Launch Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}