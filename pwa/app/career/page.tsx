"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, GraduationCap, Calculator, Award, TrendingUp, 
  Building2, Compass, ShieldCheck, CheckCircle2, ChevronRight, 
  DollarSign, Sparkles, MapPin, Plus, Trash2, ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface CareerPathway {
  course: string;
  faculty: string;
  industry_sectors: string[];
  top_employers_nigeria: string[];
  entry_salary_band_naira: string;
  certifications: string[];
  siwes_internship_hotspots: string[];
  growth_index: string;
}

interface CourseItem {
  id: string;
  code: string;
  units: number;
  grade: string;
}

export default function CareerNavigatorPage() {
  const [activeTab, setActiveTab] = useState<"careers" | "cgpa" | "siwes">("careers");
  const [pathways, setPathways] = useState<CareerPathway[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("All");

  // CGPA State
  const [currentCgpa, setCurrentCgpa] = useState<number>(4.20);
  const [completedUnits, setCompletedUnits] = useState<number>(45);
  const [courses, setCourses] = useState<CourseItem[]>([
    { id: "1", code: "MTH 201 (Linear Algebra)", units: 3, grade: "A" },
    { id: "2", code: "CSC 201 (Data Structures)", units: 3, grade: "A" },
    { id: "3", code: "PHY 205 (Modern Physics)", units: 3, grade: "B" },
    { id: "4", code: "GST 222 (Peace & Conflict)", units: 2, grade: "A" },
  ]);

  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    async function loadCareers() {
      try {
        const res = await fetch("/api/backend/career/paths");
        if (res.ok) {
          const data = await res.json();
          setPathways(data.pathways || []);
        }
      } catch (err) {
        console.warn("Using offline fallback pathways:", err);
      }
    }
    loadCareers();
  }, []);

  // Compute live CGPA simulation
  const handleCalculateCgpa = async () => {
    sfx.tap();
    triggerTmaHaptic("medium");

    try {
      const res = await fetch("/api/backend/career/cgpa-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_cgpa: Number(currentCgpa),
          completed_units: Number(completedUnits),
          semester_courses: courses.map(c => ({
            course_code: c.code,
            units: c.units,
            grade: c.grade
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
        if (data.cumulative_cgpa >= 4.50) {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          sfx.streakCelebration();
        }
      }
    } catch {}
  };

  const handleAddCourse = () => {
    sfx.tap();
    setCourses(prev => [
      ...prev,
      { id: Date.now().toString(), code: `COURSE ${prev.length + 1}`, units: 3, grade: "A" }
    ]);
  };

  const handleRemoveCourse = (id: string) => {
    sfx.tap();
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const faculties = ["All", ...Array.from(new Set(pathways.map(p => p.faculty)))];

  const filteredPathways = pathways.filter(p => {
    const matchFac = selectedFaculty === "All" || p.faculty === selectedFaculty;
    const matchSearch = p.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.top_employers_nigeria.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        p.industry_sectors.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFac && matchSearch;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 text-white max-w-7xl mx-auto font-sans pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E676] text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5" /> UNIVERSAL HIGHER EDUCATION &amp; ECONOMIC EMPOWERMENT
          </div>
          <h1 className="font-display tracking-tight font-black text-2xl sm:text-4xl text-white">
            Course-to-Career &amp; 5.0 CGPA Navigator
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Beyond examinations. Map your Nigerian degree to top employers, evaluate entry-level salaries, and simulate your path to First Class Honours on the official 5.0 scale.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 shrink-0">
          <button
            onClick={() => { sfx.tap(); setActiveTab("careers"); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "careers" ? "bg-[#00E676] text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Careers &amp; Salaries</span>
          </button>
          <button
            onClick={() => { sfx.tap(); setActiveTab("cgpa"); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "cgpa" ? "bg-amber-400 text-black shadow-md font-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>5.0 CGPA Simulator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COURSE-TO-CAREER & SALARIES */}
      {activeTab === "careers" && (
        <div className="space-y-6">
          {/* Filter ribbon */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course, employer (e.g. Paystack, NLNG), or skill..."
              className="w-full md:w-80 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
            />

            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
              {faculties.map(fac => (
                <button
                  key={fac}
                  onClick={() => { sfx.tap(); setSelectedFaculty(fac); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedFaculty === fac
                      ? "bg-[#00E676] text-black shadow-sm font-black"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>
          </div>

          {/* Pathways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPathways.map((path, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-bold">
                      {path.faculty}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Demand: <strong className="text-amber-400">{path.growth_index}</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white leading-tight">
                    {path.course}
                  </h3>

                  {/* Starting Salary Band Pill */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" /> Entry Graduate Salary:
                    </span>
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm">
                      {path.entry_salary_band_naira}
                    </span>
                  </div>

                  {/* Top Employers */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Top Domestic &amp; Global Employers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.top_employers_nigeria.map(emp => (
                        <span key={emp} className="text-[11px] bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5 text-zinc-200 font-medium">
                          {emp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Professional Certifications */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Required Professional Licensure &amp; Certs:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.certifications.map(cert => (
                        <span key={cert} className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-emerald-300 font-bold">
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SIWES Internship Hubs */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 truncate text-[11px]">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    SIWES: {path.siwes_internship_hotspots.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 5.0 CGPA SIMULATOR */}
      {activeTab === "cgpa" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Course Units & Grade Entry (7 cols) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-5 sm:p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  Official 5.0 Nigerian University Grading Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  NUC Unified Benchmark: A=5, B=4, C=3, D=2, E=1, F=0.
                </p>
              </div>
              <button
                onClick={handleAddCourse}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00E676] border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            {/* Previous Academic Standing Inputs */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                  CURRENT CUMULATIVE CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="5.0"
                  value={currentCgpa}
                  onChange={(e) => setCurrentCgpa(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                  TOTAL COMPLETED CREDIT UNITS
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={completedUnits}
                  onChange={(e) => setCompletedUnits(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>
            </div>

            {/* Semester Courses List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 block">
                Current Semester Enrolled Courses:
              </span>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={c.code}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCourses(prev => prev.map(item => item.id === c.id ? { ...item, code: val } : item));
                      }}
                      className="bg-transparent border-b border-transparent focus:border-emerald-400 font-bold text-white text-xs focus:outline-none flex-1 truncate"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Unit Picker */}
                      <select
                        value={c.units}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCourses(prev => prev.map(item => item.id === c.id ? { ...item, units: val } : item));
                        }}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map(u => (
                          <option key={u} value={u}>{u} Units</option>
                        ))}
                      </select>

                      {/* Grade Picker */}
                      <select
                        value={c.grade}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourses(prev => prev.map(item => item.id === c.id ? { ...item, grade: val } : item));
                        }}
                        className="bg-zinc-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-black text-amber-300 focus:outline-none"
                      >
                        {["A", "B", "C", "D", "E", "F"].map(g => (
                          <option key={g} value={g}>{g} ({g === "A" ? "5.0" : g === "B" ? "4.0" : g === "C" ? "3.0" : g === "D" ? "2.0" : g === "E" ? "1.0" : "0.0"})</option>
                        ))}
                      </select>

                      {courses.length > 1 && (
                        <button
                          onClick={() => handleRemoveCourse(c.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculateCgpa}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
            >
              Simulate Semester GPA &amp; Overall 5.0 CGPA
            </button>
          </div>

          {/* Right: Simulation Verdict & First Class Probability (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-black/80 via-[#0e1222] to-black/80 rounded-3xl border border-white/10 p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Academic Classification Engine
              </span>

              {simulationResult ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 text-center space-y-1">
                    <span className="text-xs font-mono text-zinc-400">PROJECTED CUMULATIVE CGPA</span>
                    <div className="font-mono font-black text-4xl text-emerald-400">
                      {simulationResult.cumulative_cgpa.toFixed(2)}
                      <span className="text-xs text-zinc-500 font-normal"> / 5.00</span>
                    </div>
                    <span className="text-xs font-bold text-amber-300 block">
                      {simulationResult.classification}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] text-zinc-500 block uppercase">Semester GPA</span>
                      <strong className="text-base text-white">{simulationResult.semester_gpa.toFixed(2)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] text-zinc-500 block uppercase">Total Units</span>
                      <strong className="text-base text-white">{simulationResult.cumulative_units}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                    <span className="font-bold block">Advisory Verdict:</span>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {simulationResult.verdict}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2 text-xs text-zinc-400">
                  <Calculator className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                  <p>Input your courses, credit units, and expected grades on the left, then click <strong>Simulate</strong>.</p>
                </div>
              )}
            </div>

            {/* Official NUC Degree Scale Quick Reference */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 text-[11px] font-mono space-y-1">
              <span className="text-zinc-500 uppercase block text-[9px]">Official Degree Classification Scale:</span>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>First Class Honours:</span>
                <span>4.50 – 5.00</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Second Class Upper (2:1):</span>
                <span>3.50 – 4.49</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Second Class Lower (2:2):</span>
                <span>2.40 – 3.49</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Third Class:</span>
                <span>1.50 – 2.39</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
