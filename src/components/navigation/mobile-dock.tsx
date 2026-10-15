"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomDock() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    // Check cached session user role
    const cached = typeof window !== "undefined" ? sessionStorage.getItem("learnnaija_session_user") : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.role) setUserRole(parsed.role);
      } catch {}
    }

    // Also sync with server learner profile
    fetch("/api/learner/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  // Hide dock during active proctored exams to prevent student distraction
  if (pathname?.startsWith("/assessments/") && pathname !== "/assessments") {
    return null;
  }

  // Role-appropriate dock navigation items (no role leakage)
  let items = [
    { label: "Hub", href: "/dashboard", icon: "🏠" },
    { label: "CBT Tests", href: "/assessments", icon: "📝" },
    { label: "AI Tutor", href: "/tutor", icon: "🤖" },
    { label: "Analytics", href: "/progress", icon: "📊" },
    { label: "Challenges", href: "/challenges", icon: "🏆" }
  ];

  if (userRole === "teacher") {
    items = [
      { label: "Cockpit", href: "/teacher", icon: "🏛️" },
      { label: "Curriculum", href: "/curriculum", icon: "📚" },
      { label: "Challenges", href: "/challenges", icon: "🏆" },
      { label: "Lesson Prep", href: "/tutor", icon: "🤖" },
      { label: "Plans", href: "/pricing", icon: "💳" }
    ];
  } else if (userRole === "parent") {
    items = [
      { label: "Ward Hub", href: "/guardian", icon: "👨‍👩‍👧" },
      { label: "Analytics", href: "/progress", icon: "📊" },
      { label: "Tutors", href: "/tutors", icon: "🧑‍🏫" },
      { label: "Plans", href: "/pricing", icon: "💳" },
      { label: "Account", href: "/dashboard", icon: "🏠" }
    ];
  }

  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dock-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="dock-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomDock;

