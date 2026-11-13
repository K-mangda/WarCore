# Skeleton baked animation integration — 2026-11-13

This starts the previously announced enemy work slice. The existing branch and sandbox AI/spawn rules are retained; no boss or new species is introduced.

## Native chain

Directly inspected installed `sharedassets1.assets`:

- EnemyData8037 `Skeleton`: Material277 `m_skellyNew`, AnimatedMeshScriptableObject7798 `Skeleton animations`.
- Animated mesh raw data: FPS8, one animation `Moving`, **eight** Mesh references1729..1736, named0.0000 through1.0000. The supplied catalog's frameCount7 is incorrect for this serialized list.
- Material277 `_AlbedoMap` points to Texture802 `PSD_SkeletonNew`; `_MainTex` points to the same texture.
- EnemyData renderer rotation(-90,0,0), rendererScale1.25. Import applies the rotation, then Unity-to-Three X reflection and reversed triangle winding.

`tools/import_skeleton_animation.py` writes `public/enemies/skeleton/animation.json`, native texture, raw EnemyData/animation bytes, frame hashes and material fields. Source and output hashes are recorded in provenance.json. Existing static skeleton files are preserved but gameplay now loads the animated set.

## Runtime

`SkeletonView` batches enemies into one InstancedMesh per baked frame. Geometry/material/texture are shared across instances rather than updating a skeletal rig for each enemy. There are at most eight frame batches per renderer, with bounded capacity for120 live enemies and120 visual corpses. This removes per-enemy skinning work, but does not establish an FPS improvement over the previous single static mesh. No benchmark is claimed.

The frame clock follows Run.elapsed and source8FPS, so pause freezes animation. A deterministic ID phase offsets neighboring skeletons. Near-player stationary enemies use frame0 because no verified Idle clip exists in this data. Death stores the animation time/ID, freezes the selected baked pose and uses the existing white dissolve. New run removes old instances. Each renderer owns and disposes its resources.

Game CombatView and the Lab Enemies tab use the same SkeletonView. Lab rooms show Walk, Hit and Death; timeline scrubbing is silent, Play may dispatch the shared Hit2 cue once, and Stop freezes preview. These are controlled state fixtures, not a second AI/combat implementation.

## Limits and tuning

- Retains the established web visual height1.6m, normalizing all frames together; native rendererScale1.25 is preserved as evidence rather than silently replacing current world scale.
- Source baked geometry, UVs and texture are real. Frame normals are computed by Three.js. Native toon/outline lighting and full material shaders are not reproduced.
- Native AnimatedMesh state transitions, frame-event policies, dynamic speed/stat scaling, AI and encounter/spawn rules are not reconstructed. Current walking speed, HP, contact damage and loot tuning remain unchanged.
- Frame0-at-rest and ID phase offsets are web choices. No invented idle, attack, death animation, spawn cry or monster death sound is added.
- White flash/dissolve remain the earlier documented web approximations; their timings are not new native evidence.

## Validation

Run `node tools/check_skeleton.mjs`: checks8FPS/eight-frame payload, valid mesh indices/UVs/finite positions, batching120 enemies, pause stability, death-pose stability, Lab hit/death and disposal. Build/typecheck, existing combat/audio/staff checks and deployment-path validation cover integration. These are CPU/mock-renderer checks; user handles rendered orientation, stride, audio feel and gameplay/performance testing.
