// Shadow Lantern — game loop + state machine (title / playing / win / caught / paused).
import { W, H, THIEF, PEBBLE, SCORE, ALARM } from "./config.js";
import { LOOT, THIEF_START, GATE, PATROLS, GUARD_STARTS } from "./world.js";
import { Guard } from "./guards.js";
import { createInput } from "./input.js";
import { resolveCollision, inLight, inGrass } from "./stealth.js";
import { render } from "./render.js";
import { applyShot } from "./shots.js";
import {
  ensureAudio,
  toggleMute,
  sfxLoot,
  sfxPebble,
  sfxAlarmTick,
  sfxCaught,
  sfxWin,
  sfxStep,
  sfxGuardStep,
} from "./audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function freshLoot() {
  return LOOT.map((l) => ({ ...l, taken: false }));
}

function freshState() {
  return {
    phase: "title",
    time: 0,
    elapsed: 0,
    alarm: 0,
    score: 0,
    thief: { ...THIEF_START },
    running: false,
    guards: [
      new Guard("warden1", GUARD_STARTS.warden1, PATROLS.warden1, false),
      new Guard("warden2", GUARD_STARTS.warden2, PATROLS.warden2, false),
      new Guard("warden3", GUARD_STARTS.warden3, PATROLS.warden3, false),
      new Guard("bearer", GUARD_STARTS.bearer, PATROLS.bearer, true),
    ],
    loot: freshLoot(),
    lootTaken: 0,
    lootTotal: LOOT.length,
    pebbles: PEBBLE.max,
    pebblesThrown: [],
    rings: [],
    noiseEvents: [],
    hasPearl: false,
    runNoiseTimer: 0,
    alarmTickTimer: 0,
    guardStepTimer: 0,
    frozen: false,
  };
}

const state = freshState();
const input = createInput(canvas);

// --- staged screenshot mode (?shot=start|play|chase|end&seed=1)
const params = new URLSearchParams(window.location.search);
const shotName = params.get("shot");
if (shotName) {
  const res = applyShot(state, shotName);
  state.frozen = res.frozen;
  state.lootTaken = state.loot.filter((l) => l.taken).length;
}

function reset() {
  const keep = state.frozen;
  Object.assign(state, freshState());
  state.frozen = keep;
  if (keep) applyShot(state, shotName);
}

function startGame() {
  if (state.phase === "title" || state.phase === "win" || state.phase === "caught") {
    reset();
    state.phase = "playing";
  }
}

function throwPebble(x, y) {
  if (state.phase !== "playing" || state.pebbles <= 0) return;
  const dx = x - state.thief.x;
  const dy = y - state.thief.y;
  const d = Math.hypot(dx, dy);
  const land = d > PEBBLE.range
    ? { x: state.thief.x + (dx / d) * PEBBLE.range, y: state.thief.y + (dy / d) * PEBBLE.range }
    : { x, y };
  state.pebbles -= 1;
  state.pebblesThrown.push({ ...land });
  state.rings.push({ x: land.x, y: land.y, radius: 90, age: 0, life: 0.7 });
  state.noiseEvents.push({ x: land.x, y: land.y, radius: PEBBLE.investigateRadius });
  sfxPebble();
}

