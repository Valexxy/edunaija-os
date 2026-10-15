"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function ScientificCalculator({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<"jamb" | "scientific">("scientific");
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  // Draggable window coordinates
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0
  });

  // Client hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize initial position on mount (docked neatly on right side of viewport)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const calcWidth = mode === "scientific" ? 350 : 270;
      const defaultX = Math.max(16, window.innerWidth - calcWidth - 24);
      setPosition({ x: defaultX, y: 100 });
    }
  }, [mode]);

  // Viewport resize containment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const calcWidth = mode === "scientific" ? 350 : 270;
      const maxX = Math.max(10, window.innerWidth - calcWidth - 16);
      const maxY = Math.max(10, window.innerHeight - 150);
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), maxX),
        y: Math.min(Math.max(10, prev.y), maxY)
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mode]);

  // Handle Dragging
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const calcWidth = mode === "scientific" ? 350 : 270;
      const maxX = Math.max(10, window.innerWidth - calcWidth - 16);
      const maxY = Math.max(10, window.innerHeight - 120);

      setPosition({
        x: Math.min(Math.max(10, dragStartRef.current.posX + dx), maxX),
        y: Math.min(Math.max(10, dragStartRef.current.posY + dy), maxY)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, mode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStartRef.current.startX;
    const dy = e.touches[0].clientY - dragStartRef.current.startY;
    const calcWidth = mode === "scientific" ? 350 : 270;
    const maxX = Math.max(10, window.innerWidth - calcWidth - 16);
    const maxY = Math.max(10, window.innerHeight - 120);
    setPosition({
      x: Math.min(Math.max(10, dragStartRef.current.posX + dx), maxX),
      y: Math.min(Math.max(10, dragStartRef.current.posY + dy), maxY)
    });
  };

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === "0" ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setExpression((prev) => prev + " " + display + " " + op);
    setDisplay("0");
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleBackspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleEvaluate = () => {
    try {
      const fullExp = (expression + " " + display).trim();
      const sanitized = fullExp
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E");
      
      const result = Function(`"use strict"; return (${sanitized})`)();
      const formatted = Number.isFinite(result) ? String(Number(result.toFixed(8))) : "Error";
      setDisplay(formatted);
      setExpression("");
    } catch {
      setDisplay("Syntax Error");
      setExpression("");
    }
  };

  const handleScientificFunc = (func: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (func) {
        case "sqrt":
          res = Math.sqrt(val);
          break;
        case "sqr":
          res = Math.pow(val, 2);
          break;
        case "sin":
          res = Math.sin((val * Math.PI) / 180);
          break;
        case "cos":
          res = Math.cos((val * Math.PI) / 180);
          break;
        case "tan":
          res = Math.tan((val * Math.PI) / 180);
          break;
        case "log":
          res = Math.log10(val);
          break;
        case "ln":
          res = Math.log(val);
          break;
        case "neg":
          res = -val;
          break;
        default:
          return;
      }
      setDisplay(Number.isFinite(res) ? String(Number(res.toFixed(8))) : "Error");
    } catch {
      setDisplay("Math Error");
    }
  };

  const dockTo = (side: "right" | "left" | "center") => {
    if (typeof window === "undefined") return;
    const calcWidth = mode === "scientific" ? 350 : 270;
    if (side === "right") {
      setPosition({ x: Math.max(16, window.innerWidth - calcWidth - 24), y: 100 });
    } else if (side === "left") {
      setPosition({ x: 20, y: 100 });
    } else if (side === "center") {
      setPosition({ x: Math.max(16, (window.innerWidth - calcWidth) / 2), y: 100 });
    }
  };

  const calculatorWindow = isOpen ? (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: mode === "scientific" ? 350 : 270,
        background: "#ffffff",
        border: "2px solid var(--brand)",
        borderRadius: 16,
        boxShadow: "0 25px 45px -10px rgba(0,0,0,0.3), 0 10px 15px -3px rgba(0,0,0,0.1)",
        zIndex: 999999,
        userSelect: "none",
        transition: isDragging ? "none" : "box-shadow 0.2s ease"
      }}
    >
          {/* Draggable Title Bar */}
          <div
            onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
            style={{
              padding: "10px 14px",
              background: "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
              color: "#ffffff",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              cursor: "move",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700 }}>
              <span>⣿</span>
              <span>{mode === "scientific" ? "🔬 WAEC Scientific" : "⚡ JAMB 8-Key"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: 4,
                  width: 22,
                  height: 22,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  lineHeight: "18px"
                }}
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? "□" : "—"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: 4,
                  width: 22,
                  height: 22,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  lineHeight: "18px"
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div style={{ padding: 14 }}>
              {/* Controls bar: mode toggle & quick dock chips */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setMode(mode === "scientific" ? "jamb" : "scientific")}
                  className="btn btn-outline btn-sm"
                  style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                >
                  Switch to {mode === "scientific" ? "JAMB 8-Key" : "WAEC Scientific"}
                </button>
                <div style={{ display: "flex", gap: 3 }}>
                  <button
                    type="button"
                    onClick={() => dockTo("left")}
                    title="Dock Left"
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 5px", fontSize: "0.68rem", cursor: "pointer" }}
                  >
                    ◀ Left
                  </button>
                  <button
                    type="button"
                    onClick={() => dockTo("center")}
                    title="Center"
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 5px", fontSize: "0.68rem", cursor: "pointer" }}
                  >
                    ⟲ Center
                  </button>
                  <button
                    type="button"
                    onClick={() => dockTo("right")}
                    title="Dock Right"
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 5px", fontSize: "0.68rem", cursor: "pointer" }}
                  >
                    Right ▶
                  </button>
                </div>
              </div>

              {/* Calculator Display Screen */}
              <div
                style={{
                  background: "#0f172a",
                  color: "#bef264",
                  borderRadius: 10,
                  padding: "10px 14px",
                  textAlign: "right",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  marginBottom: 12
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", minHeight: 16, overflow: "hidden" }}>
                  {expression || "\u00A0"}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {display}
                </div>
              </div>

              {/* Scientific Mode Extra Keys */}
              {mode === "scientific" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 8 }}>
                  <button type="button" onClick={() => handleScientificFunc("sin")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>sin</button>
                  <button type="button" onClick={() => handleScientificFunc("cos")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>cos</button>
                  <button type="button" onClick={() => handleScientificFunc("tan")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>tan</button>
                  <button type="button" onClick={() => handleScientificFunc("sqrt")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>√</button>
                  <button type="button" onClick={() => handleScientificFunc("sqr")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>x²</button>
                  <button type="button" onClick={() => handleScientificFunc("log")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>log</button>
                  <button type="button" onClick={() => handleScientificFunc("ln")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>ln</button>
                  <button type="button" onClick={() => handleDigit("Math.PI")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>π</button>
                  <button type="button" onClick={() => handleDigit("(")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>(</button>
                  <button type="button" onClick={() => handleDigit(")")} className="btn btn-secondary btn-sm" style={{ padding: "6px 2px", fontSize: "0.75rem" }}>)</button>
                </div>
              )}

              {/* Standard Keypad Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                <button type="button" onClick={handleClear} className="btn btn-sm" style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 700 }}>AC</button>
                <button type="button" onClick={handleBackspace} className="btn btn-secondary btn-sm">DEL</button>
                <button type="button" onClick={() => handleScientificFunc("neg")} className="btn btn-secondary btn-sm">±</button>
                <button type="button" onClick={() => handleOperator("÷")} className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>÷</button>

                <button type="button" onClick={() => handleDigit("7")} className="btn btn-secondary btn-sm">7</button>
                <button type="button" onClick={() => handleDigit("8")} className="btn btn-secondary btn-sm">8</button>
                <button type="button" onClick={() => handleDigit("9")} className="btn btn-secondary btn-sm">9</button>
                <button type="button" onClick={() => handleOperator("×")} className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>×</button>

                <button type="button" onClick={() => handleDigit("4")} className="btn btn-secondary btn-sm">4</button>
                <button type="button" onClick={() => handleDigit("5")} className="btn btn-secondary btn-sm">5</button>
                <button type="button" onClick={() => handleDigit("6")} className="btn btn-secondary btn-sm">6</button>
                <button type="button" onClick={() => handleOperator("-")} className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>-</button>

                <button type="button" onClick={() => handleDigit("1")} className="btn btn-secondary btn-sm">1</button>
                <button type="button" onClick={() => handleDigit("2")} className="btn btn-secondary btn-sm">2</button>
                <button type="button" onClick={() => handleDigit("3")} className="btn btn-secondary btn-sm">3</button>
                <button type="button" onClick={() => handleOperator("+")} className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>+</button>

                <button type="button" onClick={() => handleDigit("0")} className="btn btn-secondary btn-sm" style={{ gridColumn: "span 2" }}>0</button>
                <button type="button" onClick={() => handleDigit(".")} className="btn btn-secondary btn-sm">.</button>
                <button type="button" onClick={handleEvaluate} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>=</button>
              </div>

              <div style={{ marginTop: 8, textAlign: "center", fontSize: "0.68rem", color: "var(--muted)" }}>
                💡 Click &amp; drag green title bar to move calculator anywhere on screen
              </div>
            </div>
          )}
        </div>
  ) : null;

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 700,
          background: isOpen ? "var(--brand-light)" : "var(--surface)",
          borderColor: isOpen ? "var(--brand)" : "var(--line)"
        }}
        title="Official CBT On-Screen Calculator (JAMB / WAEC Approved)"
      >
        🧮 {isOpen ? "Close Calculator" : "CBT Calculator"}
      </button>

      {/* Render via Portal to body to prevent containing-block offset bugs */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(calculatorWindow, document.body)
        : null}
    </>
  );
}
