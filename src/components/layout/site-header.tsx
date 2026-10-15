"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { BackButton } from "@/components/navigation/back-button";
import { UserProfileModal } from "@/components/profile/user-profile-modal";
import { MobileDrawerPersonaSwitcher } from "@/components/demo/persona-switcher";
import type { User } from "@supabase/supabase-js";

interface HeaderUserProfile {
  id: string;
  display_name: string;
  role: string;
  is_demo?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  description?: string;
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [user, setUser] = useState<HeaderUserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("learnnaija_session_user");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("learnnaija_session_user");
        if (cached) return JSON.parse(cached).display_name || "";
      } catch {}
    }
    return "";
  });
  const [roleLabel, setRoleLabel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("learnnaija_session_user");
        if (cached) {
          const r = JSON.parse(cached).role;
          return r === "student" ? "Student" : r === "parent" ? "Guardian" : r === "teacher" ? "Teacher" : "Scholar";
        }
      } catch {}
    }
    return "Scholar";
  });
  const [activeLearnerProfile, setActiveLearnerProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [weatherTicker, setWeatherTicker] = useState<{ temp: number; city: string; state?: string; time: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Handle ESC key and click-outside for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMoreMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. Live Weather & WAT Ticker in Navigation Bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Africa/Lagos",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });

      setWeatherTicker((prev) => ({
        temp: prev?.temp || 29,
        city: prev?.city || "Asaba",
        state: prev?.state || "Delta",
        time: `${timeStr} WAT`
      }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    const fetchTickerWeather = (stateName: string) => {
      fetch(`/api/weather?state=${encodeURIComponent(stateName)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.weather) {
            setWeatherTicker((prev) => ({
              temp: data.weather.temperatureC,
              city: data.weather.capital || data.weather.state,
              state: data.weather.state,
              time: prev?.time || "12:00 WAT"
            }));
          }
        })
        .catch(() => {});
    };

    const savedState = typeof window !== "undefined" ? localStorage.getItem("edunaija_user_state") || "Delta" : "Delta";
    fetchTickerWeather(savedState);

    const handleStateChange = (e: Event) => {
      const evt = e as CustomEvent<{ state: string }>;
      if (evt.detail?.state) {
        fetchTickerWeather(evt.detail.state);
      }
    };

    window.addEventListener("edunaija:state_changed", handleStateChange);
    return () => {
      clearInterval(timer);
      window.removeEventListener("edunaija:state_changed", handleStateChange);
    };
  }, []);

  // 2. Auth Session Check & Profile Sync
  useEffect(() => {
    let isSubscribed = true;

    const syncProfile = () => {
      fetch("/api/learner/profile")
        .then((res) => {
          if (!res.ok) {
            if (isSubscribed) {
              setUser(null);
              setDisplayName("");
              setRoleLabel("");
              setActiveLearnerProfile(null);
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("learnnaija_session_user");
              }
            }
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!isSubscribed) return;
          if (!data?.user) {
            setUser(null);
            setDisplayName("");
            setRoleLabel("");
            setActiveLearnerProfile(null);
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("learnnaija_session_user");
            }
            return;
          }
          const profileObj: HeaderUserProfile = {
            id: data.user.id,
            display_name: data.user.display_name || "Scholar",
            role: data.user.role || "student",
            is_demo: Boolean(data.user.is_demo)
          };
          setUser(profileObj);
          setDisplayName(profileObj.display_name);
          setRoleLabel(
            profileObj.role === "student"
              ? "Student"
              : profileObj.role === "parent"
              ? "Guardian"
              : profileObj.role === "teacher"
              ? "Teacher"
              : "Scholar"
          );
          if (data.learnerProfile) {
            setActiveLearnerProfile(data.learnerProfile);
          }
          sessionStorage.setItem("learnnaija_session_user", JSON.stringify(profileObj));
        })
        .catch(() => {});
    };

    // Load cached session first for instantaneous rendering
    const cachedProfile = typeof window !== "undefined" ? sessionStorage.getItem("learnnaija_session_user") : null;
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setUser(parsed);
        setDisplayName(parsed.display_name);
        setRoleLabel(
          parsed.role === "student"
            ? "Student"
            : parsed.role === "parent"
            ? "Guardian"
            : parsed.role === "teacher"
            ? "Teacher"
            : "Scholar"
        );
      } catch {}
    }

    // Always fetch fresh authoritative profile from server (honoring demo persona cookies)
    syncProfile();

    // Listen for cross-component events (persona switches, profile updates)
    window.addEventListener("edunaija:user_changed", syncProfile);
    window.addEventListener("edunaija:persona_switched", syncProfile);

    // If real Supabase auth is configured and NO demo persona is overriding, sync Supabase auth events
    let unsubscribeSupabase = () => {};
    const hasDemoCookie = typeof document !== "undefined" && document.cookie.includes("learnnaija_demo_user_id");
    if (isSupabaseConfigured() && !hasDemoCookie) {
      const supabase = createSupabaseBrowserClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isSubscribed) return;
        if (session?.user) {
          syncProfile();
        }
      });
      unsubscribeSupabase = () => subscription.unsubscribe();
    }

    return () => {
      isSubscribed = false;
      window.removeEventListener("edunaija:user_changed", syncProfile);
      window.removeEventListener("edunaija:persona_switched", syncProfile);
      unsubscribeSupabase();
    };
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("learnnaija_session_user");
      localStorage.removeItem("edunaija_user_state");
      document.cookie = "learnnaija_demo_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.dispatchEvent(new CustomEvent("edunaija:user_changed"));
    }

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => {});
    }

    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}

    setUser(null);
    setDisplayName("");
    setActiveLearnerProfile(null);
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  const isGuardianRole = roleLabel === "Guardian";
  const isTeacherRole = roleLabel === "Teacher";
  const isDemo = Boolean(user && "is_demo" in user && (user as HeaderUserProfile).is_demo);

  const isAuthRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/guardian") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/promotion");

  const hasClientAuthCookie =
    typeof document !== "undefined" &&
    (document.cookie.includes("learnnaija_demo_user_id") ||
      document.cookie.includes("-auth-token") ||
      document.cookie.includes("sb-"));

  const isLikelyAuthenticated = Boolean(user) || isAuthRoute || hasClientAuthCookie;

  const handleExitDemo = () => {
    setIsUserMenuOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("learnnaija_session_user");
      localStorage.removeItem("edunaija_user_state");
      document.cookie = "learnnaija_demo_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.dispatchEvent(new CustomEvent("edunaija:user_changed"));
    }
    setUser(null);
    setDisplayName("");
    setActiveLearnerProfile(null);
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  // Streamlined Primary Navigation (Role-Segregated Core Tasks)
  const primaryNavItems: NavItem[] = isGuardianRole
    ? [
        { href: "/guardian", label: "Ward Overview", icon: "🛡️" },
        { href: "/assessments", label: "Ward CBT Audits", icon: "📋" },
        { href: "/progress", label: "Progress Reports", icon: "📊" },
        { href: "/tutor", label: "Parent Coach", icon: "🍲" }
      ]
    : isTeacherRole
    ? [
        { href: "/teacher", label: "Teacher Cockpit", icon: "👨‍🏫" },
        { href: "/assessments", label: "Item Bank", icon: "📋" },
        { href: "/curriculum", label: "Curriculum Bank", icon: "📚" },
        { href: "/tutor", label: "AI Lesson Prep", icon: "🤖" }
      ]
    : (!user && !isLikelyAuthenticated)
    ? [
        { href: "/curriculum", label: "Curriculum", icon: "📚" },
        { href: "/assessments", label: "CBT Exams", icon: "📝" },
        { href: "/tutor", label: "AI Tutor", icon: "🤖" },
        { href: "/challenges", label: "Challenges", icon: "🏆" }
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/assessments", label: "CBT Exams", icon: "📝" },
        { href: "/tutor", label: "AI Tutor", icon: "🤖" },
        { href: "/challenges", label: "Challenges", icon: "🏆" }
      ];

  const isPrimaryScholar =
    activeLearnerProfile?.education_level === "primary" ||
    (typeof activeLearnerProfile?.class_label === "string" &&
      activeLearnerProfile.class_label.toLowerCase().includes("primary"));

  const isJuniorScholar =
    activeLearnerProfile?.education_level === "junior_secondary" ||
    (typeof activeLearnerProfile?.class_label === "string" &&
      activeLearnerProfile.class_label.toLowerCase().includes("jss"));

  // Secondary Navigation in "Explore ▾" Frosted Dropdown (Strictly Synced with Scholar Tier)
  const secondaryNavItems: NavItem[] = isGuardianRole
    ? [
        { href: "/curriculum", label: "NERDC Syllabus Explorer", icon: "📚", description: "Inspect what your children are taught" },
        { href: "/challenges", label: "National STEM Competitions", icon: "🏆", description: "Spectate ward standings across 36 states" },
        { href: "/pricing", label: "Tuition & Retainers", icon: "💎", description: "Tuition packages & verified tutor escrow" }
      ]
    : isTeacherRole
    ? [
        { href: "/challenges", label: "Inter-School Tournaments", icon: "🏆", description: "Compete against other Nigerian schools" },
        { href: "/pricing", label: "Teacher Plans", icon: "💎", description: "Educator tools and cohort licensing" }
      ]
    : isPrimaryScholar
    ? [
        { href: "/curriculum", label: "NCEE Primary Syllabus", icon: "📚", description: "Official National Common Entrance subjects & topics" },
        { href: "/challenges", label: "Primary Mental Math Derby", icon: "🧮", description: "LGA & State math challenges for primary pupils" },
        { href: "/progress", label: "Pupil Growth & Mistake Vault", icon: "🌱", description: "Foundational numeracy & literacy mastery tracker" },
        { href: "/tutors", label: "TRCN Primary Tutors", icon: "👨‍🏫", description: "Vetted early education mentors & homework guides" },
        { href: "/study-group", label: "Peer Learning Circles", icon: "👥", description: "Collaborative whiteboard co-solving rooms" }
      ]
    : isJuniorScholar
    ? [
        { href: "/curriculum", label: "BECE / Junior WAEC Bank", icon: "📚", description: "Basic Science, Tech, Math & English NERDC syllabi" },
        { href: "/challenges", label: "Junior STEM Tournaments", icon: "⚡", description: "State & national JSS science and robotics challenges" },
        { href: "/progress", label: "Junior Mastery Index", icon: "🎯", description: "BECE diagnostic analytics & misconception autopsy" },
        { href: "/tutors", label: "TRCN Junior Tutors", icon: "👨‍🏫", description: "1-on-1 verified junior secondary mentors" },
        { href: "/study-group", label: "Study Circles", icon: "👥", description: "Synchronized peer co-solving & study groups" }
      ]
    : [
        { href: "/study-group", label: "Study Circles", icon: "👥", description: "Live whiteboard & synchronized peer co-solving" },
        { href: "/curriculum", label: "WAEC / JAMB UTME Syllabus", icon: "📚", description: "Official NERDC, WAEC & JAMB syllabus topics" },
        { href: "/progress", label: "Mistake Vault & UTME Forecast", icon: "🎯", description: "Diagnostic mastery index & predictive cutoff model" },
        { href: "/challenges", label: "National Merit Tournaments", icon: "🏆", description: "All-Nigeria Olympiad and 774 LGA SSS leaderboards" },
        { href: "/tutors", label: "Find Vetted TRCN Tutors", icon: "👨‍🏫", description: "1-on-1 verified subject specialists & discovery calls" },
        { href: "/pricing", label: "Subscription Plans", icon: "💎", description: "Tier subsidies, data grants & premium prep" }
      ];

  // Full Navigation list for the complete mobile drawer
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const isMoreActive = secondaryNavItems.some(
    (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <>
      {/* 🧪 Demo Persona Sandbox Alert Bar */}
      {isDemo && user && (
        <aside
          role="status"
          aria-label="Demo Persona Sandbox Status"
          style={{
            background: "linear-gradient(90deg, #fef3c7 0%, #fffbeb 50%, #fef3c7 100%)",
            borderBottom: "1px solid #fde68a",
            padding: "6px 16px",
            fontSize: "0.8rem",
            color: "#92400e",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            position: "relative",
            zIndex: 110
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.05rem" }}>🧪</span>
            <span>
              <strong>Demo Sandbox Mode:</strong> You are evaluating as <strong>{displayName}</strong> ({roleLabel}). Real data is not modified.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {roleLabel !== "Teacher" ? (
              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("learnnaija_session_user");
                  }
                  await fetch("/api/auth/demo-switch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ personaId: "demo-teacher-007" })
                  });
                  window.location.href = "/teacher";
                }}
                style={{
                  background: "#047857",
                  border: "none",
                  color: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>🧑‍🏫</span>
                <span>Switch to Teacher Demo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("learnnaija_session_user");
                  }
                  await fetch("/api/auth/demo-switch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ personaId: "demo-student-user-001" })
                  });
                  window.location.href = "/dashboard";
                }}
                style={{
                  background: "#0284c7",
                  border: "none",
                  color: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>🎓</span>
                <span>Switch to Student Demo</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExitDemo}
              style={{
                background: "transparent",
                border: "1px solid #d97706",
                color: "#92400e",
                padding: "2px 8px",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              Exit Demo
            </button>
          </div>
        </aside>
      )}

      <header className="site-header">
        <div className="header-inner">
          {/* Left: Brand + Weather Capsule */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Link className="brand" href="/" aria-label="LearnNaija Homepage">
              <span style={{ fontSize: "1.3rem" }}>🇳🇬</span>
              <span>LearnNaija</span>
            </Link>

            {/* Compact Weather Ticker Capsule */}
            {weatherTicker && (
              <div
                className="weather-header-ticker"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: "0.78rem",
                  color: "var(--ink)",
                  fontWeight: 700,
                  boxShadow: "var(--glass-highlight)"
                }}
                title={`Live Weather & WAT: ${weatherTicker.time} in ${weatherTicker.city}`}
              >
                <span style={{ color: "var(--brand)" }}>☀️ {weatherTicker.temp}°C {weatherTicker.city}</span>
              </div>
            )}
          </div>

          {/* Center: Streamlined Desktop Navigation (Core 4 + "More ▾") */}
          <div className="desktop-nav">
            <nav aria-label="Main Navigation">
              <ul className="nav-links">
                {primaryNavItems.map((item) => {
                  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link className={`nav-link ${isActive ? "active" : ""}`} href={item.href}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}

                {/* Sleek "More ▾" Frosted Dropdown */}
                {secondaryNavItems.length > 0 && (
                  <li style={{ position: "relative" }} ref={moreDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      className={`nav-link ${isMoreActive ? "active" : ""}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: isMoreMenuOpen ? "var(--brand-light)" : "transparent",
                        border: isMoreMenuOpen ? "1px solid var(--brand-border)" : "none",
                        cursor: "pointer"
                      }}
                      aria-expanded={isMoreMenuOpen}
                      aria-haspopup="true"
                    >
                      <span>More</span>
                      <span style={{ fontSize: "0.75rem", transition: "transform 0.2s", transform: isMoreMenuOpen ? "rotate(180deg)" : "rotate(0)" }}>
                        ▾
                      </span>
                    </button>

                    {isMoreMenuOpen && (
                      <div
                        className="glass-card"
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          right: 0,
                          minWidth: 260,
                          padding: "8px",
                          borderRadius: 16,
                          boxShadow: "var(--glass-shadow-lg)",
                          border: "1px solid var(--glass-border)",
                          background: "var(--glass-surface-raised)",
                          zIndex: 200,
                          animation: "fadeIn 0.15s ease-out"
                        }}
                      >
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, padding: "6px 10px 4px", textTransform: "uppercase" }}>
                          Additional Tools
                        </div>
                        {secondaryNavItems.map((sec) => {
                          const isSecActive = pathname.startsWith(sec.href);
                          return (
                            <Link
                              key={sec.href}
                              href={sec.href}
                              onClick={() => setIsMoreMenuOpen(false)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 12px",
                                borderRadius: 10,
                                fontSize: "0.86rem",
                                fontWeight: isSecActive ? 700 : 500,
                                color: isSecActive ? "var(--brand)" : "var(--ink)",
                                background: isSecActive ? "var(--brand-light)" : "transparent",
                                textDecoration: "none",
                                transition: "background 0.15s ease"
                              }}
                            >
                              <span style={{ fontSize: "1.1rem" }}>{sec.icon}</span>
                              <div>
                                <div>{sec.label}</div>
                                {sec.description && (
                                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 400 }}>
                                    {sec.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Right: Fast Switcher, Theme & User Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Prominent Exit Demo Button when evaluating in Demo Mode */}
            {isDemo && (
              <button
                type="button"
                onClick={handleExitDemo}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 9999,
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(220, 38, 38, 0.35)",
                  transition: "transform 0.15s ease"
                }}
                title="Exit demo session and return to real login"
              >
                <span style={{ fontSize: "0.95rem" }}>✕</span>
                <span>Exit Demo</span>
              </button>
            )}

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* User Session Badge with Interactive Dropdown on Desktop */}
            {user ? (
              <div className="desktop-user-badge" ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: isDemo
                      ? "rgba(245, 158, 11, 0.12)"
                      : isUserMenuOpen
                      ? "var(--brand-light)"
                      : "var(--glass-surface-sunken)",
                    border: `1px solid ${
                      isDemo ? "#f59e0b" : isUserMenuOpen ? "var(--brand)" : "var(--glass-border)"
                    }`,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: isDemo ? "#92400e" : "var(--ink)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  aria-expanded={isUserMenuOpen}
                  title={isDemo ? "Demo Persona Sandbox Session" : "Verified Account Session"}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: isDemo ? "#f59e0b" : "#10b981",
                      display: "inline-block"
                    }}
                  />
                  <span>
                    {isDemo ? "🧪 " : ""}
                    {displayName?.split(" ")[0] || "Scholar"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      background:
                        roleLabel === "Guardian"
                          ? "rgba(2, 132, 199, 0.15)"
                          : roleLabel === "Teacher"
                          ? "rgba(217, 119, 6, 0.15)"
                          : "var(--brand-light)",
                      color:
                        roleLabel === "Guardian"
                          ? "#0284c7"
                          : roleLabel === "Teacher"
                          ? "#d97706"
                          : "var(--brand)",
                      padding: "1px 6px",
                      borderRadius: 6,
                      fontWeight: 800
                    }}
                  >
                    ({roleLabel})
                  </span>
                  {isDemo ? (
                    <span
                      style={{
                        fontSize: "0.62rem",
                        background: "#fef3c7",
                        color: "#b45309",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontWeight: 800,
                        border: "1px solid #fde68a"
                      }}
                    >
                      DEMO
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.62rem",
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontWeight: 800,
                        border: "1px solid #bbf7d0"
                      }}
                    >
                      REAL
                    </span>
                  )}
                  <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>▾</span>
                </button>

                {/* Interactive Frosted Account Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="glass-card"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 260,
                      background: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 16,
                      padding: "14px",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
                      zIndex: 9999,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10
                    }}
                  >
                    <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {displayName}
                        </div>
                        {isDemo ? (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "2px 6px",
                              borderRadius: 6,
                              border: "1px solid #fde68a",
                              flexShrink: 0
                            }}
                          >
                            🧪 Demo Mode
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 6px",
                              borderRadius: 6,
                              border: "1px solid #bbf7d0",
                              flexShrink: 0
                            }}
                          >
                            🟢 Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 4 }}>
                        {isDemo ? "Simulated Sandbox" : "Sovereign Account"} &bull; {roleLabel}{" "}
                        {roleLabel === "Student" && activeLearnerProfile?.class_label ? `(${activeLearnerProfile.class_label})` : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%", justifyContent: "flex-start", gap: 8, fontSize: "0.8rem", padding: "7px 10px" }}
                    >
                      🪪 View Sovereign Profile &amp; ID
                    </button>

                    {roleLabel === "Student" && (
                      <Link
                        href="/promotion"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="btn btn-outline btn-sm"
                        style={{ width: "100%", justifyContent: "flex-start", gap: 8, fontSize: "0.8rem", padding: "7px 10px" }}
                      >
                        🎓 Change Class / Promotion
                      </Link>
                    )}

                    {isDemo && (
                      <Link
                        href="/signup"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          padding: "7px 10px",
                          fontWeight: 700
                        }}
                      >
                        ✨ Create Real Account
                      </Link>
                    )}

                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                      <button
                        type="button"
                        onClick={isDemo ? handleExitDemo : handleSignOut}
                        className="btn btn-sm"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          background: isDemo ? "#fef3c7" : "#fee2e2",
                          color: isDemo ? "#92400e" : "#b91c1c",
                          border: `1px solid ${isDemo ? "#fde68a" : "#f87171"}`,
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          padding: "7px 10px",
                          cursor: "pointer"
                        }}
                      >
                        {isDemo ? "🧪 Exit Demo Sandbox" : "🚪 Sign Out / Log Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isLikelyAuthenticated ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "var(--glass-surface-sunken)",
                  border: "1px solid var(--glass-border)",
                  fontSize: "0.78rem",
                  color: "var(--muted)"
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", display: "inline-block" }} />
                <span>Scholar Session</span>
              </div>
            ) : (
              <div className="desktop-guest-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link
                  href="/login"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontWeight: 700,
                    padding: "5px 12px",
                    fontSize: "0.82rem",
                    borderRadius: 9999,
                    textDecoration: "none"
                  }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary btn-sm"
                  style={{
                    fontWeight: 700,
                    padding: "5px 14px",
                    fontSize: "0.82rem",
                    borderRadius: 9999,
                    textDecoration: "none"
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span>{isMobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Complete Mobile Drawer: Everything accessible with zero cutoffs */}
      {isMobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="mobile-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Drawer Top Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.2rem" }}>🇳🇬</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--brand)" }}>LearnNaija</strong>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.3rem",
                  color: "var(--ink)",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* User Profile Card */}
            {user ? (
              <div
                style={{
                  padding: "14px 20px",
                  background: "var(--surface-sunken)",
                  borderBottom: "1px solid var(--line)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--brand-light)",
                      border: "2px solid var(--brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem"
                    }}
                  >
                    🎓
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{displayName || "Scholar"}</span>
                      {isDemo ? (
                        <span style={{ fontSize: "0.62rem", background: "#fef3c7", color: "#b45309", padding: "1px 5px", borderRadius: 4, fontWeight: 800, border: "1px solid #fde68a" }}>
                          DEMO
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.62rem", background: "#dcfce7", color: "#15803d", padding: "1px 5px", borderRadius: 4, fontWeight: 800, border: "1px solid #bbf7d0" }}>
                          REAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isDemo ? "#f59e0b" : "#10b981", display: "inline-block" }} />
                      {isDemo ? "Demo Sandbox" : "Verified"} &bull; {roleLabel} &bull; {activeLearnerProfile?.state_name || "Delta"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", gap: 8 }}>
                <Link href="/login" className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: "center" }}>
                  Log In
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: "center" }}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Quick 1-Click Demo Persona Switcher (Teacher, Parent, Student) */}
            <MobileDrawerPersonaSwitcher onClose={() => setIsMobileMenuOpen(false)} />

            {/* Categorized Full Navigation List (Nothing Hidden!) */}
            <div style={{ padding: "14px 16px", flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", padding: "4px 6px 8px" }}>
                All Platform Modules
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {allNavItems.map((item) => {
                  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontSize: "0.92rem",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "var(--brand)" : "var(--ink)",
                        background: isActive ? "var(--brand-light)" : "transparent",
                        border: isActive ? "1px solid var(--brand-border)" : "1px solid transparent",
                        textDecoration: "none"
                      }}
                    >
                      <span style={{ fontSize: "1.15rem" }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Demo Mode Action in Mobile Menu */}
              {isDemo && (
                <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--line)", padding: "0 6px" }}>
                  <button
                    type="button"
                    onClick={handleExitDemo}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: 12,
                      fontSize: "0.88rem",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    <span>✕</span>
                    <span>Exit Demo Session</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--line)",
                background: "var(--surface)",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              {user && (
                <button
                  type="button"
                  onClick={isDemo ? handleExitDemo : handleSignOut}
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    color: isDemo ? "#92400e" : "#dc2626",
                    background: isDemo ? "#fef3c7" : undefined,
                    border: isDemo ? "1px solid #fde68a" : undefined
                  }}
                >
                  {isDemo ? "🧪 Exit Demo Sandbox" : "🚪 Sign Out / Log Out"}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Native Mobile Glass Bottom Dock: 1-Tap Thumb Navigation */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Bottom Navigation">
        {/* Item 1: Home Command Center */}
        <Link
          href={isGuardianRole ? "/guardian" : isTeacherRole ? "/teacher" : "/dashboard"}
          className={`dock-item ${
            pathname === (isGuardianRole ? "/guardian" : isTeacherRole ? "/teacher" : "/dashboard") ? "active" : ""
          }`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "4px 6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color:
              pathname === (isGuardianRole ? "/guardian" : isTeacherRole ? "/teacher" : "/dashboard")
                ? "var(--brand)"
                : "var(--muted)",
            textDecoration: "none",
            touchAction: "manipulation"
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{isGuardianRole ? "🛡️" : isTeacherRole ? "🧑‍🏫" : "📊"}</span>
          <span>{isGuardianRole ? "Ward" : isTeacherRole ? "Cockpit" : "Home"}</span>
        </Link>

        {/* Item 2: Assessment / Item Bank / CBT */}
        <Link
          href="/assessments"
          className={`dock-item ${pathname.startsWith("/assessments") ? "active" : ""}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "4px 6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: pathname.startsWith("/assessments") ? "var(--brand)" : "var(--muted)",
            textDecoration: "none",
            touchAction: "manipulation"
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{isGuardianRole ? "📋" : isTeacherRole ? "📋" : "📝"}</span>
          <span>{isGuardianRole ? "Audits" : isTeacherRole ? "Bank" : "Exams"}</span>
        </Link>

        {/* Item 3: Progress / Syllabus / AI Tutor */}
        <Link
          href={isGuardianRole ? "/progress" : isTeacherRole ? "/curriculum" : "/tutor"}
          className={`dock-item ${
            pathname.startsWith(isGuardianRole ? "/progress" : isTeacherRole ? "/curriculum" : "/tutor") ? "active" : ""
          }`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "4px 6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color:
              pathname.startsWith(isGuardianRole ? "/progress" : isTeacherRole ? "/curriculum" : "/tutor")
                ? "var(--brand)"
                : "var(--muted)",
            textDecoration: "none",
            touchAction: "manipulation"
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{isGuardianRole ? "📊" : isTeacherRole ? "📚" : "🤖"}</span>
          <span>{isGuardianRole ? "Progress" : isTeacherRole ? "Syllabus" : "AI Tutor"}</span>
        </Link>

        {/* Item 4: Parent Coach / Lesson Prep / Challenges */}
        <Link
          href={isGuardianRole ? "/tutor" : isTeacherRole ? "/tutor" : "/challenges"}
          className={`dock-item ${
            pathname.startsWith(isGuardianRole ? "/tutor" : isTeacherRole ? "/tutor" : "/challenges") ? "active" : ""
          }`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "4px 6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color:
              pathname.startsWith(isGuardianRole ? "/tutor" : isTeacherRole ? "/tutor" : "/challenges")
                ? "var(--brand)"
                : "var(--muted)",
            textDecoration: "none",
            touchAction: "manipulation"
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{isGuardianRole ? "🍲" : isTeacherRole ? "🤖" : "🏆"}</span>
          <span>{isGuardianRole ? "Coach" : isTeacherRole ? "Prep" : "Arena"}</span>
        </Link>

        {/* Item 5: Thumb-Accessible Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`dock-item ${isMobileMenuOpen ? "active" : ""}`}
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "4px 6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: isMobileMenuOpen ? "var(--brand)" : "var(--muted)",
            cursor: "pointer",
            touchAction: "manipulation"
          }}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open full navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span style={{ fontSize: "1.15rem" }}>{isMobileMenuOpen ? "✕" : "☰"}</span>
          <span>{isMobileMenuOpen ? "Close" : "Menu"}</span>
        </button>
      </nav>

      {/* Full Sovereign Nigerian Learner Profile & ID Card Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={
          user
            ? {
                id: user.id,
                display_name: displayName,
                role: roleLabel.toLowerCase(),
                email: "email" in user ? (user.email as string) : undefined
              }
            : null
        }
        learnerProfile={activeLearnerProfile}
      />
    </>
  );
}

export default SiteHeader;
