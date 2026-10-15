"use client";

import React, { useState } from "react";

interface SocraticMarkdownRendererProps {
  rawContent: string;
  subject?: string;
  topicTitle?: string;
  practiceQuestion?: string;
}

/**
 * Visual SVG Diagram for Economics: Law of Demand, Supply & Market Equilibrium
 */
function EconomicsEquilibriumDiagram() {
  const [activeRegion, setActiveRegion] = useState<"equilibrium" | "surplus" | "shortage">("equilibrium");

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        background: "linear-gradient(145deg, #0f172a, #1e293b)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#f8fafc"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div>
          <strong style={{ fontSize: "1rem", color: "#38bdf8", display: "flex", alignItems: "center", gap: 8 }}>
            📊 Interactive Market Equilibrium Chart (NERDC / WAEC Standard)
          </strong>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            Visualizing Price (P), Quantity (Q), Demand (D), and Supply (S)
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={`btn btn-xs ${activeRegion === "surplus" ? "btn-warning" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            onClick={() => setActiveRegion("surplus")}
          >
            Surplus (P &gt; Pe)
          </button>
          <button
            type="button"
            className={`btn btn-xs ${activeRegion === "equilibrium" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            onClick={() => setActiveRegion("equilibrium")}
          >
            Equilibrium (Pe, Qe)
          </button>
          <button
            type="button"
            className={`btn btn-xs ${activeRegion === "shortage" ? "btn-danger" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            onClick={() => setActiveRegion("shortage")}
          >
            Shortage (P &lt; Pe)
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
        <svg viewBox="0 0 340 220" style={{ width: "100%", maxWidth: 420, height: "auto" }}>
          {/* Axes */}
          <line x1="45" y1="25" x2="45" y2="185" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="45" y1="185" x2="310" y2="185" stroke="#94a3b8" strokeWidth="2.5" />
          
          {/* Axis Labels */}
          <text x="25" y="30" fill="#38bdf8" fontSize="12" fontWeight="700">Price (₦)</text>
          <text x="245" y="205" fill="#38bdf8" fontSize="12" fontWeight="700">Quantity (Q)</text>

          {/* Demand Curve (Downward Sloping) */}
          <line x1="65" y1="45" x2="285" y2="165" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
          <text x="290" y="170" fill="#f43f5e" fontSize="13" fontWeight="bold">D</text>

          {/* Supply Curve (Upward Sloping) */}
          <line x1="65" y1="165" x2="285" y2="45" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          <text x="290" y="50" fill="#10b981" fontSize="13" fontWeight="bold">S</text>

          {/* Equilibrium Point E (175, 105) */}
          <circle cx="175" cy="105" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <text x="185" y="100" fill="#ffffff" fontSize="13" fontWeight="bold">E (Pe, Qe)</text>

          {/* Equilibrium Dashed Projections */}
          <line x1="45" y1="105" x2="175" y2="105" stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="1.5" />
          <line x1="175" y1="105" x2="175" y2="185" stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="25" y="110" fill="#38bdf8" fontSize="11" fontWeight="700">Pe</text>
          <text x="170" y="200" fill="#38bdf8" fontSize="11" fontWeight="700">Qe</text>

          {/* Dynamic Highlight Overlay */}
          {activeRegion === "surplus" && (
            <g>
              <line x1="45" y1="70" x2="235" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
              <rect x="110" y="60" width="130" height="20" fill="rgba(245, 158, 11, 0.25)" rx="4" />
              <text x="125" y="75" fill="#fcd34d" fontSize="11" fontWeight="bold">Surplus (Qs &gt; Qd)</text>
              <text x="18" y="75" fill="#f59e0b" fontSize="11" fontWeight="bold">P1</text>
            </g>
          )}

          {activeRegion === "shortage" && (
            <g>
              <line x1="45" y1="140" x2="235" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
              <rect x="110" y="130" width="130" height="20" fill="rgba(239, 68, 68, 0.25)" rx="4" />
              <text x="120" y="145" fill="#fca5a5" fontSize="11" fontWeight="bold">Shortage (Qd &gt; Qs)</text>
              <text x="18" y="145" fill="#ef4444" fontSize="11" fontWeight="bold">P2</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: "rgba(0, 0, 0, 0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem", lineHeight: 1.5 }}>
        {activeRegion === "equilibrium" && (
          <span>
            ⚖️ <strong>Market Equilibrium:</strong> The point where Quantity Demanded equals Quantity Supplied (<strong>Qd = Qs</strong>). Neither shortage nor surplus exists. Market price clears at <strong>Pe</strong>.
          </span>
        )}
        {activeRegion === "surplus" && (
          <span>
            📦 <strong>Surplus (Excess Supply):</strong> When price rises above equilibrium (<strong>P1 &gt; Pe</strong>), producers supply more than buyers can afford. Producers must lower prices to clear unsold stock!
          </span>
        )}
        {activeRegion === "shortage" && (
          <span>
            🚨 <strong>Shortage (Excess Demand):</strong> When price drops below equilibrium (<strong>P2 &lt; Pe</strong>), consumers demand more than is available. Many buyers chase few goods, pushing price back up to <strong>Pe</strong>!
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Universal Socratic Explanation Renderer
 * Parses structured markdown and renders clean visual sections with icons, callout cards,
 * Nigerian real-world analogies, and self-check practice components.
 */
export function SocraticMarkdownRenderer({
  rawContent,
  subject = "",
  topicTitle = "",
  practiceQuestion
}: SocraticMarkdownRendererProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Check if this topic or content relates to Economics / Market Equilibrium
  const isEconomicsTopic =
    subject.toLowerCase().includes("econ") ||
    topicTitle.toLowerCase().includes("demand") ||
    rawContent.toLowerCase().includes("market equilibrium") ||
    rawContent.toLowerCase().includes("law of demand");

  // Clean raw content into paragraphs and headers
  const sections = parseContentSections(rawContent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Welcoming Hero Card */}
      {sections.intro && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(59, 130, 246, 0.08))",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "14px",
            padding: "16px 20px",
            fontSize: "1.02rem",
            lineHeight: 1.65,
            color: "var(--ink)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🎯</span>
            <strong style={{ color: "var(--brand-dark)", fontSize: "0.95rem" }}>
              Core Concept Intuition
            </strong>
          </div>
          <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(sections.intro) }} />
        </div>
      )}

      {/* 2. Visual Diagram (Rendered when topic is Economics / Market Equilibrium) */}
      {isEconomicsTopic && <EconomicsEquilibriumDiagram />}

      {/* 3. Structured Concept Sections */}
      {sections.blocks.map((block, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: "20px 24px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        >
          {block.title && (
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--brand-dark)",
                margin: "0 0 14px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid var(--line-light)",
                paddingBottom: 8
              }}
            >
              <span>{getBlockIcon(block.title)}</span>
              <span>{block.title}</span>
            </h3>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {block.paragraphs.map((para, pIdx) => {
              // Check if paragraph is a Nigerian real-world example
              const isNigerianExample =
                para.toLowerCase().includes("garri") ||
                para.toLowerCase().includes("yam") ||
                para.toLowerCase().includes("nigeria") ||
                para.toLowerCase().includes("fuel subsidy") ||
                para.toLowerCase().includes("soft drink") ||
                para.toLowerCase().includes("market");

              if (isNigerianExample && para.length > 50) {
                return (
                  <div
                    key={pIdx}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      lineHeight: 1.6,
                      color: "#166534"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span>🇳🇬</span>
                      <strong>Everyday Nigerian Market Reality:</strong>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(para) }} />
                  </div>
                );
              }

              return (
                <div
                  key={pIdx}
                  style={{ fontSize: "0.98rem", lineHeight: 1.65, color: "var(--ink)" }}
                  dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(para) }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* 4. Interactive Self-Check Practice Question */}
      {practiceQuestion && (
        <div
          style={{
            border: "1.5px solid var(--brand-border)",
            borderRadius: "14px",
            background: "var(--surface-sunken)",
            padding: "20px 24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <strong style={{ color: "var(--brand-dark)", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span>💡</span>
              <span>Self-Check Practice Challenge</span>
            </strong>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAnswer(!showAnswer)}
              style={{ fontSize: "0.82rem" }}
            >
              {showAnswer ? "Hide Socratic Hint / Solution ▲" : "Reveal Socratic Solution ▼"}
            </button>
          </div>

          <div
            style={{ fontSize: "0.96rem", lineHeight: 1.6, color: "var(--ink)", marginBottom: showAnswer ? 16 : 0 }}
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(practiceQuestion) }}
          />

          {showAnswer && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "14px 18px",
                fontSize: "0.9rem",
                color: "#1e40af",
                lineHeight: 1.6
              }}
            >
              <strong>📐 Socratic Answer Key &amp; Guide:</strong>
              <p style={{ margin: "6px 0 0 0" }}>
                1. <strong>Supply Shift:</strong> Agricultural technology reduces production costs, causing the supply curve to shift <strong>rightward (increases)</strong>.<br />
                2. <strong>Demand Shift:</strong> The health trend makes yam more popular, causing consumer demand to shift <strong>rightward (increases)</strong>.<br />
                3. <strong>Equilibrium Outcome:</strong> Equilibrium quantity (<strong>Qe</strong>) will definitely <strong>increase</strong> because both supply and demand increased. Equilibrium price (<strong>Pe</strong>) depends on which shift was larger: if supply increase exceeds demand, price falls; if demand increase exceeds supply, price rises!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Helper to extract section blocks and intro from raw Socratic markdown
 */
function parseContentSections(text: string): {
  intro: string;
  blocks: Array<{ title: string; paragraphs: string[] }>;
} {
  const lines = text.split("\n");
  let intro = "";
  const blocks: Array<{ title: string; paragraphs: string[] }> = [];
  let currentBlock: { title: string; paragraphs: string[] } | null = null;
  let currentParagraph = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      if (currentParagraph) {
        if (currentBlock) {
          currentBlock.paragraphs.push(currentParagraph);
        } else if (!intro) {
          intro = currentParagraph;
        } else {
          intro += " " + currentParagraph;
        }
        currentParagraph = "";
      }
      continue;
    }

    // Check for bold headings e.g. **Understanding Demand** or ## Heading
    const headerMatch = rawLine.match(/^(?:#{1,4}\s+|\*\*)([^*#]+)(?:\*\*|:)?$/);
    if (headerMatch && headerMatch[1].length < 60) {
      if (currentParagraph) {
        if (currentBlock) {
          currentBlock.paragraphs.push(currentParagraph);
        } else if (!intro) {
          intro = currentParagraph;
        }
        currentParagraph = "";
      }

      currentBlock = {
        title: headerMatch[1].trim(),
        paragraphs: []
      };
      blocks.push(currentBlock);
      continue;
    }

    if (currentParagraph) {
      currentParagraph += " " + rawLine;
    } else {
      currentParagraph = rawLine;
    }
  }

  if (currentParagraph) {
    if (currentBlock) {
      currentBlock.paragraphs.push(currentParagraph);
    } else if (!intro) {
      intro = currentParagraph;
    }
  }

  // If no structured blocks were parsed, treat paragraphs as generic blocks
  if (blocks.length === 0 && text.length > 0) {
    blocks.push({
      title: "Comprehensive Concept Breakdown",
      paragraphs: [text]
    });
  }

  return { intro, blocks };
}

/**
 * Formats inline bold, italic, code, and bullet markdown to HTML
 */
function formatInlineMarkdown(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code style='background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px;'>$1</code>")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

/**
 * Dynamic icon assigner for Socratic blocks
 */
function getBlockIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("demand")) return "📉";
  if (t.includes("supply")) return "📈";
  if (t.includes("equilibrium")) return "⚖️";
  if (t.includes("shift") || t.includes("movement")) return "🔄";
  if (t.includes("determinant")) return "⚙️";
  if (t.includes("law") || t.includes("principle")) return "📜";
  if (t.includes("formula") || t.includes("math") || t.includes("equation")) return "📐";
  if (t.includes("takeaway") || t.includes("key point")) return "📌";
  return "💡";
}
