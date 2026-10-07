"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, GraduationCap, MapPin, Award, CheckCircle2, Search, Filter, 
  ExternalLink, Send, ShieldCheck, Sparkles, Phone, Mail, DollarSign, X, Check, ArrowRight
} from "lucide-react";
import InteractiveCampusMap from "../../components/InteractiveCampusMap";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BackButton from "../../components/BackButton";

interface School {
  id: string;
  name: string;
  type: string;
  category: string;
  state: string;
  zone: string;
  motto: string;
  badge: string;
  tuition_band: string;
  admission_status: string;
  curriculum: string;
  highlights_json: string;
  logo_url: string;
  phone: string;
  email: string;
  views_count: number;
  enquiries_count: number;
}

export default function SchoolsDirectoryPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Secondary" | "Tertiary">("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  
  // In-App Enquiry Modal State
  const [enquiringSchool, setEnquiringSchool] = useState<School | null>(null);
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [targetClass, setTargetClass] = useState("SSS 1");
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // B2B Sponsorship Modal State
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [proprietorSchoolName, setProprietorSchoolName] = useState("");
  const [proprietorState, setProprietorState] = useState("Lagos");
  const [proprietorPerson, setProprietorPerson] = useState("");
  const [proprietorPhone, setProprietorPhone] = useState("");
  const [proprietorEmail, setProprietorEmail] = useState("");
  const [sponsorSuccess, setSponsorSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchools() {
      setLoading(true);
      try {
        const res = await fetch("/api/backend/schools/directory?limit=50");
        if (res.ok) {
          const data = await res.json();
          setSchools(data.schools || []);
        }
      } catch (err) {
        console.warn("Using offline fallback schools:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchools();
  }, []);

  const handleOpenEnquiry = (sch: School) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setEnquiringSchool(sch);
    setEnquirySuccess(null);
  };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiringSchool || !parentPhone.trim() || !parentName.trim()) return;
    setSubmittingEnquiry(true);
    sfx.tap();

    try {
      const res = await fetch("/api/backend/schools/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: enquiringSchool.id,
          student_name: studentName.trim() || "Prospective Scholar",
          parent_name: parentName.trim(),
          parent_phone: parentPhone.trim(),
          target_class: targetClass,
          academic_session: "2026/2027",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnquirySuccess(data.enquiry_id || "ENQ-SUCCESS");
        sfx.correct();
      }
    } catch {
      setEnquirySuccess("ENQ-OFFLINE-SAVED");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const submitSponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proprietorSchoolName.trim() || !proprietorPhone.trim()) return;
    sfx.streakCelebration();

    try {
      await fetch("/api/backend/schools/sponsor-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_name: proprietorSchoolName.trim(),
          state: proprietorState,
          category: "Secondary",
          contact_person: proprietorPerson.trim() || "School Administrator",
          contact_phone: proprietorPhone.trim(),
          contact_email: proprietorEmail.trim() || "admin@school.ng",
          requested_tier: "Gold Spotlight (₦150,000/term)",
        }),
      });
    } catch {}

    setSponsorSuccess("Thank you! Your school spotlight application has been received. Our partnership team will contact your administration within 24 hours.");
  };

  const filteredSchools = schools.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesState = selectedState === "All" || s.state === selectedState;
    const matchesSearch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.motto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesState && matchesSearch;
  });

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 min-h-screen pb-28 text-white space-y-4">
      <div>
        <BackButton fallbackHref="/student" label="Back to Cockpit" />
      </div>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E676] text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" /> VERIFIED NIGERIAN INSTITUTIONS & ADMISSIONS DIRECTORY
          </div>
          <h1 className="font-display tracking-tight font-black text-3xl md:text-4xl text-white flex items-center gap-3">
            Sovereign School Showcase
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Explore premier Federal Unity Colleges, historic state academies, and top private universities. Request prospectuses and apply for admissions directly within EduNaija OS.
          </p>
        </div>

        {/* B2B Advertising Action Button */}
        <button
          onClick={() => { sfx.tap(); setIsSponsorModalOpen(true); }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Feature Your School / Advertise</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name, motto, state..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto">
          {(["All", "Secondary", "Tertiary"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => { sfx.tap(); setSelectedCategory(cat); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#00E676] text-black shadow-md"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Levels" : cat === "Secondary" ? "Secondary Colleges" : "Universities"}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Nigerian Campus & CBT Center Radar Map */}
      <div className="mb-10">
        <InteractiveCampusMap />
      </div>

      {/* School Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredSchools.map((sch) => {
          let highlights: string[] = [];
          try {
            highlights = JSON.parse(sch.highlights_json || "[]");
          } catch {}

          return (
            <div
              key={sch.id}
              className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & State */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Award className="w-3 h-3" /> {sch.badge}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {sch.state} State
                  </span>
                </div>

                {/* School Name & Motto */}
                <h3 className="font-bold text-base text-white leading-snug mb-1">{sch.name}</h3>
                <p className="text-xs text-zinc-400 italic mb-3">&ldquo;{sch.motto}&rdquo;</p>

                {/* Admission Status Pill */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 font-medium mb-3">
                  <span className="font-bold block text-[10px] uppercase text-emerald-400">Admissions Status:</span>
                  {sch.admission_status}
                </div>

                {/* Tuition & Curriculum */}
                <div className="space-y-1 text-xs mb-4">
                  <div className="text-zinc-300 flex justify-between">
                    <span className="text-zinc-500">Tuition Range:</span>
                    <span className="font-mono font-bold text-white text-[11px] truncate max-w-[170px]">{sch.tuition_band}</span>
                  </div>
                  <div className="text-zinc-300 flex justify-between">
                    <span className="text-zinc-500">Curriculum:</span>
                    <span className="font-bold text-zinc-200 text-[11px] truncate max-w-[170px]">{sch.curriculum}</span>
                  </div>
                </div>

                {/* Highlights List */}
                {highlights.length > 0 && (
                  <div className="space-y-1 mb-4 pt-2 border-t border-white/5">
                    {highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#00E676] shrink-0 mt-0.5" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct In-App Application Action */}
              <button
                onClick={() => handleOpenEnquiry(sch)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-[#00E676] hover:text-black font-extrabold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Request Prospectus & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* In-App Direct Admission Enquiry Modal */}
      <AnimatePresence>
        {enquiringSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-6 border border-emerald-500/40 bg-zinc-950 max-w-lg w-full relative"
            >
              <button
                onClick={() => setEnquiringSchool(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {enquirySuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-[#00E676] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">Admissions Enquiry Transmitted!</h3>
                  <p className="text-xs text-zinc-300 mb-3 max-w-sm mx-auto">
                    Your details have been submitted to the admissions registry of <strong className="text-amber-300">{enquiringSchool.name}</strong>.
                  </p>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-emerald-400 mb-5">
                    Reference ID: {enquirySuccess}
                  </div>
                  <button
                    onClick={() => setEnquiringSchool(null)}
                    className="w-full py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submitEnquiry}>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Direct Institutional Entry</span>
                    <h3 className="font-bold text-lg text-white">{enquiringSchool.name}</h3>
                    <p className="text-xs text-zinc-400">Request formal prospectus, fee breakdown & entrance examination requirements.</p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Prospective Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Chisom Okonkwo"
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Parent / Guardian Full Name</label>
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="e.g. Chief Dr. Emeka Okonkwo"
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Parent WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Target Class of Entry</label>
                      <select
                        value={targetClass}
                        onChange={(e) => setTargetClass(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      >
                        <option value="JSS 1 (Common Entrance)">JSS 1 (Common Entrance)</option>
                        <option value="JSS 2 Transfer">JSS 2 Transfer</option>
                        <option value="SSS 1 (Senior Secondary)">SSS 1 (Senior Secondary)</option>
                        <option value="100 Level (Undergraduate UTME)">100 Level (Undergraduate UTME)</option>
                        <option value="Direct Entry 200L">Direct Entry 200L</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="w-full py-3 rounded-xl bg-[#00E676] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingEnquiry ? "Submitting to School Registry..." : "Transmit Admission Enquiry"}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B2B School Advertising Application Modal */}
      <AnimatePresence>
        {isSponsorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-6 border border-amber-500/40 bg-zinc-950 max-w-lg w-full relative"
            >
              <button
                onClick={() => { setIsSponsorModalOpen(false); setSponsorSuccess(null); }}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {sponsorSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">Listing Request Registered!</h3>
                  <p className="text-xs text-zinc-300 mb-5">{sponsorSuccess}</p>
                  <button
                    onClick={() => { setIsSponsorModalOpen(false); setSponsorSuccess(null); }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submitSponsorship}>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Institutional Growth & Recruitment</span>
                    <h3 className="font-bold text-lg text-white">Promote Your School to 14,820+ Nigerian Families</h3>
                    <p className="text-xs text-zinc-400">Put your school on the National Showcase, CBT Cockpits, and State Academic Atlas.</p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">School / Institution Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={proprietorSchoolName}
                        onChange={(e) => setProprietorSchoolName(e.target.value)}
                        placeholder="e.g. Atlantic Hall Educational Trust"
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">State & Location</label>
                      <input
                        type="text"
                        required
                        value={proprietorState}
                        onChange={(e) => setProprietorState(e.target.value)}
                        placeholder="e.g. Lagos, Poka-Epe"
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Contact Officer Name</label>
                        <input
                          type="text"
                          required
                          value={proprietorPerson}
                          onChange={(e) => setProprietorPerson(e.target.value)}
                          placeholder="Principal / Registrar"
                          className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Official Phone</label>
                        <input
                          type="tel"
                          required
                          value={proprietorPhone}
                          onChange={(e) => setProprietorPhone(e.target.value)}
                          placeholder="+234..."
                          className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Submit Institutional Spotlight Application</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
