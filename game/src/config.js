// Shadow Lantern — shared tuning constants.
export const W = 1280;
export const H = 720;

export const THIEF = {
  radius: 14,
  walkSpeed: 115,
  runSpeed: 195,
  runNoiseRadius: 140,
  runNoiseInterval: 0.45,
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 55,
  investigateSpeed: 88,
  chaseSpeed: 132,
  visionRange: 220,
  visionHalfAngle: (35 * Math.PI) / 180,
  bearerRange: 265,
  bearerHalfAngle: (46 * Math.PI) / 180,
  // suspicion per second while the thief is seen
  seenRateLight: 52,
  seenRateDark: 24,
  seenRateGrassNear: 70,
  decayRate: 16,
  suspiciousAt: 50,
  chaseAt: 100,
  loseTrackSeconds: 2,
  grassHideDistance: 50,
};

export const ALARM = {
  riseRate: 55, // scaled by max suspicion / 100 while seen
  fallRate: 9,
  max: 100,
};

export const PEBBLE = { max: 3, range: 330, investigateRadius: 280 };

export const SCORE = {
  pearl: 500,
  shard: 120,
  coin: 60,
  parSeconds: 120,
  timeBonusPerSecond: 4,
  lowAlarmBonus: 200, // full bonus when alarm ends under 20
  pebbleBonus: 40,
};

export const COLORS = {
  floor: "#232a3d",
  floorDark: "#1b2130",
  path: "#4a5266",
  pathEdge: "#5d6780",
  grass: "#1e4d2a",
  grassTuft: "#2f7a3e",
  pond: "#12324a",
  pondShine: "#2a6a8f",
  wall: "#2c2118",
  wallTop: "#4a3423",
  fence: "#3a2c1c",
  lanternStone: "#6b7280",
  lightPool: "rgba(255, 196, 90, 0.20)",
  cone: "rgba(255, 214, 110, 0.30)",
  coneBearer: "rgba(255, 170, 70, 0.32)",
  pearl: "#6ff7ff",
  shard: "#cfe8ff",
  coin: "#ffd76a",
  thief: "#2b2f6e",
  thiefBand: "#f2f2f2",
  warden: "#8a8f98",
  wardenHat: "#c9a86a",
  bearerLantern: "#ff9a2a",
  hudText: "#ffffff",
};
