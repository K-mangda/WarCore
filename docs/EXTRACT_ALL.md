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
