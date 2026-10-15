"use client";

import { useEffect, useState } from "react";
import { processOfflineQueue, getOfflineQueue } from "@/lib/offline/sync-queue";

export function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [justSynced, setJustSynced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    setPendingCount(getOfflineQueue().length);

    const handleOnline = async () => {
      setIsOnline(true);
      const res = await processOfflineQueue();
      if (res.processed > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
      setPendingCount(res.remaining);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = (e: Event) => {
      const evt = e as CustomEvent<{ count: number }>;
      setPendingCount(evt.detail?.count || 0);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("edunaija:queue_updated", handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("edunaija:queue_updated", handleQueueChange);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !justSynced) {
    return null;
  }

  return (
    <aside
      aria-label="Network Connectivity Status"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: isOnline ? "#064e3b" : "#7c2d12",
        color: "#ffffff",
        padding: "8px 16px",
        borderRadius: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: "0.82rem",
        fontWeight: 600,
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.2)",
        animation: "fadeIn 0.2s ease-out"
      }}
    >
      <span style={{ fontSize: "1rem" }}>{isOnline ? "🟢" : "📡"}</span>
      <span>
        {!isOnline
          ? "Offline Mode — Answers saved locally to your device"
          : justSynced
          ? "Back Online — All answers synced with server ✓"
          : `Online (${pendingCount} queued)`}
      </span>
    </aside>
  );
}
