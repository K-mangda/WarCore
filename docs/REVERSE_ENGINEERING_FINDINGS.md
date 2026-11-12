# Direct artifact investigation — 2026-11-12

## Completed evidence collection

REA 6.8.0 CLI directly inspected the installed global-metadata.dat and matching GameAssembly.dll. Metadata format: 29; 14,421 type definitions and 114,472 method records. Evidence ID: `ev_03e4dbb0f9506d75f2eead8861ab8bdf77c803d1df33132b47fb6866cecb93e9`. Metadata SHA256: `17b506a77616b943b414b9a42d35e3acbdaf71eec5dc6c470fc4da338010d550`.

Full local evidence: `.local-evidence/il2cpp-stdout.json` (ignored by Git). REA's evidence-export option failed writing its bundle; complete CLI JSON was retained instead. Installed Node 24.11 is below REA's advertised supported versions; the metadata command completed but broader compatibility is unverified. No native decompiler provider was found in the limited Program Files directory check. Native method bodies and runtime behavior remain unresolved.

UnityPy read the installed top-level `*.assets` files: 513 Mesh, 1,172 Texture2D, 716 Sprite, 311 AudioClip, 134 AnimationClip, 7 Font, 610 Material, 93 Shader and 732 ParticleSystem records. No inventory read errors. This is an object inventory, not a count of unique usable exports. Complete names and object IDs are in `.local-evidence/assets.json`. Run `python tools/inventory_assets.py` to reproduce locally. StreamingAssets and external bundles were not exhaustively inventoried.

## Gaps found during self-review

- Motor formulas, jump impulse, friction, air steering, slope force integration and camera tuning are provisional. Source constants alone do not establish behavioral equivalence.
- Rendering uses primitive placeholder character, terrain and trees. Actual meshes, rigs, animations, textures, materials, fonts, audio and UI have not been converted or integrated.
- Terrain is a height-field sandbox, with simplified collision; no general capsule sweeps, ceilings, moving surfaces, ladders or wallrunning.
- Slide dust and screen streaks exist, but the original particle settings and rendering are unverified.
- Camera raycasts terrain only. Prop collision and camera shake remain missing.
- Real 60+ FPS and movement feel have not been measured interactively. Build passes; gameplay acceptance awaits playtest.
- Pause/reset works in the browser implementation. Hold-to-autojump is not implemented; Bhop uses discrete buffered Space presses.
- All combat, enemies, weapons/tomes/items, upgrades, shrines, chests, map events, desert, graveyard, hell and sound filtering remain deferred under the explicit Phase 1 scope.

## Reuse boundary

Unity has no website CSS to extract. Texture/sprite/font exports can supply authentic UI visuals, while Unity Canvas/RectTransform layout must be translated or a compatible UI renderer built. Materials, shaders, rigged meshes and particles require conversion or web implementations. Copying files alone does not reproduce Unity runtime behavior.

## Local run

Strict TypeScript and production Vite build passed. Port 5173 belongs to an existing ONE SIAM backoffice instance; this project's dev server uses `npm run dev -- --port 5174` without stopping that process. No browser interaction or FPS acceptance is claimed.

## Embedded browser entry fix

Observed WrongDocumentError on requestPointerLock in the in-app browser. Previously this prevented the simulation and keyboard input from starting. Gameplay now has its own active state, catches rejected pointer-lock requests, and offers drag-to-look fallback. Browser verification: entry overlay dismissed and Space increased jump count to 001. Rendering FPS fluctuated; 60+ FPS remains unverified.
