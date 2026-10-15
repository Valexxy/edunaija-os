"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // 1. Service Worker: Register in browser environment
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production" || window.location.hostname === "localhost") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      }
    }

    // 2. Check if already running as standalone PWA
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
      }

      // Check iOS user agent
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isAppleDevice);

      if (isAppleDevice && !isStandalone) {
        const dismissed = localStorage.getItem("learnnaija_ios_pwa_dismissed");
        if (!dismissed) {
          setShowIosTip(true);
        }
      }
    }

    // 3. Listen for Chromium/Android BeforeInstallPrompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("learnnaija_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setShowIosTip(false);
      setDeferredPrompt(null);
      console.log("[PWA] LearnNaija app was successfully installed!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("learnnaija_pwa_dismissed", "true");
  };

  const handleDismissIos = () => {
    setShowIosTip(false);
    localStorage.setItem("learnnaija_ios_pwa_dismissed", "true");
  };

  if (isInstalled) return null;

  // Render iOS Safari Add to Home Screen instruction if on iPhone/iPad
  if (isIos && showIosTip && !showInstallBanner) {
    return (
      <aside
        aria-label="PWA iOS Installation Guide"
        style={{
          position: "fixed",
          bottom: "84px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(460px, calc(100% - 24px))",
          background: "rgba(11, 21, 16, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid #10B981",
          borderRadius: "18px",
          padding: "12px 16px",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.25)",
          zIndex: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📲</span>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "#F9FAFB", display: "block" }}>
              Install on iPhone / iPad
            </strong>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
              Tap <strong>Share ⎋</strong> then <strong>&quot;Add to Home Screen&quot;</strong> for zero-data offline CBT practice.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismissIos}
          style={{
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "4px"
          }}
          aria-label="Dismiss iOS guide"
        >
          ✕
        </button>
      </aside>
    );
  }

  if (!showInstallBanner) return null;

  return (
    <aside
      aria-label="PWA Desktop & Android Install Banner"
      style={{
        position: "fixed",
        bottom: "84px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(460px, calc(100% - 24px))",
        background: "rgba(11, 21, 16, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid #10B981",
        borderRadius: "18px",
        padding: "12px 16px",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.25)",
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "1.6rem" }}>⚡</span>
        <div>
          <strong style={{ fontSize: "0.88rem", color: "#F9FAFB", display: "block" }}>
            Enable Zero-Data Offline Mode
          </strong>
          <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
            Install LearnNaija app for instant offline CBT practice anywhere.
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleInstallClick}
          className="btn btn-primary btn-sm"
          style={{
            padding: "6px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #10B981, #047857)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Install App
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "0 4px"
          }}
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
