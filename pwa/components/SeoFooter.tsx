'use client';

import React from 'react';
import Link from 'next/link';

export default function SeoFooter() {
  const currentYear = 2026;

  const topicalSilos = [
    {
      title: 'Official Examination Pillars',
      links: [
        { label: 'JAMB UTME CBT Mock Simulator (1985–2025)', href: '/quiz', badge: 'FREE' },
        { label: 'WAEC SSCE May/June Theory Marking Rubric', href: '/theory', badge: 'FREE' },
        { label: 'Cognitive Synapse Weakness Autopsy', href: '/autopsy', badge: 'FREE' },
        { label: 'Strict Proctored Exam Hall & Anti-Cheat', href: '/exam-proctor', badge: 'FREE' },
        { label: 'Sunday 8PM National Showdown League', href: '/showdown', badge: 'BOUNTY' },
        { label: 'State-by-State H2H Live Competition Drill', href: '/competition', badge: 'LIVE' },
      ],
    },
    {
      title: 'Syllabus & Pedagogical Engines',
      links: [
        { label: 'Universal School Scheme Ingestion Autopilot', href: '/syllabus', badge: 'PREMIUM' },
        { label: 'Socratic Homework Task & Assignment Solver', href: '/syllabus', badge: 'PREMIUM' },
        { label: 'Official NERDC / WAEC / JAMB Curricula', href: '/curriculum', badge: 'FREE' },
        { label: 'Ask AI Tutor (24/7 Academic Oracle)', href: '/qa', badge: 'FREE' },
        { label: 'Prescribed Literature Bionic Eye-Fixation Reader', href: '/reader', badge: 'FREE' },
        { label: 'Interactive Wonder Lab Science Simulations', href: '/playground', badge: 'FREE' },
      ],
    },
    {
      title: 'Virtual Teaching & Mentors',
      links: [
        { label: 'TRCN Vetted Mentors Directory', href: '/virtual-teaching', badge: 'VERIFIED' },
        { label: 'Book 15-Minute Free Discovery Session', href: '/virtual-teaching', badge: 'FREE' },
        { label: 'Sovereign Encrypted WebRTC Classroom', href: '/virtual-classroom', badge: 'GATED' },
        { label: 'Parent Stealth Shadow Observation Mode', href: '/virtual-classroom', badge: 'NDPA 2023' },
        { label: 'Milestone Escrow Guarantee (80/20 Payout)', href: '/virtual-teaching', badge: 'SECURE' },
      ],
    },
    {
      title: 'Admissions & Sovereign Infrastructure',
      links: [
        { label: 'Official University Cut-Off Marks & Catchment Directory', href: '/admissions', badge: 'CCMAS' },
        { label: 'Primary, Unity & Secondary Schools Radar', href: '/schools', badge: '37 STATES' },
        { label: 'NUC Accredited Tertiary Institutions Directory', href: '/institutions', badge: 'NUC 2026' },
        { label: '5.0 CGPA Varsity Course-to-Career Navigator', href: '/career', badge: 'FREE' },
        { label: '₦0 Data Mode (35KB Ultra-Compressed Vault)', href: '/zero-data', badge: 'OFFLINE' },
        { label: 'Cryptographic Verifiable Digital Certificates', href: '/certificates', badge: 'ED25519' },
        { label: 'Indigenous Audio Phonics & Cultural Voices', href: '/indigenous-voices', badge: 'HERITAGE' },
        { label: 'Live Forex Tuition & Standardized Exam Benchmark', href: '/api/realtime/forex', badge: 'REALTIME' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#030712] border-t border-slate-800/80 pt-16 pb-24 md:pb-16 text-slate-400 mt-20" aria-label="Sovereign Educational Backlink & Authority Directory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Block: Entity Authority & Logo */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-slate-800/80">
          <div className="space-y-3">
            <Link 
              href="/" 
              title="EduNaija OS - Sovereign Education Operating System"
              aria-label="EduNaija OS Homepage"
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#008751] to-[#00E676] flex items-center justify-center font-black text-black text-base shadow-[0_0_20px_rgba(0,230,118,0.4)]">
                🇳🇬
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                EduNaija <span className="text-[#00E676]">OS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Federal Republic of Nigeria’s Sovereign Education Operating System. Zero-data offline resilience, TRCN-vetted live tutoring, universal syllabus decomposition, and verifiable digital academic credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              ✓ NDPA 2023 Compliant
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              ✓ NUC CCMAS 5.0 Standard
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              ✓ TRCN Vetted Educators
            </span>
          </div>
        </div>

        {/* 4-Column Topical Silos (Crawlable Internal Backlink Architecture) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {topicalSilos.map((silo, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2.5">
                {silo.title}
              </h3>
              <ul className="space-y-2.5 text-xs">
                {silo.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="hover:text-emerald-300 transition-colors flex items-center justify-between group py-1"
                      title={link.label}
                    >
                      <span className="group-hover:translate-x-1 transition-transform truncate pr-2">
                        {link.label}
                      </span>
                      {link.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 bg-slate-800 text-slate-300 border border-slate-700">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Breadcrumb & Entity Grounding Bar */}
        <div className="py-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>Core Hubs:</span>
            <Link href="/" className="hover:text-slate-300 underline underline-offset-2">Home</Link>
            <span>&bull;</span>
            <Link href="/student" className="hover:text-slate-300 underline underline-offset-2">Student Hub</Link>
            <span>&bull;</span>
            <Link href="/parent" className="hover:text-slate-300 underline underline-offset-2">Parent Cockpit</Link>
            <span>&bull;</span>
            <Link href="/syllabus" className="hover:text-slate-300 underline underline-offset-2">Syllabus &amp; Tasks</Link>
            <span>&bull;</span>
            <Link href="/virtual-teaching" className="hover:text-slate-300 underline underline-offset-2">Vetted Mentors</Link>
            <span>&bull;</span>
            <Link href="/admissions" className="hover:text-slate-300 underline underline-offset-2">Admissions Radar</Link>
          </div>

          <div>
            &copy; {currentYear} EduNaija OS Sovereign Infrastructure. All Rights Reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
