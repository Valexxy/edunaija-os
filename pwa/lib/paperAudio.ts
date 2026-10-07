/**
 * EduNaija OS: Zero-Asset Acoustic Paper Turn & Book Flutter Synthesizer
 * Uses native Web Audio API to create authentic pink-noise friction,
 * bandpass filter sweep, and dynamic gain envelope mimicking real paper pages.
 */

class PaperAudioEngine {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Generates a realistic tactile page turn whoosh & paper rustle
   */
  playPageTurn(speed: "normal" | "brisk" = "normal") {
    try {
      this.initContext();
      if (!this.ctx) return;

      const duration = speed === "brisk" ? 0.22 : 0.35;
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate soft organic friction noise (Pink/Brown noise algorithm)
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.14;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter sweep mimicking paper curvature and air displacement
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(1.9, now);
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(650, now + duration);

      // Organic volume envelope (quick rise, gentle fluttering taper)
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.24, now + duration * 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
    } catch {
      // Gracefully suppress in environments where audio context is restricted
    }
  }

  /**
   * Pleasant chime when completing a chapter
   */
  playBookmarkChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }
}

export const paperAudio = new PaperAudioEngine();
