# Temporary implementation register

Updated: 2026-11-12. This register describes the current web implementation, not verified Megabonk parity. Update or remove entries when original behavior replaces a temporary implementation; record the evidence used. Extracted assets alone do not prove matching behavior.

## Audio — src/audio/GameAudio.ts

- Original WAV files are stored under public/game-audio; provenance.json records their imported sources. The mapping from web events to these clips is provisional, not a verified native event table. Current mapping: click=MenuClick, hover=menuMove, shot=retro_shoot_fireball3, hit=Bonk, xp=Xp2, level=Levelup3, hurt=PlayerDamage, death=DeathImpact, jump=Player_Jump, land=Player_Landing.
- Master gain 0.35, minimum repeat intervals XP=0.08s / hit=0.09s / hover=0.07s / other=0.12s, and maximum 10 simultaneous voices are web tuning choices. They are not extracted native values. At capacity the new sound is skipped; existing sounds continue. Important sounds currently share this limit.
- Native dump.cs contains AudioSpamFilter (line 329422), spamDelay, minVolumeMultiplier, maxInterval, overrideMinInterval and FindVolumeMultiplier. This proves a native filter exists, but the dump has empty method bodies and does not establish its values, which clips use it, or the exact algorithm. Do not equate the web filter with it.
- The web currently has master mute only, no native mixer/category controls, spatial audio, native random pitch/clip variations or music system. The first click starts asynchronous decoding, so its own click sound can be silent before the buffer is ready. Browser gesture unlock is a platform requirement.
- To replace: inspect original serialized audio components and mixer settings, then confirm event mapping and filtering. Keep browser unlock separate from native behavior.

## Combat and progression — src/combat/Balance.ts, Run.ts, View.ts

- All values in Balance.ts are sandbox balance: health/damage, enemy speed, contact timing, spawn timing/range/caps, attack timing/range/projectile movement, pickup and magnet radii. Capacity limits are web safeguards, not native caps.
- The automatic magic bolt, target selection, simultaneous multishot, enemy chase/contact/collision, damage labels and XP gem geometry are simplified implementations. XP color has source evidence; its shape and collection behavior are not verified.
- XP starts at 5 and increases by 3 per level; the three upgrades add 5 damage, reduce cooldown by 15% (floor 0.15s), or add one projectile (cap 8). These are provisional web rules, not the original upgrade catalog or probabilities.
- Current enemy visuals do not establish native animation or AI parity. Full weapon/item/enemy/encounter systems remain incomplete; consult PARITY_MATRIX.md and COMBAT_LOOP.md.

## Movement and camera — src/player/Motor.ts, src/camera/Orbit.ts

- Physics.ts distinguishes source-backed constants; do not label all movement constants as invented. MOVEMENT_REBUILD.md records the supporting evidence.
- The browser motor still approximates native acceleration/friction/air control, heightfield contact and collision rather than Unity PhysX capsule solving. Contact tolerances, terrain-gradient sampling and arena clamps need parity verification.
- Sliding is intentionally disabled (slideEnabled=false) and deferred, even though investigation code remains present. Do not present it as a finished native feature.
- Camera offset, sensitivity, pitch bounds, terrain obstruction and drag fallback are web implementation choices, not verified native camera behavior.

## Map, appearance and UI

- src/environment/forest/Sandbox.ts is a test arena. Original map recreation is deferred by user instruction; do not expand the placeholder as if it were native terrain.
- Lighting, fog, effects and rendering settings are provisional. Fox texture, rig and clips have extracted provenance (FOX_ASSETS.md); integration does not guarantee native state transitions/blending.
- UI images and fonts under public/game-ui are extracted assets with provenance. Web CSS sizing/layout, colors, dialogs and interaction flow remain approximate. layout.json records selected original RectTransforms; it is evidence, not a complete native UI port.
- Current UI uses original DamageTome/CooldownTome/QuantityTome icons for provisional upgrades and Firestaff for the provisional bolt. These associations are not proof of matching original mechanics.

## Editing audio without re-extraction

- Filenames in GameAudio.ts are editable references, not a baked or locked audio system. Change a mapping to another available clip, or replace a file and reload.
- Gain, timing, overlapping voices and event triggers are code settings. Pitch/playback rate, fades, spatial position and mixer categories can also be implemented without re-extracting WAVs.
- WAV waveforms can be edited in an audio editor; preserve the original and save a variant. Re-extraction is needed only for missing/wrong/damaged exports or additional original game content, not routine sound tuning.

## Sword integration — 2026-11-12

- Starting-weapon selection now allows Sword alongside the existing magic bolt. Sword uses the original audio clip, icon, atlas, and exported native Quad. Corrected source metadata lives under public/weapons/sword/metadata, with hashes/limitations in provenance.json; tools/import_sword_assets.py recreates the handoff.
- Melee range4m, 120-degree sector, vertical tolerance, knockback, attack timing/damage and multishot spread are provisional sandbox rules. Each swing shares hit history across overlapping sectors and cannot damage an enemy twice. This is not reconstructed ProjectileHeroSword behavior.
- Source moving-particle size8/color/atlas8x8 row2 and frame curve endpoints are consumed by SwordView. Web placement 1.8m forward, horizontal plane orientation, linear frame interpolation, final0.08s fade, normal transparent MeshBasicMaterial and depthWrite=false are provisional. Native shader, emission/curves, spin, movement and primary particle6883 are not fully reproduced. Sword.glb is preserved but is not attached to Fox or used as the slash shape.
- Sword sound uses source volume~0.4 and normalized pitch endpoints~0.9/1.1. Uniform sampling is a web choice: serialized min/max labels are reversed relative to those normalized endpoints. Native random-volume distribution is not reconstructed; no invented volume jitter is applied.
- Sword minimum repeat interval0.1s uses the saved spamDelay as a tuning input, but hard-skipping repeats and the global10voice cap remain web approximations. Native filter volume attenuation is not implemented. Sword uses the web master gain0.35 and nonspatial routing, not the native mixer/spatialBlend0.5.
- Build and combat/sword simulation checks pass. Browser visual/audio verification of this revision was blocked by in-app browser localhost connection timeout; do not claim listening or screenshot verification.

## Sword orientation correction — 2026-11-12

SwordPose.ts now aligns the visible crescent edge (local +X of the exported X-mirrored Quad) with the actual horizontal attack direction. The previous orientation treated a different quad axis as forward, making the crescent appear at the character's side. The quad normal remains world up and the center retains the provisional 1.8m forward offset. This corrects the web axis mismatch; native placement/swing trajectory remains unverified. Run node tools/check_sword_pose.mjs for the directional regression check.
