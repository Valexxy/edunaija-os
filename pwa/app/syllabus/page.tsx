'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Syllabus {
  id: string;
  title: string;
  class_tier: string;
  subject: string;
  jurisdiction: string;
  uploaded_by: string;
  weeks_count: number;
}

interface Module {
  id: string;
  syllabus_id: string;
  week_number: number;
  topic_title: string;
  learning_objectives: string[];
  micro_skills: string[];
  nigerian_analogy: string;
  key_formula_latex: string;
  misconception_trap: string;
  visual_lab_type: string;
  is_unlocked: number;
}

interface BloomQuestion {
  id: string;
  bloom_tier: string;
  difficulty_level: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  formula_latex?: string;
}

import AIPedagogyStudio from '../../components/AIPedagogyStudio';

export default function SyllabusPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'upload' | 'modules' | 'solver' | 'ai_studio'>('catalog');
  const [catalog, setCatalog] = useState<Syllabus[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('syl-nerdc-math-sss2');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [bloomQuestions, setBloomQuestions] = useState<BloomQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'NERDC' | 'WAEC' | 'JAMB' | 'CAMBRIDGE' | 'CUSTOM'>('ALL');

  // Socratic Homework Solver State
  const [taskSubject, setTaskSubject] = useState('Mathematics');
  const [taskTier, setTaskTier] = useState('SSS');
  const [taskInput, setTaskInput] = useState('Solve for x in the quadratic equation 2x^2 + 5x - 3 = 0 using the quadratic formula.');
  const [solverResult, setSolverResult] = useState<any>(null);
  const [solverLoading, setSolverLoading] = useState(false);
  const [showDerivations, setShowDerivations] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTier, setUploadTier] = useState('SSS');
  const [uploadSubject, setUploadSubject] = useState('Mathematics');
  const [uploadContent, setUploadContent] = useState(
`Week 1: Indices and Laws of Logarithms
Week 2: Algebraic Fractions and Undefined Values
Week 3: Simultaneous Equations with Linear and Quadratic
Week 4: Circle Geometry and Angle Theorems
Week 5: Trigonometric Ratios and Angles of Elevation
Week 6: Mid-Term Review and Problem-Solving Drills`
  );
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Fetch catalog
  useEffect(() => {
    fetch('/api/backend/syllabus/catalog')
      .then(res => res.json())
      .then(data => {
        if (data.catalog) setCatalog(data.catalog);
      })
      .catch(err => console.error('Failed to load syllabus catalog', err));
  }, []);

  // Fetch modules for selected syllabus
  useEffect(() => {
    if (!selectedSyllabusId) return;
    setLoading(true);
    fetch(`/api/backend/syllabus/${selectedSyllabusId}`)
      .then(res => res.json())
      .then(data => {
        if (data.modules) {
          setModules(data.modules);
          if (data.modules.length > 0) {
            setSelectedModule(data.modules[0]);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSyllabusId]);

  // Fetch Bloom questions when module changes
  useEffect(() => {
    if (!selectedModule) return;
    fetch(`/api/backend/syllabus/module/${selectedModule.id}/questions`)
      .then(res => res.json())
      .then(data => {
        if (data.questions) setBloomQuestions(data.questions);
      })
      .catch(err => console.error(err));
  }, [selectedModule]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/backend/syllabus/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          class_tier: uploadTier,
          subject: uploadSubject,
          jurisdiction: 'CUSTOM',
          uploaded_by: 'Parent Scheme Upload',
          raw_content: uploadContent,
          weeks_count: 12
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUploadSuccessMessage(`Successfully uploaded and decomposed "${data.title}" into ${data.parsed_modules_count} weekly modules!`);
        // Refresh catalog
        const catRes = await fetch('/api/backend/syllabus/catalog');
        const catData = await catRes.json();
        if (catData.catalog) setCatalog(catData.catalog);
        setSelectedSyllabusId(data.syllabus_id);
        setActiveTab('modules');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSolveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setSolverLoading(true);
    setSolverResult(null);
    setShowDerivations(false);
    try {
      const res = await fetch('/api/backend/syllabus/solve-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_text: taskInput,
          subject: taskSubject,
          grade_level: taskTier
        })
      });
      const data = await res.json();
      setSolverResult(data);
    } catch (err) {
      console.error('Failed to solve homework task:', err);
    } finally {
      setSolverLoading(false);
    }
  };

  const filteredCatalog = activeFilter === 'ALL'
    ? catalog
    : catalog.filter(c => c.jurisdiction.toUpperCase() === activeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-9xl select-none">OMNI</div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
              🏛️ Universal Domain-Agnostic Syllabus Engine
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              OmniLearn <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">Sovereign Autopilot</span>
            </h1>
            <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              Upload your child's exact school scheme of work or activate verified public standards (NERDC, WAEC, JAMB, Cambridge).
              Our 8-pillar pedagogical engine auto-decomposes every syllabus into granular micro-skills, Nigerian street analogies, and unyielding 4-tier Bloom exam questions.
            </p>

            {/* Quick Stats / Navigation */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/parent-autopilot" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition">
                🛡️ Parent Autopilot Radar
              </Link>
              <Link href="/exam-proctor" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 transition">
                🔒 Strict Proctored Exam Center
              </Link>
              <Link href="/zero-data" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 transition">
                📶 ₦0 Data Mode (35KB Pack)
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            📚 Public Official Standards ({catalog.length})
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded font-mono border border-emerald-500/40">FREE</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${activeTab === 'upload' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            📤 Upload Child's School Scheme
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded font-mono border border-purple-500/40">PREMIUM</span>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${activeTab === 'modules' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            🧩 12-Week Modular Trajectory ({modules.length} Weeks)
          </button>
          <button
            onClick={() => setActiveTab('solver')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${activeTab === 'solver' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            📝 Socratic Homework Task Solver
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded font-mono border border-purple-500/40">PREMIUM</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_studio')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${activeTab === 'ai_studio' ? 'bg-teal-400 text-slate-950 shadow-lg shadow-teal-400/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            🧠 AI Pedagogy &amp; Assignment Studio
            <span className="text-[10px] px-1.5 py-0.2 bg-teal-950 text-teal-300 rounded font-mono border border-teal-500/40">SOVEREIGN AI</span>
          </button>
        </div>

        {/* TAB 1: PUBLIC STANDARDS CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Jurisdiction:</span>
              {(['ALL', 'NERDC', 'WAEC', 'JAMB', 'CAMBRIDGE'] as const).map(jur => (
                <button
                  key={jur}
                  onClick={() => setActiveFilter(jur)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${activeFilter === jur ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {jur}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition relative flex flex-col justify-between ${selectedSyllabusId === item.id ? 'bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-900/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-emerald-400 uppercase tracking-wider border border-slate-700">
                        {item.jurisdiction}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.class_tier} Tier
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Subject: <span className="text-slate-200 font-medium">{item.subject}</span> • {item.weeks_count} Weeks Curriculum
                    </p>
                  </div>

                  <div className="pt-6 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSyllabusId(item.id);
                        setActiveTab('modules');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                    >
                      {selectedSyllabusId === item.id ? '✓ Active Syllabus' : 'Inspect & Learn →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD CUSTOM SCHEME OF WORK */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Ingest School Scheme of Work</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Copy and paste the weekly topics from your child's school note, diary, or term syllabus.
                  The automated parser decomposes it into 8-pillar learning units automatically.
                </p>
              </div>

              {uploadSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Syllabus / Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Corona School SSS 1 Further Maths (Term 2)"
                      value={uploadTitle}
                      onChange={e => setUploadTitle(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Class Tier</label>
                    <select
                      value={uploadTier}
                      onChange={e => setUploadTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="PRIMARY">Primary 4–6</option>
                      <option value="JSS">JSS 1–3</option>
                      <option value="SSS">SSS 1–3</option>
                      <option value="UTME">UTME / JAMB</option>
                      <option value="CAMBRIDGE">Cambridge IGCSE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Physics, Chemistry, English"
                    value={uploadSubject}
                    onChange={e => setUploadSubject(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-slate-300">Weekly Scheme of Work (Raw Text)</label>
                    <span className="text-[11px] text-slate-400">One line per week (e.g. Week 1: Topic)</span>
                  </div>
                  <textarea
                    rows={8}
                    value={uploadContent}
                    onChange={e => setUploadContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? '⚡ Parsing & Generating Micro-Skills...' : '🚀 Ingest & Activate Autopilot Trajectory'}
                </button>
              </form>
            </div>

            {/* Ingestion Explainer */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>🤖</span> How the Autopilot Engine Works
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parents don't need to be teachers. Once you upload the syllabus:
              </p>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span><strong>Micro-Skill Atomic Parsing:</strong> Breaks each topic into 3 testable competencies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span><strong>Everyday Street Grounding:</strong> Creates relatable Nigerian home/street analogies for slow learners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span><strong>Misconception Traps:</strong> Identifies where WAEC/JAMB candidates commonly lose marks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">4.</span>
                  <span><strong>Strict 4-Tier Bloom's Exams:</strong> Auto-generates Recall, Comprehension, Application, and Synthesis questions.</span>
                </li>
              </ul>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                🛡️ <strong>Zero Hallucination Guarantee:</strong> All formulas are mathematically verified before student delivery.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 12-WEEK MODULAR TRAJECTORY & BLOOM QUESTIONS */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-xs text-emerald-400 font-mono uppercase">Active Syllabus:</span>
                <h2 className="text-lg font-bold text-white">
                  {catalog.find(c => c.id === selectedSyllabusId)?.title || selectedSyllabusId}
                </h2>
              </div>
              <div className="flex gap-2">
                <Link href="/exam-proctor" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition">
                  🔒 Launch Proctored Exam on this Module
                </Link>
              </div>
            </div>

            {/* Modules Horizontal List */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {modules.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`px-4 py-3 rounded-2xl border text-left shrink-0 min-w-[220px] transition ${selectedModule?.id === mod.id ? 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-900/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Week {mod.week_number}</span>
                    <span className={mod.is_unlocked ? 'text-emerald-400' : 'text-slate-600'}>
                      {mod.is_unlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1 truncate">
                    {mod.topic_title}
                  </h4>
                </button>
              ))}
            </div>

            {/* Selected Module Detail Panel */}
            {selectedModule && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 8-Pillar Pedagogical Card */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Street Analogy & Concept */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      <h3 className="text-xl font-bold text-white">
                        {selectedModule.topic_title} (Week {selectedModule.week_number})
                      </h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                      <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                        <span>🇳🇬</span> The Feynman Cultural Analogy (Slow Learners' Anchor)
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed italic">
                        "{selectedModule.nigerian_analogy}"
                      </p>
                    </div>

                    {selectedModule.key_formula_latex && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-xs uppercase font-mono text-emerald-400 font-bold">Canonical Formula (LaTeX)</span>
                        <div className="text-base font-mono text-emerald-300 py-1">
                          {selectedModule.key_formula_latex}
                        </div>
                      </div>
                    )}

                    {selectedModule.misconception_trap && (
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                        <span className="text-xs uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                          <span>⚠️</span> Common Exam Trap (Where Students Fail)
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {selectedModule.misconception_trap}
                        </p>
                      </div>
                    )}

                    {/* Micro-Skills */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase">Micro-Skills Required for 85% Bloom Gatekeeper:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.micro_skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4-Tier Bloom's Taxonomy Practice Questions */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🎯</span> 4-Tier Bloom's Taxonomy Diagnostic Questions
                      </h3>
                      <span className="text-xs text-emerald-400 font-mono">
                        {bloomQuestions.length} Questions Verified
                      </span>
                    </div>

                    <div className="space-y-4">
                      {bloomQuestions.map((q, idx) => (
                        <div key={q.id || idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                              {q.bloom_tier} (Level {q.difficulty_level})
                            </span>
                            <span className="text-slate-500 font-mono">Question {idx + 1} of {bloomQuestions.length}</span>
                          </div>
                          
                          <p className="text-sm text-slate-100 font-medium leading-snug">
                            {q.question_text}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className={`p-2.5 rounded-xl border ${q.correct_option === 'A' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                              <strong>A:</strong> {q.option_a}
                            </div>
                            <div className={`p-2.5 rounded-xl border ${q.correct_option === 'B' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                              <strong>B:</strong> {q.option_b}
                            </div>
                            <div className={`p-2.5 rounded-xl border ${q.correct_option === 'C' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                              <strong>C:</strong> {q.option_c}
                            </div>
                            <div className={`p-2.5 rounded-xl border ${q.correct_option === 'D' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                              <strong>D:</strong> {q.option_d}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
                            <strong className="text-emerald-400">Socratic Reason:</strong> {q.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Rail: Pedagogical Status & Actions */}
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                      Bloom Mastery Gatekeeper
                    </h4>
                    
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <div className="text-3xl font-black text-emerald-400 font-mono">85%</div>
                      <p className="text-xs text-slate-400">
                        Accuracy threshold required on Week {selectedModule.week_number} before Week {selectedModule.week_number + 1} unlocks.
                      </p>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[88%]"></div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Current Cohort Average: 88.4%</span>
                    </div>

                    <Link
                      href="/exam-proctor"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      🔒 Take Strict Proctored Exam (Zero Assistance)
                    </Link>

                    <Link
                      href="/playground"
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                    >
                      🎨 Open Wonder Lab Interactive Simulation
                    </Link>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Autopilot Follow-Up
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      OmniLearn schedules automatic spaced repetition reviews at <strong>Day 1, Day 3, Day 7, and Day 21</strong> to permanently defeat the forgetting curve.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: SOCRATIC HOMEWORK TASK SOLVER */}
        {activeTab === 'solver' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase">
                      💎 Premium Socratic Homework Assistant
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-2">Class Task & Problem Guidance</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      EduNaija teaches the foundational intuition first with relatable street analogies before guiding you through step-by-step mathematical reasoning.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSolveTask} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Subject</label>
                      <input
                        type="text"
                        value={taskSubject}
                        onChange={e => setTaskSubject(e.target.value)}
                        placeholder="e.g. Mathematics, Physics, Chemistry"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Academic Tier</label>
                      <select
                        value={taskTier}
                        onChange={e => setTaskTier(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="PRIMARY">Primary (Basic 4–6)</option>
                        <option value="JSS">Junior Secondary (JSS 1–3)</option>
                        <option value="SSS">Senior Secondary (SSS 1–3)</option>
                        <option value="UTME">JAMB UTME / Post-UTME</option>
                        <option value="TERTIARY">100L Undergraduate Foundation</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Enter Class Task or Homework Question</label>
                    <textarea
                      rows={4}
                      value={taskInput}
                      onChange={e => setTaskInput(e.target.value)}
                      placeholder="Paste your assignment question, derivation problem, or exam past question..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-sans text-sm text-purple-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={solverLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {solverLoading ? '🧠 Deconstructing Problem & Synthesizing Scaffolding...' : '⚡ Teach Me & Guide This Solution'}
                  </button>
                </form>
              </div>

              {/* Solver Output Display */}
              {solverResult && (
                <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Concept Identified:</span>
                      <h3 className="text-xl font-bold text-white">{solverResult.core_concept}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                        Tier: {solverResult.bloom_level || solverResult.pedagogy_tier || 'Bloom Mastery'}
                      </span>
                    </div>
                  </div>

                  {/* Nigerian Grounding Analogy */}
                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                      <span>🇳🇬</span> Real-Life Nigerian Analogy (Intuitive Anchor)
                    </span>
                    <p className="text-slate-200 text-sm leading-relaxed italic">
                      "{solverResult.nigerian_analogy}"
                    </p>
                  </div>

                  {/* Core Pedagogical Lesson */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      📖 Conceptual Lesson (Why This Method Works)
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      {solverResult.lesson || solverResult.pedagogical_lesson}
                    </p>
                  </div>

                  {/* Step-by-Step Guidance */}
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                      🪜 Socratic Steps to Solve
                    </span>
                    <div className="space-y-2">
                      {(solverResult.steps || solverResult.step_by_step_guidance)?.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30 shrink-0">
                            Step {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bloom Socratic Mastery Check */}
                  {solverResult.socratic_check && (
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                      <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5">
                        <span>❓</span> Socratic Reflection Check (Can You Answer This?)
                      </span>
                      <p className="text-slate-200 text-sm font-medium">
                        {solverResult.socratic_check}
                      </p>
                    </div>
                  )}

                  {/* Revealing Full Derivation / Answer */}
                  <div className="pt-2 border-t border-slate-800">
                    {!showDerivations ? (
                      <button
                        onClick={() => setShowDerivations(true)}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                      >
                        👁️ Click to Reveal Full Mathematical Derivation & Final Answer
                      </button>
                    ) : (
                      <div className="space-y-3 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-mono font-bold text-emerald-400">
                            ✓ Verified Derivation & Answer
                          </span>
                          <button
                            onClick={() => setShowDerivations(false)}
                            className="text-xs text-slate-400 hover:text-slate-200"
                          >
                            Hide Derivations ▲
                          </button>
                        </div>
                        <p className="text-emerald-200 text-sm leading-relaxed whitespace-pre-line font-mono bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                          {solverResult.solution || solverResult.final_solution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Pedagogical Guarantee */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                  Pedagogical Integrity Guarantee
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unlike generic AI chatbots that output raw numerical answers leading to classroom dependency, EduNaija enforces anti-cheating cognitive scaffolding:
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-purple-400">1. Intuition First:</strong> Relatable street anchors ensure concepts make sense before equations are memorized.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-purple-400">2. Scaffolded Steps:</strong> The student is asked to solve sub-problems incrementally.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-purple-400">3. Verification Lock:</strong> Answers are hidden behind a review gate so students test their derivations first.
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Need 1-on-1 Human Tutoring?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Have a complex topic that requires individualized live demonstration? Connect with our TRCN-vetted national educators in the sovereign WebRTC classroom.
                </p>
                <Link
                  href="/virtual-teaching"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition mt-2"
                >
                  🎓 Find a Vetted Mentor
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI PEDAGOGY & ASSIGNMENT STUDIO */}
        {activeTab === 'ai_studio' && (
          <div className="w-full">
            <AIPedagogyStudio />
          </div>
        )}

      </div>
    </div>
  );
}
