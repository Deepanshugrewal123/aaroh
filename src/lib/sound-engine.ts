// Web Audio API ambient synthesizer singleton for cinematic atmosphere
export class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  public init() {
    if (this.ctx) return;
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();

      // Master volume (gentle -22dB level)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Warm Lowpass Filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
      filter.connect(this.masterGain);

      // Subtle LFO modulation for breathing warmth
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      this.lfo.start();

      // Harmonic ambient drone (108Hz Root + 162Hz Perfect Fifth)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = "triangle";
      this.osc1.frequency.setValueAtTime(108, this.ctx.currentTime);
      this.osc1.connect(filter);
      this.osc1.start();

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = "sine";
      this.osc2.frequency.setValueAtTime(162, this.ctx.currentTime);
      this.osc2.connect(filter);
      this.osc2.start();
    } catch {
      // Audio context initialization failure graceful fallback
    }
  }

  public play() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.08, now + 1.2);
    this.isPlaying = true;
  }

  public pause() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    this.isPlaying = false;
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public getIsActive(): boolean {
    return this.isPlaying;
  }

  // Interactive celestial chime on user interactions
  public playChime(noteIndex = 0) {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    // Pentatonic scale frequencies in Hz (C4, D4, E4, G4, A4, C5, D5)
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
    const freq = notes[noteIndex % notes.length];

    try {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = "sine";
      chimeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Delicate envelope: fast 15ms attack, soft 1.4s release
      const now = this.ctx.currentTime;
      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.linearRampToValueAtTime(0.045, now + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start(now);
      chimeOsc.stop(now + 1.45);
    } catch {
      // Audio context chime fallback
    }
  }
}

export const soundEngine =
  typeof window !== "undefined" ? new AmbientSoundEngine() : new AmbientSoundEngine();
