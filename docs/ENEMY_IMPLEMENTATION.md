# Skeleton baked animation integration â€” 2026-11-13

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


## Performance follow-up

Following user-reported FPS drops, SkeletonView now skips offscreen instances using a conservative sphere/frustum check, marks dynamic instance buffers appropriately and uploads only occupied ranges. It reuses transform scratch objects and hides empty batches. With120 visible live instances, matrix data scheduled for update is120*16 floats rather than8*240*16; this is an upload-volume check, not a GPU timing benchmark. Damage shader only evaluates dissolve noise for dissolving instances. Baked geometry retains the same1694 vertices/1040 triangles per enemy as the prior static mesh. Camera now performs one terrain raycast per changed pose rather than three per frame; unchanged camera poses reuse the prior collision result. Existing89 trees are rendered as two static instanced batches instead of178 separate meshes, with original positions/geometries/materials retained. `tools/check_render_cost.mjs` verifies structure/transform/cache behavior. Actual browser FPS still requires user testing.


## Bandit integration — 2026-11-13

Direct native chain: EnemyData8032 Bandit -> Material106 m_bandit_default -> Texture824 t_bandit_default, and AnimatedMesh7779 Bandit. The serialized animation has one RunForEnemyAnimation clip,8 mesh frames and7FPS; catalog frameCount7 again differs from the actual list. Import with `python tools/import_enemy_animation.py --species bandit`. Raw source bytes/material/frame hashes and source/output hashes are preserved beside the animation. Rotation(-90,0,0) and rendererScale1.25 are retained as evidence; the web keeps its established1.6m normalized height.

BakedEnemyView generalizes the former Skeleton-only renderer; SkeletonView is a compatibility re-export. Each species uses its own texture, FPS and frame batches, with the existing offscreen culling and occupied upload ranges. Enemy/corpse kind keeps models consistent through death and reset. Bandit now appears as every fourth ordinary spawn within the unchanged total120-enemy cap. The fraction is sandbox tuning, not a native encounter table. Existing chase/contact/HP/damage/loot tuning is shared for this first integration, not native Bandit AI parity. There are no new growls/spawn/death sounds inferred from catalog labels.

Lab Enemies includes Bandit Walk/Hit/Death with the same renderer. Switching species clears old instances. Native Bandit geometry has2985 vertices/2620 triangles per frame versus Skeleton1694/1040; this is a higher-cost model. Batching/culling remain active and the initial fraction is deliberately limited, but no unchanged-FPS guarantee or benchmark is claimed. User tests appearance, orientation, gait and actual performance.


Stage note: The user clarified that the original game has stage-specific enemy rosters. The mixed Bandit/Skeleton schedule is authorized only as a temporary test-arena roster. Stage/timeline spawn reconstruction is deferred and tracked in [EXTRACTION_BACKLOG.md](EXTRACTION_BACKLOG.md).
