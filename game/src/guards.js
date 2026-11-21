// Shadow Lantern — wardens + lantern bearer: patrol, vision, suspicion,
// investigate, chase, give up and return to patrol.
import { GUARD } from "./config.js";
import { canSee, resolveCollision } from "./stealth.js";

function angleLerp(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}

export class Guard {
  constructor(name, start, waypoints, isBearer) {
    this.name = name;
    this.x = start.x;
    this.y = start.y;
    this.angle = start.angle;
    this.waypoints = waypoints;
    this.wpIndex = 0;
    this.isBearer = !!isBearer;
    this.range = isBearer ? GUARD.bearerRange : GUARD.visionRange;
    this.halfAngle = isBearer ? GUARD.bearerHalfAngle : GUARD.visionHalfAngle;
    this.state = "calm"; // calm | suspicious | chase
    this.suspicion = 0;
    this.pauseTimer = 0;
    this.target = null; // {x, y} investigate point
    this.lastSeen = null;
    this.loseTimer = 0;
    this.seesThief = null;
  }

  update(dt, thief, noiseEvents) {
    // --- hearing: a noise ring reaching this guard
    for (const n of noiseEvents) {
      const d = Math.hypot(this.x - n.x, this.y - n.y);
      if (d < n.radius) {
        this.suspicion = Math.max(this.suspicion, 55);
        this.target = { x: n.x, y: n.y };
        if (this.state === "calm") this.state = "suspicious";
      }
    }

    // --- sight
    const seen = canSee(this, thief, this.range, this.halfAngle);
    this.seesThief = seen;
    if (seen === "light" || seen === "dark") {
      const rate = seen === "light" ? GUARD.seenRateLight : GUARD.seenRateDark;
      this.suspicion = Math.min(100, this.suspicion + rate * dt);
      this.lastSeen = { x: thief.x, y: thief.y };
      this.loseTimer = 0;
    } else if (seen === "hidden") {
      // Thief is in the grass right in front of the guard.
      const d = Math.hypot(this.x - thief.x, this.y - thief.y);
      if (d < GUARD.grassHideDistance) {
        this.suspicion = Math.min(100, this.suspicion + GUARD.seenRateGrassNear * dt);
        this.lastSeen = { x: thief.x, y: thief.y };
      }
    } else {
      this.suspicion = Math.max(0, this.suspicion - GUARD.decayRate * dt);
    }

    // --- state machine
    if (this.suspicion >= GUARD.chaseAt) {
      this.state = "chase";
    } else if (this.suspicion >= GUARD.suspiciousAt) {
      if (this.state === "calm") this.state = "suspicious";
      if (this.state === "suspicious" && this.lastSeen && !this.target) {
        this.target = { ...this.lastSeen };
      }
    } else if (this.state !== "calm" && this.suspicion < 20) {
      this.state = "calm";
      this.target = null;
    }

    // --- movement
    if (this.state === "chase") {
      if (seen) {
        this.loseTimer = 0;
        this.moveToward(thief.x, thief.y, GUARD.chaseSpeed, dt);
      } else {
        this.loseTimer += dt;
        if (this.lastSeen) this.moveToward(this.lastSeen.x, this.lastSeen.y, GUARD.chaseSpeed, dt);
        if (this.loseTimer > GUARD.loseTrackSeconds) {
          this.state = "suspicious";
          this.target = this.lastSeen ? { ...this.lastSeen } : null;
          this.suspicion = 55;
        }
      }
    } else if (this.state === "suspicious" && this.target) {
      const arrived = this.moveToward(this.target.x, this.target.y, GUARD.investigateSpeed, dt);
      if (arrived) {
        this.pauseTimer += dt;
        this.angle += dt * 1.6; // look around
        if (this.pauseTimer > 1.6) {
          this.pauseTimer = 0;
          this.target = null;
          if (this.suspicion < GUARD.suspiciousAt) this.state = "calm";
        }
      }
    } else {
      // patrol: walk to the next waypoint, pause briefly at each one
      if (this.pauseTimer > 0) {
        this.pauseTimer -= dt;
      } else {
        const wp = this.waypoints[this.wpIndex];
        const arrived = this.moveToward(wp.x, wp.y, GUARD.patrolSpeed, dt);
        if (arrived) {
          this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
          this.pauseTimer = 0.9;
        }
      }
    }
    resolveCollision(this, GUARD.radius);
  }

  // Walk toward (tx, ty). Returns true when arrived.
  moveToward(tx, ty, speed, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) return true;
    const step = Math.min(d, speed * dt);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    this.angle = angleLerp(this.angle, Math.atan2(dy, dx), Math.min(1, dt * 8));
    return d - step < 6;
  }

  // Distance at which this guard catches the thief by touch.
  touches(thief) {
    return Math.hypot(this.x - thief.x, this.y - thief.y) < GUARD.radius + 13;
  }
}
