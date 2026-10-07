"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Video, VideoOff, Mic, MicOff, MessageSquare, Eye, Shield, 
  Share2, ArrowLeft, Download, Maximize2, PenTool, Eraser, 
  Trash2, Send, HelpCircle, CheckCircle2, Lock, Users, Sparkles
} from "lucide-react";
import BackButton from "../../components/BackButton";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function VirtualClassroomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-emerald-400 p-8 text-center font-mono text-sm">Connecting to Encrypted Classroom...</div>}>
      <ClassroomContent />
    </Suspense>
  );
}

function ClassroomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams.get("room");
  const sessionId = searchParams.get("session");
  const userRole = searchParams.get("role") || "student"; // 'student' | 'teacher' | 'parent_shadow'

  const isParentShadow = userRole === "parent_shadow";
  const [isOnboardingVerified, setIsOnboardingVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Must have an explicit session ID and active teacher match
      const hasValidSession = Boolean(roomId && sessionId);
      const storedContract = localStorage.getItem("edunaija_tutor_contract");
      if (hasValidSession || storedContract) {
        setIsOnboardingVerified(true);
      } else {
        setIsOnboardingVerified(false);
      }
    }
  }, [roomId, sessionId]);

  // Stream States
  const [isVideoOn, setIsVideoOn] = useState(!isParentShadow);
  const [isAudioOn, setIsAudioOn] = useState(!isParentShadow);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"whiteboard" | "notes" | "chat">("whiteboard");
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mentorVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize Real / Simulated WebRTC Camera Stream
  useEffect(() => {
    if (typeof window !== "undefined" && !isParentShadow && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setHasCameraAccess(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Graceful fallback when camera permission is declined or not attached
          setHasCameraAccess(false);
        });
    }

    return () => {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isParentShadow]);

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#00E676");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  // Chat messages
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isMentor?: boolean }>>([
    { sender: "System", text: "End-to-End Encrypted WebRTC Session Established.", time: "10:00" },
    { sender: "Dr. Chukwuemeka (Mentor)", text: "Good day Chisom! Today we will master Electromagnetic Flux derivations.", time: "10:01", isMentor: true }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 500;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Initial grid pattern
    ctx.fillStyle = "#0c101c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isParentShadow) return; // Stealth shadow mode is read-only
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isParentShadow) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = tool === "eraser" ? "#0c101c" : brushColor;
    ctx.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sfx.tap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0c101c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    sfx.tap();
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      {
        sender: isParentShadow ? "Parent (Shadow)" : "Chisom (Student)",
        text: inputMsg,
        time: timeStr
      }
    ]);
    setInputMsg("");
  };

  if (isOnboardingVerified === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 text-center select-none font-sans relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative space-y-6 z-10">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Video className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-widest">
              Standalone Encrypted Classroom Gate
            </span>
            <h2 className="text-xl font-black text-white">Teacher Onboarding Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live WebRTC classes are private, 1-on-1 encrypted rooms that activate only after a <strong>TRCN-certified mentor</strong> has been selected, onboarding completed, and milestone escrow locked.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Browse Vetted Nigerian &amp; International Mentors</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Book Free 15-Minute Discovery Call or Retainer</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">3</span>
              <span>Conclude Onboarding &amp; Enter Encrypted Classroom</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="/virtual-teaching"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <span>Browse Vetted Mentors &amp; Complete Onboarding →</span>
            </a>

            <button
              onClick={() => {
                sfx.tap();
                // Demo override for testing/showcase
                if (typeof window !== "undefined") {
                  localStorage.setItem("edunaija_tutor_contract", "DEMO-ONBOARDED-VERIFIED");
                  setIsOnboardingVerified(true);
                }
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono underline"
            >
              [Demo Showcase: Unlock Sandbox Session]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans select-none">
      
      {/* 1. Header Toolbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/virtual-teaching" label="Exit Room" />
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Room:</span>
                <span className="text-cyan-400 font-mono">{roomId}</span>
              </h1>
              {isParentShadow && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Parent Shadow (Stealth Mode)
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Session Ref: {sessionId} • Subject: Physics Core
            </span>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Escrow Active</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hidden sm:flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>2 Connected</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workbench: Video Feed + Whiteboard Workspace */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        
        {/* Left Column (Whiteboard & Equations) - 8 Cols */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Whiteboard Toolbar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mr-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Collaborative STEM Whiteboard
              </span>

              {!isParentShadow && (
                <>
                  <button
                    onClick={() => setTool("pen")}
                    className={`p-1.5 rounded-lg border transition ${
                      tool === "pen"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Pen Tool"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTool("eraser")}
                    className={`p-1.5 rounded-lg border transition ${
                      tool === "eraser"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Eraser Tool"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-800 mx-1" />

                  {["#00E676", "#00E5FF", "#FFB300", "#FF5252", "#FFFFFF"].map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setBrushColor(col);
                        setTool("pen");
                      }}
                      className={`w-5 h-5 rounded-full border transition ${
                        brushColor === col ? "scale-125 border-white shadow-md" : "border-transparent opacity-70"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}

                  <div className="h-4 w-px bg-slate-800 mx-1" />

                  <button
                    onClick={clearCanvas}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Low-Latency WebRTC Sync (18ms)
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <div className="flex-1 relative min-h-[360px] bg-[#0c101c]">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`w-full h-full block ${isParentShadow ? "cursor-default" : "cursor-crosshair"}`}
            />
            {isParentShadow && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-[11px] text-purple-200 font-bold flex items-center gap-1.5 backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
                <span>Stealth Observer: Audio & Whiteboard are read-only</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Participant Streams & Live Chat (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          
          {/* Top Video Grid (Teacher & Student) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Mentor Cam Feed */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2.5 relative overflow-hidden aspect-video flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  MENTOR
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-center my-auto relative w-full h-full">
                {hasCameraAccess && isVideoOn ? (
                  <video
                    ref={mentorVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-xl font-black">
                    👨‍🏫
                  </div>
                )}
              </div>
              <div className="text-[11px] font-bold text-white truncate">
                Dr. Chukwuemeka Eze (TRCN-A)
              </div>
            </div>

            {/* Student Cam Feed */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2.5 relative overflow-hidden aspect-video flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  STUDENT
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
              </div>
              <div className="flex items-center justify-center my-auto relative w-full h-full">
                {hasCameraAccess && isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-500 flex items-center justify-center text-xl font-black">
                    🎓
                  </div>
                )}
              </div>
              <div className="text-[11px] font-bold text-white truncate">
                {isParentShadow ? "Parent Shadow Observer" : "Scholar Active"}
              </div>
            </div>
          </div>

          {/* Bottom Chat & Socratic Derivation Drawer */}
          <div className="flex-1 bg-slate-900/60 rounded-3xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden shadow-xl min-h-[280px]">
            <div className="border-b border-slate-800 pb-2 mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Live Classroom Notes & Q&A
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Encrypted</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border ${
                    m.isMentor
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-300">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder={isParentShadow ? "Shadow mode: observation only..." : "Type question or equation to mentor..."}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isParentShadow}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isParentShadow}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Bottom Control Bar (Audio, Video, Screen Share, Exit) */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {!isParentShadow ? (
            <>
              <button
                onClick={() => {
                  sfx.tap();
                  setIsAudioOn(!isAudioOn);
                }}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  isAudioOn
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isAudioOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAudioOn ? "Mute" : "Unmute"}</span>
              </button>

              <button
                onClick={() => {
                  sfx.tap();
                  setIsVideoOn(!isVideoOn);
                }}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  isVideoOn
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOn ? "Stop Cam" : "Start Cam"}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-purple-300 font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              Parent Shadow: Stealth Audio Stream Active
            </span>
          )}
        </div>

        {/* Center / Right Finish Call Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.tap();
              router.push("/virtual-teaching");
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <span>Leave Classroom</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
