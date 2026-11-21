// Shadow Lantern — all Canvas 2D drawing: garden, characters, cones, HUD.
import { COLORS, W, H, ALARM } from "./config.js";
import {
  ALTAR,
  GATE,
  GRASS,
  LANTERNS,
  LOOT,
  OBSTACLES,
  PATHS,
  PEARL_POS,
} from "./world.js";
import { inGrass, inLight } from "./stealth.js";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align) {
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.strokeText(s, x, y);
  ctx.fillStyle = color || COLORS.hudText;
  ctx.fillText(s, x, y);
}

export function drawWorld(ctx, state, t) {
  // --- floor: dark blue-grey stone tiles
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = COLORS.floorDark;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 64; y < H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // --- stone paths
  for (const p of PATHS) {
    ctx.fillStyle = COLORS.path;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = COLORS.pathEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  // --- pond
  const pond = OBSTACLES.find((o) => o.w === 200);
  ctx.fillStyle = COLORS.pond;
  rr(ctx, pond.x, pond.y, pond.w, pond.h, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.pondShine;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const yy = pond.y + 30 + i * 44 + Math.sin(t * 0.8 + i * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(pond.x + 24, yy);
    ctx.quadraticCurveTo(pond.x + 100, yy - 8, pond.x + 176, yy);
    ctx.stroke();
  }

  // --- tall grass
  for (const g of GRASS) {
    ctx.fillStyle = COLORS.grass;
    rr(ctx, g.x, g.y, g.w, g.h, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.grassTuft;
    ctx.lineWidth = 2;
    for (let i = 0; i < Math.floor(g.w / 16); i++) {
      const bx = g.x + 10 + i * 16;
      const by = g.y + g.h - 8 - ((i * 37) % 24);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 4, by - 16);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 4, by - 18);
      ctx.stroke();
    }
  }

  // --- lantern light pools (warm, on the floor)
  for (const l of LANTERNS) {
    const grad = ctx.createRadialGradient(l.x, l.y, 8, l.x, l.y, l.r);
    grad.addColorStop(0, "rgba(255, 205, 105, 0.34)");
    grad.addColorStop(1, "rgba(255, 205, 105, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- temple wall + altar (top)
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(0, 58, W, 6);
  ctx.fillStyle = "#8a6a3a";
  for (let x = 40; x < W; x += 90) {
    ctx.fillRect(x, 18, 8, 40);
  }
  // altar: gold platform
  ctx.fillStyle = "#a67c2e";
  rr(ctx, ALTAR.x - ALTAR.w / 2, ALTAR.y - 6, ALTAR.w, ALTAR.h, 6);
  ctx.fill();
  ctx.fillStyle = "#d9a441";
  rr(ctx, ALTAR.x - ALTAR.w / 2 + 6, ALTAR.y - 2, ALTAR.w - 12, 12, 4);
  ctx.fill();

  // --- bamboo fence (outer border, gate gap at bottom centre)
  ctx.fillStyle = COLORS.fence;
  ctx.fillRect(0, 0, 22, H);
  ctx.fillRect(W - 22, 0, 22, H);
  ctx.fillRect(0, H - 22, 596, 22);
  ctx.fillRect(684, H - 22, 596, 22);
  // gate: two posts + torii beam
  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(588, 668, 12, 34);
  ctx.fillRect(680, 668, 12, 34);
  ctx.fillStyle = "#a03a2a";
  ctx.fillRect(578, 660, 124, 10);
  text(ctx, "EXIT", 640, 712, 13, "#ffd76a", "center");

  // --- stone lanterns
  for (const l of LANTERNS) {
    ctx.fillStyle = COLORS.lanternStone;
    ctx.fillRect(l.x - 11, l.y - 12, 22, 24);
    ctx.fillStyle = "#3d4450";
    ctx.fillRect(l.x - 15, l.y - 18, 30, 8);
    ctx.fillStyle = "#ffd27a";
    ctx.beginPath();
    ctx.arc(l.x, l.y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- loot
  for (const item of state.loot) {
    if (item.taken) continue;
    if (item.kind === "pearl") {
      const pulse = 1 + Math.sin(t * 3) * 0.18;
      const grad = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 46 * pulse);
      grad.addColorStop(0, "rgba(111, 247, 255, 0.75)");
      grad.addColorStop(1, "rgba(111, 247, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 46 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.pearl;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(item.x - 3, item.y - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.kind === "shard") {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = COLORS.shard;
      ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();
    } else {
      ctx.fillStyle = COLORS.coin;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a67c2e";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

export function drawCones(ctx, guards) {
  for (const g of guards) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);
    ctx.fillStyle = g.isBearer ? COLORS.coneBearer : COLORS.cone;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, g.range, -g.halfAngle, g.halfAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawGuard(ctx, g, t) {
  // robe body
  ctx.fillStyle = COLORS.warden;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
  ctx.fill();
  // straw hat
  ctx.fillStyle = COLORS.wardenHat;
  ctx.beginPath();
  ctx.moveTo(g.x - 16, g.y - 4);
  ctx.lineTo(g.x, g.y - 22);
  ctx.lineTo(g.x + 16, g.y - 4);
  ctx.closePath();
  ctx.fill();
  // facing tick
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.angle) * 16, g.y + Math.sin(g.angle) * 16);
  ctx.stroke();
  // lantern in hand for the bearer
  if (g.isBearer) {
    ctx.fillStyle = COLORS.bearerLantern;
    ctx.beginPath();
    ctx.arc(g.x + 18, g.y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // "?" / "!" markers
  if (g.state === "suspicious") text(ctx, "?", g.x, g.y - 32, 24, "#ffd76a", "center");
  if (g.state === "chase") text(ctx, "!", g.x, g.y - 32, 26, "#ff4d4d", "center");
}

function drawThief(ctx, thief, running, t) {
  const bob = running ? Math.sin(t * 14) * 2 : Math.sin(t * 3) * 1;
  // soft shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(thief.x, thief.y + 12, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y + bob * 0.3, 14, 0, Math.PI * 2);
  ctx.fill();
  // white headband
  ctx.strokeStyle = COLORS.thiefBand;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y - 3 + bob * 0.3, 10, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  // crouch hint when hidden in grass
  if (inGrass(thief.x, thief.y)) {
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawNoiseRings(ctx, rings) {
  for (const r of rings) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - r.age / r.life)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius * (0.4 + 0.6 * (r.age / r.life)), 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawPebbles(ctx, pebbles) {
  for (const p of pebbles) {
    ctx.fillStyle = "#c8ccd4";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawHUD(ctx, state) {
  // top bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  rr(ctx, 12, 10, 560, 44, 8);
  ctx.fill();
  const alarm = state.alarm;
  const frac = alarm / ALARM.max;
  const col = alarm > 70 ? "#ff4d4d" : alarm > 40 ? "#ffd76a" : "#58d68d";
  const blink = alarm > 70 && Math.floor(state.time * 4) % 2 === 0;
  text(ctx, "ALARM", 26, 32, 15, "#ffffff");
  ctx.fillStyle = "#111";
  rr(ctx, 96, 20, 220, 20, 5);
  ctx.fill();
  if (!blink && frac > 0.02) {
    ctx.fillStyle = col;
    rr(ctx, 96, 20, Math.max(4, 220 * frac), 20, 5);
    ctx.fill();
  }
  text(ctx, `${Math.round(alarm)}%`, 326, 32, 15, "#ffffff");
  text(ctx, `LOOT ${state.lootTaken}/${state.lootTotal}`, 360, 32, 15, "#ffffff");
  text(ctx, `PEBBLES ${state.pebbles}`, 470, 32, 15, "#ffffff");

  // top-right: timer + garden name
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  rr(ctx, W - 292, 10, 280, 44, 8);
  ctx.fill();
  const mm = String(Math.floor(state.elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(state.elapsed % 60)).padStart(2, "0");
  text(ctx, `${mm}:${ss}`, W - 272, 32, 16, "#ffffff");
  text(ctx, "MOONLIT GARDEN", W - 200, 32, 14, "#cfe8ff");

  // guard status icons (bottom-left)
  let gx = 26;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  rr(ctx, 12, H - 46, 300, 34, 8);
  ctx.fill();
  for (const g of state.guards) {
    const dot = g.state === "chase" ? "#ff4d4d" : g.state === "suspicious" ? "#ffd76a" : "#58d68d";
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(gx, H - 29, 7, 0, Math.PI * 2);
    ctx.fill();
    gx += 22;
    text(ctx, g.isBearer ? "LANTERN" : "WARDEN", gx, H - 29, 12, "#ffffff");
    gx += g.isBearer ? 66 : 70;
  }

  // hint line
  const hint = state.hasPearl
    ? "Pearl taken — reach the EXIT gate!"
    : "Steal the Moon Pearl, then escape through the gate.";
  text(ctx, hint, W / 2, H - 28, 14, "#e8e8e8", "center");

  // light/dark/grass indicator under the thief
  if (inGrass(state.thief.x, state.thief.y)) {
    text(ctx, "HIDDEN IN GRASS", state.thief.x, state.thief.y - 30, 12, "#7dff9a", "center");
  } else if (inLight(state.thief.x, state.thief.y)) {
    text(ctx, "IN THE LIGHT — SEEN FAST", state.thief.x, state.thief.y - 30, 12, "#ffd76a", "center");
  }
}

export function drawOverlay(ctx, state) {
  ctx.fillStyle = "rgba(8, 10, 18, 0.62)";
  ctx.fillRect(0, 0, W, H);
  if (state.phase === "title") {
    text(ctx, "SHADOW LANTERN", W / 2, 210, 64, "#ffffff", "center");
    text(ctx, "steal the Moon Pearl through lamplight, tall grass and patrols", W / 2, 272, 20, "#cfe8ff", "center");
    text(ctx, "WASD move · SHIFT run (loud!) · CLICK throw a pebble · P pause · M mute", W / 2, 330, 17, "#ffffff", "center");
    text(ctx, "Hide in tall grass. Stay out of the lantern light. Don't let the alarm reach 100.", W / 2, 360, 17, "#ffffff", "center");
    const pulse = 0.7 + Math.sin(state.time * 4) * 0.3;
    ctx.globalAlpha = pulse;
    text(ctx, "CLICK or press ENTER to begin", W / 2, 440, 22, "#ffd76a", "center");
    ctx.globalAlpha = 1;
  } else if (state.phase === "win") {
    text(ctx, "VANISHED INTO THE NIGHT", W / 2, 300, 52, "#6ff7ff", "center");
    text(ctx, `Score ${state.score}  ·  Loot ${state.lootTaken}/${state.lootTotal}  ·  Time ${Math.round(state.elapsed)}s`, W / 2, 370, 20, "#ffffff", "center");
    text(ctx, "Press R or click to play again", W / 2, 430, 18, "#ffd76a", "center");
  } else if (state.phase === "caught") {
    text(ctx, "CAUGHT IN THE LAMPLIGHT", W / 2, 300, 52, "#ff4d4d", "center");
    text(ctx, "The wardens found you. The pearl stays in the temple.", W / 2, 370, 20, "#ffffff", "center");
    text(ctx, "Press R or click to try again", W / 2, 430, 18, "#ffd76a", "center");
  } else if (state.phase === "paused") {
    text(ctx, "PAUSED", W / 2, 330, 48, "#ffffff", "center");
    text(ctx, "Press P to resume", W / 2, 390, 18, "#ffd76a", "center");
  }
}

export function render(ctx, state, t) {
  drawWorld(ctx, state, t);
  drawCones(ctx, state.guards);
  drawPebbles(ctx, state.pebblesThrown);
  drawNoiseRings(ctx, state.rings);
  for (const g of state.guards) drawGuard(ctx, g, t);
  drawThief(ctx, state.thief, state.running, t);
  drawHUD(ctx, state);
  if (state.phase !== "playing") drawOverlay(ctx, state);
}
