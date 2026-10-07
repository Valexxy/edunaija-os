'use client';

import React, { useState, useEffect } from 'react';
import { 
  School, Building2, MapPin, GraduationCap, X, Check, Search, 
  Sparkles, BookOpen, Award, Landmark, History, Compass, Users
} from 'lucide-react';
import { sfx } from '../lib/audio';

interface StateOption {
  state_code: string;
  state_name: string;
  capital: string;
  geopolitical_zone: string;
  motto: string;
  creation_year: number;
  historical_summary?: string;
  educational_heritage?: string;
  notable_scholars_and_heroes?: string;
  cultural_landmarks?: string;
  accent_theme?: string;
}

interface InstitutionOption {
  id: string;
  name: string;
  short_name: string;
  institution_type: string;
  state: string;
  city: string;
  ownership: string;
  motto?: string;
  founded_year?: number;
  historical_significance?: string;
  notable_alumni?: string;
}

interface SecondarySchoolOption {
  id: string;
  name: string;
  school_type: string;
  state: string;
  city: string;
  motto?: string;
  founded_year?: number;
  historical_significance?: string;
  alumni_heroes?: string;
}

interface InstitutionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (selection: {
    state: string;
    motto: string;
    institution: string;
    secondarySchool: string;
    targetCourse: string;
  }) => void;
}

