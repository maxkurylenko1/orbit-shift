# Orbit Shift

Orbit Shift is a lightweight, responsive arcade game built with **TypeScript**, **PixiJS v8**, and **Vite**.

You pilot a ship around a reactor on two concentric orbital lanes. The entire game uses one action: switch lanes at the right moment, avoid hazards, collect energy shards, and survive as the pace increases.

## Highlights

- Responsive PixiJS rendering for mobile, desktop, and ultrawide displays
- Mouse, touch, and keyboard controls
- Fast lane-switch animation with squash, tilt, trail, and glow feedback
- Procedural Web Audio sound design with persistent mute preference
- Collision burst, screen shake, shard pickup particles, and reactor feedback
- Progressive difficulty with protected reaction windows
- Spawn-safety rules that prevent unfair dual-lane blockades
- Combo scoring and persistent best score
- Safe-area support for notched mobile devices
- Small dependency surface: PixiJS is the only runtime dependency

## Controls

| Action | Input |
| --- | --- |
| Start / restart | Tap, click, or Space |
| Switch orbit | Tap, click, or Space |
| Toggle sound | M or the SOUND button |

## Tech stack

- TypeScript
- PixiJS 8
- Vite
- Web Audio API
- localStorage
- HTML / CSS

## Project structure

```text
src/
  audio/          Procedural sound design
  background/     Responsive cinematic background
  config/         Responsive sizing and layout rules
  core/           App, scene, and input lifecycle
  entities/       Player, obstacle, collectible
  presentation/   Visual feedback and rendering helpers
  scenes/         Boot, menu, gameplay
  systems/        Difficulty, spawning, scoring, collision, combo
  ui/             Game-over and sound controls
tests/            Pure logic and presentation tests
public/assets/    Authored WebP game art
```

## Run locally

Requires a recent Node.js version.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Design goals

Orbit Shift is intentionally compact. The project focuses on the areas that matter for a polished HTML5 game portfolio piece:

1. **Readable game state** — strong silhouettes, minimal asset detail, clear lane separation.
2. **Game feel** — short responsive transitions, particles, shake, audio, and restrained glow.
3. **Fair difficulty** — increasing pressure without spawning impossible lane combinations.
4. **Responsive rendering** — one gameplay layout that remains readable from small phones to ultrawide monitors.
5. **Maintainable architecture** — gameplay rules, visual metrics, feedback, and rendering are kept in separate modules.

## Repository

Created as a portfolio project to demonstrate frontend game engineering with PixiJS and TypeScript.
