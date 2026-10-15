"use client";

import React, { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (errorCode: string) => void;
          "expired-callback"?: () => void;
          theme?: string;
          action?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  onVerify,
  onError,
  className = "",
  theme = "auto"
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFSY317zV-171p9L";

  useEffect(() => {
    // If running in development and no script tag yet
    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;

    try {
      // Clear container first
      containerRef.current.innerHTML = "";

      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          onVerify(token);
        },
        "error-callback": (err: string) => {
          console.warn("[Turnstile] Challenge error:", err);
          if (onError) onError(err);
        }
      });
      setWidgetId(id);
    } catch (e) {
      console.warn("[Turnstile] Render warning:", e);
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [isLoaded, siteKey, theme, onVerify, onError]);

  return (
    <div className={`turnstile-container flex flex-col items-center my-3 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
      <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 text-emerald-600 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        Protected by Cloudflare Turnstile • Anti-Cheat Verified
      </span>
    </div>
  );
}
