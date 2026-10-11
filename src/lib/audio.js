// FinLeap Sound Effects Engine using Web Audio API
// Generates clean, instant procedural audio for correct and wrong answers.
// Requires zero external audio files, works offline, zero network latency.

const SOUND_STORAGE_KEY = 'lf_sound_enabled';

let soundEnabled = true;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  }
} catch (e) {
  // localStorage not available
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    }
  } catch (e) {
    // ignore
  }
  // Dispatch custom event so UI components can re-render if needed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lf:sound-toggle', { detail: { enabled: soundEnabled } }));
  }
  return soundEnabled;
}

export function toggleSound() {
  return setSoundEnabled(!soundEnabled);
}

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    try {
      audioCtx = new AudioCtx();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a sparkling, upbeat ascending major chime for correct answers.
 */
export function playCorrectSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ascending arpeggio notes (C5, E5, G5, C6)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.18, gain: 0.14 },
      { freq: 659.25, time: 0.07, dur: 0.20, gain: 0.16 },
      { freq: 783.99, time: 0.14, dur: 0.22, gain: 0.18 },
      { freq: 1046.50, time: 0.21, dur: 0.38, gain: 0.22 },
    ];

    notes.forEach(({ freq, time, dur, gain }) => {
      const start = now + time;
      
      // Main tone (sine wave for pure chime)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.linearRampToValueAtTime(gain, start + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.02);

      // Subtle warm harmonic overtone (triangle wave)
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();

      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 2, start);

      harmGain.gain.setValueAtTime(0.0001, start);
      harmGain.gain.linearRampToValueAtTime(gain * 0.25, start + 0.015);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.6);

      harm.connect(harmGain);
      harmGain.connect(ctx.destination);

      harm.start(start);
      harm.stop(start + dur + 0.02);
    });
  } catch (err) {
    // Silently continue if audio cannot play
  }
}

/**
 * Play a gentle, low descending two-tone "try again" sound for incorrect answers.
 */
export function playWrongSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Gentle descending notes (Eb4 -> Bb3) - warm and informative, not harsh
    const notes = [
      { freq: 311.13, time: 0, dur: 0.16, gain: 0.18 },
      { freq: 233.08, time: 0.12, dur: 0.26, gain: 0.16 },
    ];

    notes.forEach(({ freq, time, dur, gain }) => {
      const start = now + time;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // Warm, soft wave
      osc.frequency.setValueAtTime(freq, start);
      // Slight pitch droop for intuitive "uh-oh" feedback
      osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.88, 50), start + dur);

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.linearRampToValueAtTime(gain, start + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch (err) {
    // Silently continue if audio cannot play
  }
}
