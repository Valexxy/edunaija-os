"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, ShieldCheck, Heart, Sparkles, CheckCircle2, 
  ArrowRight, Users, Award, CreditCard, ChevronRight,
  BookOpen, Volume2, Download, Copy, Check, Star,
  Compass, School, AlertCircle, RefreshCw
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

type CurrencyCode = "USD" | "GBP" | "CAD" | "NGN";

interface ChildSeat {
  name: string;
  age: number;
  heritage_language: string;
  grade_level: string;
  country_of_residence: string;
}

export default function DiasporaHubPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("family_annual");
  const [parentName, setParentName] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [country, setCountry] = useState<string>("United Kingdom");
  const [paymentMethod, setPaymentMethod] = useState<string>("stripe_card");

  // Child seats
  const [children, setChildren] = useState<ChildSeat[]>([
    {
      name: "Timi Adeleke",
      age: 11,
      heritage_language: "Yorùbá",
      grade_level: "Primary 6",
      country_of_residence: "United Kingdom"
    },
    {
      name: "Simi Adeleke",
      age: 8,
      heritage_language: "Yorùbá",
      grade_level: "Primary 3",
      country_of_residence: "United Kingdom"
    }
  ]);

  const [pricingPlans, setPricingPlans] = useState<any>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load plans from API
  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("/api/backend/monetization/diaspora/plans");
        if (res.ok) {
          const data = await res.json();
          setPricingPlans(data.plans);
        }
      } catch (err) {
        console.error("Error fetching diaspora plans:", err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const currencies: { code: CurrencyCode; label: string; flag: string; symbol: string }[] = [
    { code: "USD", label: "USD ($)", flag: "🇺🇸", symbol: "$" },
    { code: "GBP", label: "GBP (£)", flag: "🇬🇧", symbol: "£" },
    { code: "CAD", label: "CAD (C$)", flag: "🇨🇦", symbol: "C$" },
    { code: "NGN", label: "NGN (₦)", flag: "🇳🇬", symbol: "₦" }
  ];

  const handleAddChild = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    if (selectedPlanTier === "single_monthly" && children.length >= 1) {
      setErrorMsg("Single Scholar Pass allows 1 child seat. Select Family Legacy Plan for up to 3 children.");
      return;
    }
    if (children.length >= 3) {
      setErrorMsg("Maximum 3 children supported on standard Family plan. Contact concierge for larger cohorts.");
      return;
    }
    setErrorMsg(null);
    setChildren([
      ...children,
      {
        name: "",
        age: 9,
        heritage_language: "Yorùbá",
        grade_level: "Primary 4",
        country_of_residence: country
      }
    ]);
  };

  const handleRemoveChild = (index: number) => {
    sfx.tap();
    triggerTmaHaptic("light");
    if (children.length <= 1) {
      setErrorMsg("At least one learner seat is required.");
      return;
    }
    setErrorMsg(null);
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleChildChange = (index: number, field: keyof ChildSeat, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleExecuteCheckout = async () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setErrorMsg(null);

    if (!parentName.trim() || !parentEmail.trim()) {
      setErrorMsg("Please provide your full name and email address.");
      return;
    }

    const invalidChild = children.find(c => !c.name.trim());
    if (invalidChild) {
      setErrorMsg("Please specify a name for each child learner seat.");
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const payload = {
        parent_name: parentName.trim(),
        parent_email: parentEmail.trim(),
        parent_phone: parentPhone.trim(),
        country: country,
        currency: selectedCurrency,
        plan_tier: selectedPlanTier,
        children: children,
        payment_method: paymentMethod
      };

      const res = await fetch("/api/backend/monetization/diaspora/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Checkout execution failed");
      }

      sfx.streakCelebration();
      triggerTmaHaptic("success");
      setCheckoutResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error during checkout.");
      sfx.tap();
      triggerTmaHaptic("error");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    sfx.tap();
    triggerTmaHaptic("light");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getPlanPriceDisplay = (planKey: string) => {
    if (!pricingPlans || !pricingPlans[planKey]) {
      if (planKey === "single_monthly") return selectedCurrency === "USD" ? "$14.99/mo" : selectedCurrency === "GBP" ? "£11.99/mo" : selectedCurrency === "CAD" ? "C$19.99/mo" : "₦15,000/mo";
      if (planKey === "family_annual") return selectedCurrency === "USD" ? "$119.00/yr" : selectedCurrency === "GBP" ? "£95.00/yr" : selectedCurrency === "CAD" ? "C$159.00/yr" : "₦120,000/yr";
      return selectedCurrency === "NGN" ? "₦2,500/term" : "$2.99/term";
    }
    const plan = pricingPlans[planKey];
    const priceObj = plan.prices[selectedCurrency] || plan.prices["USD"];
    return priceObj.formatted;
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-emerald-500/30 selection:text-emerald-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-950/40 via-[#0b0e17] to-emerald-950/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
              GLOBAL DIASPORA DUAL-CURRENCY ENROLLMENT
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Connect Your Children to Their <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-[#00E676] bg-clip-text text-transparent">Heritage &amp; Academic Mastery</span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Designed specifically for Nigerian families in the US, UK, Canada, and Europe. Bridge native language fluency (Yorùbá, Igbo, Hausa, Pidgin), cultural proverbs, and international curriculum excellence with AI-powered personalized tutoring.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 0% VAT Statutory Exemption
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <Volume2 className="w-4 h-4" /> 9 Native Voice Personas
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Award className="w-4 h-4" /> +500 Family Welcome XP
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <BookOpen className="w-4 h-4" /> Saccadic Bionic Reader
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher Floating Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Select Billing Currency:</span>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
            {currencies.map(c => {
              const isActive = selectedCurrency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    sfx.tap();
                    triggerTmaHaptic("light");
                    setSelectedCurrency(c.code);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-400/40 scale-105"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Tiers Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Tier 1: Single Scholar Pass */}
          <div 
            onClick={() => {
              sfx.tap();
              setSelectedPlanTier("single_monthly");
              if (children.length > 1) setChildren([children[0]]);
            }}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all flex flex-col justify-between border ${
              selectedPlanTier === "single_monthly"
                ? "bg-purple-950/30 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] ring-1 ring-purple-500"
                : "bg-black/40 border-white/10 hover:border-white/20"
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Solo Learner</span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/10 text-zinc-300">1 Child Seat</span>
              </div>
              <h3 className="text-xl font-bold text-white">Diaspora Single Scholar</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Ideal for one child mastering indigenous language and bridging international syllabus.
              </p>
              <div className="pt-2">
                <div className="text-3xl font-black text-white">{getPlanPriceDisplay("single_monthly")}</div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">Billed monthly · Cancel anytime</div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Dedicated Child Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Indigenous Voice Speech Synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Saccadic Bionic Reader with African Classics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Weekly Friday Parent Dossier</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                selectedPlanTier === "single_monthly"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white/5 text-zinc-400"
              }`}>
                {selectedPlanTier === "single_monthly" ? "Selected Plan" : "Choose Single Scholar"}
              </div>
            </div>
          </div>

          {/* Tier 2: Family Legacy (POPULAR) */}
          <div 
            onClick={() => {
              sfx.tap();
              setSelectedPlanTier("family_annual");
            }}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all flex flex-col justify-between border relative ${
              selectedPlanTier === "family_annual"
                ? "bg-gradient-to-b from-purple-950/60 to-black/80 border-[#00E676] shadow-[0_0_35px_rgba(0,230,118,0.25)] ring-2 ring-[#00E676]"
                : "bg-black/50 border-purple-500/30 hover:border-purple-500/60"
            }`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-[11px] font-black uppercase tracking-wider shadow-md">
              Most Popular Family Choice
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Complete Household
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-[#00E676]">
                  Up to 3 Child Seats
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">Global Diaspora Family Legacy</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                The ultimate heritage preservation package. Empower multiple children with shared family streaks and VIP tutoring.
              </p>
              <div className="pt-2">
                <div className="text-4xl font-black text-white">{getPlanPriceDisplay("family_annual")}</div>
                <div className="text-[11px] font-mono text-[#00E676] mt-1">Save 34% annually · Dual-currency guarantee</div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-zinc-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span className="font-semibold text-white">Up to 3 Dedicated Child Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span className="text-emerald-300 font-bold">+500 Welcome Family XP per Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>All 9 Native AI Voice Personas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>Socratic Gap Remediation with Tone Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>Family Shared Streak Multiplier &amp; Clan Battles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>Priority WhatsApp Concierge for Parents</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className={`w-full py-3 rounded-xl text-xs font-black text-center transition-all ${
                selectedPlanTier === "family_annual"
                  ? "bg-gradient-to-r from-emerald-500 to-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.5)]"
                  : "bg-white/10 text-white"
              }`}>
                {selectedPlanTier === "family_annual" ? "Selected Family Plan" : "Choose Family Legacy"}
              </div>
            </div>
          </div>

          {/* Tier 3: Domestic Term Pass */}
          <div 
            onClick={() => {
              sfx.tap();
              setSelectedPlanTier("domestic_term");
              if (children.length > 1) setChildren([children[0]]);
            }}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all flex flex-col justify-between border ${
              selectedPlanTier === "domestic_term"
                ? "bg-purple-950/30 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] ring-1 ring-purple-500"
                : "bg-black/40 border-white/10 hover:border-white/20"
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Seasonal Return</span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/10 text-zinc-300">1 Child Seat</span>
              </div>
              <h3 className="text-xl font-bold text-white">Domestic Term Pass</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                For students visiting Nigeria, sitting WAEC/JAMB mocks, or local school support.
              </p>
              <div className="pt-2">
                <div className="text-3xl font-black text-white">{getPlanPriceDisplay("domestic_term")}</div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">Billed per 4-month term</div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Student Termly CBT &amp; Study Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Offline Sync &amp; Zero-Data Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard Voice Explanations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Weekly WhatsApp Score Card</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                selectedPlanTier === "domestic_term"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white/5 text-zinc-400"
              }`}>
                {selectedPlanTier === "domestic_term" ? "Selected Plan" : "Choose Term Pass"}
              </div>
            </div>
          </div>

        </div>

        {/* Child Learner Seat Allocator Form */}
        <div className="rounded-3xl bg-black/60 border border-white/10 p-6 sm:p-10 space-y-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                Configure Learner Seats ({children.length} of {selectedPlanTier === "family_annual" ? 3 : 1} Allocated)
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Assign each child&apos;s heritage language focus and academic level. Each child receives a personalized login key.
              </p>
            </div>

            {selectedPlanTier === "family_annual" && children.length < 3 && (
              <button
                onClick={handleAddChild}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 self-start cursor-pointer"
              >
                <span>+ Add Child Seat</span>
              </button>
            )}
          </div>

          {/* Child Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, idx) => (
              <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-purple-400" /> Child Seat #{idx + 1}
                  </span>
                  {children.length > 1 && (
                    <button
                      onClick={() => handleRemoveChild(idx)}
                      className="text-zinc-500 hover:text-red-400 text-xs transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Child&apos;s Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Timi Adeleke"
                      value={child.name}
                      onChange={(e) => handleChildChange(idx, "name", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">Age</label>
                      <input
                        type="number"
                        min="4"
                        max="18"
                        value={child.age}
                        onChange={(e) => handleChildChange(idx, "age", parseInt(e.target.value) || 10)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">Grade Level</label>
                      <select
                        value={child.grade_level}
                        onChange={(e) => handleChildChange(idx, "grade_level", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 2">Primary 2</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 4">Primary 4</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="Primary 6">Primary 6</option>
                        <option value="JSS 1">JSS 1 (Year 7)</option>
                        <option value="JSS 2">JSS 2 (Year 8)</option>
                        <option value="JSS 3">JSS 3 (Year 9)</option>
                        <option value="SSS 1">SSS 1 (Year 10 / GCSE)</option>
                        <option value="SSS 2">SSS 2 (Year 11)</option>
                        <option value="SSS 3">SSS 3 (A-Level / JAMB)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Heritage Language Focus</label>
                    <select
                      value={child.heritage_language}
                      onChange={(e) => handleChildChange(idx, "heritage_language", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Yorùbá">Yorùbá (Bàbá Àgbà &amp; Àbíkẹ́)</option>
                      <option value="Igbo">Igbo (Nna Anyị &amp; Adanna)</option>
                      <option value="Hausa">Hausa (Malam Danladi &amp; Fatima)</option>
                      <option value="Nigerian Pidgin">Nigerian Pidgin (Broda Wazobia)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono border-t border-white/5">
                  <span className="flex items-center gap-1 text-[#00E676]">
                    <Sparkles className="w-3 h-3" /> +500 Family XP
                  </span>
                  <span>Audio Tonal Drills</span>
                </div>
              </div>
            ))}
          </div>

          {/* Parent Guardian Details */}
          <div className="border-t border-white/10 pt-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Parent / Guardian Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Parent Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kunle Adeleke"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Email (For Progress Dossier) *</label>
                <input
                  type="email"
                  placeholder="e.g. kunle.adeleke@nhs.uk"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">WhatsApp Phone (For Friday Alerts)</label>
                <input
                  type="tel"
                  placeholder="e.g. +44 7911 123456"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Country of Residence</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Ireland">🇮🇪 Ireland</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="Nigeria">🇳🇬 Nigeria</option>
                  <option value="United Arab Emirates">🇦🇪 UAE / Dubai</option>
                  <option value="Other">🌍 Other International</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Instant Activation Bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">Payment Channel:</span>
              {[
                { id: "stripe_card", label: "Credit / Debit Card (Stripe)" },
                { id: "apple_pay", label: "Apple Pay / GPay" },
                { id: "nip_transfer", label: "Direct NIP Transfer (₦)" }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    sfx.tap();
                    setPaymentMethod(m.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? "bg-purple-600/30 border-purple-400 text-purple-200"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-zinc-400">Total Due Today:</div>
                <div className="text-xl font-black text-white">{getPlanPriceDisplay(selectedPlanTier)}</div>
              </div>

              <button
                onClick={handleExecuteCheckout}
                disabled={isProcessingCheckout}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#00E676] hover:from-purple-500 hover:to-emerald-400 text-black font-black text-sm tracking-wide shadow-[0_0_25px_rgba(147,51,234,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingCheckout ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Allocating Child Learner Keys...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Diaspora Enrollment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Pure Tonal Speech Engine</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Proprietary Do-Re-Mi high/mid/low tone synthesis ensures words like <em>ọ̀kọ́</em> and <em>ọkọ</em> are pronounced with native cultural accuracy.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Saccadic Bionic Reader</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Guides young diaspora readers with bold fixation anchors across Nigerian literature masterpieces and folk stories.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">NDPA 2023 Minor Protection</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Strict guardian consent enforcement and zero ad-tracking ensures 100% child privacy and safety compliant with global data acts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Curriculum Dual-Bridge</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Harmonizes British Key Stages / US Common Core standards with NERDC curriculum, keeping children grounded in their Nigerian heritage.
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation & Child Registration Keys Modal */}
      {checkoutResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#090b14] border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00E676]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Diaspora Enrollment Activated!</h3>
                  <p className="text-xs text-zinc-400">Receipt Hash: <span className="font-mono text-[#00E676]">{checkoutResult.summary.receipt_hash}</span></p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutResult(null)}
                className="text-zinc-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-300 font-bold">Total Paid: {checkoutResult.summary.formatted_amount}</div>
                  <div className="text-[11px] text-zinc-400">{checkoutResult.summary.vat_exemption}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-zinc-300">Guardian: {checkoutResult.summary.parent_name}</div>
                  <div className="text-[11px] font-mono text-zinc-400">{checkoutResult.summary.parent_email}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Allocated Child Learner Access Keys:</h4>
                <div className="space-y-2">
                  {checkoutResult.summary.allocated_seats.map((seat: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{seat.name} ({seat.grade_level})</div>
                        <div className="text-[11px] text-zinc-400">Language: <span className="text-purple-300">{seat.heritage_language}</span> · <span className="text-[#00E676]">+{seat.welcome_xp_awarded} XP Awarded</span></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {seat.learner_registration_key}
                        </span>
                        <button
                          onClick={() => handleCopyKey(seat.learner_registration_key)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                          title="Copy Learner Key"
                        >
                          {copiedKey === seat.learner_registration_key ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Your children can immediately log in on any device using their unique Learner Keys above!</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/reader"
                onClick={() => sfx.tap()}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Launch Bionic Reader
              </Link>
              <Link
                href="/student"
                onClick={() => sfx.tap()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-lg"
              >
                Go to Student Portal <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
