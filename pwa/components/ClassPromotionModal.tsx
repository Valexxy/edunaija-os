'use client';

import React, { useState, useEffect } from 'react';

interface DiagnosticQuestion {
  id: string;
  q: string;
  options: string[];
  correct: string;
}

interface ClassPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentKey: string;
  currentTier: string;
  targetTier: string;
  onPromotionSuccess: (newTier: string) => void;
}

export default function ClassPromotionModal({
  isOpen,
  onClose,
  studentKey,
  currentTier,
  targetTier,
  onPromotionSuccess
}: ClassPromotionModalProps) {
  const [activeMode, setActiveMode] = useState<'CHOICE' | 'EXAM' | 'PARENT_PIN'>('CHOICE');
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [parentPin, setParentPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCert, setSuccessCert] = useState<any>(null);

  // Fetch diagnostic questions when target tier changes
  useEffect(() => {
    if (!isOpen || !targetTier) return;
    setActiveMode('CHOICE');
    setAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setParentPin('');
    setErrorMessage(null);
    setSuccessCert(null);

    fetch(`/api/backend/lifecycle/diagnostic-exam/${targetTier}`)
      .then(res => res.json())
      .then(data => {
        if (data.questions) setDiagnosticQuestions(data.questions);
      })
      .catch(err => console.error(err));
  }, [isOpen, targetTier]);

  if (!isOpen) return null;

  const handleDiagnosticSubmit = async () => {
    if (Object.keys(answers).length < diagnosticQuestions.length) {
      setErrorMessage("Please answer all diagnostic readiness questions before submitting.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Score answers locally
    let correct = 0;
    const optionLetters = ['A', 'B', 'C', 'D'];
    diagnosticQuestions.forEach(q => {
      const chosenLetter = answers[q.id];
      if (chosenLetter === q.correct) correct++;
    });

    const scorePct = Math.round((correct / diagnosticQuestions.length) * 100);
    setExamScore(scorePct);
    setExamSubmitted(true);

    try {
      const res = await fetch('/api/backend/lifecycle/request-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_key: studentKey,
          target_tier: targetTier,
          diagnostic_score: scorePct
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessCert(data);
        onPromotionSuccess(targetTier);
      } else {
        setErrorMessage(data.detail || data.message || `Score of ${scorePct}% did not meet the 80% benchmark.`);
      }
    } catch (e: any) {
      setErrorMessage("Network error verifying promotion.");
    } finally {
      setLoading(false);
    }
  };

  const handleParentPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentPin.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/backend/lifecycle/request-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_key: studentKey,
          target_tier: targetTier,
          parent_pin: parentPin.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessCert(data);
        onPromotionSuccess(targetTier);
      } else {
        setErrorMessage(data.detail || "Invalid Parent Security PIN.");
      }
    } catch (e: any) {
      setErrorMessage("Network error verifying parent PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              🛡️ Anti-Cheat Class Progression Gatekeeper
            </span>
            <h3 className="text-xl font-bold text-white">
              Academic Transition: {currentTier} → <span className="text-emerald-400">{targetTier}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-mono">✕</button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUCCESS CERTIFICATE */}
        {successCert && (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500 text-center space-y-4">
            <div className="text-5xl">🎓</div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">Promotion Officially Certified!</h4>
              <p className="text-xs text-slate-300">
                Candidate has advanced to <strong>{targetTier}</strong>. Curriculum, voice tutor persona, and subjects have updated.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 max-w-md mx-auto">
              Audit Hash: {successCert.audit_hash} • Verified: {successCert.verified_by}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              Enter {targetTier} Learning Arena →
            </button>
          </div>
        )}

        {/* STEP 1: CHOICE OF VERIFICATION */}
        {!successCert && activeMode === 'CHOICE' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-300 leading-relaxed">
              To prevent level-skipping, XP farming, and maintain standardized transcript validity, all class promotions must be earned through verified readiness or authorized by a parent.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Diagnostic Gateway */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition">
                <div className="space-y-2">
                  <div className="text-2xl">📝</div>
                  <h4 className="font-bold text-white text-sm">Path A: Take Diagnostic Gateway Exam</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Take a 5-question readiness test on {targetTier} foundational concepts. Score ≥80% to earn promotion.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMode('EXAM')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Start Diagnostic Exam (5 Qs) →
                </button>
              </div>

              {/* Option B: Parent Authorization PIN */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-teal-500/50 transition">
                <div className="space-y-2">
                  <div className="text-2xl">🔑</div>
                  <h4 className="font-bold text-white text-sm">Path B: Parent Security PIN</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Parents can authorize class changes directly using their confidential 4-digit Parent Pass PIN.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMode('PARENT_PIN')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition"
                >
                  Enter Parent Security PIN →
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <span>🛡️</span>
              <span><strong>Immutable Ledger:</strong> Past exam attempts, historical test scores, and earned XP are permanently preserved.</span>
            </div>
          </div>
        )}

        {/* STEP 2A: DIAGNOSTIC EXAM */}
        {!successCert && activeMode === 'EXAM' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase">Target: {targetTier} Gateway Readiness</span>
              <span className="font-mono text-emerald-400">Pass Threshold: 80% (4 of 5 correct)</span>
            </div>

            <div className="space-y-4">
              {diagnosticQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <span className="font-mono text-slate-400">Question {idx + 1} of {diagnosticQuestions.length}</span>
                  <p className="text-sm font-medium text-white">{q.q}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${answers[q.id] === letter ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] font-mono ${answers[q.id] === letter ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveMode('CHOICE')}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
              >
                ← Back
              </button>
              <button
                onClick={handleDiagnosticSubmit}
                disabled={loading}
                className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Evaluating Readiness...' : 'Submit Diagnostic & Verify Promotion'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: PARENT PIN AUTH */}
        {!successCert && activeMode === 'PARENT_PIN' && (
          <form onSubmit={handleParentPinSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Enter 4-Digit Parent Security PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="e.g. 1234"
                value={parentPin}
                onChange={e => setParentPin(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono text-emerald-400 tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 text-center">
                *Default demo parent PIN is <strong>1234</strong>. Can be updated in Parent Autopilot settings.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveMode('CHOICE')}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Verifying PIN...' : 'Authorize Class Transition'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
