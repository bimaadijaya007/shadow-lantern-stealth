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

fs.mkdirSync(outputDir, { recursive: true });
copyDir(path.join(here, "game"), path.join(outputDir, "game"));
const shotsDir = path.join(here, "screenshots");
if (fs.existsSync(shotsDir)) {
  copyDir(shotsDir, path.join(outputDir, "screenshots"));
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
// buildDossier returns canonical JSON bytes (Uint8Array) — write them verbatim.
fs.writeFileSync(path.join(outputDir, "dossier.json"), dossier);
console.log("dossier written to", path.join(outputDir, "dossier.json"));
