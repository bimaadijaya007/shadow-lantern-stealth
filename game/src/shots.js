// Shadow Lantern — deterministic staged states for ?shot=<name>&seed=1.
// A shot freezes the simulation (fixed clock) so screenshots are reproducible.
import { GUARD_STARTS, PATROLS, THIEF_START } from "./world.js";
import { Guard } from "./guards.js";

function makeGuards() {
  return [
    new Guard("warden1", GUARD_STARTS.warden1, PATROLS.warden1, false),
    new Guard("warden2", GUARD_STARTS.warden2, PATROLS.warden2, false),
    new Guard("warden3", GUARD_STARTS.warden3, PATROLS.warden3, false),
    new Guard("bearer", GUARD_STARTS.bearer, PATROLS.bearer, true),
  ];
}

// Returns { shot, frozen } — frozen states render with a fixed clock t = 1.2.
export function applyShot(state, shot) {
  state.guards = makeGuards();
  state.rings = [];
  state.pebblesThrown = [];
  state.alarm = 0;
  state.elapsed = 0;
  state.pebbles = 3;
  state.hasPearl = false;
  state.score = 0;
  state.time = 1.2;

  if (shot === "start") {
    state.phase = "title";
    state.thief = { ...THIEF_START };
  } else if (shot === "play") {
    // Cover: thief crouched in tall grass at the edge of a lantern pool,
    // warden-3's cone sweeping close, bearer cone cutting across the garden.
    state.phase = "playing";
    state.thief = { x: 268, y: 548 };
    state.alarm = 30;
    state.elapsed = 47;
    const w3 = state.guards[2];
    w3.x = 470;
    w3.y = 565;
    w3.angle = Math.PI;
    w3.state = "suspicious";
    w3.suspicion = 62;
    const bearer = state.guards[3];
    bearer.x = 640;
    bearer.y = 360;
    bearer.angle = Math.PI;
    const w1 = state.guards[0];
    w1.x = 640;
    w1.y = 210;
    w1.angle = Math.PI / 2;
  } else if (shot === "chase") {
    // Tense moment: warden chasing ("!"), alarm ~80, thief running for grass.
    state.phase = "playing";
    state.thief = { x: 700, y: 480 };
    state.running = true;
    state.alarm = 80;
    state.elapsed = 83;
    const w3 = state.guards[2];
    w3.x = 620;
    w3.y = 520;
    w3.angle = Math.atan2(480 - 520, 700 - 620);
    w3.state = "chase";
    w3.suspicion = 100;
    state.rings = [{ x: 700, y: 480, radius: 140, age: 0.2, life: 0.8 }];
    const bearer = state.guards[3];
    bearer.x = 560;
    bearer.y = 380;
    bearer.angle = Math.PI / 4;
    bearer.state = "suspicious";
    bearer.suspicion = 58;
  } else if (shot === "end") {
    // Win screen: thief at the gate carrying the pearl.
    state.phase = "win";
    state.thief = { x: 640, y: 656 };
    state.hasPearl = true;
    state.alarm = 12;
    state.elapsed = 96;
    state.lootTaken = 4;
    state.score = 812;
    for (const item of state.loot) {
      if (item.kind === "pearl" || item.kind === "shard") item.taken = true;
    }
    state.lootTaken = state.loot.filter((l) => l.taken).length;
  } else {
    return { shot: null, frozen: false };
  }
  return { shot, frozen: true };
}
