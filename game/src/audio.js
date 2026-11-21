// Shadow Lantern — tiny WebAudio synth. No audio files; created lazily on
// the first user gesture so headless screenshots stay silent.
let ctx = null;
let muted = false;
let stepTimer = 0;

export function ensureAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  } catch {
    ctx = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
export function isMuted() {
  return muted;
}

function tone(freq, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // audio is decoration; never break the game
  }
}

export function sfxLoot() {
  tone(880, 0.12, "sine", 0.09, 1320);
}
export function sfxPebble() {
  tone(220, 0.07, "triangle", 0.12, 140);
}
export function sfxAlarmTick() {
  tone(520, 0.08, "square", 0.045);
}
export function sfxCaught() {
  tone(220, 0.5, "sawtooth", 0.1, 55);
}
export function sfxWin() {
  [523, 659, 784, 1046].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, "sine", 0.09), i * 110);
  });
}
export function sfxStep(running, guardNear) {
  if (!ctx || muted) return;
  stepTimer -= 1;
  if (stepTimer > 0) return;
  stepTimer = running ? 9 : 16;
  tone(running ? 140 : 90, 0.05, "sine", guardNear ? 0.07 : 0.03);
}
export function sfxGuardStep(nearestDist) {
  if (!ctx || muted || nearestDist > 320) return;
  const vol = 0.02 + (1 - nearestDist / 320) * 0.06;
  tone(70, 0.09, "sine", vol);
}