export default function InstitutionSelectorModal({
  isOpen,
  onClose,
  onSave
}: InstitutionSelectorModalProps) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [schools, setSchools] = useState<SecondarySchoolOption[]>([]);

  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [selectedInstType, setSelectedInstType] = useState<string>('ALL');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('University of Lagos (UNILAG)');
  const [selectedSchool, setSelectedSchool] = useState<string>('King\'s College, Lagos');
  const [targetCourse, setTargetCourse] = useState<string>('Software Engineering / Computer Science');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  
  // Rich Heritage Data for selected State
  const [stateHeritage, setStateHeritage] = useState<StateOption | null>(null);
  const [activeHeritageTab, setActiveHeritageTab] = useState<'history' | 'education' | 'scholars' | 'landmarks'>('history');

  useEffect(() => {
    if (!isOpen) return;

    // Load existing preferences from localStorage
    try {
      const saved = localStorage.getItem('edunaija_user_directory_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state) setSelectedState(parsed.state);
        if (parsed.institution) setSelectedInstitution(parsed.institution);
        if (parsed.secondarySchool) setSelectedSchool(parsed.secondarySchool);
        if (parsed.targetCourse) setTargetCourse(parsed.targetCourse);
      }
    } catch {}

    // Fetch states
    fetch('/api/backend/quiz/directory/states')
      .then(res => res.json())
      .then(data => {
        if (data.states) setStates(data.states);
      })
      .catch(() => {});
  }, [isOpen]);

  // Fetch state heritage details & institutions/schools when selectedState changes
  useEffect(() => {
    if (!isOpen || !selectedState) return;

    fetch(`/api/backend/quiz/directory/state/${encodeURIComponent(selectedState)}`)
      .then(res => res.json())
      .then(data => {
        if (data.state) {
          setStateHeritage(data.state);
          if (data.state.institutions) setInstitutions(data.state.institutions);
          if (data.state.secondary_schools) setSchools(data.state.secondary_schools);
        }
      })
      .catch(() => {});
  }, [isOpen, selectedState]);

  if (!isOpen) return null;

  const currentInstitutionObj = institutions.find(i => 
    selectedInstitution.includes(i.short_name) || selectedInstitution === i.name
  );

  const currentSchoolObj = schools.find(s => 
    selectedSchool === s.name || selectedSchool.includes(s.name)
  );

  const handleSave = () => {
    sfx.tap();
    const payload = {
      state: selectedState,
      motto: stateHeritage?.motto || 'Centre of Excellence',
      institution: selectedInstitution,
      secondarySchool: selectedSchool,
      targetCourse: targetCourse
    };
    localStorage.setItem('edunaija_user_directory_pref', JSON.stringify(payload));
    setIsSaved(true);
    if (onSave) onSave(payload);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  const filteredInstitutions = institutions.filter(i => 
    (selectedInstType === 'ALL' || i.institution_type.toLowerCase().includes(selectedInstType.toLowerCase())) &&
    (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     i.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090b14] border border-white/15 rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[94vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              <Compass className="w-5 h-5 text-[#00E676]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Pan-Nigerian State &amp; Institutional Heritage Atlas
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  36 States + FCT
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Celebrate your state motto, pioneer scholars, historic schools, and target university cut-offs
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

        {/* Content Body: 2-Column Split on desktop for rich educational showcase */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT COLUMN: Selection Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5 bg-black/40 p-3.5 rounded-2xl border border-white/5">
              
              {/* Step 1: State Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  1. State of Origin / Residence
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {states.map(s => (
                    <option key={s.state_code} value={s.state_name} className="bg-zinc-900 text-white">
                      {s.state_name} State — &quot;{s.motto}&quot; ({s.geopolitical_zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Target Higher Institution */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    2. Target Tertiary Institution
                  </label>
                  <div className="flex gap-1 text-[9px]">
                    {['ALL', 'University', 'Polytechnic'].map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedInstType(t)}
                        className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                          selectedInstType === t
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search institution..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1 rounded-xl bg-black/60 p-1.5 border border-white/5">
                  {filteredInstitutions.length > 0 ? (
                    filteredInstitutions.map(inst => {
                      const isSelected = selectedInstitution.includes(inst.short_name) || selectedInstitution === inst.name;
                      return (
                        <button
                          key={inst.id}
                          onClick={() => {
                            sfx.tap();
                            setSelectedInstitution(`${inst.name} (${inst.short_name})`);
                          }}
                          className={`w-full text-left p-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                              : 'hover:bg-white/5 text-zinc-300'
                          }`}
                        >
                          <div className="truncate mr-1">
                            <span className="font-bold">{inst.short_name}</span> - <span className="text-zinc-400 text-[11px]">{inst.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-2 text-[11px] text-zinc-500">
                      No matching institution in {selectedState}.
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Secondary School */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-amber-400" />
                  3. Secondary School / Alma Mater
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.name} className="bg-zinc-900 text-white">
                      {sch.name} ({sch.school_type})
                    </option>
                  ))}
                  <option value="Other Federal / State Secondary School" className="bg-zinc-900 text-white">
                    Other Accredited Secondary School
                  </option>
                </select>
              </div>

              {/* Step 4: Target Course */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  4. Target Course of Study
                </label>
                <input
                  type="text"
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  placeholder="e.g. Medicine, Law, Software Engineering, Accounting"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            {/* RIGHT COLUMN: Rich Celebratory Heritage Showcase Card (7 cols) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
              
              {stateHeritage && (
                <div className="rounded-3xl bg-gradient-to-br from-black/80 via-[#0d101d] to-black/90 border border-emerald-500/30 p-4 shadow-2xl relative overflow-hidden space-y-3">
                  
                  {/* State Title & Official Motto */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">{stateHeritage.state_name} State</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          Est. {stateHeritage.creation_year}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {stateHeritage.geopolitical_zone}
                        </span>
                      </div>
                      
                      {/* Celebratory Motto Banner */}
                      <div className="mt-1 text-sm font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#00E676] to-emerald-400 tracking-wide flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>&ldquo;{stateHeritage.motto}&rdquo;</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Capital City: <strong className="text-white">{stateHeritage.capital}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Heritage Sub-Tabs */}
                  <div className="flex items-center gap-1 border-b border-white/5 pb-2 text-[10px] overflow-x-auto">
                    {[
                      { id: 'history', label: 'History & Origin', icon: History },
                      { id: 'education', label: 'Educational Heritage', icon: BookOpen },
                      { id: 'scholars', label: 'Notable Scholars & Heroes', icon: Users },
                      { id: 'landmarks', label: 'Monuments & Landmarks', icon: Landmark },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeHeritageTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { sfx.tap(); setActiveHeritageTab(tab.id as any); }}
                          className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Heritage Tab Content */}
                  <div className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5 min-h-[90px] flex items-center">
                    {activeHeritageTab === 'history' && (
                      <p>{stateHeritage.historical_summary}</p>
                    )}
                    {activeHeritageTab === 'education' && (
                      <div>
                        <strong className="text-emerald-400 block mb-1">Academic Pedigree:</strong>
                        <p>{stateHeritage.educational_heritage}</p>
                      </div>
                    )}
                    {activeHeritageTab === 'scholars' && (
                      <div>
                        <strong className="text-amber-400 block mb-1">Pioneering Thinkers &amp; National Leaders:</strong>
                        <p>{stateHeritage.notable_scholars_and_heroes}</p>
                      </div>
                    )}
                    {activeHeritageTab === 'landmarks' && (
                      <div>
                        <strong className="text-cyan-400 block mb-1">Geographic &amp; Historic Monuments:</strong>
                        <p>{stateHeritage.cultural_landmarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Institutional Heritage Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* Selected University Spotlight */}
                    <div className="p-2.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                      <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Target Tertiary Institution
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {selectedInstitution}
                      </div>
                      {currentInstitutionObj?.motto && (
                        <div className="text-[10px] text-cyan-200/90 italic mt-0.5 truncate">
                          &ldquo;{currentInstitutionObj.motto}&rdquo;
                        </div>
                      )}
                      {currentInstitutionObj?.founded_year && (
                        <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                          Founded: {currentInstitutionObj.founded_year} • {currentInstitutionObj.ownership}
                        </div>
                      )}
                    </div>

                    {/* Selected Secondary School Spotlight */}
                    <div className="p-2.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                      <div className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center gap-1">
                        <School className="w-3 h-3" /> Secondary School
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {selectedSchool}
                      </div>
                      {currentSchoolObj?.motto && (
                        <div className="text-[10px] text-amber-200/90 italic mt-0.5 truncate">
                          &ldquo;{currentSchoolObj.motto}&rdquo;
                        </div>
                      )}
                      {currentSchoolObj?.founded_year && (
                        <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                          Founded: {currentSchoolObj.founded_year} • {currentSchoolObj.school_type}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-3 mt-3 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 font-mono">
            Calibrating: <span className="text-emerald-400 font-bold">{selectedState} State</span> (&ldquo;{stateHeritage?.motto || 'Excellence'}&rdquo;)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { sfx.tap(); onClose(); }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black shadow-[0_0_15px_rgba(0,230,118,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              <span>{isSaved ? 'Saved Heritage Preference!' : 'Save & Calibrate'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
