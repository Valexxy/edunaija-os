"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, RefreshCw, Zap, Globe, ArrowUpRight,
  ShieldAlert, CheckCircle2, Flame, HelpCircle, X
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface SynapseNode {
  id: string;
  name: string;
  subject: string;
  tier: "PRIMARY" | "JSS" | "SSS" | "UTME" | "FRESHMAN";
  mastery: number; // 0 - 100
  wikiConcept: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SynapseEdge {
  source: string;
  target: string;
  strength: number;
  particles: { progress: number; speed: number }[];
}

export default function CognitiveSynapseGraph({ activeTier = "UTME" }: { activeTier?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<SynapseNode | null>(null);
  const [wikiData, setWikiData] = useState<any>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [filterSubject, setFilterSubject] = useState<string>("ALL");

  const nodesRef = useRef<SynapseNode[]>([
    // Primary / Foundational
    { id: "fractions", name: "Mental Maths & Fractions", subject: "Mathematics", tier: "PRIMARY", mastery: 92, wikiConcept: "Fraction", x: 180, y: 140, vx: 0, vy: 0, radius: 20 },
    { id: "phonics", name: "Phonics & Word Blending", subject: "English", tier: "PRIMARY", mastery: 94, wikiConcept: "Phonics", x: 140, y: 220, vx: 0, vy: 0, radius: 22 },
    { id: "habitats", name: "Plant & Animal Habitats", subject: "Basic Science", tier: "PRIMARY", mastery: 93, wikiConcept: "Habitat", x: 260, y: 180, vx: 0, vy: 0, radius: 20 },

    // Senior / UTME
    { id: "lekki", name: "The Lekki Headmaster", subject: "Literature", tier: "UTME", mastery: 92, wikiConcept: "Chinua Achebe", x: 420, y: 120, vx: 0, vy: 0, radius: 22 },
    { id: "projectile", name: "Projectile Motion & Vectors", subject: "Physics", tier: "UTME", mastery: 94, wikiConcept: "Projectile motion", x: 500, y: 200, vx: 0, vy: 0, radius: 24 },
    { id: "organic", name: "Organic Reaction Mechanisms", subject: "Chemistry", tier: "UTME", mastery: 95, wikiConcept: "Organic chemistry", x: 380, y: 260, vx: 0, vy: 0, radius: 24 },
    { id: "genetics", name: "Mendelian Genetics & DNA", subject: "Biology", tier: "UTME", mastery: 96, wikiConcept: "Mendelian inheritance", x: 480, y: 320, vx: 0, vy: 0, radius: 26 },
    { id: "thermo", name: "Thermodynamics & Heat", subject: "Physics", tier: "UTME", mastery: 74, wikiConcept: "Thermodynamics", x: 600, y: 240, vx: 0, vy: 0, radius: 18 },
    { id: "calculus", name: "Calculus & Differentiation", subject: "Mathematics", tier: "UTME", mastery: 58, wikiConcept: "Calculus", x: 320, y: 340, vx: 0, vy: 0, radius: 18 },
    { id: "gst", name: "Use of English & Logic (GST 111)", subject: "General Studies", tier: "FRESHMAN", mastery: 88, wikiConcept: "Logic", x: 620, y: 140, vx: 0, vy: 0, radius: 20 }
  ]);

  const edgesRef = useRef<SynapseEdge[]>([
    { source: "fractions", target: "phonics", strength: 0.05, particles: [{ progress: 0.1, speed: 0.007 }, { progress: 0.6, speed: 0.007 }] },
    { source: "fractions", target: "habitats", strength: 0.06, particles: [{ progress: 0.3, speed: 0.008 }] },
    { source: "fractions", target: "calculus", strength: 0.04, particles: [{ progress: 0.2, speed: 0.005 }] },
    { source: "projectile", target: "thermo", strength: 0.06, particles: [{ progress: 0.5, speed: 0.009 }, { progress: 0.9, speed: 0.009 }] },
    { source: "organic", target: "genetics", strength: 0.07, particles: [{ progress: 0.2, speed: 0.008 }, { progress: 0.7, speed: 0.008 }] },
    { source: "lekki", target: "gst", strength: 0.04, particles: [{ progress: 0.4, speed: 0.006 }] },
    { source: "projectile", target: "calculus", strength: 0.05, particles: [{ progress: 0.15, speed: 0.007 }] }
  ]);

  // Load Wikipedia entity when a node is selected
  useEffect(() => {
    if (!selectedNode) {
      setWikiData(null);
      return;
    }
    setWikiLoading(true);
    fetch(`/api/backend/api/realtime/wiki/${encodeURIComponent(selectedNode.wikiConcept)}`)
      .then((r) => r.json())
      .then((data) => setWikiData(data))
      .catch(() => {
        setWikiData({
          title: selectedNode.name,
          extract: `Encyclopedic syllabus overview for ${selectedNode.name}. Core competency under West African curriculum.`,
          source: "Offline Syllabus Archive"
        });
      })
      .finally(() => setWikiLoading(false));
  }, [selectedNode]);

  // Physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // 1. Simple Force Dynamics (Relaxation)
      if (isRunning) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) / 180 * 0.05;
              nodes[i].vx -= (dx / dist) * force;
              nodes[i].vy -= (dy / dist) * force;
              nodes[j].vx += (dx / dist) * force;
              nodes[j].vy += (dy / dist) * force;
            }
          }
          // Center gravity
          nodes[i].vx += (width / 2 - nodes[i].x) * 0.001;
          nodes[i].vy += (height / 2 - nodes[i].y) * 0.001;

          nodes[i].x += nodes[i].vx;
          nodes[i].y += nodes[i].vy;
          nodes[i].vx *= 0.88;
          nodes[i].vy *= 0.88;
        }
      }

      // 2. Draw Edges & Synaptic Particles
      edges.forEach((edge) => {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return;

        // Base link line
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Synapse Particles
        edge.particles.forEach((p) => {
          if (isRunning) {
            p.progress = (p.progress + p.speed) % 1.0;
          }
          const px = src.x + (tgt.x - src.x) * p.progress;
          const py = src.y + (tgt.y - src.y) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#00E676";
          ctx.shadowColor = "#00E676";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });
      });

      // 3. Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const color = node.mastery >= 80 ? "#00E676" : node.mastery >= 60 ? "#F59E0B" : "#EF4444";

        // Outer Aura Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, node.radius * 0.4, node.x, node.y, node.radius * 2.2);
        gradient.addColorStop(0, isSelected ? "rgba(0, 230, 118, 0.45)" : `${color}25`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Core Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0D0E12";
        ctx.fill();
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.strokeStyle = color;
        ctx.stroke();

        // Node Mastery Indicator Dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Typography Label
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)";
        ctx.fillText(node.name, node.x, node.y + node.radius + 14);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [isRunning, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8;
    });

    if (clicked) {
      sfx.tap();
      triggerTmaHaptic("medium");
      setSelectedNode(clicked);
    }
  };

  return (
    <div className="relative rounded-3xl bg-[#08090C] border border-white/10 overflow-hidden shadow-2xl p-5 flex flex-col">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-[#00E676] border border-emerald-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Cognitive Synapse Knowledge Web
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-bold">
                HTML5 Force-Directed
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Interactive prerequisite memory graph • Click any node to query live Wikipedia concept
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { sfx.tap(); setIsRunning(!isRunning); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isRunning
                ? "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Simulating Physics" : "Paused"}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-[380px] bg-gradient-to-b from-[#050608] to-[#0A0B10] rounded-2xl overflow-hidden mt-4 border border-white/5">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />

        {/* Floating Legend */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[10px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
            <span className="text-zinc-300">Mastered (&ge;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span className="text-zinc-300">In Progress (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
            <span className="text-zinc-300">Focus Needed (&lt;60%)</span>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-3 right-3 bottom-3 w-80 bg-[#0C0D12]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex flex-col justify-between overflow-y-auto z-20"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-[#00E676] font-bold">
                      {selectedNode.subject}
                    </span>
                    <h4 className="text-sm font-black text-white mt-1.5 leading-snug">
                      {selectedNode.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mastery Bar */}
                <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-400">Mastery Index:</span>
                    <span className={selectedNode.mastery >= 80 ? "text-[#00E676]" : "text-amber-400"}>
                      {selectedNode.mastery}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#00E676] rounded-full"
                      style={{ width: `${selectedNode.mastery}%` }}
                    />
                  </div>
                </div>

                {/* Real-time Wikipedia Concept Lookup Card */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    Live Wikipedia Concept Summary
                  </div>

                  {wikiLoading ? (
                    <div className="py-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      Connecting to Wikipedia REST API...
                    </div>
                  ) : wikiData ? (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                      {wikiData.thumbnail && (
                        <img
                          src={wikiData.thumbnail}
                          alt={wikiData.title}
                          className="w-full h-24 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <p className="text-[11px] text-zinc-300 line-clamp-4 leading-relaxed">
                        {wikiData.extract}
                      </p>
                      {wikiData.page_url && (
                        <a
                          href={wikiData.page_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline"
                        >
                          View Wikipedia Entry <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex gap-2">
                <a
                  href={`/quiz?subject=${encodeURIComponent(selectedNode.subject)}&topic=${encodeURIComponent(selectedNode.name)}`}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs text-center hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  Start Diagnostic Drill &rarr;
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}