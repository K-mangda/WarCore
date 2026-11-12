# Megabonk movement lab

Current movement evidence and revised implementation order: [movement rebuild](docs/MOVEMENT_REBUILD.md). It supersedes earlier provisional movement notes where they conflict. Run `node tools/check_slide.mjs` and `node tools/check_motor.mjs` for motor regression checks.

Experimental web reimplementation using React, Three.js, strict TypeScript and Vite. The first automatic-combat/XP loop is now playable; its balance is provisional. Native behavior parity is **not verified**. See [combat loop scope](docs/COMBAT_LOOP.md).

Run `npm install`, then `npm run dev`. Open http://localhost:5173. `npm run build` checks types and creates the production bundle.

Enter sandbox to play. Mouse capture is optional; if your browser denies it, hold the mouse button and drag to look. WASD moves, Space jumps, Esc pauses. Sliding is deferred and disabled by default. Pause to reset or start at the test slope summit. Telemetry reports real render FPS and horizontal velocity.

Fox uses the extracted default texture, skeleton and original Idle/Run/Jump/Falling clips; see [Fox asset provenance](docs/FOX_ASSETS.md). The map remains the placeholder test arena pending a faithful map implementation. Rebuild Fox assets locally with `python tools/export_fox_rig.py`; run `node tools/check_fox.mjs` to verify skin/clip data. Raw source game archives and binaries remain local.

Evidence and missing systems: [master spec](docs/MEGABONK_MASTER_SPEC.md), [parity ledger](docs/PARITY_MATRIX.md). Extract local enum declarations with `python tools/extract_spec.py`.
