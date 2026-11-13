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

## Impact audio correction — 2026-11-12

Removed the provisional universal hit -> Bonk.wav mapping from both combat events and audio loading. It previously played on every successful sword/bolt hit, without verified source mapping. Sword swing still uses HeroSwordAttack.wav; projectile shot still uses its existing clip. Enemy-hit and weapon-impact audio is pending verified references from the external extraction task. The Bonk file remains preserved as an unused source asset; its presence does not justify playing it on every hit. This entry supersedes the earlier hit mapping/interval in this register.

## Correct Sword identity and automatic cadence — 2026-11-12

IMPORTANT: Earlier entries calling the HeroSword assets the Knight's Sword were wrong and are superseded here. The external package combined the name HeroSword with enum ID2, but installed data proves these are different weapons.

Verified chain (sharedassets1.assets): Knight CharacterData7823 -> WeaponData8633 WeaponSword (EWeapon.Sword2) -> attack4144/WeaponAttack8928 -> SwordProjectilePrefab3436 -> Particle7070/Renderer7165 -> Material428 -> Texture704. Icon1315 and AudioClip2119 SwordSwing are separate from HeroSword27 / WeaponData8622 / Particle7039 / Texture930 / HeroSwordAttack2112.

The playable Sword now loads public/weapons/knight-sword, exported with tools/import_knight_sword_assets.py. Source particle size10.7, lifetime0.15s, speed6, UV8x8row1 and its active blue color/alpha gradient are used. ExtraGlow3 and compiled shader metadata are preserved, but native glow/postprocessing is not reproduced by the web MeshBasicMaterial. Previous HeroSword assets remain archived under public/weapons/sword; they are no longer the playable Sword's media. The WAV is a validated prior local Unity export because direct decode fails; provenance states this limitation.

Sword now swings on cooldown even in empty space and never acquires an enemy to determine its direction. This corrects the user's reported automatic behavior. The web chooses facing from camera yaw, and range4m,120degree sector,0.3s hit window,multishot spread,1.8m forward anchor and attack cooldown remain provisional. Source visual lifetime0.15s is kept separate from the provisional0.3s damage window. Full native trajectory and timing have not been reconstructed.

Validation: build, combat including empty-space/facing/cadence regressions, and sword-pose checks pass. Browser loaded the corrected asset set and completed a run. Automated screenshots did not isolate the short slash reliably; no exact screenshot or audio comparison with native gameplay is claimed.

## User-requested size/speed tuning — 2026-11-12

Reduced Sword visual scale to0.55 of the extracted size:10.7 ->5.885 web units. This is a requested visual override in combat/Balance.ts, not an edit to original particle metadata. Hit range/damage and effect anchor remain unchanged.

Reduced player horizontal movement cap by30%:10 ->7m/s, using playtestMovement.speedMultiplier0.7 in player/Physics.ts. Both grounded movement and air acceleration use the reduced base cap; existing momentum preservation still applies. Jump impulse/gravity are unchanged. These are user-requested playtest adjustments, not claims about native balance.

## Sword quantity and pose correction — 2026-11-12

Removed invented60degree side fan and shared hit history across quantity. Quantity now produces temporal forward swings with independent hit histories. Web burst spacing=max(source minBurstInterval0.1,source burstTime0.5/quantity) is a provisional interpretation, NOT a verified native formula. End cooldown still uses the web upgrade-controlled attackInterval rather than claiming native timing parity. Pause freezes a pending burst; reset clears it.

Changed visual origin to source spawnOffset0.5Y/2.5forward. Composed source particle localX90/Y90/Z15 with Unity-to-Three handedness conversion and projectile facing instead of forcing one atlas edge onto the forward axis for every frame. Initial local-to-world composition is tested mathematically, but exact native runtime transforms/appearance remain unverified. User-requested visual scale0.55 and speed0.7 remain intact.

Future weapon investigation requirements are recorded in WEAPON_BEHAVIOR.md and .cursor/rules/weapon-behavior.mdc. No universal quantity pattern should be assumed for the other weapons.

### Follow-up: exact burst formula recovered

