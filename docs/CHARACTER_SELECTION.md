# Character selection — 2026-11-13

Flow: Play -> character selection -> Confirm starts the run. New Run from Pause/death returns to selection. Back/Escape returns to the ready screen. Settings/Lab can still open without starting simulation. Fox is the only playable model; selecting another card inspects its name/portrait and disables Confirm. Search filters the roster. Readiness is web integration status, **not native unlock status**.

User reference: codex-clipboard-9e470d83-7e11-43ae-8bf7-baddeec59ead.png. Layout follows roster left / 3D model centre / details right, using existing BorderWindow and button art. The Fox model uses the actual shared rig, idle animation at 30 preview FPS, transparent local scene and bounded pixel ratio. It mounts only for Fox and disposes on closing/changing selection; errors have a local Retry. This is not the original menu environment.

21 names/IDs copied from existing character data.json exports. 20 portraits copied unchanged; TonyMcZoom has no portrait in that source. public/characters/provenance.json records source paths and SHA256 of metadata/portraits. No extraction. Do not use a portrait as a playable character model.

The supplied screenshot establishes Fox description, Firestaff description and RNG Blessing text (Gain 1.5% luck per level). Display these as reference descriptions only: no luck/passive calculation is enabled. The existing Firestaff/Sword playtest weapon override remains clearly labelled, and no native starting-weapon or passive behavior is changed.

## Requests for the extraction AI / unresolved reference data

- Resolve the complete official display names/order (e.g. screenshot Sir Oofie versus source catalog Knight; Sir Chadwell, Cl4nk and Tony McZoom naming). Do not guess identity mappings or rename IDs from appearance.
- Complete non-Fox model/rig/skin/animation/material payloads: continue existing multi-character request in EXTRACTION_BACKLOG.md. Native skin slots/defaults/material mappings are not implemented.
- TonyMcZoom portrait: source data.json portrait is null; inspect existing exports first, do not automatically re-extract all portraits.
- Native unlock eligibility, prices and persistence. Screenshot Silver prices/black silhouettes are account-specific presentation, not defaults. Web NOT READY does not mean locked or purchasable.
- Per-character Rank/XP/run-count schema and event rules. Screenshot Rank 26 / 11 Runs must not seed local progress.
- Resolve native startingWeapon references and state/stat/passive bindings for all characters. For Fox RNG Blessing, screenshot text is known but base luck, additive/multiplicative formula, level-1 treatment, cap, save behavior and passive trigger need evidence before gameplay implementation.
- Skin availability/pricing and preview, confirmation/back/menu transitions, source scene/environment assets and character-selection audio event mapping.

Return verified / inferred / unknown separately, with raw references and method-body evidence for formulas. Preserve existing files; extraction belongs to the other AI. Stay in Phase 2 and retain user movement/combat/audio tuning.

2026-11-14 user feedback: selection Fox faces the camera and supports primary-button horizontal drag rotation. Unplayable portrait alpha silhouettes are black in roster/details; source images stay unchanged. This presentation follows user instruction, not native unlock-state logic.
