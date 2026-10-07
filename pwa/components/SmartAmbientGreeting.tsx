"use client";

import { useState, useEffect } from "react";
import { 
  CloudSun, MapPin, Sparkles, Clock, Compass, Thermometer, 
  Sun, CloudRain, ShieldCheck, Navigation, RefreshCw, Edit3, X, Check
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface SmartAmbientGreetingProps {
  user: any;
}

export default function SmartAmbientGreeting({ user }: SmartAmbientGreetingProps) {
  const [context, setContext] = useState<any>({
    greeting_english: "Good afternoon, Scholar!",
    greeting_indigenous: "Ehihie oma nnoo! • Ẹ kú ọ̀sán • Barka da rana",
    wat_time: "15:52 WAT",
    location: {
      state: "Anambra",
      lga: "Ogbaru",
      area: "Atani / Oshita",
      display: "Oshita, Ogbaru, Anambra",
      geopolitical_zone: "South East"
    },
    weather: {
      temperature_celsius: 30.4,
      humidity_percent: 68,
      condition: "Partly Cloudy ⛅",
      focus_advisory: "Comfortable ambient temperature — optimal conditions for STEM problem-solving!"
    },
    cognitive_recommendation: "Your brain is primed for high-cognition subjects: Mathematics & Physics."
  });

  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [manualState, setManualState] = useState<string>("Anambra");
  const [manualLga, setManualLga] = useState<string>("Ogbaru");
  const [manualArea, setManualArea] = useState<string>("Oshita");

  const scholarName = (user?.full_name || user?.fullName || "Scholar").split(" ")[0];

  const fetchContext = async (lat?: number, lng?: number, overrideState?: string, overrideLga?: string, overrideArea?: string) => {
    try {
      let queryUrl = `/api/backend/smart/context?scholar_name=${encodeURIComponent(scholarName)}`;
      
      const st = overrideState || (typeof window !== "undefined" ? localStorage.getItem("edunaija_user_state") : null) || user?.state || "Anambra";
      const lg = overrideLga || (typeof window !== "undefined" ? localStorage.getItem("edunaija_user_lga") : null) || "Ogbaru";
      const ar = overrideArea || (typeof window !== "undefined" ? localStorage.getItem("edunaija_user_area") : null) || "";

      if (lat !== undefined && lng !== undefined) {
        queryUrl += `&lat=${lat}&lng=${lng}`;
      } else {
        queryUrl += `&state=${encodeURIComponent(st)}&lga=${encodeURIComponent(lg)}`;
        if (ar) queryUrl += `&area=${encodeURIComponent(ar)}`;
      }

      const res = await fetch(queryUrl);
      if (res.ok) {
        const data = await res.json();
        setContext(data);
      }
    } catch (err) {
      console.warn("Could not fetch ambient context:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("edunaija_user_state") || "Anambra";
      const savedLga = localStorage.getItem("edunaija_user_lga") || "Ogbaru";
      const savedArea = localStorage.getItem("edunaija_user_area") || "Oshita";
      setManualState(savedState);
      setManualLga(savedLga);
      setManualArea(savedArea);

      // Prioritize saved accurate Anambra location
      fetchContext(undefined, undefined, savedState, savedLga, savedArea);

      // HTML5 Geolocation check
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Only override if user hasn't explicitly set their location
            if (!localStorage.getItem("edunaija_user_state_manual")) {
              fetchContext(pos.coords.latitude, pos.coords.longitude);
            }
          },
          () => {},
          { timeout: 4000 }
        );
      }
    }
  }, [scholarName]);

  const handleSaveManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_user_state", manualState);
      localStorage.setItem("edunaija_user_lga", manualLga);
      localStorage.setItem("edunaija_user_area", manualArea);
      localStorage.setItem("edunaija_user_state_manual", "true");
    }
    fetchContext(undefined, undefined, manualState, manualLga, manualArea);
    setIsLocationModalOpen(false);
  };

  const handleTriggerGps = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    setGeoLocating(true);
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLocating(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("edunaija_user_state_manual");
          }
          fetchContext(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setGeoLocating(false);
          // Fallback to exact Ogbaru GPS coordinates
          fetchContext(6.049, 6.749);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGeoLocating(false);
      fetchContext(6.049, 6.749);
    }
  };

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#070e1c] via-[#09152b] to-[#040810] p-4 sm:p-6 text-white shadow-xl space-y-3 sm:space-y-4">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Strip: Time, Live Weather, and Real-Time Location Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Weather Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono shadow-sm">
              <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-white">{context.weather?.temperature_celsius ?? 30.4}°C</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 truncate max-w-[140px] sm:max-w-none">{context.weather?.condition ?? "Partly Cloudy ⛅"}</span>
            </div>

            {/* Real-Time Location Hub (LGA, Area & State) */}
            <button
              onClick={() => {
                sfx.tap();
                setIsLocationModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 shadow-sm hover:bg-emerald-500/20 transition-all cursor-pointer group"
              title="Click to calibrate your exact State, LGA and Area"
            >
              <MapPin className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${geoLocating ? "animate-spin" : ""}`} />
              <span className="font-bold truncate max-w-[200px] sm:max-w-none">
                {context.location?.display || `${context.location?.lga || "Ogbaru"}, ${context.location?.state || "Anambra"}`}
              </span>
              <Edit3 className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300 transition-colors ml-0.5" />
            </button>
          </div>

          {/* Live WAT Clock Pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-[#00E676] animate-pulse shrink-0" />
            <span className="text-white font-bold">{context.wat_time}</span>
            <span className="text-[10px] bg-emerald-500/20 text-[#00E676] px-1.5 py-0.5 rounded font-mono font-bold">
              WAT
            </span>
          </div>
        </div>

        {/* Main Greeting & Cognitive Advisory */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white tracking-tight">
              {context.greeting_english}
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 italic">
              ({context.greeting_indigenous})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            {context.weather?.focus_advisory} {context.cognitive_recommendation}
          </p>
        </div>
      </div>

      {/* Location Calibration Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Calibrate Exact Location</h3>
                <p className="text-xs text-zinc-400">Ensures accurate LGA weather, indigenous greetings & LGA ranks</p>
              </div>
            </div>

            <form onSubmit={handleSaveManualLocation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">State</label>
                <input
                  type="text"
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  placeholder="e.g. Anambra"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Local Government Area (LGA)</label>
                <input
                  type="text"
                  value={manualLga}
                  onChange={(e) => setManualLga(e.target.value)}
                  placeholder="e.g. Ogbaru, Onitsha North, Awka South"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Town / Area (Optional)</label>
                <input
                  type="text"
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                  placeholder="e.g. Oshita, Atani, Okpoko, Fegge"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerGps}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Detect GPS</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
