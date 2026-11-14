# Extract everything in one command

```bash
node tools/extract_all.mjs            # plan + Unity dump + Ghidra decompile + coverage report
node tools/extract_all.mjs --skip-ghidra   # Unity data only (about minutes)
```

Everything lands in `.local-evidence/` (git-ignored; the game's files are not committed). Resumable: re-running skips what is done.

| Step | Tool | Output |
|---|---|---|
| 1 Plan | `tools/build_decompile_plan.py` | `decompile-all-plan.json`: every non-trivial method of all Assembly-CSharp classes (~5,550), weapons/Tomes/enemies/interactables/items first |
| 2 Unity data | `tools/dump_all_unity.py` | `unity-dump/<asset file>/`: `objects.jsonl` (every object's full typetree, MonoBehaviour class names), `textures/`, `sprites/`, `audio/`, `meshes/`, `catalog.json` |
| 3 Code | `tools/rea_decompile_batch.mjs` (Ghidra via REA) | `decompile6/<tier>__<Class>.<method>_<rva>.c` pseudocode; one binary import (~35 min) then seconds per function |
| 4 Coverage | `tools/coverage_report.py` | `docs/DECOMPILE_COVERAGE.md` |

Not covered by this command yet: animation retargeting/FBX with skeletons (meshes are exported as OBJ only), shader source, the IL2CPP metadata strings (already in `dump.cs`).
Needs about 1.5 GB free RAM for Ghidra; close heavy programs first.

## First full Unity run (2026-11-14, 4 minutes, 386 MB)

50,473 objects; 1,172 textures, 716 sprites, 750 meshes (OBJ), 134 animation clips, 311 audio clips, 12,284 MonoBehaviours.
Known gaps: **audio** - all 310 non-trivial clips fail with `FORMAT` (UnityPy needs an FMOD/FSB5 decoder; install one such as `pyfmodex` + FMOD, or vgmstream, and re-run); **432 MonoBehaviour typetrees** fail (`failed to dump nodes raw`, generic/odd types; listed in `<file>/errors.log`); PlayerSettings 1.
