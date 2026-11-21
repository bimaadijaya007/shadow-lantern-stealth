# shadow-lantern-stealth

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/bimaadijaya007/shadow-lantern-stealth/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/bimaadijaya007/shadow-lantern-stealth/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**Shadow Lantern** is a top-down 2D stealth game set in a moonlit temple garden.
You are a thief who must steal the Moon Pearl from the altar and escape through
the gate — without being seen. Three wardens patrol the garden with sweeping
vision cones, a lantern-bearer carries a moving pool of light, and every running
step rings out loud enough for the patrols to hear.

- **Hide** in tall grass — guards cannot see you there unless they get very close.
- **Mind the light** — suspicion rises twice as fast inside a lantern pool, half
  as fast in the dark.
- **Move quietly** — walking is silent; running is fast but throws a visible
  sound ring that pulls guards toward you.
- **Distract** — click to throw a pebble (3 per run); the nearest guard goes to
  investigate the sound.
- **Alarm meter** — being seen feeds it; at 100% you are caught. Grab the pearl,
  plus optional moon shards and offering coins, then slip out the exit gate.

Controls: WASD / arrows to move, Shift to run, click to throw a pebble,
P pause, M mute, R restart, Enter / click to start.

Built with plain Canvas 2D — no libraries, no external assets, no network.
All sound is synthesized with WebAudio at runtime.

## Run it

```sh
python3 -m http.server 8080 --directory game   # lalu buka http://localhost:8080/
```
