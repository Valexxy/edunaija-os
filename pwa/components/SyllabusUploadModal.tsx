'use client';

import React, { useState } from 'react';
import { UploadCloud, BookOpen, Check, X, FileText, Sparkles, Layers, AlertCircle } from 'lucide-react';
import { sfx } from '../lib/audio';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (syllabus: any) => void;
}

export default function SyllabusUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}: SyllabusUploadModalProps) {
  const [title, setTitle] = useState('');
  const [classTier, setClassTier] = useState('SSS');
  const [subject, setSubject] = useState('Mathematics');
  const [jurisdiction, setJurisdiction] = useState('NERDC');
  const [rawContent, setRawContent] = useState('');
  const [weeksCount, setWeeksCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  const handlePreloadTemplate = () => {
    sfx.tap();
    setTitle(`Term 1 ${classTier} ${subject} Scheme of Work`);
    setRawContent(`Week 1: Indices and Logarithms (Laws of Indices, Characteristic and Mantissa)
Week 2: Surds and Conjugate Binomial Expressions (Simplification and Rationalization)
Week 3: Quadratic Equations (Factorization, Completing Square, Quadratic Formula)
Week 4: Simultaneous Equations (Linear & Quadratic Systems)
Week 5: Arithmetic Progression (nth term, Sum of first n terms)
Week 6: Geometric Progression (Common ratio, Sum to infinity)
Week 7: Mid-Term Continuous Assessment & Diagnostic Review
Week 8: Trigonometric Ratios & Sine/Cosine Rules
Week 9: Mensuration of Solid Shapes (Cylinder, Cone, Sphere, Frustum)
Week 10: Statistics: Grouped Data, Mean, Median, Mode & Ogive Curves
Week 11: Probability: Mutually Exclusive and Independent Events
Week 12: Term End Examination & Standardized Readiness Audit`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawContent.trim()) {
      setErrorMsg('Please enter a syllabus title and curriculum content.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      sfx.tap();
      const res = await fetch('/api/backend/syllabus/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          class_tier: classTier,
          subject: subject,
          jurisdiction: jurisdiction,
          uploaded_by: 'Parent / Student Portal',
          raw_content: rawContent.trim(),
          weeks_count: weeksCount
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to upload syllabus');
      }

      setSuccessData(data);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while uploading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090b14] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[92vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Parent &amp; Student Syllabus Portal
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Custom Scheme of Work
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Upload your school's weekly curriculum to auto-align practice questions and weekly pacing
              </p>
            </div>
          </div>
          <button
            onClick={() => { sfx.tap(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successData ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,230,118,0.3)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Syllabus Ingested Successfully!</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                <strong className="text-white">{successData.title}</strong> has been registered. 
                Our pedagogical engine will schedule weekly micro-skills and tailored practice drills.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setTitle('');
                  setRawContent('');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Class Tier</label>
                <select
                  value={classTier}
                  onChange={(e) => setClassTier(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRIMARY">Primary School (Basic 1-6)</option>
                  <option value="JSS">Junior Secondary (JSS 1-3)</option>
                  <option value="SSS">Senior Secondary (SSS 1-3)</option>
                  <option value="UTME">JAMB / UTME Candidate</option>
                  <option value="CAMBRIDGE">Cambridge IGCSE / A-Levels</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English Language</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                  <option value="Government">Government</option>
                  <option value="Literature">Literature in English</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Standard / System</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="NERDC">NERDC National Curriculum</option>
                  <option value="WAEC">WAEC / WASSCE Standards</option>
                  <option value="JAMB">JAMB High-Yield Syllabus</option>
                  <option value="CAMBRIDGE">Cambridge International</option>
                  <option value="CUSTOM">School Internal Scheme</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Syllabus or Scheme Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SSS 2 Term 1 Mathematics — Corona Secondary School"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Weekly Curriculum Topics (Weeks 1 - 12)
                </label>
                <button
                  type="button"
                  onClick={handlePreloadTemplate}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Load 12-Week Sample Template
                </button>
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={7}
                placeholder="Enter or paste each week's topic and learning goals...&#10;Week 1: Indices and Logarithms&#10;Week 2: Surds and Conjugate Pairs&#10;Week 3: Quadratic Equations"
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">
                Pacing: 12-Week Term Cycle
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { sfx.tap(); onClose(); }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black shadow-[0_0_15px_rgba(0,230,118,0.35)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? 'Processing Scheme...' : 'Ingest Syllabus'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
