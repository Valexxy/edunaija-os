"use client";

import React, { useRef, useState, useEffect } from "react";

export function CollaborativeWhiteboard({ roomName }: { roomName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#047857");
  const [lineWidth, setLineWidth] = useState(3);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "formula">("pen");
  const [mathSymbol, setMathSymbol] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background with subtle math graph grid
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "formula" && mathSymbol) {
      ctx.font = "bold 18px 'Segoe UI', sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(mathSymbol, x, y);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = activeTool === "eraser" ? 20 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#FFFFFF", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
      {/* Whiteboard Toolbar */}
      <div style={{ padding: "10px 16px", background: "#F8FAFC", borderBottom: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
          📐 STEM Whiteboard ({roomName}):
        </span>

        {/* Tools */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTool === "pen" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTool("pen")}
          >
            ✏️ Pen
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTool === "eraser" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTool("eraser")}
          >
            🧹 Eraser
          </button>
        </div>

        {/* Color Palette */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 8 }}>
          {["#047857", "#1E40AF", "#B91C1C", "#111827"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setActiveTool("pen"); }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: c,
                border: color === c ? "2px solid #000" : "1px solid #ddd",
                cursor: "pointer"
              }}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 4 }}>
          {[2, 4, 6].map((w) => (
            <button
              key={w}
              type="button"
              className={`btn btn-sm ${lineWidth === w ? "btn-secondary" : "btn-outline"}`}
              style={{ fontSize: "0.72rem", padding: "2px 6px" }}
              onClick={() => setLineWidth(w)}
            >
              {w}px
            </button>
          ))}
        </div>

        {/* LaTeX Math Chips */}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Insert Formula:</span>
          {["x² + y² = r²", "(-b ± √(b²-4ac))/2a", "F = ma", "v = u + at"].map((sym) => (
            <button
              key={sym}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => {
                setActiveTool("formula");
                setMathSymbol(sym);
              }}
            >
              {sym}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "0.75rem", color: "#DC2626" }}
            onClick={clearCanvas}
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", minHeight: 460 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: "100%", height: "100%", display: "block", cursor: activeTool === "eraser" ? "crosshair" : "default" }}
        />
      </div>
    </div>
  );
}
