// Synthesize pleasant notification sounds using Web Audio API (Zero external assets needed)

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play an ascending melodic chime when Focus ends
  playFocusComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.65);
      });
    } catch (e) {
      console.warn('Audio playback not permitted or failed', e);
    }
  }

  // Play a soft mellow bell when Rest ends
  playRestComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [587.33, 880.00]; // D5, A5
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.18);

        gain.gain.setValueAtTime(0, now + index * 0.18);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.18 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.18 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.18);
        osc.stop(now + index * 0.18 + 0.85);
      });
    } catch (e) {
      console.warn('Audio playback not permitted or failed', e);
    }
  }
}

export const soundManager = new SoundManager();
