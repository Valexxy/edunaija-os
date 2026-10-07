"use client";

import { useState, useEffect } from "react";
import { 
  HeartHandshake, Award, ShieldCheck, Users, Globe, 
  Sparkles, CheckCircle, ArrowRight, Share2, Download, 
  Building2, Landmark, Check, ExternalLink, Filter
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import ZeroFeeTransferModal from "../../components/ZeroFeeTransferModal";
import BackButton from "../../components/BackButton";

interface Sponsor {
  id: string;
  sponsor_name: string;
  tier: string;
  amount_ngn: number;
  students_sponsored: number;
  state_focus: string;
  certificate_id: string;
  created_at: string;
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [totalStudents, setTotalStudents] = useState(185);
  const [totalPledged, setTotalPledged] = useState(1850000);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"wall" | "ledger">("ledger");
  const [ledgerData, setLedgerData] = useState<any>(null);

  // Pledge modal / form state
  const [isPledging, setIsPledging] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("Gold Patron");
  const [sponsorName, setSponsorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateFocus, setStateFocus] = useState("Nationwide");
  const [candidateCount, setCandidateCount] = useState(20);
  const [amountNgn, setAmountNgn] = useState(100000);

  // Certificate Modal
  const [viewingCert, setViewingCert] = useState<any>(null);

  // Zero-fee transfer modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [createdPledgeData, setCreatedPledgeData] = useState<any>(null);

  const tiers = [
    { name: "Silver Pillar", count: 5, amount: 25000, icon: "🥈", desc: "Sponsors 5 candidates with season pass & digital mentor" },
    { name: "Gold Patron", count: 20, amount: 100000, icon: "🥇", desc: "Sponsors 20 candidates across your hometown/state" },
    { name: "Platinum Luminary", count: 100, amount: 500000, icon: "💎", desc: "Sponsors 100 candidates with full mock series & audio drills" },
    { name: "National Trustee", count: 500, amount: 2500000, icon: "🏛️", desc: "Full LGA / Senatorial district endowment & custom voucher branding" }
  ];

  const fetchWall = async () => {
    try {
      const res = await fetch("/api/backend/sponsors/wall");
      if (res.ok) {
        const data = await res.json();
        setSponsors(data.sponsors || []);
        setTotalStudents(data.total_students_sponsored || 185);
        setTotalPledged(data.total_pledged_ngn || 1850000);
      }
    } catch {
      // Fallback sample data if offline
      setSponsors([
        {
          id: "sp-1",
          sponsor_name: "Engr. Femi Adeyemi (London, UK)",
          tier: "Platinum Luminary",
          amount_ngn: 500000,
          students_sponsored: 50,
          state_focus: "Oyo & Osun",
          certificate_id: "CERT-EDUNAIJA-2025-FE92",
          created_at: "2025-01-14"
        },
        {
          id: "sp-2",
          sponsor_name: "Dr. Ngozi Eze (Houston, TX)",
          tier: "Silver Pillar",
          amount_ngn: 100000,
          students_sponsored: 10,
          state_focus: "Enugu & Anambra",
          certificate_id: "CERT-EDUNAIJA-2025-NG88",
          created_at: "2025-01-18"
        },
        {
          id: "sp-3",
          sponsor_name: "Alhaji Ibrahim Danfulani (Abuja)",
          tier: "National Trustee",
          amount_ngn: 1250000,
          students_sponsored: 125,
          state_focus: "Kano & Kaduna",
          certificate_id: "CERT-EDUNAIJA-2025-IB31",
          created_at: "2025-02-01"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWall();
    fetch("/api/backend/sponsors/ledger")
      .then(res => res.json())
      .then(data => setLedgerData(data))
      .catch(() => {});
  }, []);

  const handleSelectTier = (tier: typeof tiers[0]) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedTier(tier.name);
    setCandidateCount(tier.count);
    setAmountNgn(tier.amount);
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) return;

    sfx.confirm();
    triggerTmaHaptic("heavy");

    try {
      const res = await fetch("/api/backend/sponsors/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsor_name: sponsorName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          tier: selectedTier,
          amount_ngn: amountNgn,
          students_sponsored: candidateCount,
          state_focus: stateFocus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedPledgeData(data);
        setIsTransferModalOpen(true);
        setIsPledging(false);
        fetchWall();
      }
    } catch {
      setIsTransferModalOpen(true);
      setIsPledging(false);
    }
  };

  const handleViewCert = (sponsor: Sponsor) => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setViewingCert(sponsor);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <BackButton fallbackHref="/student" label="Back to Cockpit" />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-[#0a0f18] to-black border border-emerald-500/30 p-6 md:p-10 shadow-[0_0_60px_rgba(0,230,118,0.12)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide uppercase mb-4">
            <HeartHandshake className="w-4 h-4" />
            <span>Diaspora & Alumni Endowments</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-4">
            Adopt-a-Candidate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00E676] to-teal-200">
              Sponsorship Wall
            </span>
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed mb-6">
            Empower hardworking Nigerian students from humble backgrounds into medicine, engineering, and law. 
            Receive a verifiable, shareable <strong className="text-emerald-400">Digital Certificate of Educational Impact</strong> for every student you sponsor.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { sfx.tap(); setIsPledging(true); }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,230,118,0.35)] flex items-center gap-2 cursor-pointer"
            >
              <span>Sponsor Candidates Now</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <a
              href="#wall"
              className="px-5 py-3.5 rounded-2xl glass-card border border-white/10 hover:border-white/25 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <span>View Wall of Honor</span>
            </a>
          </div>
        </div>

        {/* Live Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Candidates Sponsored</span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-display text-white">
              {totalStudents.toLocaleString()}+
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Capital Mobilized</span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-display text-emerald-400">
              ₦{totalPledged.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 col-span-2 md:col-span-1">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tax & Statutory Status</span>
            </div>
            <div className="text-xs md:text-sm font-bold text-zinc-200">
              100% VAT-Exempt Grant
            </div>
            <div className="text-[10px] text-zinc-500">First Schedule FRN VAT Act</div>
          </div>
        </div>
      </div>

      {/* Sponsor Tier Selection & Pledge Drawer */}
      {isPledging && (
        <div className="rounded-3xl bg-[#0c0e18] border border-emerald-500/40 p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black font-display text-white">Select Your Impact Tier</h2>
              <p className="text-xs text-zinc-400">Funds directly credit student Season Passes with 0% gateway leakage</p>
            </div>
            <button 
              onClick={() => setIsPledging(false)}
              className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
            >
              Cancel
            </button>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((t) => {
              const isSelected = selectedTier === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => handleSelectTier(t)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected 
                      ? "bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(0,230,118,0.2)]" 
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-sm font-black text-white">{t.name}</div>
                  <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
                    ₦{t.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2">
                    {t.count} Candidates Funded
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pledge Form */}
          <form onSubmit={handlePledgeSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Your Full Name / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ngozi Eze (Diaspora Chapter)"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Preferred State of Beneficiaries</label>
                <select
                  value={stateFocus}
                  onChange={(e) => setStateFocus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  <option value="Nationwide">Nationwide (Most Needy Candidates)</option>
                  <option value="Lagos">Lagos State Candidates</option>
                  <option value="Oyo">Oyo State Candidates</option>
                  <option value="Enugu">Enugu State Candidates</option>
                  <option value="Kano">Kano State Candidates</option>
                  <option value="Rivers">Rivers State Candidates</option>
                  <option value="Delta">Delta State Candidates</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Email (For Digital Certificate)</label>
                <input
                  type="email"
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+234 or Int'l Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Direct Transfer (₦{amountNgn.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* The Wall of Honor */}
      <div id="wall" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black font-display text-white">Wall of Educational Benefactors</h2>
            <p className="text-xs text-zinc-400">Honoring distinguished diaspora leaders, alumni, and philanthropic patrons</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Updated live across 36 States</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sp) => (
            <div 
              key={sp.id}
              className="group rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-emerald-500/40 p-5 transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.12)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                    {sp.sponsor_name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {sp.tier}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  {sp.sponsor_name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  Focus: <span className="text-zinc-200">{sp.state_focus}</span>
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Candidates</span>
                    <span className="font-black text-white">{sp.students_sponsored} Students</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 block text-[10px]">Endowment</span>
                    <span className="font-black text-emerald-400 font-mono">₦{sp.amount_ngn.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {sp.certificate_id}
                </span>
                <button
                  onClick={() => handleViewCert(sp)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e121d] to-[#07090e] border-2 border-amber-500/40 rounded-3xl p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)]">
            <button
              onClick={() => setViewingCert(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs"
            >
              Close
            </button>

            {/* Certificate Frame */}
            <div className="border-2 border-dashed border-amber-500/30 rounded-2xl p-6 text-center space-y-4 bg-black/40">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-black font-black text-2xl shadow-lg">
                🇳🇬
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-black">
                  Federal Republic of Nigeria • EduNaija Academic Council
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-display text-white mt-1">
                  Certificate of Educational Impact
                </h2>
              </div>

              <p className="text-xs text-zinc-300 max-w-md mx-auto italic">
                This certifies that distinguished benefactor
              </p>

              <div className="text-xl md:text-2xl font-black text-amber-300 font-serif">
                {viewingCert.sponsor_name}
              </div>

              <p className="text-xs text-zinc-300 max-w-lg mx-auto">
                has generously endowed <strong className="text-white">{viewingCert.students_sponsored} Nigerian Secondary & UTME Candidates</strong> with full academic Season Passes, personalized digital tutoring, and CBT mock exam diagnostic engines for the 2025/2026 Academic Season.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-amber-500/20 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Tier Level</span>
                  <span className="font-bold text-amber-400">{viewingCert.tier}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Verification Ref</span>
                  <span className="font-mono font-bold text-white text-[11px]">{viewingCert.certificate_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Statutory Status</span>
                  <span className="font-bold text-emerald-400 text-[10px]">0% VAT Educational Grant</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-zinc-500 font-mono">
                Digitally sealed and verifiable at edunaija.ng/verify/{viewingCert.certificate_id}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "EduNaija Educational Impact Certificate",
                      text: `Proud to sponsor ${viewingCert.students_sponsored} Nigerian students for JAMB 2025 via EduNaija OS! Ref: ${viewingCert.certificate_id}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    sfx.tap();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share to LinkedIn / WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Zero-Fee Virtual Account Modal */}
      <ZeroFeeTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        planName={`${selectedTier} (${candidateCount} Candidates)`}
        amountNgn={amountNgn}
        onSuccess={() => {
          fetchWall();
        }}
      />
    </div>
  );
}
