"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Activity, Award, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface PhonemeSpectrogramProps {
  targetWord?: string;
  targetIPA?: string;
  targetF1?: number; // Formant 1 Hz (vowel height)
  targetF2?: number; // Formant 2 Hz (vowel backness)
  onScore?: (score: number) => void;
}

export default function PhonemSpectrogram({
  targetWord = "FLEET",
  targetIPA = "/iː/",
  targetF1 = 270,
  targetF2 = 2290,
  onScore
}: PhonemeSpectrogramProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectedF1, setDetectedF1] = useState<number | null>(null);
  const [detectedF2, setDetectedF2] = useState<number | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop recording cleanup
  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startAnalysisSession = async () => {
    setPermissionError(null);
    setDetectedF1(null);
    setDetectedF2(null);
    setMatchScore(null);

    // 3 second countdown before recording starts
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countInterval);
          startMicrophoneStream();
          return null;
        }
        sfx.tap();
        return prev - 1;
      });
    }, 1000);
  };

  const startMicrophoneStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsRecording(true);
      sfx.tap();
      triggerTmaHaptic("medium");

      // Draw real-time FFT spectrogram loop
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = audioCtx.sampleRate;

      let recordedSamples: { f1: number; f2: number }[] = [];
      let frameCount = 0;

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = "#090a12";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw frequency heatmap bars
        const barWidth = (canvas.width / bufferLength) * 4;
        let x = 0;

        // Peak formant detection (F1 in 200-900Hz, F2 in 700-2500Hz)
        let peakF1 = { val: 0, freq: 0 };
        let peakF2 = { val: 0, freq: 0 };

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const freq = (i * sampleRate) / (analyser.fftSize);

          if (freq >= 200 && freq <= 900 && dataArray[i] > peakF1.val) {
            peakF1 = { val: dataArray[i], freq: Math.round(freq) };
          }
          if (freq > 900 && freq <= 2600 && dataArray[i] > peakF2.val) {
            peakF2 = { val: dataArray[i], freq: Math.round(freq) };
          }

          // Gradient color by intensity
          const hue = 250 - (dataArray[i] / 255) * 180; // violet to amber
          ctx.fillStyle = `hsl(${hue}, 90%, 50%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
          if (x > canvas.width) break;
        }

        // Draw target formant lines (crosshairs)
        const f1Y = canvas.height - ((peakF1.val / 255) * canvas.height || 20);
        ctx.strokeStyle = "rgba(52, 211, 153, 0.6)"; // emerald
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, f1Y);
        ctx.lineTo(canvas.width, f1Y);
        ctx.stroke();

        if (peakF1.val > 60 && peakF2.val > 50) {
          recordedSamples.push({ f1: peakF1.freq, f2: peakF2.freq });
        }

        frameCount++;
        // Auto-stop after 3 seconds (~180 frames at 60fps)
        if (frameCount < 180) {
          animationFrameRef.current = requestAnimationFrame(draw);
        } else {
          // Finish recording & evaluate match
          stopRecording();

          if (recordedSamples.length > 0) {
            const avgF1 = Math.round(
              recordedSamples.reduce((acc, s) => acc + s.f1, 0) / recordedSamples.length
            );
            const avgF2 = Math.round(
              recordedSamples.reduce((acc, s) => acc + s.f2, 0) / recordedSamples.length
            );

            setDetectedF1(avgF1);
            setDetectedF2(avgF2);

            // Compute Euclidean distance to canonical IPA target
            const deltaF1 = Math.abs(avgF1 - targetF1);
            const deltaF2 = Math.abs(avgF2 - targetF2);
            const penalty = (deltaF1 * 0.5 + deltaF2 * 0.25) / 10;
            const score = Math.max(30, Math.min(98, Math.round(100 - penalty)));

            setMatchScore(score);
            if (onScore) onScore(score);

            if (score >= 75) {
              sfx.correct();
              triggerTmaHaptic("success");
            } else {
              sfx.wrong();
              triggerTmaHaptic("error");
            }
          }
        }
      };

      animationFrameRef.current = requestAnimationFrame(draw);
    } catch (err: any) {
      setPermissionError(err.message || "Microphone access denied. Please grant permission.");
      setIsRecording(false);
    }
  };

  return (
    <div className="rounded-3xl bg-[#090b14] border border-indigo-500/30 p-5 space-y-4 shadow-xl">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Oral Acoustic Spectrogram
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Web Audio FFT
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Real-time Formant Analysis (F1/F2) vs Received Pronunciation
            </p>
          </div>
        </div>

        {/* Target Badge */}
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-right">
          <span className="text-[10px] text-zinc-400 block font-mono">Target:</span>
          <span className="text-xs font-black text-amber-300 font-mono">{targetWord} {targetIPA}</span>
        </div>
      </div>

      {/* Realtime Canvas Spectrogram Display */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
        <canvas 
          ref={canvasRef} 
          width={512} 
          height={120} 
          className="w-full h-28 block"
        />

        {/* Overlay when idle or counting down */}
        {!isRecording && matchScore === null && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            {countdown !== null ? (
              <div className="text-center space-y-1">
                <span className="text-4xl font-black text-amber-400 animate-ping block">
                  {countdown}
                </span>
                <span className="text-xs text-zinc-300 font-mono">Get ready to articulate clearly...</span>
              </div>
            ) : (
              <button
                onClick={startAnalysisSession}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                Record Oral Articulation (3s)
              </button>
            )}
          </div>
        )}

        {isRecording && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Analyzing Formants...
          </div>
        )}
      </div>

      {permissionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Post-Session Acoustic Result */}
      {matchScore !== null && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              {matchScore >= 75 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              {matchScore >= 75 ? "Phonetically Aligned!" : "Articulatory Adjustment Needed"}
            </span>

            <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Acoustic Match: {matchScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-zinc-500 block">Detected Formant 1 (Height):</span>
              <strong className="text-white">{detectedF1 || 0} Hz</strong>
              <span className="text-zinc-500 text-[10px] ml-1">(Target: {targetF1} Hz)</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-zinc-500 block">Detected Formant 2 (Backness):</span>
              <strong className="text-white">{detectedF2 || 0} Hz</strong>
              <span className="text-zinc-500 text-[10px] ml-1">(Target: {targetF2} Hz)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-zinc-400">
              {matchScore >= 75 
                ? "Your tongue position and vowel length match British RP standard tested in JAMB."
                : "Try opening your mouth slightly wider to reach the target vowel formant peak."}
            </p>

            <button
              onClick={startAnalysisSession}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-2"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
