"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Trophy, Zap, Compass, Star, ChevronRight, Award, 
  MapPin, Users, BookOpen, Flame, Landmark, X, ArrowRight, ShieldCheck
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";
import { SparklesCore } from "./SparklesCore";
import { ShimmerButton } from "./ShimmerButton";
import { NIGERIA_VECTORS } from "../lib/nigeriaVectors";

interface StateData {
  state_name: string;
  capital: string;
  geopolitical_zone: string;
  motto: string;
  registered_scholars: number;
  avg_xp: number;
  total_xp: number;
  educational_heritage: string;
  notable_scholars_and_heroes: string;
  cultural_landmarks: string;
  lat: number;
  lng: number;
  academic_focus: string;
  rank: number;
}

const INITIAL_STATES: StateData[] = [
  { state_name: "Anambra", capital: "Awka", geopolitical_zone: "South East", motto: "Light of the Nation", registered_scholars: 1420, avg_xp: 3890, total_xp: 552380, educational_heritage: "Home to leading STEM pioneers, commerce academies, and Olympiad gold medalists.", notable_scholars_and_heroes: "Prof. Chinua Achebe, Dr. Nnamdi Azikiwe, Prof. Chike Obi (Legendary Mathematician)", cultural_landmarks: "Ogbunike Caves, River Niger Confluence, Rojenny Tourist Village", lat: 6.22, lng: 7.00, academic_focus: "Pure Mathematics, Physics & Technical Commerce", rank: 1 },
  { state_name: "Lagos", capital: "Ikeja", geopolitical_zone: "South West", motto: "Centre of Excellence", registered_scholars: 4890, avg_xp: 4120, total_xp: 2014680, educational_heritage: "Premier commercial and tech metropolis housing Nigeria’s leading software unicorns.", notable_scholars_and_heroes: "Herbert Macaulay, Prof. Grace Alele-Williams", cultural_landmarks: "National Theatre, Lekki Conservation Centre, Freedom Park", lat: 6.52, lng: 3.37, academic_focus: "Software Engineering, AI & FinTech", rank: 2 },
  { state_name: "Oyo", capital: "Ibadan", geopolitical_zone: "South West", motto: "Pace Setter State", registered_scholars: 2310, avg_xp: 3750, total_xp: 866250, educational_heritage: "Host of Nigeria's premier university (University of Ibadan) and Cocoa House.", notable_scholars_and_heroes: "Prof. Wole Soyinka (Nobel Laureate), Chief Obafemi Awolowo", cultural_landmarks: "Cocoa House, Bower's Tower, Agodi Gardens", lat: 7.84, lng: 3.93, academic_focus: "Clinical Medicine, Law & Literary Arts", rank: 3 },
  { state_name: "FCT Abuja", capital: "Abuja", geopolitical_zone: "North Central", motto: "Centre of Unity", registered_scholars: 2840, avg_xp: 3950, total_xp: 1121800, educational_heritage: "Sovereign seat of governance and inter-university research institutes.", notable_scholars_and_heroes: "Dr. Aliyu Mai-Bornu, Ladi Kwali", cultural_landmarks: "Zuma Rock, Aso Rock, National Mosque", lat: 9.07, lng: 7.48, academic_focus: "Public Policy, Cyber Security & Diplomacy", rank: 4 },
  { state_name: "Enugu", capital: "Enugu", geopolitical_zone: "South East", motto: "Coal City State", registered_scholars: 1820, avg_xp: 3680, total_xp: 669760, educational_heritage: "Historic capital of Eastern Region and pioneer University of Nigeria Nsukka.", notable_scholars_and_heroes: "Prof. Kenneth Dike, Chief C.C. Onoh", cultural_landmarks: "Udi Hills, Ngwo Pine Forest, Awhum Waterfalls", lat: 6.53, lng: 7.43, academic_focus: "Civil Engineering, Jurisprudence & Computer Science", rank: 5 },
  { state_name: "Kaduna", capital: "Kaduna", geopolitical_zone: "North West", motto: "Centre of Learning", registered_scholars: 1980, avg_xp: 3590, total_xp: 710820, educational_heritage: "Historic seat of Ahmadu Bello University Zaria and the Nigerian Defence Academy.", notable_scholars_and_heroes: "Sir Ahmadu Bello, Prof. Ishaya Audu", cultural_landmarks: "Nok Settlement, Matsirga Waterfalls, Lugard Hall", lat: 10.51, lng: 7.43, academic_focus: "Aerospace, Defence STEM & Architecture", rank: 6 },
  { state_name: "Edo", capital: "Benin City", geopolitical_zone: "South South", motto: "Heartbeat of the Nation", registered_scholars: 1450, avg_xp: 3510, total_xp: 508950, educational_heritage: "Cradle of bronze casting civilization and pioneer medical science at UNIBEN.", notable_scholars_and_heroes: "Prof. Ambrose Alli, Oba Eweka I", cultural_landmarks: "Benin Moat, Royal Oba Palace, Igun Bronze Street", lat: 6.54, lng: 5.90, academic_focus: "Medicine, Surgery & Metallurgical Arts", rank: 7 },
  { state_name: "Rivers", capital: "Port Harcourt", geopolitical_zone: "South South", motto: "Treasure Base of the Nation", registered_scholars: 2100, avg_xp: 3640, total_xp: 764400, educational_heritage: "Hydrocarbon engineering capital and maritime innovation corridor.", notable_scholars_and_heroes: "Ken Saro-Wiwa, Prof. Tekena Tamuno", cultural_landmarks: "Port Harcourt Pleasure Park, Isaac Boro Park", lat: 4.81, lng: 7.04, academic_focus: "Marine Engineering, Offshore Oil & Gas Sciences", rank: 8 },
  { state_name: "Kano", capital: "Kano", geopolitical_zone: "North West", motto: "Centre of Commerce", registered_scholars: 2240, avg_xp: 3480, total_xp: 779520, educational_heritage: "Centuries-old trans-Saharan scholarly hub with Bayero University Kano.", notable_scholars_and_heroes: "Aminu Kano, Maitama Sule", cultural_landmarks: "Dala Hill, Gidan Rumfa, Kurmi Market", lat: 11.99, lng: 8.52, academic_focus: "Applied Mathematics, Trade Economics & Arabic", rank: 9 },
  { state_name: "Delta", capital: "Asaba", geopolitical_zone: "South South", motto: "The Big Heart", registered_scholars: 1620, avg_xp: 3540, total_xp: 573480, educational_heritage: "High-density polytechnic and petroleum education network.", notable_scholars_and_heroes: "Chief Dennis Osadebay, Prof. Epiphany Azinge", cultural_landmarks: "River Ethiope Source, Lander Brothers Anchorage", lat: 5.70, lng: 5.93, academic_focus: "Petrochemical Technology & Economics", rank: 10 },
  { state_name: "Ogun", capital: "Abeokuta", geopolitical_zone: "South West", motto: "Gateway State", registered_scholars: 1890, avg_xp: 3710, total_xp: 701190, educational_heritage: "Birthplace of countless national titans and highest concentration of tertiary institutions.", notable_scholars_and_heroes: "Chief M.K.O. Abiola, Funmilayo Ransome-Kuti", cultural_landmarks: "Olumo Rock, Bilikisu Sungbo Shrine", lat: 6.90, lng: 3.35, academic_focus: "Chemical Engineering, Pharmacy & Humanities", rank: 11 },
  { state_name: "Imo", capital: "Owerri", geopolitical_zone: "South East", motto: "Eastern Heartland", registered_scholars: 1530, avg_xp: 3620, total_xp: 553860, educational_heritage: "Renowned for one of the highest school enrolment rates in West Africa.", notable_scholars_and_heroes: "Dr. K.O. Mbadiwe, Prof. Walter Ofonagoro", cultural_landmarks: "Oguta Lake, Mbari Cultural Centre", lat: 5.48, lng: 7.03, academic_focus: "Mechanical Engineering & Accountancy", rank: 12 },
  { state_name: "Akwa Ibom", capital: "Uyo", geopolitical_zone: "South South", motto: "Land of Promise", registered_scholars: 1380, avg_xp: 3590, total_xp: 495420, educational_heritage: "Modern digital library infrastructure and maritime research institutions.", notable_scholars_and_heroes: "Obong Victor Attah, Clement Isong", cultural_landmarks: "Ibom Tropicana, National Museum of Colonial History", lat: 4.90, lng: 7.85, academic_focus: "Petroleum Engineering & Marine Sciences", rank: 13 },
  { state_name: "Plateau", capital: "Jos", geopolitical_zone: "North Central", motto: "Home of Peace and Tourism", registered_scholars: 1120, avg_xp: 3420, total_xp: 383040, educational_heritage: "National Veterinary Research Institute Vom and mining geology faculties.", notable_scholars_and_heroes: "J.D. Gomwalk, Solomon Lar", cultural_landmarks: "Shere Hills, Kurra Falls, Jos Wildlife Park", lat: 9.21, lng: 9.51, academic_focus: "Geophysics, Earth Sciences & Biochemistry", rank: 14 },
  { state_name: "Borno", capital: "Maiduguri", geopolitical_zone: "North East", motto: "Home of Peace", registered_scholars: 980, avg_xp: 3310, total_xp: 324380, educational_heritage: "Host of University of Maiduguri with extensive desertification studies.", notable_scholars_and_heroes: "Sir Kashim Ibrahim, Shehu of Borno", cultural_landmarks: "Lake Chad Basin, Shehu's Palace", lat: 11.83, lng: 13.15, academic_focus: "Renewable Energy & Arid Ecology", rank: 15 }
];

