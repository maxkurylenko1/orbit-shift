import {
  getCountdownFrequency,
  getPickupFrequency,
  getSwitchToneProfile,
} from './audioDesign';

const MASTER_GAIN = 0.5;
const AMBIENT_GAIN = 0.025;
const SILENCE_GAIN = 0.0001;
const MUTE_RAMP_SECONDS = 0.035;

export class GameAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private muted = false;

  public get isMuted(): boolean {
    return this.muted;
  }

  public unlock(): void {
    const context = this.ensureContext();

    if (!context || context.state !== 'suspended') {
      return;
    }

    void context.resume().catch(() => undefined);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain();
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.muted);

    return this.muted;
  }

  public startAmbient(): void {
    const context = this.ensureContext();
    const masterGain = this.masterGain;

    if (!context || !masterGain || this.ambientOscillators.length > 0) {
      return;
    }

    const ambientGain = context.createGain();
    const filter = context.createBiquadFilter();
    const base = context.createOscillator();
    const harmonic = context.createOscillator();

    ambientGain.gain.value = AMBIENT_GAIN;
    filter.type = 'lowpass';
    filter.frequency.value = 210;
    filter.Q.value = 0.65;

    base.type = 'sine';
    base.frequency.value = 46;
    harmonic.type = 'triangle';
    harmonic.frequency.value = 92;

    base.connect(filter);
    harmonic.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(masterGain);

    base.start();
    harmonic.start();

    this.ambientGain = ambientGain;
    this.ambientOscillators = [base, harmonic];
  }

  public stopAmbient(): void {
    for (const oscillator of this.ambientOscillators) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped by the browser.
      }
      oscillator.disconnect();
    }

    this.ambientOscillators.length = 0;
    this.ambientGain?.disconnect();
    this.ambientGain = null;
  }

  public playSwitch(): void {
    const profile = getSwitchToneProfile();

    this.playSweep(
      profile.startFrequency,
      profile.endFrequency,
      profile.durationSeconds,
      0.075,
      'triangle',
    );
  }

  public playPickup(multiplier: number): void {
    const baseFrequency = getPickupFrequency(multiplier);

    this.playTone(baseFrequency, 0.09, 0.1, 'sine');
    this.playTone(baseFrequency * 1.48, 0.11, 0.07, 'triangle', 0.045);

    if (multiplier > 1) {
      this.playTone(
        baseFrequency * 1.9,
        0.08,
        Math.min(0.08, 0.035 + multiplier * 0.008),
        'sine',
        0.09,
      );
    }
  }

  public playCollision(): void {
    this.playSweep(150, 58, 0.26, 0.18, 'sawtooth');
    this.playNoiseBurst(0.18, 0.1);
  }

  public playCountdown(label: string): void {
    const frequency = getCountdownFrequency(label);

    if (frequency === null) {
      return;
    }

    const isGo = label === 'GO';
    this.playTone(
      frequency,
      isGo ? 0.14 : 0.075,
      isGo ? 0.1 : 0.055,
      isGo ? 'triangle' : 'sine',
    );
  }

  public destroy(): void {
    this.stopAmbient();
    this.masterGain?.disconnect();
    this.masterGain = null;

    if (this.context) {
      void this.context.close().catch(() => undefined);
      this.context = null;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) {
      return this.context;
    }

    if (typeof AudioContext === 'undefined') {
      return null;
    }

    try {
      const context = new AudioContext();
      const masterGain = context.createGain();

      masterGain.gain.value = this.muted ? 0 : MASTER_GAIN;
      masterGain.connect(context.destination);

      this.context = context;
      this.masterGain = masterGain;

      return context;
    } catch {
      return null;
    }
  }

  private applyMasterGain(): void {
    const context = this.context;
    const masterGain = this.masterGain;

    if (!context || !masterGain) {
      return;
    }

    const target = this.muted ? 0 : MASTER_GAIN;
    const now = context.currentTime;

    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(
      target,
      now,
      MUTE_RAMP_SECONDS,
    );
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    peakGain: number,
    type: OscillatorType,
    delaySeconds = 0,
  ): void {
    const context = this.ensureContext();
    const masterGain = this.masterGain;

    if (!context || !masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + Math.max(0, delaySeconds);
    const duration = Math.max(0.02, durationSeconds);
    const endTime = startTime + duration;
    const attackEnd = Math.min(
      endTime,
      startTime + Math.min(0.012, duration * 0.35),
    );

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), startTime);

    gain.gain.setValueAtTime(SILENCE_GAIN, startTime);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(SILENCE_GAIN, peakGain),
      attackEnd,
    );
    gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, endTime);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }

  private playSweep(
    startFrequency: number,
    endFrequency: number,
    durationSeconds: number,
    peakGain: number,
    type: OscillatorType,
  ): void {
    const context = this.ensureContext();
    const masterGain = this.masterGain;

    if (!context || !masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime;
    const duration = Math.max(0.03, durationSeconds);
    const endTime = startTime + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      Math.max(20, startFrequency),
      startTime,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      endTime,
    );

    gain.gain.setValueAtTime(SILENCE_GAIN, startTime);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(SILENCE_GAIN, peakGain),
      startTime + Math.min(0.012, duration * 0.3),
    );
    gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, endTime);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }

  private playNoiseBurst(durationSeconds: number, peakGain: number): void {
    const context = this.ensureContext();
    const masterGain = this.masterGain;

    if (!context || !masterGain) {
      return;
    }

    const duration = Math.max(0.03, durationSeconds);
    const sampleCount = Math.max(
      1,
      Math.floor(context.sampleRate * duration),
    );
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const startTime = context.currentTime;
    const endTime = startTime + duration;

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 720;
    filter.Q.value = 0.8;

    gain.gain.setValueAtTime(
      Math.max(SILENCE_GAIN, peakGain),
      startTime,
    );
    gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, endTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(startTime);
    source.stop(endTime);
    source.addEventListener('ended', () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    });
  }
}
