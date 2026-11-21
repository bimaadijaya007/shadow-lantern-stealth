// Shadow Lantern — level data: walls, lanterns, pond, grass, loot, waypoints.
// Everything fits in one 1280x720 frame; no scrolling.
import { W, H } from "./config.js";

// Rect obstacles block movement AND line of sight (except the gate gap).
export const OBSTACLES = [
  // Temple wall across the top (altar sits in front of it).
  { x: 0, y: 0, w: 560, h: 64 },
  { x: 720, y: 0, w: 560, h: 64 },
  // Outer bamboo fence: left, right, top edges and bottom with a gate gap.
  { x: 0, y: 0, w: 22, h: H },
  { x: W - 22, y: 0, w: 22, h: H },
  { x: 0, y: H - 22, w: 596, h: 22 },
  { x: 684, y: H - 22, w: 596, h: 22 },
  // Stone lanterns (also light sources).
  { x: 292, y: 138, w: 30, h: 30 },
  { x: 958, y: 138, w: 30, h: 30 },
  { x: 322, y: 508, w: 30, h: 30 },
  { x: 928, y: 508, w: 30, h: 30 },
  // Pond (left middle) — blocks movement and sight.
  { x: 58, y: 298, w: 200, h: 142 },
];

// Stone lanterns: position + warm light pool radius.
export const LANTERNS = [
  { x: 307, y: 153, r: 118 },
  { x: 973, y: 153, r: 118 },
  { x: 337, y: 523, r: 118 },
  { x: 943, y: 523, r: 118 },
];

// Tall grass patches: concealment, not obstacles.
export const GRASS = [
  { x: 170, y: 108, w: 150, h: 74 },
  { x: 810, y: 104, w: 160, h: 74 },
  { x: 420, y: 296, w: 150, h: 82 },
  { x: 890, y: 326, w: 150, h: 82 },
  { x: 140, y: 516, w: 150, h: 72 },
  { x: 760, y: 540, w: 170, h: 72 },
  { x: 560, y: 178, w: 120, h: 62 },
];

// Stone path (bright walking lanes): vertical spine + cross lane.
export const PATHS = [
  { x: 596, y: 64, w: 88, h: 634 },
  { x: 258, y: 336, w: 764, h: 44 },
];

export const ALTAR = { x: 640, y: 46, w: 130, h: 34 };
export const PEARL_POS = { x: 640, y: 52 };
export const GATE = { x: 596, y: 690, w: 88, h: 30 }; // enter + exit
export const THIEF_START = { x: 640, y: 656 };

export const LOOT = [
  { kind: "pearl", x: 640, y: 52, value: 500, required: true },
  { kind: "shard", x: 245, y: 145, value: 120 },
  { kind: "shard", x: 965, y: 367, value: 120 },
  { kind: "shard", x: 620, y: 209, value: 120 },
  { kind: "coin", x: 448, y: 452, value: 60 },
  { kind: "coin", x: 838, y: 470, value: 60 },
];

// Patrol waypoints. Warden 1: horizontal upper; warden 2: vertical right;
// warden 3: horizontal lower; bearer: slow loop through the middle.
export const PATROLS = {
  warden1: [
    { x: 380, y: 210 },
    { x: 900, y: 210 },
  ],
  warden2: [
    { x: 1085, y: 180 },
    { x: 1085, y: 470 },
  ],
  warden3: [
    { x: 380, y: 565 },
    { x: 900, y: 565 },
  ],
  bearer: [
    { x: 470, y: 300 },
    { x: 810, y: 300 },
    { x: 810, y: 430 },
    { x: 470, y: 430 },
  ],
};

export const GUARD_STARTS = {
  warden1: { x: 380, y: 210, angle: 0 },
  warden2: { x: 1085, y: 180, angle: Math.PI / 2 },
  warden3: { x: 900, y: 565, angle: Math.PI },
  bearer: { x: 470, y: 300, angle: 0 },
};
