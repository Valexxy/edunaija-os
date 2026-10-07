"use client";
import { useState } from "react";

interface FormulaSlot { id: string; label: string; unit: string; placeholder: string; }
interface FormulaResult { result: number; unit: string; steps: string[]; }
interface Formula {
  id: string; name: string; subject: string; template: string;
  description: string; slots: FormulaSlot[];
  calculate: (values: Record<string, number>) => FormulaResult;
}

const FORMULAS: Formula[] = [
  {
    id: "newton2", name: "Newton's 2nd Law", subject: "Physics", template: "F = m \u00d7 a",
    description: "Force equals mass times acceleration",
    slots: [
      { id: "m", label: "Mass", unit: "kg", placeholder: "Enter mass (kg)..." },
      { id: "a", label: "Acceleration", unit: "m/s\u00b2", placeholder: "Enter acceleration..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.m * v.a).toFixed(3)), unit: "N (Newtons)",
      steps: [`Step 1: Write formula \u2192 F = m \u00d7 a`, `Step 2: Substitute \u2192 F = ${v.m} \u00d7 ${v.a}`, `Step 3: Calculate \u2192 F = ${(v.m*v.a).toFixed(3)} N`, `\u2705 Answer: ${(v.m*v.a).toFixed(3)} Newtons`] })
  },
  {
    id: "ohm", name: "Ohm's Law", subject: "Physics", template: "V = I \u00d7 R",
    description: "Voltage equals current times resistance",
    slots: [
      { id: "I", label: "Current", unit: "A", placeholder: "Enter current (Amps)..." },
      { id: "R", label: "Resistance", unit: "\u03a9", placeholder: "Enter resistance (Ohms)..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.I * v.R).toFixed(3)), unit: "V (Volts)",
      steps: [`Step 1: Write formula \u2192 V = I \u00d7 R`, `Step 2: Substitute \u2192 V = ${v.I} \u00d7 ${v.R}`, `Step 3: Calculate \u2192 V = ${(v.I*v.R).toFixed(3)} V`, `\u2705 Answer: ${(v.I*v.R).toFixed(3)} Volts`] })
  },
  {
    id: "molarity", name: "Molarity", subject: "Chemistry", template: "M = n \u00f7 V",
    description: "Moles of solute per litre of solution",
    slots: [
      { id: "n", label: "Moles", unit: "mol", placeholder: "Enter moles of solute..." },
      { id: "V", label: "Volume", unit: "L", placeholder: "Enter volume in litres..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.n / v.V).toFixed(4)), unit: "mol/L (M)",
      steps: [`Step 1: Write formula \u2192 M = n \u00f7 V`, `Step 2: Substitute \u2192 M = ${v.n} \u00f7 ${v.V}`, `Step 3: Calculate \u2192 M = ${(v.n/v.V).toFixed(4)} mol/L`, `\u2705 Answer: ${(v.n/v.V).toFixed(4)} M`] })
  },
  {
    id: "speed", name: "Speed Formula", subject: "Physics", template: "v = d \u00f7 t",
    description: "Speed equals distance divided by time",
    slots: [
      { id: "d", label: "Distance", unit: "m", placeholder: "Enter distance (metres)..." },
      { id: "t", label: "Time", unit: "s", placeholder: "Enter time (seconds)..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.d / v.t).toFixed(3)), unit: "m/s",
      steps: [`Step 1: Write formula \u2192 v = d \u00f7 t`, `Step 2: Substitute \u2192 v = ${v.d} \u00f7 ${v.t}`, `Step 3: Calculate \u2192 v = ${(v.d/v.t).toFixed(3)} m/s`, `\u2705 Answer: ${(v.d/v.t).toFixed(3)} m/s`] })
  },
  {
    id: "kinetic_energy", name: "Kinetic Energy", subject: "Physics", template: "KE = \u00bdmv\u00b2",
    description: "Energy of a moving object",
    slots: [
      { id: "m", label: "Mass", unit: "kg", placeholder: "Enter mass (kg)..." },
      { id: "v", label: "Velocity", unit: "m/s", placeholder: "Enter velocity (m/s)..." },
    ],
    calculate: (vals) => ({ result: parseFloat((0.5 * vals.m * vals.v * vals.v).toFixed(3)), unit: "J (Joules)",
      steps: [`Step 1: Write formula \u2192 KE = \u00bd \u00d7 m \u00d7 v\u00b2`, `Step 2: Square velocity \u2192 v\u00b2 = ${vals.v}\u00b2 = ${vals.v*vals.v}`, `Step 3: Substitute \u2192 KE = 0.5 \u00d7 ${vals.m} \u00d7 ${vals.v*vals.v}`, `Step 4: Calculate \u2192 KE = ${(0.5*vals.m*vals.v*vals.v).toFixed(3)} J`, `\u2705 Answer: ${(0.5*vals.m*vals.v*vals.v).toFixed(3)} Joules`] })
  },
  {
    id: "pressure", name: "Pressure", subject: "Physics", template: "P = F \u00f7 A",
    description: "Pressure equals force per unit area",
    slots: [
      { id: "F", label: "Force", unit: "N", placeholder: "Enter force (Newtons)..." },
      { id: "A", label: "Area", unit: "m\u00b2", placeholder: "Enter area (m\u00b2)..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.F / v.A).toFixed(3)), unit: "Pa (Pascals)",
      steps: [`Step 1: Write formula \u2192 P = F \u00f7 A`, `Step 2: Substitute \u2192 P = ${v.F} \u00f7 ${v.A}`, `Step 3: Calculate \u2192 P = ${(v.F/v.A).toFixed(3)} Pa`, `\u2705 Answer: ${(v.F/v.A).toFixed(3)} Pascals`] })
  },
  {
    id: "simple_interest", name: "Simple Interest", subject: "Mathematics", template: "SI = PRT \u00f7 100",
    description: "Interest earned on principal amount",
    slots: [
      { id: "P", label: "Principal", unit: "\u20a6", placeholder: "Enter principal amount..." },
      { id: "R", label: "Rate", unit: "%", placeholder: "Enter rate per year..." },
      { id: "T", label: "Time", unit: "yrs", placeholder: "Enter time in years..." },
    ],
    calculate: (v) => ({ result: parseFloat(((v.P * v.R * v.T) / 100).toFixed(2)), unit: "\u20a6 (Naira)",
      steps: [`Step 1: Write formula \u2192 SI = (P \u00d7 R \u00d7 T) \u00f7 100`, `Step 2: Substitute \u2192 SI = (${v.P} \u00d7 ${v.R} \u00d7 ${v.T}) \u00f7 100`, `Step 3: Multiply \u2192 ${v.P*v.R*v.T} \u00f7 100`, `Step 4: Result \u2192 \u20a6${((v.P*v.R*v.T)/100).toFixed(2)}`, `\u2705 Answer: \u20a6${((v.P*v.R*v.T)/100).toFixed(2)}`] })
  },
  {
    id: "density", name: "Density", subject: "Physics/Chemistry", template: "\u03c1 = m \u00f7 V",
    description: "Mass per unit volume",
    slots: [
      { id: "m", label: "Mass", unit: "g", placeholder: "Enter mass (grams)..." },
      { id: "V", label: "Volume", unit: "cm\u00b3", placeholder: "Enter volume (cm\u00b3)..." },
    ],
    calculate: (v) => ({ result: parseFloat((v.m / v.V).toFixed(4)), unit: "g/cm\u00b3",
      steps: [`Step 1: Write formula \u2192 \u03c1 = m \u00f7 V`, `Step 2: Substitute \u2192 \u03c1 = ${v.m} \u00f7 ${v.V}`, `Step 3: Calculate \u2192 \u03c1 = ${(v.m/v.V).toFixed(4)} g/cm\u00b3`, `\u2705 Answer: ${(v.m/v.V).toFixed(4)} g/cm\u00b3`] })
  }
];

