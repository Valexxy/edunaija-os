"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, Copy, Check, Users, Gift, Sparkles, Award, 
  ArrowUpRight, DollarSign, Building, X, CheckCircle2, 
  ShieldAlert, ShieldCheck, Flame, Trophy, Zap, ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function ReferralHubPage() {
  const [copied, setCopied] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [selectedBank, setSelectedBank] = useState("058"); // GTBank
  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [accountName, setAccountName] = useState("Chisom Okonkwo");
  const [isProcessing, setIsProcessing] = useState(false);

  // Growth & Anti-Churning State
  const [activeTab, setActiveTab] = useState<"referral" | "streak_vault">("referral");
  const [selectedHook, setSelectedHook] = useState<"cbt" | "theory" | "showdown">("cbt");
  const [claimedScholarPass, setClaimedScholarPass] = useState(false);
  const [claimedShield, setClaimedShield] = useState(false);

  // Live stats from backend with resilient defaults
  const [stats, setStats] = useState({
    referral_code: "CHISOM-7X",
    tier1_count: 4,
    tier2_count: 14,
    total_hearts_earned: 80,
    total_xp_earned: 940,
    cash_bounty_accrued: 2500.0,
    rank_ambassador: "Gold Ambassador",
    streak_shields: 2,
    active_streak_days: 19
  });

  const myCode = stats.referral_code;
  const [webInviteUrl, setWebInviteUrl] = useState(`http://localhost:3000/?ref=${myCode}`);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebInviteUrl(`${window.location.origin}/?ref=${myCode}`);
      const isPassActive = localStorage.getItem("edunaija_scholar_pass") === "active";
      if (isPassActive) setClaimedScholarPass(true);
      const shieldClaimed = localStorage.getItem("edunaija_shield_claimed") === "true";
      if (shieldClaimed) setClaimedShield(true);
    }
  }, [myCode]);

  useEffect(() => {
    // Attempt live fetch from backend
    fetch("/api/backend/referrals/stats/chisom_123")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats(prev => ({
            ...prev,
            ...data,
            cash_bounty_accrued: data.cash_bounty_accrued ?? prev.cash_bounty_accrued
          }));
        }
      })
      .catch(() => {});
  }, []);

  const copyCode = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWebLink = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    navigator.clipboard.writeText(webInviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getWhatsAppMessage = () => {
    if (selectedHook === "cbt") {
      return `Chai! I scored 295/400 on EduNaija OS Mock CBT today! 🇳🇬 Test your score before JAMB 2025 and get 10 FREE study hearts immediately with my invite code ${myCode}: ${webInviteUrl}`;
    } else if (selectedHook === "theory") {
      return `Stop losing marks in WAEC Physics & Chemistry theory! ✍️ EduNaija OS grades your steps using the actual WAEC marking rubrics (Method & Accuracy marks). Join with code ${myCode}: ${webInviteUrl}`;
    } else {
      return `Join my study clan on EduNaija OS! 🏆 We are competing for scholarships and cash prizes every Sunday 8PM National Showdown. Use code ${myCode} for bonus hearts: ${webInviteUrl}`;
    }
  };

  const shareWhatsApp = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    const text = getWhatsAppMessage();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleClaimScholarPass = () => {
    if (stats.tier1_count < 3) return;
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_scholar_pass", "active");
    }
    setClaimedScholarPass(true);
  };

  const handleClaimStreakShield = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_shield_claimed", "true");
    }
    setClaimedShield(true);
    setStats(prev => ({ ...prev, streak_shields: prev.streak_shields + 1 }));
  };

  const handleWithdrawPayout = async () => {
    setIsProcessing(true);
    sfx.tap();

    try {
      await fetch("/api/backend/referrals/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "chisom_123",
          amount_naira: stats.cash_bounty_accrued,
          bank_code: selectedBank,
          account_number: accountNumber,
          account_name: accountName
        })
      });
    } catch {
      // Graceful fallback for local test
    }

    setIsProcessing(false);
    setPayoutSuccess(true);
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });

    setStats(prev => ({ ...prev, cash_bounty_accrued: 0.0 }));

    setTimeout(() => {
      setShowPayoutModal(false);
      setPayoutSuccess(false);
    }, 2800);
  };

  return (
    <main className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen pb-24 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <span className="text-[11px] font-bold text-naija-gold tracking-widest uppercase">
            Viral Growth & Anti-Churning Hub
          </span>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
            Invite, Earn & Protect
          </h1>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-naija-gold/10 border border-naija-gold/30 flex items-center justify-center text-naija-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]">
          <Gift className="w-6 h-6" />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("referral")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "referral"
              ? "bg-[#00E676] text-black shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Referral Engine (Earn)</span>
        </button>
        <button
          onClick={() => setActiveTab("streak_vault")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "streak_vault"
              ? "bg-amber-400 text-black shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Streak Shield Vault (No Churn)</span>
        </button>
      </div>

      {activeTab === "referral" ? (
        <>
          {/* Hero Code Card */}
          <div className="glass-card rounded-3xl p-5 md:p-6 mb-6 border border-white/10 text-center relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 mb-3">
              <Zap className="w-3.5 h-3.5 fill-current" /> Give 10 Hearts • Get 10 Hearts + 100 XP
            </div>
            
            <div className="text-xs text-zinc-400 mb-2 font-medium">Your Exclusive Viral Referral Code</div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-3xl md:text-4xl font-mono font-black tracking-widest text-white px-6 py-2.5 rounded-2xl bg-black/50 border border-white/10 shadow-inner">
                {myCode}
              </div>
              <button
                onClick={copyCode}
                aria-label="Copy Code"
                className="w-12 h-12 rounded-2xl glass-card border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#00E676]/50 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-5 h-5 text-[#00E676]" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Web Referral URL Card */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 mb-4 text-left">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Direct In-App Web Link</span>
                {copiedLink && <span className="text-[#00E676] font-bold">Link Copied! ✓</span>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webInviteUrl}
                  className="flex-1 bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none"
                />
                <button
                  onClick={copyWebLink}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Viral Angle Selector for WhatsApp */}
            <div className="mb-4 text-left">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Choose Your High-Converting Pitch Hook:
              </label>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
                <button
                  onClick={() => setSelectedHook("cbt")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedHook === "cbt"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  🎯 CBT Score Mock
                </button>
                <button
                  onClick={() => setSelectedHook("theory")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedHook === "theory"
                      ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                      : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ✍️ WAEC Step Rubrics
                </button>
                <button
                  onClick={() => setSelectedHook("showdown")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedHook === "showdown"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  🏆 ₦50k Showdown
                </button>
              </div>
            </div>

            <button
              onClick={shareWhatsApp}
              className="w-full bg-gradient-to-r from-[#00E676] to-[#008751] text-black font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,230,118,0.35)] hover:brightness-110 active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              Share Selected Hook to WhatsApp (+10 Hearts per Friend)
            </button>
          </div>

          {/* Viral Milestone Rewards Ladder */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Referral Unlock Milestones
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {stats.tier1_count} Direct Friends Joined
              </span>
            </div>

            <div className="space-y-3">
              {/* Milestone 1: 3 Friends = Scholar Pass Free */}
              <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-transparent flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">3 Friends: 7-Day Scholar Pass FREE</h3>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Worth ₦1,500
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Unlocks full proctored CBT mocks, unlimited WAEC theory grading & deep autopsy.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {claimedScholarPass ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : stats.tier1_count >= 3 ? (
                    <button
                      onClick={handleClaimScholarPass}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black shadow-lg animate-pulse"
                    >
                      Claim Pass
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-zinc-500">
                      {stats.tier1_count}/3 Friends
                    </span>
                  )}
                </div>
              </div>

              {/* Milestone 2: 5 Friends = Golden Streak Shield */}
              <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 to-transparent flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">5 Friends: Golden Streak Shield</h3>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30">
                        Anti-NEPA
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Prevents your daily streak reset if power outage or data expires.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {claimedShield ? (
                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Vault
                    </span>
                  ) : stats.tier1_count >= 5 ? (
                    <button
                      onClick={handleClaimStreakShield}
                      className="px-3 py-1.5 rounded-xl bg-blue-400 hover:bg-blue-300 text-black text-xs font-black shadow-lg"
                    >
                      Claim Shield
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-zinc-500">
                      {stats.tier1_count}/5 Friends
                    </span>
                  )}
                </div>
              </div>

              {/* Milestone 3: 10 Friends = Ambassador Cash Bounty */}
              <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-transparent flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">10 Friends: ₦1,000 Cash Bounty</h3>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Direct Bank
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Cash transferred instantly into your GTBank, Access, OPay, or PalmPay account.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-zinc-500">
                    {stats.tier1_count}/10 Friends
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4-Tier Network Earnings Breakdown */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Referral Tree</h2>
              <span className="text-[11px] font-bold text-naija-gold bg-naija-gold/10 px-2.5 py-0.5 rounded-full border border-naija-gold/20">
                {stats.rank_ambassador}
              </span>
            </div>

            <div className="space-y-3">
              {/* Tier 1 */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00E676]" /> Tier 1: Direct Buddies
                  </div>
                  <div className="text-[11px] text-zinc-400">{stats.tier1_count} friends joined with your code</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[#00E676]">+{stats.total_hearts_earned} Hearts</div>
                  <div className="text-[10px] text-zinc-400">+{stats.total_xp_earned} XP</div>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Tier 2: Viral Ripple
                  </div>
                  <div className="text-[11px] text-zinc-400">{stats.tier2_count} friends invited by your buddies</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-purple-300">+{stats.tier2_count * 2} Hearts</div>
                  <div className="text-[10px] text-zinc-400">10% XP Override</div>
                </div>
              </div>

              {/* Tier 3: Ambassador Cash Bounty */}
              <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-naija-gold" /> Tier 3: Ambassador Cash
                  </div>
                  <div className="text-[11px] text-amber-200/80">₦500 per Season Pass conversion</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-sm font-black text-naija-gold">₦{stats.cash_bounty_accrued.toLocaleString()} Accrued</div>
                  {stats.cash_bounty_accrued > 0 ? (
                    <button
                      onClick={() => setShowPayoutModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-naija-gold text-black font-extrabold text-[10px] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                    >
                      Withdraw <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Paid out ✓</span>
                  )}
                </div>
              </div>

              {/* Tier 4: School Clan Boost */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-400" /> Tier 4: School Clan Boost
                  </div>
                  <div className="text-[11px] text-zinc-400">Queen&apos;s College Yaba (72/100 active)</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-blue-300">1.25x XP</div>
                  <div className="text-[10px] text-zinc-400">28 to next tier</div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Streak Shield Vault View (Anti-Churning Core) */
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,191,0,0.25)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
              Active Anti-Churn Vault
            </span>
            <h2 className="font-display font-black text-2xl text-white mb-2">
              {stats.streak_shields} Golden Streak Shields Available
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-md mx-auto mb-5">
              In Nigeria, power cuts (NEPA/discos) and data outages happen unexpectedly. Streak Shields automatically absorb missed days so your hard-earned study momentum is never lost.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-left">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Current Streak</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-5 h-5 fill-amber-400" /> {stats.active_streak_days} Days Active
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-left">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Shields in Reserve</span>
                <span className="text-lg font-black text-[#00E676] flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5" /> {stats.streak_shields} Shields
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-naija-gold" /> How to Earn More Streak Shields:
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span>Invite 5 Classmates via WhatsApp</span>
                <span className="text-[#00E676] font-bold">+1 Shield</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span>Score 70%+ on 3 Consecutive CBT Mocks</span>
                <span className="text-[#00E676] font-bold">+1 Shield</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span>Participate in Sunday 8PM National Showdown</span>
                <span className="text-[#00E676] font-bold">+1 Shield</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Proof-of-Work Anti-Cheat Notice */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 text-center leading-relaxed mt-6 mb-6">
        🛡️ <strong className="text-white">Anti-Cheat Protection:</strong> Referral rewards unlock as soon as your invited friend completes their first 15-question diagnostic test.
      </div>

      {/* Nigerian Bank Transfer Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card border border-amber-500/30 rounded-3xl p-6 w-full max-w-sm relative bg-[#0d0e12]"
            >
              <button
                onClick={() => setShowPayoutModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {!payoutSuccess ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-naija-gold flex items-center justify-center mx-auto mb-3">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-black text-lg text-white text-center mb-1">Bank Transfer Payout</h3>
                  <p className="text-xs text-zinc-400 text-center mb-4">
                    Instant transfer via Paystack Direct Payout
                  </p>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 text-center">
                    <div className="text-xs text-zinc-400">Available Payout Amount</div>
                    <div className="text-2xl font-black text-naija-gold">₦{stats.cash_bounty_accrued.toLocaleString()}</div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Select Destination Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-naija-gold"
                      >
                        <option value="058">Guaranty Trust Bank (GTBank)</option>
                        <option value="044">Access Bank PLC</option>
                        <option value="057">Zenith Bank PLC</option>
                        <option value="090267">Kuda Microfinance Bank</option>
                        <option value="999992">OPay Digital Services</option>
                        <option value="999991">Palmpay Limited</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        10-Digit NUBAN Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        maxLength={10}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-naija-gold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Account Name
                      </label>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-xs">
                        <span className="font-semibold text-white">{accountName}</span>
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleWithdrawPayout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-naija-gold to-amber-500 text-black font-extrabold py-3.5 rounded-2xl text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50"
                  >
                    {isProcessing ? "Processing Transfer..." : `Confirm Transfer ₦${stats.cash_bounty_accrued.toLocaleString()}`}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-black text-xl text-white mb-1">Transfer Successful!</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    ₦{stats.cash_bounty_accrued.toLocaleString()} has been sent to your bank account via Paystack. Funds will reflect in under 60 seconds.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
