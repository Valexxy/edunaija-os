"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GlobalProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress bar on route change
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Global click interceptor on links to trigger instant visual feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchors, and downloads
      if (
        href.startsWith("http") &&
        !href.startsWith(window.location.origin)
      ) {
        return;
      }
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (target.hasAttribute("download") || target.getAttribute("target") === "_blank") {
        return;
      }

      // If clicking the current path without param changes, ignore
      const currentFull = window.location.pathname + window.location.search;
      if (href === currentFull) return;

      // Start loading bar immediately (0ms visual feedback)
      setLoading(true);
      setProgress(25);

      // Increment progress smoothly
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 120);

      // Safety fallback: auto-clear after 6 seconds in case navigation is aborted
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
        setProgress(0);
      }, 6000);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top glowing progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          zIndex: 99999,
          pointerEvents: "none",
          backgroundColor: "rgba(16, 185, 129, 0.15)"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #10B981 0%, #34D399 50%, #F59E0B 100%)",
            boxShadow: "0 0 14px #10B981, 0 0 6px #047857",
            transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            borderRadius: "0 2px 2px 0"
          }}
        />
      </div>

      {/* Floating loading indicator pill */}
      {loading && progress < 100 && (
        <aside
          aria-label="Navigation Loading Indicator"
          style={{
            position: "fixed",
            top: "16px",
            right: "20px",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(11, 21, 16, 0.92)",
            border: "1px solid #10B981",
            borderRadius: "999px",
            padding: "6px 14px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            pointerEvents: "none",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              border: "2px solid rgba(16, 185, 129, 0.3)",
              borderTopColor: "#10B981",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite"
            }}
          />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#F9FAFB", letterSpacing: "0.02em" }}>
            Loading...
          </span>
        </aside>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