Focused static native disassembly resolved GetBurstInterval0x434840, StartAttackNoCoroutine0x450C30 and FixedUpdateAttack0x450150. AttackTiming.ts now uses max(burstTime/quantity/AttackSpeed,minBurstInterval/AttackSpeed,fixedStep) for a positive burstTime. First swing is immediate on the next fixedtick; later swings discard elapsed remainder and spawn at most once per tick. The earlier base-state spacing approximation is superseded. Web haste -> AttackSpeed mapping, end cooldown, full damage/trajectory and other weapons' policies remain incomplete. Details: WEAPON_BEHAVIOR.md.

## Full-frame Sword alignment and sound integration — 2026-11-12

User screenshot showed lateral drift still present. The original atlas frames have different alpha-weighted visible centers inside their transparent tiles. New derived frame-alignment.json records those centers; tools/build_sword_frames.py computes them without editing the source PNG. SwordView subtracts the transformed/scaled per-frame center so visible pixels remain at the forward spawn anchor throughout the animation. This is an explicit web alignment correction, not a claim that native Unity changes pivots the same way. Source animation/color/size override remain active. Empty atlas frames are hidden.

The earlier .1s hard repeat gate on SwordSwing is removed; sequential swing events can each play. Audio preloads encoded bytes, tracks per-event voices, prioritizes sword/hurt/level/death over pickups/UI under the10voice cap, and stops stale gameplay sounds on pause/reset while preserving UI/level/death notifications. Voice priorities and sampling remain web policies; native filter attenuation/mixer/spatial routing and impact variants remain unverified. The first gesture may still occur before decode completes; stale gameplay events are not replayed late.

Integrated checks cover quantity repeats and repeat hits, recovered burst timing, every visible atlas-frame center across multiple facing directions, and audio event dispatch/priorities/pause/mute/cleanup. The audio test uses a mock context; it does not claim to verify listening or perceived loudness. Browser load/start/pause were exercised; the pause overlay obscures the effect and no exact rendered comparison with native gameplay is claimed.

## Stable Sword animation regression correction and Lab — 2026-11-12

The earlier per-frame alpha-center correction was wrong: changing the entire quad position by roughly0.6-1.1m between adjacent cells made the animation appear scattered. Removed dynamic recentering. The native zero pivot is now stable; only a fixed heading calibration based on the first frame is applied to the entire animation. Original frame sweep/fade remains intact. This heading calibration is a web visual correction, not fully verified native transform parity. Inspected actual rendered early/middle/late frames in the shared-renderer Lab, rather than treating an axis test as visual proof. This entry supersedes the full-frame re-centering entry above.

LAB button opens /lab.html embedded over the paused game. Back to game removes the Lab without replacing the game instance. Lab supports frame age, facing angle, one attack with original sound, stop/mute and a damage-number sample. It shares SwordView, GameAudio and DamageNumbers with the game. Only the Sword room is implemented. Vite builds both index.html and lab.html. Browser checked navigation, actual glyph sample and attack playback controls.

## Damage font and user-requested size — 2026-11-12

Native damage chain: sharedassets2 DamageNumbersNew785 -> DamageNumbers3114 -> TMP3205 -> PressStart2P-Regular SDF3029 -> Material2 -> Texture110. Original SDF atlas/glyph metrics are exported under public/game-ui/damage using tools/export_damage_font.py. It is Press Start2P, not Alagard or monospace. No original TTF was found; no substitute TTF is used.

DamageNumbers.ts rasterizes original alpha-channel SDF digits with foreground threshold0.5/black-underlay threshold0.3 and native padding20. CPU threshold rendering, cream foreground color, sprite dimensions and animation are web approximations; native TMP shader/underlay rendering is not fully reproduced. Font raster height is28px, reduced from42px by one third at the user's request. This same renderer serves game and Lab. Build and glyph preview were checked; this does not claim native pixel-perfect damage typography.

## User-requested slower jump/fall/animation — 2026-11-12

Added playtestMovement.airTimeScale0.8. Vertical jump impulse is multiplied by0.8 and airborne gravity by0.8 squared, extending flight roughly25% while retaining approximately the prior jump height (small fixed-step differences remain). Both ascent and descent slow down; walk/run speed override0.7 stays separate. Jump/fall animation actions use matching0.8 playback speed; idle/run animation and combat timing are not globally slowed.

Original physics constants, source clips and jumpDelta() are retained. This is user-requested feel tuning, not a newly recovered native formula. Jump and landing sounds still trigger on actual motor transitions, so the landing sound follows the later contact; original sound pitch/duration is not stretched. The regression check verifies approximate height/longer flight and queued input still surviving the slower landing.

