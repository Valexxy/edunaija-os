"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, ShieldCheck, CheckCircle2, QrCode, Printer, 
  Share2, Copy, Check, ExternalLink, Search, Sparkles,
  GraduationCap, Download, Lock
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BackButton from "../../components/BackButton";

export interface CertificateDef {
  id: string;
  student_key: string;
  student_name: string;
  cert_type: string;
  title: string;
  grade_level: string;
  institution: string;
  score_grade: string;
  sha256_hash: string;
  qr_payload: string;
  issuer: string;
  issue_date: string;
}

const DEFAULT_CERTS: CertificateDef[] = [
  {
    id: "CERT-2026-NUC-UNILAG-8821",
    student_key: "WARD-100L-UNILAG-01",
    student_name: "Emeka Okonkwo",
    cert_type: "CCMAS_HONOURS",
    title: "Dean's First Class Honour Roll (Semester 1)",
    grade_level: "100L University Freshman",
    institution: "University of Lagos (UNILAG)",
    score_grade: "4.85 / 5.0 CGPA (First Class Honours)",
    sha256_hash: "6db5ba9cb35f791e847c5d3198a2fe3518904ab72e9871fa08d43891bcfa1209",
    qr_payload: "https://edunaija.ng/verify/CERT-2026-NUC-UNILAG-8821?sha=6db5ba9cb35f",
    issuer: "Prof. Folashade Ogunsola & NUC CCMAS Board",
    issue_date: "2026-10-05T08:00:00Z"
  },
  {
    id: "CERT-2026-WAEC-QUEENS-4419",
    student_key: "WARD-UTME-MED-02",
    student_name: "Chisom Okonkwo",
    cert_type: "UTME_MERIT",
    title: "National STEM Distinction & Pre-Med Olympiad",
    grade_level: "SSS 3 (Senior Secondary)",
    institution: "Queen's College Lagos",
    score_grade: "324/400 (Top 0.5% Percentile)",
    sha256_hash: "8fa21e905bc8411d99fa0e3c847721ab8923d8fa19e8749a0918efbc78291044",
    qr_payload: "https://edunaija.ng/verify/CERT-2026-WAEC-QUEENS-4419?sha=8fa21e905bc8",
    issuer: "National Examinations Regulatory Council",
    issue_date: "2026-09-28T12:00:00Z"
  },
  {
    id: "CERT-2026-NERDC-CORONA-1102",
    student_key: "WARD-PRI-04",
    student_name: "Tobi Adeleke",
    cert_type: "PRIMARY_WONDER",
    title: "Young Mathematician Wonder Star Award",
    grade_level: "Primary 4 (Middle Basic 4)",
    institution: "Corona School Gbagada",
    score_grade: "98/100 (Grand Distinction)",
    sha256_hash: "3cb1829e09ff7618a82e99fa087a12bc9038d821fa761890ecb9187a41289110",
    qr_payload: "https://edunaija.ng/verify/CERT-2026-NERDC-CORONA-1102?sha=3cb1829e09ff",
    issuer: "NERDC Early Childhood Directorate",
    issue_date: "2026-09-20T10:00:00Z"
  }
];