export default function FormulaWorkbench() {
  const [selectedFormula, setSelectedFormula] = useState<Formula>(FORMULAS[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [error, setError] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  const subjects = ["All", "Physics", "Chemistry", "Mathematics"];
  const filteredFormulas = filterSubject === "All" ? FORMULAS : FORMULAS.filter(f => f.subject.includes(filterSubject));

  const handleCalculate = () => {
    setError("");
    const vals: Record<string, number> = {};
    for (const slot of selectedFormula.slots) {
      const v = parseFloat(values[slot.id] || "");
      if (isNaN(v)) { setError(`\u26a0\ufe0f Please enter a valid number for "${slot.label}"`); return; }
      if (v === 0 && ["V", "t", "A"].includes(slot.id)) { setError(`\u26a0\ufe0f "${slot.label}" cannot be zero`); return; }
      vals[slot.id] = v;
    }
    try { setResult(selectedFormula.calculate(vals)); } catch { setError("Calculation error. Please check your values."); }
  };

  const handleReset = () => { setValues({}); setResult(null); setError(""); };
  const handleFormulaSelect = (f: Formula) => { setSelectedFormula(f); setValues({}); setResult(null); setError(""); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {subjects.map(s => (
          <button key={s} onClick={() => setFilterSubject(s)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filterSubject === s ? "bg-[#00E676] text-black" : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filteredFormulas.map(f => (
          <button key={f.id} onClick={() => handleFormulaSelect(f)}
            className={`p-3 rounded-xl text-left transition-all border ${selectedFormula.id === f.id ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"}`}>
            <div className="font-mono text-xs font-bold text-[#00E676]">{f.template}</div>
            <div className="text-[11px] font-semibold mt-0.5">{f.name}</div>
            <div className="text-[10px] text-zinc-500">{f.subject}</div>
          </button>
        ))}
      </div>
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/30 rounded-2xl p-5 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl font-mono font-black text-[#00E676] tracking-widest">{selectedFormula.template}</div>
          <div className="text-sm font-bold text-white">{selectedFormula.name}</div>
          <div className="text-xs text-zinc-400">{selectedFormula.description}</div>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-zinc-500 font-semibold">\ud83d\udc47 Fill in the values below:</p>
          {selectedFormula.slots.map(slot => (
            <div key={slot.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 flex flex-col items-center justify-center shrink-0">
                <span className="font-mono font-black text-[#00E676] text-lg">{slot.id}</span>
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-zinc-400 font-semibold block mb-1">{slot.label} <span className="text-zinc-600">({slot.unit})</span></label>
                <input type="number" placeholder={slot.placeholder} value={values[slot.id] || ""}
                  onChange={e => setValues(prev => ({ ...prev, [slot.id]: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>
          ))}
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">{error}</div>}
        <div className="flex gap-2">
          <button onClick={handleCalculate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]">
            \ud83e\uddee Calculate
          </button>
          <button onClick={handleReset} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-bold text-sm active:scale-95 transition-all">
            Reset
          </button>
        </div>
        {result && (
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="text-center">
              <div className="text-4xl font-mono font-black text-[#00E676]">{result.result}</div>
              <div className="text-sm text-zinc-400 mt-1">{result.unit}</div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-400">\ud83d\udcda Step-by-Step Working:</p>
              {result.steps.map((step, i) => (
                <div key={i} className={`text-xs p-2 rounded-lg ${step.startsWith("\u2705") ? "bg-emerald-500/20 text-emerald-300 font-bold" : "bg-white/5 text-zinc-300"}`}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