## Local Firestaff integration — 2026-11-13

See FIRESTAFF_IMPLEMENTATION.md for the full file list, source evidence, integrated checks and limitations. Firestaff now uses native layered VFX, shot/explosion/Hit2 media, enemy-targeted temporal quantity, baseline explosion damage and shared Lab playback. It remains a bounded Three.js subset of Unity's particle/shader behavior; native postprocessing, spatial audio, filter/random distributions, full target visibility, movement and upgrade/proc behavior are not fully ported. Existing projectile speed/lifetime/collider tuning remains provisional. No push/deploy was performed for this change.


## Compact Firestaff visuals — 2026-11-13

User-requested web tuning: impact and generic hit particle scale is 0.5 of the previous rendering; projectile/trail and muzzle scale is 0.8. Original particle layers, emission counts, timing, sound events and gameplay explosion radius remain unchanged. These are visual overrides, not recovered native scale corrections. Atlas sampling uses a half-texel inset and linear filtering without mipmaps to avoid adjacent-frame bleeding; original low-resolution source artwork remains unchanged. Build validation only; perceived size and sharpness await user playtesting. Local only, no push/deploy.


## Compact Firestaff hit area and automatic Lab dummy � 2026-11-13

User playtest reported oversized hits. Firestaff swept collision threshold reduced from 0.7m to 0.45m; explosion damage radius reduced from serialized 5m to a provisional 1.5m web override. Visual scales and sound events remain as previously tuned. Lab dummy is now automatically visible in both weapon rooms, at 2.5m for Sword and 6m for Firestaff; Sword room remains a visual timeline preview, not a full damage simulation.


## Native EXP atlas integration — 2026-11-13

Replaced octahedron placeholder with the native XpPickup billboard atlas chain, shared by game and EXP Lab. See XP_ASSET_HANDOFF.md for exact IDs, reproduction and missing-evidence prompt. Source size/color/frames are used; custom glow, runtime tier/particle updates and native movement remain incomplete. Existing collection mechanics and Xp2 event retained. No speculative new spawn/attraction sound or VFX added. Local only, no push/deploy.


## EXP, currency and level-up integration - 2026-11-13

See PROGRESSION_IMPLEMENTATION.md for source corrections and remaining approximations. This supersedes the earlier low-tier-only/constant-speed EXP and Levelup3 in-run mapping. EXP now retains values, tier colors/scales, stacking and accelerating attraction from the external report. Currency uses native atlas art with separate sounds and HUD balances. Level-up uses LevelupAfter, Levelup4 and LevelupAmbience with loop cleanup, plus native burst/text art. Incorrect currency IDs and text texture claims in the report were corrected by direct reference traversal; native disassembly was not independently repeated.

XP threshold5+3 and three upgrade choices remain provisional. For sandbox playtesting every5th kill drops1 gold and every12th drops1 silver; native probabilities and values remain unknown. Activation radius5m, target+.35Y, omission of random spawn offset, money cap/merging, level burst directions/text placement and custom shader rendering remain web approximations. No boss/chest orb, echo generation, XP damage proc or persistent economy is claimed. Source rows/modules/hashes are saved in public/progression. Build/combat/staff/mock-audio checks passed; visual/audio/gameplay testing is left to the user. Local only; no push/deploy.


## Screenshot-guided EXP size, glow and collection feedback - 2026-11-13

User requested smaller luminous EXP and cyan collection numbers. XpAppearance.xpVisual sets visual scale0.42, brightness2.5, additive procedural halo scale2.4/opacity0.32. Source atlas and tier colors/scales remain intact. Linear sampling and half-texel UV inset prevent neighboring cell bleed. This soft halo is a web approximation, not native bloom/shader parity.

Run now records actual awarded XP, aggregating collections within one fixed tick. PickupNumbers displays cyan +value above the player using existing native SDF glyphs, a short pop/rise/fade and a bounded24-label limit. Game and EXP Lab share the renderer. Size, color, placement, aggregation and timing are tuned from user screenshots, not extracted native feedback parameters. The existing Xp2 collection event remains; automatic level-up pause now preserves the current pickup sound instead of cutting it immediately. Ordinary pause/reset/Lab stop still stop stale pickup audio. No speculative spawn or attraction sound added. User handles rendered appearance/listening validation. No push/deploy.
