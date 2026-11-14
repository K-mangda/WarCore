# Extract everything in one command

```bash
node tools/extract_all.mjs
```

One run, no manual steps. Everything lands in `.local-evidence/` (git-ignored; the game's files are never committed). Safe to re-run: finished work is skipped, failed items are retried.

| Step | Tool | Output |
|---|---|---|
| 1 Plan | `tools/build_decompile_plan.py` | `decompile-all-plan.json`: every non-trivial method of all Assembly-CSharp classes (5,556 methods = 4,575 unique function bodies; shared bodies are decompiled once and list their aliases). Order: weapons, Tomes, enemies/bosses, interactables, items, everything else |
| 2 Unity data | `tools/dump_all_unity.py` | `unity-dump/<asset file>/objects.jsonl` (every object, full typetree, MonoBehaviour class name), `textures/`, `sprites/`, `meshes/` (OBJ), `meshes_raw/` (gz JSON with bone weights and bind poses), `fonts/`, `text/`, `catalog.json`, `errors.log` |
| 3 Audio | `tools/dump_audio.py` | `unity-dump/<asset file>/audio/*.wav`, `unity-dump/audio-index.json` (separate clean process: FMOD fails inside step 2) |
| 4 Code | `tools/rea_decompile_batch.mjs` (Ghidra via REA) | `decompile6/<tier>__<Class>.<method>_<rva>.c` pseudocode, `failures.log`; one binary import (~40 min) then seconds per function |
| 5 Coverage | `tools/coverage_report.py` | `docs/DECOMPILE_COVERAGE.md` |

## No duplicates
- Files are content-addressed: identical bytes (same texture in two asset files, a sprite equal to its texture, repeated meshes or sounds) are written once; other records carry `duplicateOf` and the full list is `unity-dump/unique-files.json`.
- Functions are de-duplicated by RVA, both in the plan and on resume (a body already saved under another name is not decompiled again).
- Earlier hand-picked extractions under `public/` stay as they are; the port should take new assets from `unity-dump` and match by `sha256` before copying anything into `public/`.

## Flags
`--skip-unity`, `--skip-ghidra`, `--after-running-ghidra` (wait for a Ghidra batch that is already running, then continue).

## Limits
- Needs about 1.5 GB free RAM for Ghidra and roughly 2 GB of disk.
- Not produced: FBX/glTF with skeleton and animation baked together (raw mesh + AnimationClip typetrees are there to build them), shader source.
- A few MonoBehaviours cannot be decoded (see each `errors.log`).

## Run of 2026-11-14 (Unity + audio part, 5 minutes, about 1 GB)

50,473 objects; 3,305 unique files written; duplicates skipped: 50 sprites, 2 textures, 2 meshes; audio 311 clips (309 unique, 0 errors).
Open problems: 236 MonoBehaviours not decoded (was 432 before loading every assembly), 20 meshes and 7 textures failed to export (see `exportError` in `objects.jsonl`).

## Before using an image from the dump (images can look wrong)
- Many UI/VFX textures are white or grey masks that the game tints at runtime (colour lives in the material, particle start colour or script). Take the colour from data, not from the PNG.
- Sprites are crops of atlases; check `m_Rect`, pivot and border in the sprite's `data` before slicing or 9-slicing.
- Some textures store data, not pictures (normal maps, masks in single channels, lookup ramps), and some have alpha only.
- Always open the PNG and compare with a screenshot of the real game before wiring it in; record the source path and sha256 in a `provenance.json` next to it.

## Handing over between models or sessions
Nothing depends on chat memory: the pipeline is a script, state is on disk, and the plan is in `docs/NEXT_STEPS.md` (parking lot) and `docs/PORT_BRIEF.md`. A new model only needs: "read docs/PORT_BRIEF.md and docs/NEXT_STEPS.md, then continue".

## asset-index.json (answers "what colour / which crop is this image really?")

`tools/build_asset_index.py` (runs inside `extract_all`, or alone in seconds; it only reads the dump) writes `unity-dump/asset-index.json`: for each of the 1,172 textures its `kind` (760 picture, 346 greyscale, 55 mask-white, ...) and every user found in the data - materials with colour properties, UI Image/RawImage objects with their `m_Color`, sprites with rect/border/pivot, and script fields that reference it (for example `WeaponData.icon`). Only 1 texture has no recorded user.
Example: `icon_coin` is greyscale and is drawn by `CoinIcon` with colour (1, 0.995, 0.061) - that is the gold coin. Colours set purely by code at runtime (rarity tints) are not in the index; those come from the decompile.

## Image quality: the textures are not degraded, the game is pixel art

Measured on all 1,168 textures: 994 use **Point** filtering (pixel-sharp, no smoothing), 503 are 32 px or smaller, 396 are 33-128 px. 676 are stored lossless (RGBA32); 299 are DXT1/DXT5 block-compressed inside the game itself, so their small artefacts are in the original too. The export is the exact pixels the game uploads to the GPU.
Small images look "low quality" only when a browser or three.js scales them with smoothing. Rules for the port:
- three.js: `texture.magFilter = texture.minFilter = THREE.NearestFilter`, `generateMipmaps = false` for every texture whose `filter` in `asset-index.json` is `point`; keep `colorSpace = SRGBColorSpace` for pictures.
- HTML/CSS: `image-rendering: pixelated` and integer scale factors (x2, x3, x4) where possible.
- Do not upscale or "enhance" (AI upscalers, smoothing) - it changes the look away from the original.
- Use `asset-index.json` fields `filter`, `wrap`, `mipmaps`, `format` instead of guessing.

## Decompile run of 2026-11-14 and the retry

First full pass: 4,575 unique functions attempted, 4,659 files with real pseudocode (including the earlier batch). 787 replies were errors that the old script saved as if they were code:
- 432 "complete MCP response exceeded" (very large functions with `analyze_function` detail=complete);
- 355 "No procedure exists at the requested address" (Ghidra did not create a function at that IL2CPP entry).
Fix: the batch now uses `procedure_pseudo_code` (pseudocode only), retries by file offset (from dump.cs), then falls back to the containing function, and treats any error reply as a failure (logged in `failures.log`, no file written, retried on the next run). The 787 error files were deleted and a retry run started (one more binary import).

## Retry result (2026-11-14 08:55 UTC)

4,575 planned function bodies: 4,255 have Ghidra pseudocode; the last 320 have no Ghidra function even by file offset or containing function, so `tools/disasm_missing.py` writes Capstone disassembly for them (`*.asm.c`). Coverage of the plan is now 100% (93% as C-like pseudocode).
