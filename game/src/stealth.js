// Shadow Lantern — stealth helpers: light, grass, line of sight, noise.
import { GRASS, LANTERNS, OBSTACLES } from "./world.js";

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function inGrass(x, y) {
  return GRASS.some((g) => pointInRect(x, y, g));
}

export function inLight(x, y) {
  return LANTERNS.some((l) => Math.hypot(x - l.x, y - l.y) < l.r);
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does segment (x1,y1)-(x2,y2) cross rect r?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  for (const [p, q] of [
    [-dx, x1 - r.x],
    [dx, r.x + r.w - x1],
    [-dy, y1 - r.y],
    [dy, r.y + r.h - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tmax) return false;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return false;
        if (t < tmax) tmax = t;
      }
    }
  }
  return true;
}

export function hasLineOfSight(x1, y1, x2, y2) {
  for (const o of OBSTACLES) {
    if (segmentHitsRect(x1, y1, x2, y2, o)) return false;
  }
  return true;
}

// Can this guard see the thief right now? Returns "light" | "dark" | "hidden" | null.
export function canSee(guard, thief, range, halfAngle) {
  const dx = thief.x - guard.x;
  const dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return null;
  let ang = Math.atan2(dy, dx) - guard.angle;
  while (ang > Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  if (Math.abs(ang) > halfAngle) return null;
  if (!hasLineOfSight(guard.x, guard.y, thief.x, thief.y)) return null;
  if (inGrass(thief.x, thief.y) && dist >= 50) return "hidden";
  return inLight(thief.x, thief.y) ? "light" : "dark";
}

// Push a circle out of every obstacle rect (movement collision).
export function resolveCollision(p, radius) {
  for (const o of OBSTACLES) {
    const cx = Math.max(o.x, Math.min(p.x, o.x + o.w));
    const cy = Math.max(o.y, Math.min(p.y, o.y + o.h));
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < radius * radius) {
      if (d2 === 0) {
        p.y = o.y - radius;
      } else {
        const d = Math.sqrt(d2);
        p.x = cx + (dx / d) * radius;
        p.y = cy + (dy / d) * radius;
      }
    }
  }
  p.x = Math.max(22 + radius, Math.min(1280 - 22 - radius, p.x));
  p.y = Math.max(64 + radius * 0.4, Math.min(720 - 22 - radius, p.y));
}
