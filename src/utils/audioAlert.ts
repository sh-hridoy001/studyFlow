export type SoundEffectType = 'zen_bell' | 'marimba' | 'crystal' | 'digital';

let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a synthesized audio alert using the Web Audio API
 */
export function playAlertSound(type: SoundEffectType, volume: number = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'zen_bell': {
      // 528 Hz (Solfeggio frequency) with warm overtone decay
      const freqs = [528, 1056, 1584];
      const gains = [0.6, 0.25, 0.15];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 3.0);
      });
      break;
    }

    case 'marimba': {
      // Warm 4-note ascending chord (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + i * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.5, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(noteStart);
        osc.stop(noteStart + 0.85);
      });
      break;
    }

    case 'crystal': {
      // Shimmering triple crystal chime
      const freqs = [880, 1108.73, 1318.51, 1760];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.4, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(noteStart);
        osc.stop(noteStart + 1.8);
      });
      break;
    }

    case 'digital':
    default: {
      // Clean modern dual beep
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + offset;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, start); // B5

        gain.gain.setValueAtTime(0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.14);
      });
      break;
    }
  }
}

/**
 * Single tick sound for optional ambient timer sound
 */
export function playTickSound(volume: number = 0.2): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(volume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Stops any ambient audio background
 */
export function stopAmbientSound(): void {
  if (ambientSource) {
    try {
      (ambientSource as AudioBufferSourceNode).stop();
    } catch {
      // ignore
    }
    ambientSource.disconnect();
    ambientSource = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
}

/**
 * Starts continuous soft rain / white noise ambient sound
 */
export function startAmbientNoise(volume: number = 0.3): void {
  stopAmbientSound();
  const ctx = getAudioContext();
  if (!ctx) return;

  // Generate 2 seconds of pinkish noise buffer looped
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    data[i] = (b0 + b1 + b2) * 0.15;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Filter to soften into gentle rainfall/ambient breeze
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  ambientSource = noise;
  ambientGain = gain;
}
