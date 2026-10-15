"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { posthog, PilotAnalyticsEvent } from "@/lib/analytics/posthog";

interface AnalyticsContextValue {
  track: (event: PilotAnalyticsEvent, properties?: Record<string, string | number | boolean | null>) => void;
  identify: (distinctId: string, traits?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => {},
  identify: () => {},
});

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (key && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${host.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`;
      script.onload = () => {
        const win = window as unknown as { posthog?: { init: (k: string, opts: Record<string, unknown>) => void } };
        win.posthog?.init(key, {
          api_host: host,
          autocapture: false,
          mask_all_element_attributes: true,
          mask_all_text: true,
          disable_session_recording: false,
          respect_dnt: true,
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      track: (event, properties) => {
        posthog.track({
          distinctId: "client-session",
          event,
          properties,
        });
      },
      identify: (distinctId, traits) => {
        posthog.identify(distinctId, traits || {});
      },
    }),
    []
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
