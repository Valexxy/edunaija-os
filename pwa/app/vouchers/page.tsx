"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, Sparkles, Download, Copy, Check, CheckCircle2, 
  ArrowRight, ShieldCheck, FileSpreadsheet, Printer, Users, 
  Briefcase, AlertCircle
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import VoucherRedemptionModal from "../../components/VoucherRedemptionModal";

export default function VouchersPage() {
  const [stats, setStats] = useState<any>({
    total_generated: 150,
    total_redeemed: 48,
    redemption_rate: "32.0%",
    recent_vouchers: []
  });

  const [sponsorTitle, setSponsorTitle] = useState("Hon. Benjamin Kalu Constituency Grant");
  const [batchPrefix, setBatchPrefix] = useState("KALU");
  const [count, setCount] = useState(50);
  const [planType, setPlanType] = useState("season_pass");
  const [generating, setGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<any>(null);

  // Quick redeem on page
  const [quickCode, setQuickCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/backend/vouchers/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    sfx.tap();
    triggerTmaHaptic("heavy");

    try {
      const res = await fetch("/api/backend/vouchers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsor_title: sponsorTitle.trim(),
          count: Number(count),
          plan_type: planType,
          hearts: 50,
          prefix: batchPrefix.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedBatch(data);
        sfx.victory();
        fetchStats();
      } else {
        setRedeemError("Unable to generate batch at this time. Please check parameters.");
      }
    } catch (err) {
      setRedeemError("Network connectivity issue. Please check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    setRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    sfx.tap();

    let keyOrPhone = "EDU-2025-LAG-1112";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          keyOrPhone = user.registration_key || user.registrationKey || user.phone || keyOrPhone;
        } catch {}
      }
    }

    try {
      const res = await fetch("/api/backend/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: quickCode.trim().toUpperCase(),
          user_key_or_phone: keyOrPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid voucher code");
      }

      setRedeemSuccess(data.message);
      setQuickCode("");
      sfx.victory();
      triggerTmaHaptic("heavy");
      fetchStats();

      if (data.user) {
        localStorage.setItem("edunaija_user", JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: data.user }));
      }
    } catch (err: any) {
      setRedeemError(err.message || "Failed to redeem");
      sfx.wrong();
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopy = (code: string) => {
    sfx.tap();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (!generatedBatch || !generatedBatch.codes) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Batch ID,Sponsor Title,Voucher Code,Plan,Hearts"].join(",") + "\n" +
      generatedBatch.codes.map((c: string) => 
        `"${generatedBatch.batch_id}","${generatedBatch.sponsor_title}","${c}","Season Pass","50"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${generatedBatch.batch_id}_vouchers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sfx.confirm();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#0d0f18] to-black border border-amber-500/30 p-6 md:p-10 shadow-[0_0_60px_rgba(245,158,11,0.12)]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide uppercase mb-4">
            <Ticket className="w-4 h-4" />
            <span>LGA, Politician & CSR Bulk Portal</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-4">
            Mass Scholarship <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-300">
              Voucher Engine
            </span>
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed mb-6">
            Empower whole constituencies, schools, or youth leagues with physical scratch-cards or SMS activation codes.
            Includes 1-click batch generation, real-time redemption analytics, and zero gateway deduction.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#generate-batch"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center gap-2"
            >
              <span>Mint Bulk Batch</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>

            <button
              onClick={() => { sfx.tap(); setIsRedeemModalOpen(true); }}
              className="px-5 py-3.5 rounded-2xl glass-card border border-white/10 hover:border-amber-400/40 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>Redeem a Voucher</span>
            </button>
          </div>
        </div>

        {/* Real-time stats bar */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-zinc-400 mb-1">Vouchers Minted</div>
            <div className="text-2xl md:text-3xl font-black font-display text-white">
              {stats.total_generated.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-zinc-400 mb-1">Active Redemptions</div>
            <div className="text-2xl md:text-3xl font-black font-display text-amber-400">
              {stats.total_redeemed.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-zinc-400 mb-1">Redemption Rate</div>
            <div className="text-2xl md:text-3xl font-black font-display text-emerald-400">
              {stats.redemption_rate}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Quick Redeem Box */}
      <div className="rounded-3xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 p-6 md:p-8">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-black font-display text-white">Have a Scratch-Card or Voucher Code?</h2>
          <p className="text-xs text-zinc-400">Enter your code below to instantly activate free study hearts and Season Pass</p>

          {redeemSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00E676]" />
              <span>{redeemSuccess}</span>
            </div>
          )}

          {redeemError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{redeemError}</span>
            </div>
          )}

          <form onSubmit={handleQuickRedeem} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              placeholder="e.g. HON-KALU-2025"
              className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-white font-mono font-bold tracking-widest uppercase text-center sm:text-left focus:outline-none focus:border-amber-400 text-sm"
              required
            />
            <button
              type="submit"
              disabled={redeeming}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-60"
            >
              {redeeming ? "Activating..." : "Redeem Code"}
            </button>
          </form>
        </div>
      </div>

      {/* Mint Bulk Batch Generator */}
      <div id="generate-batch" className="rounded-3xl bg-[#0c0e18] border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black font-display text-white">Generate Bulk Voucher Batch</h2>
            <p className="text-xs text-zinc-400">For LGA Councils, Honorable Members, Alumni Branches & Corporate CSR</p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Exportable to CSV & Print
          </span>
        </div>

        <form onSubmit={handleGenerateBatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Sponsor / Constituency Title *</label>
              <input
                type="text"
                required
                value={sponsorTitle}
                onChange={(e) => setSponsorTitle(e.target.value)}
                placeholder="e.g. Hon. Benjamin Kalu Constituency Grant"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Voucher Prefix (Max 6 letters)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                placeholder="e.g. KALU, ALIMOSHO, MTN"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Quantity of Vouchers</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value={25}>25 Vouchers (Small Class / Tutorial Center)</option>
                <option value={50}>50 Vouchers (Constituency Ward)</option>
                <option value={100}>100 Vouchers (Local Government Area)</option>
                <option value={250}>250 Vouchers (Senatorial District / CSR Initiative)</option>
                <option value={500}>500 Vouchers (State-Wide Educational Drive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Access Tier Granted</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="season_pass">Full Season Pass (Unlimited Till Exams + 50 Hearts)</option>
                <option value="cram_pass">Cram Pass (30-Day Intensive Access)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {generating ? "Minting Cryptographic Codes..." : `Generate ${count} Vouchers Now`}
            </button>
          </div>
        </form>

        {/* Generated Codes Modal / Result Drawer */}
        {generatedBatch && (
          <div className="mt-6 p-6 rounded-2xl bg-black/60 border border-amber-500/40 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Batch Active</span>
                <h3 className="text-lg font-bold text-white">{generatedBatch.sponsor_title}</h3>
                <div className="text-xs text-zinc-400 font-mono">
                  Batch ID: <strong className="text-white">{generatedBatch.batch_id}</strong> • {generatedBatch.count_generated} Codes Minted
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-white/5 text-zinc-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Cards</span>
                </button>
              </div>
            </div>

            {/* Grid of codes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/5">
              {generatedBatch.codes.map((code: string) => (
                <div
                  key={code}
                  onClick={() => handleCopy(code)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-center cursor-pointer transition-all flex items-center justify-between group"
                >
                  <span className="font-mono text-xs font-bold text-amber-300 group-hover:text-white">
                    {code}
                  </span>
                  {copiedCode === code ? (
                    <Check className="w-3 h-3 text-[#00E676]" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 opacity-60" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500">
              💡 Tip: Click any code to copy to clipboard. Download CSV to send to SMS broadcasting platforms or physical scratch card printers.
            </p>
          </div>
        )}
      </div>

      {/* Redemption Modal */}
      <VoucherRedemptionModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
}
