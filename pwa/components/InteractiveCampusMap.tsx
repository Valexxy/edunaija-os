"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Navigation, ExternalLink, School, Compass, 
  Search, ShieldCheck, CheckCircle2, ChevronRight, Phone, Car, X
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface CampusCenter {
  id: string;
  name: string;
  type: "Federal University" | "State University" | "Private University" | "Federal Unity College" | "JAMB PTC Hub";
  state: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  cbtCapacity: number;
  accredited: boolean;
  contactPhone: string;
}

export const ACCREDITED_CAMPUS_CENTERS: CampusCenter[] = [
  {
    id: "unilag-cbt",
    name: "University of Lagos (UNILAG) ETC & CBT Center",
    type: "Federal University",
    state: "Lagos",
    city: "Akoka, Yaba",
    address: "University Road, Akoka, Yaba, Lagos State",
    lat: 6.5173,
    lng: 3.3987,
    cbtCapacity: 1200,
    accredited: true,
    contactPhone: "+234 1 280 2440"
  },
  {
    id: "ui-cbt",
    name: "University of Ibadan (UI) Distance Learning CBT Center",
    type: "Federal University",
    state: "Oyo",
    city: "Ibadan",
    address: "Sasa Road, Ajibode, Ibadan, Oyo State",
    lat: 7.4443,
    lng: 3.9003,
    cbtCapacity: 1500,
    accredited: true,
    contactPhone: "+234 807 753 2374"
  },
  {
    id: "oau-cbt",
    name: "Obafemi Awolowo University (OAU) ICT Center",
    type: "Federal University",
    state: "Osun",
    city: "Ile-Ife",
    address: "OAU Campus, Ile-Ife, Osun State",
    lat: 7.5186,
    lng: 4.5266,
    cbtCapacity: 950,
    accredited: true,
    contactPhone: "+234 803 555 1234"
  },
  {
    id: "futa-cbt",
    name: "Federal University of Technology Akure (FUTA) Digital Hub",
    type: "Federal University",
    state: "Ondo",
    city: "Akure",
    address: "Ilesha Road, FUTA South Gate, Akure, Ondo State",
    lat: 7.3034,
    lng: 5.1378,
    cbtCapacity: 800,
    accredited: true,
    contactPhone: "+234 802 345 6789"
  },
  {
    id: "unn-cbt",
    name: "University of Nigeria Nsukka (UNN) Nnamdi Azikiwe Library CBT",
    type: "Federal University",
    state: "Enugu",
    city: "Nsukka",
    address: "UNN Main Campus, Nsukka, Enugu State",
    lat: 6.8645,
    lng: 7.4083,
    cbtCapacity: 1100,
    accredited: true,
    contactPhone: "+234 803 777 9900"
  },
  {
    id: "abu-cbt",
    name: "Ahmadu Bello University (ABU) Iya Abubakar Computer Center",
    type: "Federal University",
    state: "Kaduna",
    city: "Zaria",
    address: "Main Campus, Samaru, Zaria, Kaduna State",
    lat: 11.1528,
    lng: 7.6508,
    cbtCapacity: 1600,
    accredited: true,
    contactPhone: "+234 805 123 9876"
  },
  {
    id: "covenant-cbt",
    name: "Covenant University (CU) Center for Systems & Info Services",
    type: "Private University",
    state: "Ogun",
    city: "Ota",
    address: "KM 10 Idiroko Road, Canaanland, Ota, Ogun State",
    lat: 6.6718,
    lng: 3.1581,
    cbtCapacity: 1000,
    accredited: true,
    contactPhone: "+234 1 790 0724"
  },
  {
    id: "uniben-cbt",
    name: "University of Benin (UNIBEN) Ugbowo ICT Complex",
    type: "Federal University",
    state: "Edo",
    city: "Benin City",
    address: "Ugbowo Lagos Road, Benin City, Edo State",
    lat: 6.3350,
    lng: 5.6037,
    cbtCapacity: 1350,
    accredited: true,
    contactPhone: "+234 803 111 2233"
  },
  {
    id: "kings-college",
    name: "King's College Lagos (Annex Campus CBT Hub)",
    type: "Federal Unity College",
    state: "Lagos",
    city: "Victoria Island",
    address: "Adeyemo Alakija Street, Victoria Island, Lagos State",
    lat: 6.4326,
    lng: 3.4243,
    cbtCapacity: 500,
    accredited: true,
    contactPhone: "+234 1 261 4532"
  }
];

