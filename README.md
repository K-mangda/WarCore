> Continuing in a new chat? Start with [NEXT_CHAT_HANDOFF.md](docs/NEXT_CHAT_HANDOFF.md).

> Current scope: **Phase 2 — playtest systems and player tools**. See [phase status](docs/PHASE_STATUS.md) and [Pause/death reference backlog](docs/PAUSE_END_REFERENCE.md). The deployment branch retains its historical Phase 1 name. Movement-native-parity gaps remain open.

# Megabonk movement lab

Current movement evidence and revised implementation order: [movement rebuild](docs/MOVEMENT_REBUILD.md). It supersedes earlier provisional movement notes where they conflict. Run `node tools/check_slide.mjs` and `node tools/check_motor.mjs` for motor regression checks.

Experimental web reimplementation using React, Three.js, strict TypeScript and Vite. The first automatic-combat/XP loop is now playable; its balance is provisional. Native behavior parity is **not verified**. See [combat loop scope](docs/COMBAT_LOOP.md).

Run `npm install`, then `npm run dev`. Open http://localhost:5173. `npm run build` checks types and creates the production bundle.

Enter sandbox to play. Mouse capture is optional; if your browser denies it, hold the mouse button and drag to look. WASD moves, Space jumps, Esc pauses. Sliding is deferred and disabled by default. Pause to reset or start at the test slope summit. Telemetry reports real render FPS and horizontal velocity.

Fox uses the extracted default texture, skeleton and original Idle/Run/Jump/Falling clips; see [Fox asset provenance](docs/FOX_ASSETS.md). The map remains the placeholder test arena pending a faithful map implementation. Rebuild Fox assets locally with `python tools/export_fox_rig.py`; run `node tools/check_fox.mjs` to verify skin/clip data. Raw source game archives and binaries remain local.

Evidence and missing systems: [master spec](docs/MEGABONK_MASTER_SPEC.md), [parity ledger](docs/PARITY_MATRIX.md). Extract local enum declarations with `python tools/extract_spec.py`.

Temporary behavior and unverified tuning are tracked in [the temporary implementation register](docs/TEMPORARY_IMPLEMENTATIONS.md), including audio clip mapping, overlap limits, combat, movement, camera, map and UI.

Sword is now selectable before starting a fresh run. Its original sound/icon/atlas and source Quad are imported with corrected metadata; melee rules and VFX shader/placement remain provisional. See [sword handoff review](docs/SWORD_ASSET_REVIEW.md) and [temporary settings](docs/TEMPORARY_IMPLEMENTATIONS.md). Rebuild source exports with `python tools/import_sword_assets.py` (requires the installed local game and the external extraction package).

Identity correction: the earlier external sword package was HeroSword (ID27), distinct from Knight's starting Sword (ID2). Playable Sword now uses the verified Knight -> WeaponSword -> projectile reference chain and assets under public/weapons/knight-sword. Rebuild those with `python tools/import_knight_sword_assets.py`. Sword attacks repeatedly without requiring a nearby target; exact native timing/motion remain unverified.

Before implementing another weapon, follow [weapon behavior checks](docs/WEAPON_BEHAVIOR.md): identity, quantity/burst policy, aiming, spawn pose, hit history and audio must be checked separately for each weapon.

The LAB button opens the Sword room over the paused game; BACK TO GAME preserves the game instance. Direct room: /lab.html. It uses the same SwordView, audio player and native Press Start 2P damage glyph renderer as gameplay. Frame/facing controls, attack+sound playback and a damage-number sample are available. The production build includes both game and Lab pages.

Git-based deployment setup is documented in [deployment](docs/DEPLOYMENT.md). GitHub Actions deploys the current test branch to Pages, with base-aware asset paths and a packaged game/Lab check. The latest external extraction catalog has a separate [handoff review](docs/LATEST_EXTRACTION_REVIEW.md); it has not been blindly imported.

Local Firestaff integration status, changed files, source evidence and remaining approximations are in [Firestaff implementation review](docs/FIRESTAFF_IMPLEMENTATION.md). Use the Lab Weapon selector to inspect Sword or Firestaff; both share the actual game renderers/audio.
