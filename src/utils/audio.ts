// Web Audio API generator for ambient soundscapes & audio feedback
// No external dependencies or network requests needed - zero 404 risk

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private currentCategory: string = 'Acoustic ambient';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume * 0.3,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume * 0.3,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentCategory(): string {
    return this.currentCategory;
  }

  public stop() {
    this.isPlaying = false;
    this.cleanupNodes();
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch (e) {
          // ignore disconnect errors
        }
      }
    });
    this.activeNodes = [];
  }

  public play(category: string = 'Acoustic ambient') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.isPlaying = true;
    this.currentCategory = category;

    switch (category) {
      case 'Focus':
        this.startFocusSound();
        break;
      case 'Lo-fi':
        this.startLofiSound();
        break;
      case 'Calm':
        this.startCalmSound();
        break;
      case 'Productivity':
        this.startProductivitySound();
        break;
      case 'Acoustic ambient':
      default:
        this.startAcousticSound();
        break;
    }
  }

  // 1. Acoustic ambient: Warm layered harmonic drones (E maj / B maj chords)
  private startAcousticSound() {
    if (!this.ctx || !this.masterGain) return;

    const notes = [164.81, 246.94, 329.63, 493.88, 659.25]; // E3, B3, E4, B4, E5
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + i * 80, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / (i + 1), this.ctx.currentTime);

      // Subtle vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + i * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.activeNodes.push(osc, filter, gain, lfo, lfoGain);
    });
  }

  // 2. Focus: Alpha wave 10Hz binaural beat with soft filtered pink noise
  private startFocusSound() {
    if (!this.ctx || !this.masterGain) return;

    // Binaural carriers (200Hz Left, 210Hz Right)
    const baseFreq = 216;
    const beatFreq = 10;

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();

    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    gainL.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.1, this.ctx.currentTime);

    if (panL && panR) {
      panL.pan.setValueAtTime(-0.8, this.ctx.currentTime);
      panR.pan.setValueAtTime(0.8, this.ctx.currentTime);
      oscL.connect(gainL);
      gainL.connect(panL);
      panL.connect(this.masterGain);

      oscR.connect(gainR);
      gainR.connect(panR);
      panR.connect(this.masterGain);
      this.activeNodes.push(panL, panR);
    } else {
      oscL.connect(gainL);
      gainL.connect(this.masterGain);
      oscR.connect(gainR);
      gainR.connect(this.masterGain);
    }

    oscL.start();
    oscR.start();
    this.activeNodes.push(oscL, oscR, gainL, gainR);
  }

  // 3. Lo-fi: Warm sub bass, Rhodes-style minor 7th chord swells
  private startLofiSound() {
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
    ];
    let chordIdx = 0;

    const gainChord = this.ctx.createGain();
    gainChord.gain.setValueAtTime(0.12, this.ctx.currentTime);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    filter.connect(gainChord);
    gainChord.connect(this.masterGain);
    this.activeNodes.push(gainChord, filter);

    const oscs: OscillatorNode[] = [];
    chords[0].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(filter);
      osc.start();
      oscs.push(osc);
      this.activeNodes.push(osc);
    });

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      chordIdx = (chordIdx + 1) % chords.length;
      const nextChord = chords[chordIdx];
      oscs.forEach((osc, i) => {
        if (nextChord[i]) {
          osc.frequency.setTargetAtTime(nextChord[i], this.ctx!.currentTime, 1.2);
        }
      });
    }, 4500);

    this.activeNodes.push(interval);
  }

  // 4. Calm: Slow breathing warm ocean pads
  private startCalmSound() {
    if (!this.ctx || !this.masterGain) return;

    const freqs = [130.81, 196.0, 261.63, 392.0]; // C3, G3, C4, G4
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      // Slow breathing swell
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12 + i * 0.02, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      lfo.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();
      this.activeNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  // 5. Productivity: Soft rhythmic pulsing chimes
  private startProductivitySound() {
    if (!this.ctx || !this.masterGain) return;

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // Pentatonic C
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    chimeGain.connect(this.masterGain);
    this.activeNodes.push(chimeGain);

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

      osc.connect(noteGain);
      noteGain.connect(chimeGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);
    }, 1800);

    this.activeNodes.push(interval);
  }

  // Chime for timer finish
  public playTimerChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime + i * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  }
}

export const soundEngine = new AmbientSoundEngine();
