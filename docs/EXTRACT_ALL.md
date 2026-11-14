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
