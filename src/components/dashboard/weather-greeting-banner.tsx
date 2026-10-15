"use client";

import { useEffect, useState, useCallback } from "react";
import type { WeatherReport } from "@/lib/weather/engine";
import { NIGERIAN_STATE_COORDINATES } from "@/lib/weather/engine";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

function getLagosHour(): number {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Lagos", hour: "numeric", hour12: false }).format(new Date());
    const parsed = parseInt(formatted, 10);
    return isNaN(parsed) ? new Date().getHours() : parsed;
  } catch {
    return new Date().getHours();
  }
}

function getInstantWeatherFallback(stateName: string = "Anambra"): WeatherReport {
  const geo = NIGERIAN_STATE_COORDINATES[stateName] || NIGERIAN_STATE_COORDINATES["Anambra"];
  const lagosHour = getLagosHour();
  const timeOfDay = lagosHour >= 5 && lagosHour < 12 ? "morning" : lagosHour >= 17 || lagosHour < 5 ? "evening" : "afternoon";
  return {
    state: geo.state,
    capital: geo.capital,
    temperatureC: 29,
    condition: "Warm Tropical Breeze",
    icon: "🌤️",
    humidity: 68,
    windSpeedKmH: 11,
    isHarmattan: false,
    studyTip: "Stay focused on your exam goals today!",
    greetingText: timeOfDay === "morning" ? "Good morning, Scholar!" : timeOfDay === "afternoon" ? "Good afternoon, Scholar!" : "Good evening, Scholar!",
    nativeGreeting: geo.nativeGreeting[timeOfDay]
  };
}

interface Props {
  initialState?: string;
  userName?: string;
  classLabel?: string;
  examGoal?: string;
}

