// Sonidos cortos generados con Web Audio (no requiere archivos de audio).
import { getState } from './storage.js';

let ctx = null;

function tone(freq, start, duration, type = 'sine', gain = 0.08) {
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(gain, ctx.currentTime + start);
  vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(vol).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
}

function play(notes) {
  if (!getState().settings.sound) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    notes.forEach(([freq, start, duration, type, gain]) => tone(freq, start, duration, type, gain));
  } catch {
    // Sin audio disponible: se ignora.
  }
}

export const playCorrect = () => play([[660, 0, 0.12], [880, 0.1, 0.18]]);
export const playWrong = () => play([[220, 0, 0.18, 'square', 0.04], [180, 0.15, 0.25, 'square', 0.04]]);
export const playComplete = () => play([[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.15], [1046, 0.36, 0.3]]);
