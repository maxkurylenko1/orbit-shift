import {
  getAmbientProfile,
  getCountdownFrequency,
  getPickupFrequency,
  getSwitchToneProfile,
} from './audioDesign';

const MASTER_GAIN = 0.5;
const SILENCE_GAIN = 0.0001;
const MUTE_RAMP_SECONDS = 0.035;
const AMBIENT_SMOOTHING_SECONDS = 0.18;

export class GameAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientBase: OscillatorNode | null = null;
  private ambientHarmonic: OscillatorNode | null = null;
  private ambientPulse: OscillatorNode | null = null;
  private ambientPulseDepth: GainNode | null = null;
  private ambientDrift: OscillatorNode | null = null;
  private ambientDriftDepth: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private muted = false;
  private lastAmbientIntensity = -1;
  private lastAmbientSurge = -1;

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

    const profile = getAmbientProfile(0, 0);
    const ambientGain = context.createGain();
    const filter = context.createBiquadFilter();
    const base = context.createOscillator();
    const baseLevel = context.createGain();
    const harmonic = context.createOscillator();
    const harmonicLevel = context.createGain();
    const pulse = context.createOscillator();
    const pulseDepth = context.createGain();
    const drift = context.createOscillator();
    const driftDepth = context.createGain();

    ambientGain.gain.value = profile.gain;

    filter.type = 'lowpass';
    filter.frequency.value = profile.filterFrequency;
    filter.Q.value = 0.8;

    base.type = 'sine';
    base.frequency.value = profile.baseFrequency;
    baseLevel.gain.value = 0.92;

    harmonic.type = 'triangle';
    harmonic.frequency.value = profile.harmonicFrequency;
    harmonicLevel.gain.value = 0.2;

    pulse.type = 'sine';
    pulse.frequency.value = profile.pulseRate;
    pulseDepth.gain.value = profile.pulseDepth;

    drift.type = 'sine';
    drift.frequency.value = 0.085;
    driftDepth.gain.value = 55;

    base.connect(baseLevel);
    baseLevel.connect(filter);
    harmonic.connect(harmonicLevel);
    harmonicLevel.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(masterGain);

    pulse.connect(pulseDepth);
    pulseDepth.connect(ambientGain.gain);

    drift.connect(driftDepth);
    driftDepth.connect(filter.frequency);

    base.start();
    harmonic.start();
    pulse.start();
    drift.start();

    this.ambientGain = ambientGain;
    this.ambientFilter = filter;
    this.ambientBase = base;
    this.ambientHarmonic = harmonic;
    this.ambientPulse = pulse;
    this.ambientPulseDepth = pulseDepth;
    this.ambientDrift = drift;
    this.ambientDriftDepth = driftDepth;
    this.ambientOscillators = [base, harmonic, pulse, drift];
    this.lastAmbientIntensity = 0;
    this.lastAmbientSurge = 0;
  }

  public setAmbientIntensity(
    intensity: number,
    surgeStrength: number,
  ): void {
    const context = this.context;
    const ambientGain = this.ambientGain;
    const filter = this.ambientFilter;
    const base = this.ambientBase;
    const harmonic = this.ambientHarmonic;
    const pulse = this.ambientPulse;
    const pulseDepth = this.ambientPulseDepth;

    if (
      !context ||
      !ambientGain ||
      !filter ||
      !base ||
      !harmonic ||
      !pulse ||
      !pulseDepth
    ) {
      return;
    }

    const safeIntensity = Math.max(0, Math.min(1, intensity));
    const safeSurge = Math.max(0, Math.min(1, surgeStrength));

    if (
      Math.abs(safeIntensity - this.lastAmbientIntensity) < 0.015 &&
      Math.abs(safeSurge - this.lastAmbientSurge) < 0.02
    ) {
      return;
    }

    this.lastAmbientIntensity = safeIntensity;
    this.lastAmbientSurge = safeSurge;

    const profile = getAmbientProfile(safeIntensity, safeSurge);
    const now = context.currentTime;

    ambientGain.gain.setTargetAtTime(
      profile.gain,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
    filter.frequency.setTargetAtTime(
      profile.filterFrequency,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
    base.frequency.setTargetAtTime(
      profile.baseFrequency,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
    harmonic.frequency.setTargetAtTime(
      profile.harmonicFrequency,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
    pulse.frequency.setTargetAtTime(
      profile.pulseRate,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
    pulseDepth.gain.setTargetAtTime(
      profile.pulseDepth,
      now,
      AMBIENT_SMOOTHING_SECONDS,
    );
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
    this.ambientFilter?.disconnect();
    this.ambientPulseDepth?.disconnect();
    this.ambientDriftDepth?.disconnect();
    this.ambientGain = null;
    this.ambientFilter = null;
    this.ambientBase = null;
    this.ambientHarmonic = null;
    this.ambientPulse = null;
    this.ambientPulseDepth = null;
    this.ambientDrift = null;
    this.ambientDriftDepth = null;
    this.lastAmbientIntensity = -1;
    this.lastAmbientSurge = -1;
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

  public playSurge(tier: number): void {
    const safeTier = Math.max(0, Math.min(4, Math.floor(tier)));
    const base = 210 + safeTier * 28;

    this.playSweep(base, base * 1.85, 0.2, 0.075, 'triangle');
    this.playTone(base * 0.5, 0.18, 0.055, 'sine', 0.025);
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
