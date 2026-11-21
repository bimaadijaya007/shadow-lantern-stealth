// Shadow Lantern — make.fun dossier builder.
// Copies game/ and screenshots/ into MAKEFUN_OUTPUT_DIR and writes dossier.json.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Preflight: fail fast when the entry is incomplete or over the dossier caps,
// instead of shipping a broken bundle. Caps mirror the buildDossier call below.
const EXPECTED_SHOTS = ["1-cover.jpg", "2-start.jpg", "3-chase.jpg", "4-escape.jpg"];
const SHOT_MAX_BYTES = 262144;
const GAME_MAX_FILES = 993;
const GAME_MAX_BYTES = 50331648;

function fail(message) {
  throw new Error(`Shadow Lantern preflight: ${message}`);
}

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

const gameDir = path.join(here, "game");
if (!fs.existsSync(path.join(gameDir, "index.html"))) {
  fail("game/index.html is missing — the entry cannot run");
}
const gameFiles = walkFiles(gameDir);
const gameBytes = gameFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
if (gameFiles.length > GAME_MAX_FILES) {
  fail(`game/ has ${gameFiles.length} files, over the ${GAME_MAX_FILES} cap`);
}
if (gameBytes > GAME_MAX_BYTES) {
  fail(`game/ is ${gameBytes} bytes, over the ${GAME_MAX_BYTES} cap`);
}
const shotsDir = path.join(here, "screenshots");
if (!fs.existsSync(shotsDir)) fail("screenshots/ is missing");
for (const shot of EXPECTED_SHOTS) {
  const shotPath = path.join(shotsDir, shot);
  if (!fs.existsSync(shotPath)) fail(`screenshots/${shot} is missing`);
  const size = fs.statSync(shotPath).size;
  if (size > SHOT_MAX_BYTES) {
    fail(`screenshots/${shot} is ${size} bytes, over the ${SHOT_MAX_BYTES} cap`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
copyDir(path.join(here, "game"), path.join(outputDir, "game"));
copyDir(shotsDir, path.join(outputDir, "screenshots"));

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
// buildDossier returns canonical JSON bytes (Uint8Array) — write them verbatim.
fs.writeFileSync(path.join(outputDir, "dossier.json"), dossier);
console.log(
  `dossier written to ${path.join(outputDir, "dossier.json")} ` +
    `(game ${gameFiles.length} files / ${gameBytes} bytes, ` +
    `screenshots ${EXPECTED_SHOTS.length}, dossier ${dossier.length} bytes)`,
);
