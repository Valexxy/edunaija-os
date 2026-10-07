'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DevModeToggle from '@/components/DevModeToggle';

interface ToggleItem {
  key: string;
  category: string;
  label: string;
  is_enabled: number;
  description: string;
  updated_at: string;
}

interface ConfigItem {
  key: string;
  category: string;
  label: string;
  value_type: string;
  value: string;
  description: string;
  updated_at: string;
}

interface StudentLifecycle {
  student_key: string;
  student_name: string;
  current_tier: string;
  lifecycle_stage: string;
  parent_pin_hash: string;
  total_study_minutes: number;
  cumulative_mastery_pct: number;
  diagnostic_passed: number;
}

interface AuditLog {
  id: string;
  student_key: string;
  previous_tier: string;
  new_tier: string;
  transition_type: string;
  diagnostic_score: number;
  verified_by: string;
  audit_hash: string;
  timestamp: string;
}

interface TeacherApp {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nin: string;
  trcn_number: string;
  trcn_category: string;
  degree_qualification: string;
  institution: string;
  tier_category: string;
  requested_monthly_fee: number;
  platform_take_pct: number;
  net_tutor_pay: number;
  diagnostic_score: number;
  guarantor_name: string;
  status: string;
  created_at: string;
}

export default function AdminMasterPage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'teachers' | 'students' | 'proctoring' | 'multiagent' | 'toggles'>('teachers');
  const [toggles, setToggles] = useState<ToggleItem[]>([]);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [students, setStudents] = useState<StudentLifecycle[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [teacherApps, setTeacherApps] = useState<TeacherApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Pricing Form State
  const [pricingForm, setPricingForm] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Admin Override Modal
  const [overrideStudentKey, setOverrideStudentKey] = useState<string | null>(null);
  const [overrideTargetTier, setOverrideTargetTier] = useState('SSS');
  const [overrideNote, setOverrideNote] = useState('Chief Developer Manual Override');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, aRes, teachRes] = await Promise.all([
        fetch('/api/backend/admin/toggles').then(r => r.json()).catch(() => ({ toggles: [] })),
        fetch('/api/backend/admin/config').then(r => r.json()).catch(() => ({ configs: [] })),
        fetch('/api/backend/admin/students').then(r => r.json()).catch(() => ({ students: [] })),
        fetch('/api/backend/admin/audit-logs').then(r => r.json()).catch(() => ({ audit_logs: [] })),
        fetch('/api/backend/admin/teachers/applications').then(r => r.json()).catch(() => ({ applications: [] }))
      ]);

      if (tRes.toggles) setToggles(tRes.toggles);
      if (cRes.configs) {
        setConfigs(cRes.configs);
        const pMap: Record<string, string> = {};
        cRes.configs.forEach((c: ConfigItem) => {
          pMap[c.key] = c.value;
        });
        setPricingForm(pMap);
      }
      if (sRes.students) setStudents(sRes.students);
      if (aRes.audit_logs) setAuditLogs(aRes.audit_logs);
      if (teachRes.applications) setTeacherApps(teachRes.applications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggle = async (key: string, currentVal: number) => {
    const newVal = currentVal === 1 ? false : true;
    try {
      const res = await fetch('/api/backend/admin/toggles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, is_enabled: newVal })
      });
      if (res.ok) {
        setToggles(prev => prev.map(t => t.key === key ? { ...t, is_enabled: newVal ? 1 : 0 } : t));
        showToast(`Toggle updated: ${key} is now ${newVal ? 'ENABLED' : 'DISABLED'}`);
      }
    } catch {
      showToast('Failed to update toggle');
    }
  };

  const handleSaveConfig = async (key: string, value: string) => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/backend/admin/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
        showToast(`Saved ${key} = ${value} in production!`);
      }
    } catch {
      showToast('Error saving configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAdminClassOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudentKey) return;
    try {
      const res = await fetch('/api/backend/admin/students/override-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_key: overrideStudentKey,
          target_tier: overrideTargetTier,
          admin_note: overrideNote
        })
      });
      if (res.ok) {
        showToast(`Override successful: ${overrideStudentKey} moved to ${overrideTargetTier}`);
        setOverrideStudentKey(null);
        fetchData();
      }
    } catch {
      showToast('Override execution failed');
    }
  };

  const handleApproveTeacher = async (appId: string) => {
    try {
      const res = await fetch(`/api/backend/admin/teachers/approve/${appId}`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast(`Teacher ${appId} Approved & Certified!`);
        setTeacherApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'VETTED_APPROVED' } : a));
      }
    } catch {
      showToast('Failed to approve teacher application');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Master Control Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span>● PRODUCTION TELEMETRY ACTIVE</span>
              <span>•</span>
              <span>100% SOVEREIGN NIGERIAN EDTECH</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Chief Developer <span className="text-emerald-400">Master Control Cockpit</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Live top-down administrative switches: teacher certifications, milestone escrow releases, pricing controls &amp; proctoring policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DevModeToggle />
            <Link
              href="/student"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              View Student View →
            </Link>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-3 animate-fade-in">
            <span>⚡</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 pb-2 overflow-x-auto">
          {[
            { id: 'teachers', label: `🎓 Vetted Teachers & Escrow (${teacherApps.length})` },
            { id: 'pricing', label: '💳 Manual Pricing & Financials' },
            { id: 'students', label: `👥 Student Lifecycles (${students.length})` },
            { id: 'proctoring', label: '🔒 Proctoring & Exam Policy' },
            { id: 'multiagent', label: '🤖 Multi-Agent Knowledge Engine' },
            { id: 'toggles', label: `🎛️ System Feature Toggles (${toggles.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 0: VETTED TEACHERS ONBOARDING & ESCROW DISBURSEMENT */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">Educator Vetting &amp; Escrow Disbursement Review</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Audit applicant statutory credentials under TRCN Act No. 31 of 1993, Smile ID NIN biometric check, and pedagogical video demo.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                    Hybrid 80% / 20% Split Active
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {teacherApps.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No pending educator applications. All vetting queues cleared.
                  </div>
                ) : (
                  teacherApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{app.full_name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            app.status === 'VETTED_APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {app.status}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                            {app.tier_category} Cohort
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400 font-mono">
                          <div>TRCN: <strong className="text-slate-200">{app.trcn_number}</strong></div>
                          <div>NIN: <strong className="text-slate-200">{app.nin}</strong></div>
                          <div>Diagnostic: <strong className="text-emerald-400">{app.diagnostic_score}%</strong></div>
                          <div>Degree: <strong className="text-slate-200">{app.degree_qualification}</strong></div>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Institution: {app.institution} • Guarantor: {app.guarantor_name}
                        </div>
                      </div>

                      {/* Financials & Payout Triggers */}
                      <div className="flex flex-col md:items-end gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-base font-black text-white font-mono">
                            ₦{app.requested_monthly_fee.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Net Tutor (80%): ₦{(app.net_tutor_pay || app.requested_monthly_fee * 0.8).toLocaleString()}
                          </div>
                        </div>

                        {app.status !== 'VETTED_APPROVED' ? (
                          <button
                            onClick={() => handleApproveTeacher(app.id)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20"
                          >
                            Verify &amp; Approve Teacher
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-emerald-400">
                            ✓ Ready for Escrow Retainers
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MANUAL PRICING & FINANCIALS */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Live Production Pricing Controls</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust product prices and fee structures in real-time. Changes are immediately reflected across student checkout modals and school billing portals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'cram_pass_price_ngn', label: '24-Hour Cram Pass', unit: '₦' },
                  { key: 'season_pass_price_ngn', label: 'Full Season Pass (UTME)', unit: '₦' },
                  { key: 'parent_monthly_price_ngn', label: 'Parent Guardian Monthly', unit: '₦' },
                  { key: 'parent_annual_price_ngn', label: 'Parent Guardian Annual', unit: '₦' },
                  { key: 'school_b2b_fee_student_ngn', label: 'School B2B Fee (Per Student/Term)', unit: '₦' },
                  { key: 'currency_symbol', label: 'Platform Currency Symbol', unit: 'Char' },
                ].map(item => (
                  <div key={item.key} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pricingForm[item.key] || ''}
                        onChange={e => setPricingForm({ ...pricingForm, [item.key]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleSaveConfig(item.key, pricingForm[item.key] || '')}
                        disabled={savingConfig}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT LIFECYCLES */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white">Registered Student Cohorts ({students.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="pb-3">Candidate Key</th>
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Academic Tier</th>
                      <th className="pb-3">Study Time</th>
                      <th className="pb-3">Topic Mastery</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {students.slice(0, 15).map(s => (
                      <tr key={s.student_key} className="hover:bg-slate-900/50">
                        <td className="py-3 text-emerald-400 font-bold">{s.student_key}</td>
                        <td className="py-3 font-sans font-medium text-white">{s.student_name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                            {s.current_tier}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{roundMinutes(s.total_study_minutes)}</td>
                        <td className="py-3 text-emerald-400">{Math.round(s.cumulative_mastery_pct)}%</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setOverrideStudentKey(s.student_key);
                              setOverrideTargetTier(s.current_tier);
                            }}
                            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-sans font-bold"
                          >
                            Override Tier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROCTORING & EXAM POLICY */}
        {activeTab === 'proctoring' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-white">AI Proctoring Rules &amp; Anti-Malpractice Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'proctoring_strike_limit', label: 'Maximum Permissible Strikes Before Lockout' },
                  { key: 'anti_cheat_blur_penalty_seconds', label: 'Tab Switch / Background Delay Penalty (Secs)' },
                  { key: 'face_detection_confidence_threshold', label: 'Facial Identification Confidence Minimum' },
                  { key: 'showdown_start_hour_wat', label: 'National Showdown Sunday Start Hour (24-Hour WAT)' },
                ].map(cfg => (
                  <div key={cfg.key} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs font-semibold text-slate-300">{cfg.label}</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pricingForm[cfg.key] || ''}
                        onChange={e => setPricingForm({ ...pricingForm, [cfg.key]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                      <button
                        onClick={() => handleSaveConfig(cfg.key, pricingForm[cfg.key] || '')}
                        disabled={savingConfig}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-AGENT KNOWLEDGE ENGINE */}
        {activeTab === 'multiagent' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-white">Subagent Swarm Status &amp; Real-Time Router</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: '1. Socratic Broda', role: 'Pidgin explanation for failed questions', latency: '<0.2s', status: 'ACTIVE' },
                  { name: '2. Feynman Engine', role: 'Nigerian cultural analogies & real-world anchors', latency: '<0.2s', status: 'ACTIVE' },
                  { name: '3. Cognitive Scaffolder', role: '3-tier scaffolding for struggling students', latency: '<0.2s', status: 'ACTIVE' },
                  { name: '4. Teachable Peer Tobi', role: 'Simulated pupil learning-by-teaching model', latency: '<0.2s', status: 'ACTIVE' },
                  { name: '5. Admissions Oracle', role: 'Real-time university cutoff scoring & radar', latency: '<0.1s', status: 'ACTIVE' },
                  { name: '6. Parent Reporter', role: 'Friday 5:00 PM WhatsApp audit synthesis', latency: '<0.2s', status: 'ACTIVE' },
                ].map(agent => (
                  <div key={agent.name} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{agent.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{agent.role}</p>
                    <div className="text-[10px] text-slate-500 font-mono">Inference Latency: {agent.latency}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM TOGGLES */}
        {activeTab === 'toggles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {toggles.map(t => (
              <div key={t.key} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] uppercase">
                      {t.category}
                    </span>
                    <span className={`text-[10px] font-bold font-mono ${t.is_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {t.is_enabled ? '● ONLINE' : '○ OFFLINE'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{t.label}</h4>
                  <p className="text-xs text-slate-400">{t.description}</p>
                </div>

                <button
                  onClick={() => handleToggle(t.key, t.is_enabled)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition font-mono ${t.is_enabled ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60' : 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'}`}
                >
                  {t.is_enabled ? 'Disable Toggle' : 'Enable Toggle'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN OVERRIDE MODAL */}
        {overrideStudentKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
              <h3 className="font-bold text-white text-base">Manual Student Tier Override</h3>
              <form onSubmit={handleAdminClassOverride} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Target Cohort / Tier</label>
                  <select
                    value={overrideTargetTier}
                    onChange={e => setOverrideTargetTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PRIMARY">PRIMARY (Basic 1 - 6)</option>
                    <option value="JSS">JSS (Basic 7 - 9)</option>
                    <option value="SSS">SSS (Senior Secondary WAEC)</option>
                    <option value="UTME">UTME (JAMB Candidate)</option>
                    <option value="FRESHMAN">100-Level Varsity Undergraduate</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Audit Rationale / Note</label>
                  <input
                    type="text"
                    value={overrideNote}
                    onChange={e => setOverrideNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOverrideStudentKey(null)}
                    className="w-1/2 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                  >
                    Execute Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function roundMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h ${mins % 60}m`;
}
