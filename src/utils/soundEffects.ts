// Web Audio API based sound synthesizer for Chatbot & Interactive events
class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastTypingTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('processinghub_chat_sound_muted');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      } catch {
        // ignore localStorage error
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('processinghub_chat_sound_muted', String(this.isMuted));
      } catch {
        // ignore
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('processinghub_chat_sound_muted', String(muted));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play a pleasant two-tone incoming reply chime
   */
  public playReplyChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Note 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: 880.00 Hz (A5) with slight delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  }

  /**
   * Play a subtle, tactile typing tick sound (throttled to avoid cacophony)
   */
  public playTypingTick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const currentTime = Date.now();
    // Throttle typing sound to at least 45ms between ticks
    if (currentTime - this.lastTypingTime < 45) return;
    this.lastTypingTime = currentTime;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Randomize pitch slightly for organic typing feel
    const randomFreq = 420 + Math.random() * 140;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomFreq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Play soft pop sound on sending a message
   */
  public playSendPop(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Play subtle, high-clarity crisp 'pop/click' sound when message is marked as read
   */
  public playReadCheckPop(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Subtle crisp acoustic snap from 650Hz to 980Hz
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Play subtle open/close toggle sound
   */
  public playToggleSound(isOpen: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (isOpen) {
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.09);
    }

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const soundEffects = new SoundManager();
