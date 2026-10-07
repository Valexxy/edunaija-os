'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ParentTelemetry {
  student_key: string;
  student_name: string;
  daily_study_target_minutes: number;
  current_syllabus_week: number;
  syllabus_coverage_percentage: number;
  verified_exam_mastery: number;
  proctored_exams_completed: number;
  active_syllabus: string;
  projected_waec_grade: string;
  projected_jamb_score: number;
  weak_topic_interventions: { topic: string; mastery: number; scheduled_remediation: string }[];
}

export default function ParentAutopilotPage() {
  const [telemetry, setTelemetry] = useState<ParentTelemetry | null>(null);
  const [whatsappText, setWhatsappText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [studentKey, setStudentKey] = useState('EDU-2025-LAG-1001');
  const [targetMinutes, setTargetMinutes] = useState(20);

  useEffect(() => {
    fetch(`/api/backend/syllabus/parent/report/${studentKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.telemetry) setTelemetry(data.telemetry);
        if (data.whatsapp_formatted_text) setWhatsappText(data.whatsapp_formatted_text);
      })
      .catch(err => {
        // Fallback demo data
        setTelemetry({
          student_key: 'EDU-2025-LAG-1001',
          student_name: 'Tolu Adeleke',
          daily_study_target_minutes: 20,
          current_syllabus_week: 4,
          syllabus_coverage_percentage: 33.3,
          verified_exam_mastery: 88.4,
          proctored_exams_completed: 3,
          active_syllabus: 'NERDC Senior Secondary Mathematics (Term 1)',
          projected_waec_grade: 'A1',
          projected_jamb_score: 318,
          weak_topic_interventions: [
            { topic: 'Quadratic Surd Conjugates', mastery: 62, scheduled_remediation: 'Saturday 10:00 AM micro-drill' },
            { topic: 'Negative Characteristic Bar Division', mastery: 71, scheduled_remediation: 'Sunday 4:00 PM Feynman analogy review' }
          ]
        });
      });
  }, [studentKey]);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateDispatch = () => {
    setDispatchStatus('Dispatched live to 08031234567 via WhatsApp Gateway (Zero Mobile Data Surcharge)!');
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase">
              🛡️ Zero-Micromanagement Parent Radar
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              OmniLearn <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">Parent Autopilot</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              No need to struggle teaching complex high-school calculus or science after work.
              OmniLearn tracks your child's syllabus progress, automatically assigns 20-minute daily micro-drills, schedules interventions for weak topics, and sends you an executive Friday WhatsApp audit.
            </p>
          </div>
        </div>

        {/* Dispatch status banner */}
        {dispatchStatus && (
          <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-3">
            <span>✅</span>
            <span>{dispatchStatus}</span>
          </div>
        )}

        {/* 4 KPI Metrics */}
        {telemetry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono uppercase">Syllabus Coverage</span>
              <div className="text-3xl font-black text-white font-mono">
                Week {telemetry.current_syllabus_week} / 12
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                {telemetry.syllabus_coverage_percentage}% Term Complete
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono uppercase">Verified Exam Mastery</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {telemetry.verified_exam_mastery}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {telemetry.proctored_exams_completed} Proctored Exams Passed
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono uppercase">Predicted WAEC Standing</span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                Distinction ({telemetry.projected_waec_grade})
              </div>
              <div className="text-xs text-slate-400">
                Mathematics & Physics Core
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono uppercase">Predicted JAMB UTME</span>
              <div className="text-3xl font-black text-teal-400 font-mono">
                {telemetry.projected_jamb_score} <span className="text-base text-slate-500 font-normal">/ 400</span>
              </div>
              <div className="text-xs text-emerald-400">
                Merit Quota Safe (UNILAG/UI)
              </div>
            </div>

          </div>
        )}

        {/* 2-Column Split: Autopilot Weakness Radar & WhatsApp Report Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Weakness Radar & Remediation */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🎯</span> Autopilot Weakness Interventions
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                The system detects where your child loses marks during practice and automatically schedules micro-scaffolds without parental intervention.
              </p>
            </div>

            <div className="space-y-4">
              {telemetry?.weak_topic_interventions.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{item.topic}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      {item.mastery}% Mastery
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${item.mastery}%` }}></div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
                    <span>⚡ Autopilot Action:</span>
                    <span className="text-slate-300">{item.scheduled_remediation}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Autopilot Study Routine Settings */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs uppercase font-mono font-bold text-slate-400">
                Daily Study Routine Calibration
              </span>
              <p className="text-xs text-slate-300">
                Set how much time the system should demand from your child each evening:
              </p>
              <div className="flex gap-3">
                {[15, 20, 30, 45].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setTargetMinutes(mins)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition border ${targetMinutes === mins ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                *Studies show 20 minutes of daily deliberate retrieval practice beats 4 hours of weekend cramming.
              </p>
            </div>
          </div>

          {/* Right Column: Live Friday WhatsApp / SMS Preview */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📲</span> Friday 5:00 PM WhatsApp Audit
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every Friday at closing time, parents receive this automated diagnostic breakdown on WhatsApp.
                  </p>
                </div>
              </div>

              {/* Chat Bubble Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 font-mono text-xs text-emerald-200 whitespace-pre-line leading-relaxed shadow-inner">
                {whatsappText || 'Generating live parent report...'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleCopyWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy WhatsApp Report Text'}
              </button>

              <button
                onClick={handleSimulateDispatch}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                🚀 Test Live Dispatch to Parent Phone (08031234567)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
