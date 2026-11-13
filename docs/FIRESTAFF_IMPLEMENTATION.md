# Firestaff integration review

Date: 2026-11-13. Local work only; no commit, push or deployment performed for this change. Stable published commit remains d03c302.

## Implemented together

- Replaced the orange placeholder sphere with original Firestaff sprite atlases and thirteen native particle layers: projectile/core/fire/spark/smoke trails, muzzle, explosion and generic hit.
- Source constant/curve/gradient evaluation, atlas animation, distance/time emission, bounded bursts, looping projectile core, local/world simulation, stretched spark billboards and gravity. No dynamic Sword changes.
- Enemy-targeted initialization and source forward spawn offset, temporal quantity bursts,0.5-second base end cooldown,1-second burstTime and0.15-second minimum burst interval. The recovered generic burst timing formula is reused. Failed target initialization emits no phantom projectile or sound.
- Explosion damages enemies within the baseline5m radius once per projectile; actual individual enemy collider contact remains the sandbox swept-segment approximation.
- Verified shot clip with source volume0.7/pitch endpoints0.94..1.06; explosion variants volume0.4; generic Hit2 volume0.12. Disabled muzzle audio is not played. Existing audio unlock, priority cap, mute and pause/reset cleanup apply.
- Firestaff selector in Lab uses the same Run, StaffView and GameAudio. It offers deterministic timeline scrubbing, a stationary training target, facing, combined sequence+sound and stop/mute. The alternate camera is confined to Firestaff's Lab view.

## Primary files

- src/combat/StaffView.ts: bounded source-driven renderer, max192 particles/layer and2400 total; reset/dispose and zero-delta burst protection.
- src/combat/Run.ts and Balance.ts: Firestaff target/burst/impact and area-damage events. Internal weapon ID bolt remains for compatibility; UI now says Firestaff.
- src/combat/View.ts: integrates StaffView and removes sphere rendering.
- src/audio/GameAudio.ts: source-backed Firestaff clip mappings, volume and pitch endpoints; no duplicate disabled muzzle sound.
- src/dev/SwordPreview.ts, src/dev/lab.css, lab.html and tools/sword-preview.html: shared Lab selector and actual simulation playback.
- src/main.tsx: Firestaff label only.
- public/weapons/staff/: manifest, original textures/WAVs, raw metadata and source hashes.
- tools/import_staff_assets.py: reproducible exporter; non-finite Unity curve tangents are preserved as strings in valid strict JSON rather than invalid JSON Infinity tokens.
- tools/check_staff.mjs, check_combat.mjs, check_audio.mjs: integration/regression coverage.

## Source and native evidence

Installed sharedassets1: WeaponData8619 -> attack3199 -> projectile4255, muzzle3316, explosion3784, generic-hit3790. FireStaff enum0. The latest external catalog is Desktop/WarCore/megabonk_extracted_assets; its normalized enum/field/status errors were not trusted.

ProjectileExploding.TryInit RVA0x4EB660 queries EnemyScan.GetEnemy; null returnsfalse at0x4EBA01. onlySpawnWhenCloseEnemies=false does not mean an empty-space fireball succeeds. Generic projectile rotation begins at player orientation; TryInit then aims at the selected enemy.

WeaponAttack.GetSize RVA0x4503A0 computes1+(GetAttackSizeMultiplier-1)*projectileSizeMultiplier. The0.15 field is therefore not a uniform base visual scale of0.15. ProjectileExploding.Hitscan at0x4EB100 multiplies explosionRadius by GetAttackSizeMultiplier (mulss at0x4EB2BD). The unmodified web Size is1, so baseline radius5 is used.

## Checks performed

- TypeScript and production build pass.
- Combat checks: target requirement, timed quantity, projectile/muzzle/impact/hit events, bounded explosion damage, no-target silence and reset. Existing Sword checks remain passing.
- Renderer checks: all13 layers, native media headers, zero-delta pause without repeated burst spawning, long-flight looping core,2400-particle cap and reset/disposal cleanup.
- Audio tests use a mock context: verified event-to-file mapping, impact variants, no Bonk, pause/mute/priority/cleanup. They do not prove perceived volume or waveform equivalence.
- Browser: actual Lab frames at0.08/0.22/0.4s, sequence playback, game combat (11 kills), pause and fresh-run cleanup. No console errors were reported in that inspection. Hidden-tab FPS was throttled and is not a performance benchmark.

## Material limits

This is not full native parity. Native compiled glow/shader/postprocessing and spatial audio are not reconstructed. Shader alpha blending, source random distributions, weighted tangents and particle shape sampling are approximations; source modules are preserved. Some Unity modules (noise/collision/subemitters and detailed emitter orientation policies) are not ported. Spark stretch is supported; screen/camera effects are not reproduced.

Projectile speed25m/s,2-second lifetime, enemy collider radius/contact and terrain interaction still use existing sandbox tuning rather than complete native projectile motion. Target selection approximates native EnemyScan and does not reproduce all useVision checks. Native attack size/upgrade/per-character/proc systems are incomplete. Explosion damage uses current web damage without claiming all native hit/element/proc behavior. Impact/hit sound scheduling is tied to the web collision event; the native random/filter attenuation algorithms remain unknown. WAVs are copied from the validated local export catalog, not independently decoded from native compressed data in this pass.

Frame scrubbing is a deterministic replay fixture with an anchored target; it is not a second gameplay implementation. The game remains paused while its Lab overlay is open. No map, player movement, Sword asset or Sword combat rule changes were intended.