function computeScore() {
  const lootScore = state.loot.filter((l) => l.taken).reduce((s, l) => s + l.value, 0);
  const timeBonus = Math.max(0, Math.round((SCORE.parSeconds - state.elapsed) * SCORE.timeBonusPerSecond));
  const alarmBonus = Math.round(Math.max(0, (100 - state.alarm) / 100) * SCORE.lowAlarmBonus);
  const pebbleBonus = state.pebbles * SCORE.pebbleBonus;
  return lootScore + timeBonus + alarmBonus + pebbleBonus;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (!state.frozen) {
    state.time += dt;

    // --- global toggles
    if (input.muteToggle) {
      input.muteToggle = false;
      ensureAudio();
      toggleMute();
    }
    if (input.pausedToggle) {
      input.pausedToggle = false;
      if (state.phase === "playing") state.phase = "paused";
      else if (state.phase === "paused") state.phase = "playing";
    }
    if (input.restartToggle) {
      input.restartToggle = false;
      if (state.phase !== "title") startGame();
    }
    if (input.startToggle) {
      input.startToggle = false;
      ensureAudio();
      startGame();
    }

    if (state.phase === "playing") {
      state.elapsed += dt;

      // --- movement
      const moving = input.moveX !== 0 || input.moveY !== 0;
      const speed = input.running ? THIEF.runSpeed : THIEF.walkSpeed;
      state.running = input.running && moving;
      if (moving) {
        state.thief.x += input.moveX * speed * dt;
        state.thief.y += input.moveY * speed * dt;
        resolveCollision(state.thief, THIEF.radius);
        sfxStep(state.running, false);
      }

      // --- running noise rings
      if (state.running) {
        state.runNoiseTimer -= dt;
        if (state.runNoiseTimer <= 0) {
          state.runNoiseTimer = THIEF.runNoiseInterval;
          state.rings.push({ x: state.thief.x, y: state.thief.y, radius: THIEF.runNoiseRadius, age: 0, life: 0.6 });
          state.noiseEvents.push({ x: state.thief.x, y: state.thief.y, radius: THIEF.runNoiseRadius });
        }
      }

      // --- pebble throw
      if (input.click) {
        throwPebble(input.click.x, input.click.y);
        input.click = null;
      }

      // --- guards
      for (const g of state.guards) g.update(dt, state.thief, state.noiseEvents);
      state.noiseEvents = [];

      // guard footsteps: nearest guard volume hint
      state.guardStepTimer -= dt;
      if (state.guardStepTimer <= 0) {
        state.guardStepTimer = 0.5;
        const nearest = Math.min(...state.guards.map((g) => Math.hypot(g.x - state.thief.x, g.y - state.thief.y)));
        sfxGuardStep(nearest);
      }

      // --- alarm: rises with the highest suspicion while seen, falls when hidden
      const maxSusp = Math.max(...state.guards.map((g) => g.suspicion));
      const anySeen = state.guards.some((g) => g.seesThief === "light" || g.seesThief === "dark");
      if (anySeen) {
        state.alarm = Math.min(ALARM.max, state.alarm + (maxSusp / 100) * ALARM.riseRate * dt);
        state.alarmTickTimer -= dt;
        if (state.alarmTickTimer <= 0) {
          state.alarmTickTimer = 0.4;
          sfxAlarmTick();
        }
      } else {
        state.alarm = Math.max(0, state.alarm - ALARM.fallRate * dt);
      }

      // --- loot pickup
      for (const item of state.loot) {
        if (item.taken) continue;
        if (Math.hypot(item.x - state.thief.x, item.y - state.thief.y) < 26) {
          item.taken = true;
          state.lootTaken += 1;
          if (item.kind === "pearl") state.hasPearl = true;
          sfxLoot();
        }
      }

      // --- caught?
      const touched = state.guards.some((g) => g.touches(state.thief));
      if (touched || state.alarm >= ALARM.max) {
        state.phase = "caught";
        state.score = computeScore();
        sfxCaught();
      }

      // --- win: pearl + reach the exit gate
      if (
        state.hasPearl &&
        state.thief.x > GATE.x - 10 &&
        state.thief.x < GATE.x + GATE.w + 10 &&
        state.thief.y > 668
      ) {
        state.phase = "win";
        state.score = computeScore();
        sfxWin();
      }

      // --- rings age out
      for (const r of state.rings) r.age += dt;
      state.rings = state.rings.filter((r) => r.age < r.life);
    } else {
      // title / win / caught / paused: clear stale clicks
      input.click = null;
    }
  }

  render(ctx, state, state.time);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
