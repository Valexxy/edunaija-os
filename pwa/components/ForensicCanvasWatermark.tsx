"use client";

import React, { useEffect, useRef } from "react";

interface ForensicCanvasWatermarkProps {
  userKey?: string;
  ipAddress?: string;
  examNonce?: string;
}

export default function ForensicCanvasWatermark({
  userKey = "SCHOLAR-DEMO-NG",
  ipAddress = "102.89.44.12",
  examNonce = "CBT-MOCK-2026"
}: ForensicCanvasWatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderWatermark = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);
      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; // Steganographic faint overlay
      ctx.rotate((-20 * Math.PI) / 180);

      const stamp = `EDUNAIJA SECURE • ${userKey} • IP:${ipAddress} • ${examNonce} • ${new Date().toISOString().slice(0, 16)}`;

      const stepX = 320;
      const stepY = 140;

      for (let x = -width; x < width * 2; x += stepX) {
        for (let y = -height; y < height * 2; y += stepY) {
          ctx.fillText(stamp, x, y);
        }
      }
    };

    renderWatermark();
    window.addEventListener("resize", renderWatermark);
    return () => window.removeEventListener("resize", renderWatermark);
  }, [userKey, ipAddress, examNonce]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full select-none"
      aria-hidden="true"
    />
  );
}