export default function CertificatesPage() {
  const [certs, setCerts] = useState<CertificateDef[]>(DEFAULT_CERTS);
  const [activeCert, setActiveCert] = useState<CertificateDef>(DEFAULT_CERTS[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(activeCert.qr_payload);
      setCopiedLink(true);
      sfx.tap();
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handlePrint = () => {
    sfx.tap();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleVerifyLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setIsSearching(true);
    setLookupError("");
    setLookupResult(null);
    sfx.tap();

    try {
      const res = await fetch(`/api/backend/certificates/verify/${encodeURIComponent(lookupQuery.trim())}`);
      if (!res.ok) {
        throw new Error("Certificate ID not recognized in official verification registry.");
      }
      const data = await res.json();
      setLookupResult(data.certificate);
      sfx.streakCelebration();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setLookupError(err.message || "Certificate verification failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 flex flex-col font-sans selection:bg-[#00E676] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Verifiable Credentials &amp; Honours Registry
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                  SHA-256 Anchored
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                NUC CCMAS, WAEC &amp; NERDC Certified Digital Diplomas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Diploma</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs shadow-md shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Certificate Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {certs.map(c => {
            const isSelected = activeCert.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCert(c); sfx.tap(); }}
                className={`px-4 py-2.5 rounded-2xl border text-left transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(0,230,118,0.25)]"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>🎓</span>
                  <span>{c.student_name}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px]">
                  {c.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* ================= ROYAL VERIFIABLE CERTIFICATE CANVAS ================= */}
        <div className="relative mx-auto max-w-4xl p-2 sm:p-6 rounded-3xl bg-gradient-to-b from-[#101726] to-[#0A0E17] border-2 border-[#D4AF37]/60 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)]">
          {/* Inner Ornate Guilloche Border */}
          <div className="border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-12 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-black to-black">
            
            {/* Watermark Coat of Arms Stamp */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none text-[220px]">
              🦅
            </div>

            {/* Top Certificate Header */}
            <div className="text-center space-y-2 relative z-10">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🇳🇬</span>
                <div className="h-6 w-px bg-[#D4AF37]/50" />
                <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#D4AF37]">
                  Federal Republic of Nigeria
                </span>
                <div className="h-6 w-px bg-[#D4AF37]/50" />
                <span className="text-3xl">⚖️</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-white uppercase pt-2">
                EduNaija Sovereign Academic Directorate
              </h2>
              <p className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                National Core Curriculum &amp; Academic Standards Registry
              </p>
            </div>

            {/* Certificate Body */}
            <div className="my-8 text-center space-y-4 relative z-10">
              <p className="text-xs font-serif italic text-zinc-300">
                This is to officially certify that
              </p>

              <div className="py-2 border-b-2 border-dotted border-[#D4AF37]/40 max-w-md mx-auto">
                <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 uppercase">
                  {activeCert.student_name}
                </h3>
              </div>

              <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
                having demonstrated exceptional intellectual rigor, mastery of foundational competencies, and peerless study dedication at <strong className="text-white">{activeCert.institution}</strong> ({activeCert.grade_level}), is hereby awarded the distinction of:
              </p>

              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 max-w-lg mx-auto">
                <div className="text-base sm:text-lg font-serif font-black text-[#FFD700] uppercase tracking-wider">
                  {activeCert.title}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300 mt-1">
                  Grade / Classification: {activeCert.score_grade}
                </div>
              </div>
            </div>

            {/* Bottom Signatures, QR & Cryptographic Seal */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end relative z-10">
              {/* Official Seal */}
              <div className="flex flex-col items-center sm:items-start space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center text-center p-1">
                    <span className="text-xs font-serif font-black text-[#D4AF37] leading-none">SEAL</span>
                    <span className="text-[7px] text-zinc-400 font-mono tracking-tighter">OFFICIAL 2026</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-400">Tamper-Proof Holographic Seal</span>
              </div>

              {/* QR Code & Verify */}
              <div className="flex flex-col items-center space-y-1.5">
                <div className="p-2 rounded-xl bg-white border border-white/20 shadow-md">
                  <QrCode className="w-12 h-12 text-black" />
                </div>
                <div className="text-[9px] font-mono text-emerald-400 font-bold text-center">
                  Scan to Verify Authenticity
                </div>
                <div className="text-[8px] font-mono text-zinc-500 text-center truncate max-w-[180px]">
                  ID: {activeCert.id}
                </div>
              </div>

              {/* Authority Signature */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-base text-[#D4AF37] font-bold">
                  Prof. Folashade Adeleke
                </div>
                <div className="h-0.5 bg-[#D4AF37]/40 w-32 ml-auto" />
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Academic Director &amp; Registrar
                </div>
                <div className="text-[9px] text-zinc-400 font-mono">
                  Issued: {new Date(activeCert.issue_date).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
            </div>

            {/* SHA-256 Fingerprint Ribbon */}
            <div className="mt-6 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono text-zinc-500">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cryptographic SHA-256 Hash Digest:</span>
              </div>
              <span className="text-zinc-400 font-mono truncate max-w-sm">
                {activeCert.sha256_hash}
              </span>
            </div>

          </div>
        </div>

        {/* ================= PUBLIC VERIFICATION LOOKUP PORTAL ================= */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <h3 className="text-sm font-bold text-white">Public Certificate Verification Registry</h3>
              <p className="text-xs text-zinc-400">
                Enter any official Certificate ID (e.g. <span className="font-mono text-zinc-300">CERT-2026-NUC-UNILAG-8821</span>) to authenticate credentials directly from the database.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyLookup} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. CERT-2026-NUC-UNILAG-8821"
              value={lookupQuery}
              onChange={e => setLookupQuery(e.target.value)}
              className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? "Verifying..." : "Verify Credential"}</span>
            </button>
          </form>

          {lookupError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
              ⚠️ {lookupError}
            </div>
          )}

          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-[#00E676] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Official Credential Verified (Valid &amp; Authentic)
                </span>
                <span className="font-mono text-zinc-400 text-[10px]">ID: {lookupResult.id}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-zinc-500 block">Candidate Name:</span>
                  <strong className="text-white">{lookupResult.student_name}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Honour Title:</span>
                  <strong className="text-emerald-300">{lookupResult.title}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Institution:</span>
                  <strong className="text-white">{lookupResult.institution}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Score / Grade:</span>
                  <strong className="text-amber-400">{lookupResult.score_grade}</strong>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}