interface GithubHeroGlobeProps {
  onExploreClick?: () => void;
}

export default function GithubHeroGlobe({ onExploreClick }: GithubHeroGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [states, setStates] = useState<StateData[]>(INITIAL_STATES);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [activeNode, setActiveNode] = useState<StateData>(INITIAL_STATES[0]);
  const [mascotCheer, setMascotCheer] = useState<string>("Welcome scholar! Tap any state to inspect registered academic champions. 🌟");

  // Fetch live state telemetry from backend
  useEffect(() => {
    fetch("/api/backend/competition/state-standings")
      .then((res) => res.json())
      .then((data) => {
        if (data.standings && data.standings.length > 0) {
          setStates(data.standings);
          const anambra = data.standings.find((s: StateData) => s.state_name === "Anambra") || data.standings[0];
          setActiveNode(anambra);
        }
      })
      .catch(() => {});
  }, []);

  // Canvas pulsating Nigeria map & holographic radar render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    const speed = 0.005;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Nigeria geographical bounding box for mapping
    const MIN_LAT = 4.0;
    const MAX_LAT = 14.0;
    const MIN_LNG = 2.5;
    const MAX_LNG = 14.8;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.44;

      ctx.clearRect(0, 0, width, height);

      // 1. Holographic Cyber Nebula Ambient Aura
      const outerAura = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius * 1.35);
      outerAura.addColorStop(0, "rgba(0, 230, 118, 0.18)");
      outerAura.addColorStop(0.45, "rgba(56, 189, 248, 0.10)");
      outerAura.addColorStop(0.8, "rgba(168, 85, 247, 0.05)");
      outerAura.addColorStop(1, "rgba(6, 10, 20, 0)");
      ctx.fillStyle = outerAura;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. High-Tech Holographic Globe Sphere Body
      const sphereGrad = ctx.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.35,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      sphereGrad.addColorStop(0, "rgba(15, 23, 42, 0.90)");
      sphereGrad.addColorStop(0.7, "rgba(6, 10, 24, 0.96)");
      sphereGrad.addColorStop(1, "rgba(2, 6, 18, 1)");

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 230, 118, 0.45)";
      ctx.stroke();
      ctx.clip();

      // 3. Cybernetic Latitude Parallels
      const latSteps = 8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 1; i < latSteps; i++) {
        const yOffset = (i / latSteps - 0.5) * 2 * radius;
        const rAtY = Math.sqrt(Math.max(0, radius * radius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + yOffset, rAtY, rAtY * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Rotating Longitude Meridians
      const lonSteps = 14;
      for (let i = 0; i < lonSteps; i++) {
        const angle = rotation + (i / lonSteps) * Math.PI * 2;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        if (cosA > -0.2) {
          ctx.beginPath();
          const opacity = Math.max(0.03, cosA * 0.2);
          ctx.strokeStyle = `rgba(0, 230, 118, ${opacity})`;
          ctx.ellipse(centerX, centerY, Math.abs(sinA) * radius, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      rotation += speed;

      // 5. Authentic Sovereign Nigeria National Outline & State Boundaries
      const mapBoxWidth = radius * 1.55;
      const mapBoxHeight = radius * 1.35;
      const mapOriginX = centerX - mapBoxWidth / 2;
      const mapOriginY = centerY - mapBoxHeight / 2 + 5;

      // Draw all state boundary polygons (fine internal grid)
      ctx.strokeStyle = "rgba(0, 230, 118, 0.22)";
      ctx.lineWidth = 0.9;
      for (const [stName, rings] of Object.entries(NIGERIA_VECTORS.states)) {
        const isSelectedOrActive = activeNode.state_name === stName || selectedState?.state_name === stName;
        
        for (const ring of rings) {
          if (ring.length === 0) continue;
          ctx.beginPath();
          ring.forEach(([nx, ny], ptIdx) => {
            const px = mapOriginX + nx * mapBoxWidth;
            const py = mapOriginY + ny * mapBoxHeight;
            if (ptIdx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          
          if (isSelectedOrActive) {
            ctx.fillStyle = "rgba(0, 230, 118, 0.16)";
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 230, 118, 0.65)";
            ctx.lineWidth = 1.6;
          } else {
            ctx.strokeStyle = "rgba(0, 230, 118, 0.20)";
            ctx.lineWidth = 0.8;
          }
          ctx.stroke();
        }
      }

      // Draw sovereign national perimeter (sharp prominent border with neon glow)
      ctx.beginPath();
      NIGERIA_VECTORS.national.forEach(([nx, ny], ptIdx) => {
        const px = mapOriginX + nx * mapBoxWidth;
        const py = mapOriginY + ny * mapBoxHeight;
        if (ptIdx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(0, 230, 118, 0.85)";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#00E676";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Subtle sovereign territory fill
      ctx.fillStyle = "rgba(0, 230, 118, 0.05)";
      ctx.fill();

      // 6. State Nodes Pulsing with Dynamic Rings & Inter-State Knowledge Arcs
      const pulseTime = Date.now() * 0.0035;

      states.forEach((st, idx) => {
        const normX = (st.lng - 2.69) / (14.68 - 2.69);
        const normY = 1.0 - (st.lat - 4.27) / (13.89 - 4.27);

        const x = mapOriginX + normX * mapBoxWidth;
        const y = mapOriginY + normY * mapBoxHeight;

        const distFromCenter = Math.hypot(x - centerX, y - centerY);
        if (distFromCenter > radius * 0.98) return;

        const isCurrentActive = activeNode.state_name === st.state_name;
        const isHovered = hoveredState?.state_name === st.state_name;

        const baseSize = isCurrentActive ? 6.5 : isHovered ? 5.5 : Math.min(4.8, 2.8 + Math.log10(Math.max(1, st.registered_scholars)) * 0.7);
        const pulse = Math.sin(pulseTime + idx * 0.7) * 0.5 + 0.5;

        // Pulsing radar ripples
        ctx.beginPath();
        ctx.arc(x, y, (baseSize + 3 + pulse * 6), 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive 
          ? `rgba(255, 215, 0, ${0.4 - pulse * 0.3})`
          : `rgba(0, 230, 118, ${0.35 - pulse * 0.25})`;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(x, y, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive ? "#FFD700" : isHovered ? "#38BDF8" : "#00E676";
        ctx.shadowColor = isCurrentActive ? "#FFD700" : "#00E676";
        ctx.shadowBlur = isCurrentActive ? 14 : 7;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Knowledge Arcs from Anambra
        if (st.state_name === "Anambra") {
          const destinations = states.filter(d => ["Lagos", "FCT Abuja", "Kano", "Enugu"].includes(d.state_name));
          destinations.forEach((dest, dIdx) => {
            const destNormX = (dest.lng - 2.69) / (14.68 - 2.69);
            const destNormY = 1.0 - (dest.lat - 4.27) / (13.89 - 4.27);
            const dx = mapOriginX + destNormX * mapBoxWidth;
            const dy = mapOriginY + destNormY * mapBoxHeight;

            ctx.beginPath();
            ctx.moveTo(x, y);
            const midX = (x + dx) / 2;
            const midY = Math.min(y, dy) - 18;
            ctx.quadraticCurveTo(midX, midY, dx, dy);
            ctx.strokeStyle = `rgba(0, 230, 118, ${0.45 - dIdx * 0.08})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 4]);
            ctx.lineDashOffset = -Date.now() * 0.025;
            ctx.stroke();
            ctx.setLineDash([]);
          });
        }
      });

      ctx.restore();

      // 7. Glossy Outer Horizon Rim Highlight
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.2;
      const rimGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      rimGrad.addColorStop(0, "rgba(56, 189, 248, 0.8)");
      rimGrad.addColorStop(0.5, "rgba(0, 230, 118, 0.65)");
      rimGrad.addColorStop(1, "rgba(168, 85, 247, 0.3)");
      ctx.strokeStyle = rimGrad;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [states, activeNode, hoveredState]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.44;

    const MIN_LAT = 4.27;
    const MAX_LAT = 13.89;
    const MIN_LNG = 2.69;
    const MAX_LNG = 14.68;

    const mapBoxWidth = radius * 1.55;
    const mapBoxHeight = radius * 1.35;
    const mapOriginX = centerX - mapBoxWidth / 2;
    const mapOriginY = centerY - mapBoxHeight / 2 + 5;

    let matched: StateData | null = null;
    let minDistance = 24;

    for (const st of states) {
      const normX = (st.lng - MIN_LNG) / (MAX_LNG - MIN_LNG);
      const normY = 1.0 - (st.lat - MIN_LAT) / (MAX_LAT - MIN_LAT);
      const x = mapOriginX + normX * mapBoxWidth;
      const y = mapOriginY + normY * mapBoxHeight;

      const dist = Math.hypot(clickX - x, clickY - y);
      if (dist < minDistance) {
        minDistance = dist;
        matched = st;
      }
    }

    if (matched !== null) {
      const targetState: StateData = matched;
      sfx.tap();
      triggerTmaHaptic("medium");
      setSelectedState(targetState);
      setActiveNode(targetState);
      setMascotCheer(`Inspecting ${targetState.state_name} State: ${targetState.motto} 🎓`);
    }
  };

  const triggerMascotReaction = (name: string, cheerText: string) => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setMascotCheer(cheerText);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#080B14] via-[#0C1021] to-[#060811] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] my-8">
      <SparklesCore
        background="transparent"
        minSize={0.4}
        maxSize={1.8}
        particleDensity={45}
        particleColor="#00E676"
        className="opacity-40"
      />

      {/* Top Banner Bar */}
      <div className="relative z-10 pt-6 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E676] text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            LIVE NIGERIA SOVEREIGN KNOWLEDGE GRID
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            36 States + FCT Connected • Click Any State on Map
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
            <span>5-Day National Streak</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black font-mono">
            <Users className="w-3.5 h-3.5" />
            <span>{states.reduce((acc, s) => acc + s.registered_scholars, 0).toLocaleString()} Registered Scholars</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Gen-Z Hero Copy & AI Study Companions */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
              <span>THE ENTERPRISE ACADEMIC REVOLUTION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
              The future of learning happens{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] via-teal-300 to-cyan-400">
                together.
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
              From foundational phonics with <strong className="text-amber-300">Ijapa the Turtle</strong> to senior WAEC theory mastery and 5.0 CGPA university honours. Zero data waste, authentic national pride, and pure joy every single day.
            </p>
          </div>

          {/* Interactive Mascot Companions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                Tap Your AI Study Mentors to Power Up
              </span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">+10 XP Tap Bonus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Mascot 1: Ijapa the Turtle */}
              <button
                onClick={() => triggerMascotReaction("Ijapa", "🐢 Ijapa: 'Slow and steady conquers the exam! Every big champion started with one small step today.'")}
                className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/40 hover:border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl filter drop-shadow"
                >
                  🐢
                </motion.div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                    Ijapa Turtle
                    <Star className="w-3 h-3 fill-amber-300" />
                  </div>
                  <div className="text-[10px] text-zinc-400">Primary Storyteller</div>
                </div>
              </button>

              {/* Mascot 2: Sister Amaka AI */}
              <button
                onClick={() => triggerMascotReaction("Amaka", "👩🏾‍🏫 Sister Amaka: 'Outstanding work! 15 minutes of disciplined CBT practice today guarantees your WAEC distinction.'")}
                className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/40 hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="text-3xl filter drop-shadow"
                >
                  👩🏾‍🏫
                </motion.div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#00E676] flex items-center gap-1">
                    Sister Amaka
                    <Zap className="w-3 h-3 fill-[#00E676]" />
                  </div>
                  <div className="text-[10px] text-zinc-400">JSS/SSS CBT Concierge</div>
                </div>
              </button>

              {/* Mascot 3: Professor Obi */}
              <button
                onClick={() => triggerMascotReaction("ProfObi", "👨🏾‍🔬 Prof. Obi: 'Master the first principles of calculus and logic. True academic excellence is sovereign!'")}
                className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-400/40 hover:border-purple-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="text-3xl filter drop-shadow"
                >
                  👨🏾‍🔬
                </motion.div>
                <div className="text-left">
                  <div className="text-xs font-black text-purple-300 flex items-center gap-1">
                    Prof. Obi
                    <Award className="w-3 h-3 text-purple-300" />
                  </div>
                  <div className="text-[10px] text-zinc-400">100L Campus Fellow</div>
                </div>
              </button>

            </div>

            {/* Dynamic Cheer Speech Bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mascotCheer}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-bold text-emerald-300 bg-black/60 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2 shadow-sm"
              >
                <span className="text-base">💬</span>
                <span>{mascotCheer}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <ShimmerButton
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else window.location.href = "/student";
              }}
              shimmerColor="#00E676"
              background="linear-gradient(135deg, #008751 0%, #00E676 100%)"
            >
              <span className="text-black font-black flex items-center gap-1.5">
                <span>Start Learning Free</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </ShimmerButton>

            <ShimmerButton
              onClick={() => {
                window.location.href = "/competition";
              }}
              shimmerColor="#FFD700"
              background="rgba(15, 23, 42, 0.95)"
            >
              <span className="text-amber-300 font-black flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Enter National Arena</span>
              </span>
            </ShimmerButton>
          </div>

        </div>

        {/* Right Column: Pulsating Nigeria 3D Radar Map on Holographic Globe */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          <div className="relative w-full max-w-[380px] sm:max-w-[440px] aspect-square flex items-center justify-center">
            
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className="w-full h-full cursor-pointer select-none"
              title="Click any pulsing point to inspect state members"
            />

            {/* Selected / Active Node Overlay Pin Card */}
            <div 
              onClick={() => setSelectedState(activeNode)}
              className="absolute -bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-emerald-500/50 rounded-2xl px-4 py-2.5 text-center shadow-2xl z-20 w-[92%] max-w-[310px] cursor-pointer hover:border-emerald-400 transition"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-emerald-400 font-extrabold pb-0.5 border-b border-white/5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                  Active Academic Node
                </span>
                <span className="text-zinc-400">Tap for Details ↗</span>
              </div>

              <div className="text-sm font-black text-white truncate pt-1">
                📍 {activeNode.state_name} State • "{activeNode.motto}"
              </div>

              <div className="text-[11px] text-zinc-300 flex items-center justify-center gap-2 mt-0.5">
                <span className="text-amber-300 font-black">{activeNode.registered_scholars.toLocaleString()} Scholars</span>
                <span>•</span>
                <span className="text-cyan-300 truncate max-w-[150px]">{activeNode.academic_focus}</span>
              </div>
            </div>

          </div>

          <div className="mt-4 text-[11px] font-mono text-zinc-400 flex items-center gap-2 text-center">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" />
            <span>Interactive 3D Radar • Click Any State Beacon to Inspect</span>
          </div>

        </div>

      </div>

      {/* MODAL: Comprehensive State Educational Heritage & Member Inspector */}
      {selectedState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c1020] border-2 border-emerald-500/50 p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008751] to-[#00E676] flex items-center justify-center text-black font-black text-lg shadow-md">
                  🇳🇬
                </div>
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>{selectedState.state_name} State</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                      Rank #{selectedState.rank}
                    </span>
                  </h3>
                  <p className="text-xs text-amber-300 italic font-medium">"{selectedState.motto}"</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedState(null)} 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Registered Scholars</div>
                <div className="text-xl font-black font-mono text-emerald-300">{selectedState.registered_scholars.toLocaleString()}</div>
                <div className="text-[9px] text-zinc-500">Active learners</div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Average XP</div>
                <div className="text-xl font-black font-mono text-amber-300">{Math.round(selectedState.avg_xp).toLocaleString()}</div>
                <div className="text-[9px] text-zinc-500">Per scholar</div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Geopolitical Zone</div>
                <div className="text-xs font-black text-white pt-1">{selectedState.geopolitical_zone}</div>
                <div className="text-[9px] text-zinc-500">Capital: {selectedState.capital}</div>
              </div>
            </div>

            {/* Academic Specialization & Heritage */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="font-black text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Primary Academic Strength:
                </div>
                <p className="text-white font-medium">{selectedState.academic_focus}</p>
              </div>

              {selectedState.educational_heritage && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Educational Heritage & Background:
                  </div>
                  <p className="text-zinc-300">{selectedState.educational_heritage}</p>
                </div>
              )}

              {selectedState.notable_scholars_and_heroes && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Notable Scholars & Historical Icons:
                  </div>
                  <p className="text-cyan-200">{selectedState.notable_scholars_and_heroes}</p>
                </div>
              )}
            </div>

            {/* Direct CTA */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedState(null);
                  window.location.href = `/states`;
                }}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
              >
                View Full State Directory
              </button>

              <button
                onClick={() => {
                  setSelectedState(null);
                  window.location.href = `/competition`;
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Challenge {selectedState.state_name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