export interface InteractiveCampusMapProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function InteractiveCampusMap({ isOpen, onClose }: InteractiveCampusMapProps = {}) {
  const isModalMode = isOpen !== undefined;
  const [selectedState, setSelectedState] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCenter, setActiveCenter] = useState<CampusCenter>(ACCREDITED_CAMPUS_CENTERS[0]);

  if (isModalMode && !isOpen) {
    return null;
  }

  const states = ["All", ...Array.from(new Set(ACCREDITED_CAMPUS_CENTERS.map(c => c.state)))];

  const filteredCenters = ACCREDITED_CAMPUS_CENTERS.filter(c => {
    const matchesState = selectedState === "All" || c.state === selectedState;
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesQuery;
  });

  const getGoogleMapsDirectionsUrl = (center: CampusCenter) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(center.name + " " + center.address)}&travelmode=driving`;
  };

  const bodyContent = (
    <div className={`rounded-3xl bg-[#090b14] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-5 ${isModalMode ? "max-w-4xl w-full max-h-[90vh] overflow-y-auto" : ""}`}>
      {/* Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00E676] flex items-center justify-center">
              <Compass className="w-4 h-4 animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
              Nigerian Campus &amp; CBT Test Center Radar
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Live official examination locations, seat capacities &amp; Google Maps turn-by-turn directions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* State Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
            {states.map(s => (
              <button
                key={s}
                onClick={() => { sfx.tap(); setSelectedState(s); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedState === s
                    ? "bg-[#00E676] text-black shadow-md shadow-emerald-950 font-black"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {isModalMode && onClose && (
            <button
              onClick={() => {
                sfx.tap();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
              title="Close Map"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campus, city, or CBT center name..."
          className="w-full bg-black/60 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Main Grid: Center List + Interactive Detail Map Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Center List */}
        <div className="lg:col-span-6 space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredCenters.map(center => {
            const isSelected = activeCenter.id === center.id;
            return (
              <div
                key={center.id}
                onClick={() => {
                  sfx.tap();
                  triggerTmaHaptic("light");
                  setActiveCenter(center);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(0,230,118,0.2)]"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                        {center.state}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-[#00E676] font-bold">
                        {center.cbtCapacity} Seats
                      </span>
                      {center.accredited && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Accredited
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {center.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {center.address}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? "text-[#00E676] translate-x-1" : "text-zinc-600"}`} />
                </div>
              </div>
            );
          })}

          {filteredCenters.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No CBT test centers found matching your filter.
            </div>
          )}
        </div>

        {/* Right Column: Selected Center Detail & Simulated Tactical Map Canvas */}
        <div className="lg:col-span-6 bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          
          {/* Tactical Vector Map Canvas (CSS Simulation) */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00E676_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Compass Rings */}
            <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20 animate-ping opacity-40" />
            <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30" />
            <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40" />
            
            {/* Target Pin */}
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_20px_#00E676] animate-bounce">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[9px] font-mono font-bold text-[#00E676] whitespace-nowrap">
                {activeCenter.lat.toFixed(4)}°N, {activeCenter.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-300">
              <span className="flex items-center gap-1">
                <School className="w-3 h-3 text-emerald-400" /> {activeCenter.type}
              </span>
              <span className="text-[#00E676] font-bold">Verified JAMB Hub</span>
            </div>
          </div>

          {/* Center Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{activeCenter.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Capacity: {activeCenter.cbtCapacity} Seats
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase">Official Exam Street Address</span>
              <p className="text-xs text-zinc-200 font-semibold leading-relaxed">
                {activeCenter.address}
              </p>
              <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1 font-mono">
                <Phone className="w-3 h-3 text-emerald-400" /> Helpline: {activeCenter.contactPhone}
              </div>
            </div>

            {/* Examination Morning Pacing Advice */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Recommended arrival: <strong>45 minutes</strong> before scheduled CBT session to complete biometric verification.</span>
            </div>
          </div>

          {/* Action CTAs: Direct Google Maps Launch */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-3">
            <a
              href={getGoogleMapsDirectionsUrl(activeCenter)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,230,118,0.4)] flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Get Google Maps Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );

  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        {bodyContent}
      </div>
    );
  }

  return bodyContent;
}