export function WeatherGreetingBanner({
  initialState = "Anambra",
  userName = "Scholar",
  classLabel = "SSS 3",
  examGoal = "Statutory Exam Cycle"
}: Props) {
  // Never start null: instantaneous fallback for immediate render with zero layout shift
  const [weather, setWeather] = useState<WeatherReport>(() => getInstantWeatherFallback(initialState));
  const [currentTime, setCurrentTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date()) + " WAT";
    } catch {
      return "12:00:00 WAT";
    }
  });
  const [activeState, setActiveState] = useState<string>(initialState || "Anambra");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);

  // Fetch live weather for a specific Nigerian state
  const fetchWeatherForState = useCallback(async (stateName: string) => {
    try {
      const res = await fetch(`/api/weather?state=${encodeURIComponent(stateName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.weather) {
          setWeather(data.weather);
        }
      }
    } catch {
      // Fallback already pre-seeded
    }
  }, []);

  // Request live geolocation from browser to guarantee 100% location accuracy
  const requestLiveLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Send GPS coordinates to weather API which resolves to the closest Nigerian state
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.weather) {
              const detectedState = data.state || data.weather.state;
              setActiveState(detectedState);
              setWeather(data.weather);
              setLocationVerified(true);
              localStorage.setItem("edunaija_user_state", detectedState);

              // Broadcast location change to site header and all components
              window.dispatchEvent(
                new CustomEvent("edunaija:state_changed", {
                  detail: { state: detectedState, weather: data.weather }
                })
              );

              // Persist detected state to learner profile database/session
              fetch("/api/learner/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state_name: detectedState })
              }).catch(() => {});
            }
          }
        } catch {
          // Geolocation resolution error
        } finally {
          setIsGpsLoading(false);
        }
      },
      (_err) => {
        setIsGpsLoading(false);
        // Cleanse any stale Bauchi entry from localStorage
        const cached = localStorage.getItem("edunaija_user_state");
        const safeState = (cached && cached !== "Bauchi") ? cached : (initialState || "Anambra");
        setActiveState(safeState);
        fetchWeatherForState(safeState);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [fetchWeatherForState, initialState]);

  // 1. Live per-second clock (WAT - West Africa Time GMT+1)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Africa/Lagos",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setCurrentTime(`${timeStr} WAT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Automatically sync with verified initialState and purge stale "Bauchi"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edunaija_user_state");
      // Explicitly purge stale Bauchi state from legacy sessions
      if (saved === "Bauchi") {
        localStorage.removeItem("edunaija_user_state");
      }
    }

    const saved = typeof window !== "undefined" ? localStorage.getItem("edunaija_user_state") : null;
    const targetState = (saved && saved !== "Bauchi") ? saved : (initialState || "Anambra");

    setActiveState(targetState);
    setWeather(getInstantWeatherFallback(targetState));
    fetchWeatherForState(targetState);

    // Request browser live GPS location for 100% precision
    requestLiveLocation();
  }, [fetchWeatherForState, initialState, requestLiveLocation]);

  // Handle manual state change from dropdown
  const handleStateChange = (newState: string) => {
    setActiveState(newState);
    setLocationVerified(false);
    localStorage.setItem("edunaija_user_state", newState);
    setWeather(getInstantWeatherFallback(newState));
    fetchWeatherForState(newState);

    window.dispatchEvent(
      new CustomEvent("edunaija:state_changed", {
        detail: { state: newState }
      })
    );

    fetch("/api/learner/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state_name: newState })
    }).catch(() => {});
  };

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 24,
        background: "linear-gradient(135deg, rgba(13, 59, 37, 0.92) 0%, rgba(6, 78, 59, 0.88) 60%, rgba(4, 47, 46, 0.92) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.18)",
        boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 16px 36px -6px rgba(6, 78, 59, 0.35)",
        borderRadius: 22,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(163, 230, 53, 0.25) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        {/* Left: Dynamic Cultural Greeting, Live Time & Location Controls */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                fontWeight: 800,
                letterSpacing: "0.03em",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ⏱️ {currentTime || "Live Clock Loading..."}
            </span>

            {weather?.nativeGreeting && (
              <span
                style={{
                  background: "rgba(163, 230, 53, 0.2)",
                  color: "#bef264",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 700
                }}
              >
                🇳🇬 {weather.nativeGreeting}
              </span>
            )}

            {/* Location Verification Status Indicator */}
            {locationVerified ? (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  padding: "3px 8px",
                  borderRadius: 12,
                  fontSize: "0.72rem",
                  fontWeight: 600
                }}
              >
                ✓ GPS Verified
              </span>
            ) : isGpsLoading ? (
              <span
                style={{
                  background: "rgba(234, 179, 8, 0.2)",
                  color: "#fde047",
                  padding: "3px 8px",
                  borderRadius: 12,
                  fontSize: "0.72rem",
                  fontWeight: 600
                }}
              >
                📡 Detecting Location...
              </span>
            ) : null}
          </div>

          <h2 style={{ fontSize: "1.65rem", margin: "4px 0 6px", color: "#ffffff", letterSpacing: "-0.02em" }}>
            {weather ? weather.greetingText.replace("Scholar", userName) : `Welcome, ${userName}!`}
          </h2>

          <p style={{ margin: "4px 0 14px", color: "rgba(255, 255, 255, 0.85)", fontSize: "0.95rem", lineHeight: 1.5 }}>
            🎯 <strong>Scholar Mission:</strong> You are training for <strong>{examGoal}</strong> in <strong>{classLabel}</strong>. {weather?.studyTip}
          </p>

          {/* Real-time State Location Selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

            {/* Quick State Selector Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <label htmlFor="banner-state-select" style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.75)" }}>
                State:
              </label>
              <select
                id="banner-state-select"
                value={activeState}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "#bef264",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} style={{ background: "#064e3b", color: "#ffffff" }}>
                    {s} State
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Satellite Weather Badge */}
        {weather && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 14,
              padding: "16px 20px",
              minWidth: 230,
              textAlign: "right"
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: "1.8rem" }}>{weather.icon}</span>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "#bef264" }}>
                {weather.temperatureC}°C
              </span>
            </div>

            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ffffff" }}>
              {weather.condition}
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.86rem", color: "rgba(255, 255, 255, 0.95)", marginTop: 4, fontWeight: 700 }}>
              <span>📍</span> <span>{weather.capital}, {weather.state} State</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.7)", marginTop: 8 }}>
              <span>💧 {weather.humidity}% Hum.</span>
              <span>💨 {weather.windSpeedKmH} km/h</span>
            </div>

            <button
              onClick={requestLiveLocation}
              disabled={isGpsLoading}
              style={{
                background: "transparent",
                border: "none",
                color: "#a3e635",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "6px 0 0",
                textDecoration: "underline",
                display: "inline-block"
              }}
            >
              {isGpsLoading ? "📡 Detecting GPS..." : "📍 Re-ask GPS Location"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
