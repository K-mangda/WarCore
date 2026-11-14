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


## User-requested smaller, low-hover rotating EXP - 2026-11-13

Reduced xpVisual.scale0.42 to0.35 (about17% smaller). EXP spawn elevation now uses balance.xpHoverHeight0.35 above sampled ground instead of the externally reported2m offset; currency height is unchanged. EXP Lab uses the same hover setting. These are explicit user playtest overrides. XpView now loops the native seven-frame crystal turn every0.5s instead of holding the last frame, so crystals keep rotating while waiting and following. Simulation elapsed time still freezes animation on pause. Continuous looping is a user-requested interpretation, not independently recovered ring-buffer behavior. Existing glow, tier ratios, collection numbers and sounds remain. No push/deploy.


## Further user-requested slower movement and jump - 2026-11-13

playtestMovement.speedMultiplier0.7 ->0.63 lowers walking/running and airborne movement cap from7 to6.3m/s (10% slower than the previous playtest). airTimeScale0.8 ->0.7 further slows ascent/descent and jump/fall animation, extending nominal flight by about14% relative to the previous version while retaining approximately the same apex. Existing motor scales vertical impulse by airTimeScale and gravity by its square; Fox airborne animation uses the same factor. Grounded animation, combat and source physics constants remain unchanged. Motor regression checks use the configured time scale for flight duration bounds. This is requested feel tuning, not recovered native balance. User authorized pushing this update.


## Screen-anchored EXP and dual-currency counters - 2026-11-13

User screenshots supersede the upward-floating XP feedback. PickupNumbers now projects the player anchor into a camera-plane overlay at a fixed pixel offset. EXP (cyan +), gold (yellow $) and silver (pale S) use separate rows/counters and do not mix balances. Collection within0.9s continues the running displayed total; each new receipt retriggers a0.18s pulse and chain growth, capped at1.55x after12 increments. Counters fade after1.1s and hide after1.4s idle. Fixed pixel sizing ignores camera distance, depth testing is disabled for HUD feedback. All timing, prefixes/offsets and caps are explicit web tuning pending native evidence; totals always use actual award values. Texture/material replacements are disposed rather than cached indefinitely.

EXP size0.35 ->0.32 (about9% smaller); gold and silver billboards use the same0.32 base size rather than native1/1.5. Currency hover now matches EXP at ground+0.35m. Shared game/Lab changes; source artwork, separate currency sounds and wallet balances remain. Build and targeted feedback checks are required; rendered appearance/listening is left to user playtesting. No push/deploy.

Currency sprite tint now consumes native InitialModule.startColor.maxColor: gold(1,0.9311,0.3538), silver(0.7333,0.7843,0.8510). Previously both were rendered without their distinct source tints.


## Combat report follow-up: hit feedback, white flash and death dissolve - 2026-11-13

External combat_vfx_audio_manifest.json and the latest native call-site report attribute GeneralProjectileHit3790/Hit2 to both Sword and Firestaff, with audio only for the first hit target per attack/explosion. Sword now emits the shared hit VFX per damaged enemy and Hit2 once per slash instance. Firestaff emits Hit2 only after an actual AoE damage target is found, once per explosion; hit VFX is placed on each target rather than only at the impact center. Existing explosion audio remains separate. The internal event name staffHit is retained for compatibility but is now generic. Native filter attenuation and random distributions remain unported.

Direct UnityPy checks confirmed AudioSource1974 in sharedassets2: PlayerDamage volume0.17/pitch1; AudioSource8882 in level2: DeathImpact volume0.5/pitch1. GameAudio gains now match these source values before the existing web master gain. Direct Texture2D checks confirmed atlas01 PID711 and atlas02Custom PID545 are512x256 with filterMode0 (Point). StaffView now uses NearestFilter with existing half-texel inset/no mipmaps; native32px frames stay intentionally pixelated. No unsupported additive/premultiplied shader parity claim is made.

The earlier red damage tint was a web hit flash, not a separate enemy species. Replaced it with a white material-style flash. Enemy death now removes gameplay collision/targeting immediately, awards drops once, and retains a bounded visual corpse for a pixel dissolve. Dissolve direction/noise pattern and duration0.45s are explicit web approximations of the reported EnemyDissolve behavior, not recovered native parameters. Corpses freeze with gameplay pause, expire after their duration and clear on reset. No monster death cry was added. The sandbox still uses one skeleton mesh; native enemy roster expansion is not part of this change.

Build, combat, staff and mock-audio checks required; user handles visual/audio validation. No push/deploy.


## Automatic Lab dummy damage numbers - 2026-11-13

Sword Lab now uses the same anchored-dummy Run simulation as Firestaff rather than manually injecting a visual slash. Both weapon rooms automatically display actual Run.hits damage values at the hit positions, with rise/fade matching hit lifetimes. Playback emits the real swing/hit events; timeline scrubbing stays silent. Sword timeline extends to0.8s so impact numbers can rise and expire. The optional damage-sample button is retained as a separate font preview. Material clones for per-label opacity are reused/disposed without disposing shared font textures. No invented random damage values or extra duplicate audio is used. User requested pushing this update together with the combat feedback changes.


## Categorized Lab tabs - 2026-11-13

Lab now groups rooms into Weapons (Sword/Firestaff), Pickups (EXP/Gold/Silver) and Effects (Level up). Tabs expose tablist/tab/tabpanel semantics, selected state and Left/Right/Home/End keyboard navigation. Each category remembers its last selected room. Switching tabs stops previous playback/audio and resets the preview; existing weapon query links select the correct category. Preview time, facing and playback controls remain shared. Tabs enable after asset loading so an early switch cannot render unloaded fonts. No gameplay or asset changes. Build validation; no push/deploy in this change.


## Quick user-directed LEVEL UP tuning - 2026-11-13

User requested iterative size tuning without extensive comparison. LevelUpText scale is0.6 of serialized1.5 (web0.9). Its previously ignored source ColorModule gold/orange gradient now tints the text over its lifetime instead of leaving it white. No new UI sound mapping is guessed: current MenuClick/menuMove mapping remains pending event evidence/user direction. Existing gold drop path remains1 gold per5 sandbox kills (silver separately per12); this is not a recovered native loot table. No push/deploy.


## User-directed gold drop adjustment - 2026-11-13

Every sandbox enemy now drops1 gold on death, replacing the prior every5th-kill schedule at the user request. The amount1 remains provisional. Silver retains its existing temporary every12th-kill schedule because the native condition is still unknown; this is not a verified native drop rule. Pickup counters were also moved30 screen pixels farther right (55 ->85px offset). No push/deploy.


## Gold atlas frame bounds and white death silhouette - 2026-11-13

User close-up confirms a white silhouette throughout enemy dissolution. Corpses now retain the white material override for the entire0.45s web dissolve rather than only its first0.08s. Inspected public/progression/gold.png: native coin frames are present in the atlas row, tinted by source gold color at render time. Gold/Silver animation now loops within ceil(frameOverTime*tilesX) active frames (11/10), avoiding the prior lifetime-end hold on the first out-of-range atlas cell. Loop scheduling remains web tuning. No replacement/generated coin art; no push/deploy.


## Lower/slower jump and further walking tuning - 2026-11-13

User requested lower jump plus slower walking/ascent/descent. speedMultiplier0.63 ->0.57 (6.3 ->5.7m/s); airTimeScale0.7 ->0.6 also slows airborne animation. New jumpHeightMultiplier0.85 scales vertical launch impulse by sqrt(0.85), separately from the existing air-time multiplier. Gravity retains airTimeScale squared. Nominal apex is15% lower; nominal flight about8% longer than previous0.7 tuning. Source jump stat/physics constants remain intact. Motor regression expected impulse, height and duration now account for both independent settings. No push/deploy.


## Delivery preference update - 2026-11-13

User explicitly requested automatic commit/push for completed checked changes, and notification before any phase transition. This supersedes earlier per-change local-only delivery defaults; explicit later wait/no-push instructions still override it. Maintained skill: skills/warcore-development/SKILL.md, installed under the user Codex skills folder. Existing GitHub Pages workflow is part of the authorized push path. No phase transition is performed by this preference update.


## LEVEL UP small pop and gentle sway - 2026-11-13

User-directed text tuning: scale0.6 ->0.45 of native1.5 (25% smaller than previous). Text starts at88% of final size and eases to100% over0.12s, rises0.35m/s and sways0.055m sideways along rendering-camera right. Native text color gradient and lifetime remain. Motion/size are web tuning based on user description, shared by game and Lab.


## Pickup counter readability tuning - 2026-11-13

User requested no black outline, slightly smaller text, farther right/lower positioning. Pickup counters use native SDF foreground only (no black underlay); ordinary damage labels retain their existing outline. Base counter canvas height48 ->42 screen pixels (12.5% smaller), anchor85 ->105px right and24 ->12px up relative to projected player anchor. Existing currency colors, stack/pulse cap and fade remain. Shared game/Lab tuning, automatic delivery applies.


## LEVEL UP single-sided pop/sway and strict pause - 2026-11-13

User refined the desired motion: text starts at20% size, eases to normal over0.14s, floats from its head anchor, randomly chooses left/right once, performs one small sideways/tilt arc over its lifetime, then shrinks/fades over the last0.16s. These are user-directed approximations. The native source gold/orange color gradient is retained, not claimed visually exact.

The native text atlas has opaque dark pixels (742 dark opaque pixels in the selected64x32 tile). Text material now suppresses dark backing via a luminance alpha mask in the renderer; source PNG is preserved. This removes the visible dark plate without editing source art.

Engine now passes effect delta only while active AND Run is not blocked: manual pause, focus/pointer-lock loss and upgrade/death screens all freeze effects, including a level-up reached in the current physics tick. The initial small text remains frozen until gameplay resumes. Lab explicit timeline/playback remains a preview clock, with Stop freezing it. This supersedes the earlier special unscaled animation during the level-up modal. Automatic delivery applies.


## Shorter Firestaff target range - 2026-11-13

User requested shorter attack reach. staffTargetRange40 ->32m (20% shorter acquisition range). Explosion radius1.5m, projectile speed/lifetime, visuals and damage remain unchanged. This is user-directed web tuning; source metadata is preserved. Automatic delivery applies.


## Make gameplay gold drops visible - 2026-11-13

Gold already spawned on every enemy death and used the shared Lab renderer. It overlapped EXP at the same point and nearby drops immediately followed/collected. Gold now spawns offset0.45X/0.15Z and waits0.18s before attraction/collection so the user can see the coin drop before it is collected. These are explicit visibility tuning, not native drop physics. No gold is granted until pickup; separate currency balance, sound and counters remain. Focused regression verifies the gameplay death -> gold entity -> collected balance path. Automatic delivery applies.


## LEVEL UP lower head anchor and horizontal squeeze - 2026-11-13

User refined placement/end motion: text anchor2.5 ->1.85m above player ground origin, near the character head. After its single-sided sway, the last0.16s compresses horizontal width quadratically to zero while retaining height/opacity, then removes the sprite at expiry. This replaces uniform shrink/fade; opening pop, color and strict pause behavior remain. Shared game/Lab web tuning; automatic delivery applies.


## Follow moving player with LEVEL UP; shorter staff and smaller gold - 2026-11-13

User reported game/Lab mismatch: LEVEL UP text retained its original world anchor while the player could move/fall away, unlike the stationary Lab. Text now follows current player position plus1.85Y and its existing animated rise/sway; pause still freezes its age. Burst particles now use the previously omitted native blue startColor instead of white. Burst lifetime remains the source0.2..0.4s, shorter than text0.8s, so a late screenshot may show only text. No claim of exact native parity.

Further requested tuning: Firestaff target range32 ->24m (25% shorter), Gold visual scale0.32 ->0.256 (20% smaller), Silver/EXP sizes unchanged. Long-flight renderer fixture is within the new acquisition range. Automatic delivery applies.


## Gold-only faint glow and attraction shrink - 2026-11-13

User requested faint golden glow and progressive shrinking during attraction, exclusively for Gold. A shared procedural radial texture supplies a low-opacity additive golden halo around each native coin sprite. On attraction, size decreases with remaining distance to the player pickup target, down to15% near the collection threshold. The smallest reached scale is retained so player motion cannot make a sucked-in coin expand again. Halo inherits coin shrink. Stationary gold, EXP, Silver, collection values, timings and audio remain unchanged. Shared game/Lab renderer; source art untouched. Halo materials and shared texture are disposed appropriately. These are requested web visual tuning, not recovered native behavior. Automatic delivery applies.

User additionally confirmed desired head-high curved collection. Gold spawn height is1.8m above sampled ground, while EXP/Silver retain0.35m. Gold-only attraction follows a quadratic Bezier from its initial point through a midpoint raised0.8m to the live player target, driven by the existing acceleration; normal collection bounds remain. Lab gold starts at the same configured height. This is user-described web motion, not a recovered native trajectory, and assumes the current fixed-height skeleton; per-species head heights are not yet modeled.


## LEVEL UP quick center-collapse refinement - 2026-11-13

User clarified closing motion: shrink toward the center of the word rapidly, rather than squeezing width alone. Both X/Y scale now collapse quadratically over the final0.09s (previous width-only0.16s). Sprite center remains0.5/0.5, preserving centered contraction. Existing head tracking, opening pop, one-sided sway, source gold/orange tint and strict gameplay pause remain. User-directed web visual tuning; automatic delivery applies.


## Ground-born gold arcs and automatic collection - 2026-11-13

User clarified Gold starts at the ground like EXP, rises then arcs directly to the player without walking into magnet range. goldSpawnHeight1.8 ->0.35m. After the existing0.18s spawn visibility delay Gold activates following at any distance. Its Bezier control midpoint is raised3m (about1.5m of arc lift), with minimum trajectory length3m so near-player coins can visibly launch. Gold does not collect at its starting point merely because it is already inside collection range; collection waits until the final20% of the trajectory or completion. Existing glow/shrink and separate currency award remain. EXP/Silver attraction unchanged. This is user-directed feel tuning, not a recovered native rule.

Existing XP tiers are cyan values1..9, yellow10..49, red50+, with purple reserved for echo XP. Value belongs to each pickup; color follows value/echo state. Ordinary sandbox enemies still drop1 XP, so higher colors primarily arise through stacking. No extra tiers, fixed per-color award values or echo generation were invented in this adjustment. Automatic delivery applies.


## Slower gold flight and cream-gold LEVEL UP tuning - 2026-11-13

User requested slightly slower Gold flight. Gold Bezier progress uses0.75 of previous speed (about33% longer flight); activation, arc shape and gameplay reward are unchanged. LEVEL UP source art remains, while backing mask thresholds0.22/0.45 ->0.35/0.65 suppress more dark/gray edge pixels. User screenshot color override shifts prior saturated source orange toward cream-gold (1,0.84,0.55 ->1,0.76,0.42). This overrides the prior source gradient display only as requested visual tuning; shader parity is not claimed. Automatic delivery applies.


## Restore native LEVEL UP outer border - 2026-11-13

User clarified the outer dark border is desired and was lost to the luminance alpha mask. Removed that mask entirely so the original tile alpha preserves its native dark border/backing while transparent outside pixels remain transparent. Cream-gold text tint and existing animation/pause behavior remain. This supersedes earlier dark-backing removal and edge-threshold tuning for LEVEL UP only. Automatic delivery applies.


## Native UI press clip correction - 2026-11-13

User clarified hover/selection may be correct but button press is wrong. Direct metadata/native/serialized investigation: AudioManager.PlayButtonEnter0x34c0e0 sets queueEnter at memory+0xc9; LateUpdate0x34bd00 selects uiClick at+0x58 when enter is queued (and takes precedence over uiSelect). level2 AudioManager13704 serialized+0x50 references RandomSfx14631 (UiClick), whose sole clip is external fileID4/pathID2123 Enter5. AudioSource8891 volume0.75/pitch1; RandomSfx endpoints0.98/1.02, randomVolume0.1. Imported Enter5 with WAV validation/hash in public/game-audio/ui-click-provenance.json. Replaced provisional MenuClick mapping with Enter5, gain0.75 and uniform pitch0.98..1.02; native random-volume distribution/queue timing is not fully ported. uiSelect is separately RandomSfx15605/Select, but current hover/menuMove mapping remains unchanged per user direction.

Upgrade confirmation now plays only after Run.choose succeeds, then resumes gameplay without dispatching a second click from lock(). Existing browser unlock, master gain and voice policies remain web behavior. Build/mock-audio validation, user listening test; automatic delivery applies.


## Smaller Firestaff hitbox and shorter range - 2026-11-13

User reported apparent two-target hits and requested reduced hitbox/range. Firestaff already has AoE damage; retaining that mechanic, swept collision radius0.45 ->0.30m, explosion radius1.5 ->0.9m, acquisition range24 ->19.2m (20% shorter). Damage, visual scale and attack cadence unchanged. Nearby enemies inside0.9m may still both take damage; this is not single-target conversion. These are explicit user tuning, not native values. Long-flight fixture adjusted within the new targeting range. Automatic delivery applies.


## Skeleton enemy animation slice - 2026-11-13

User authorized using existing enemy assets after phase/scope notification. Direct native chain EnemyData8037 -> AnimatedMesh7798/Material277 -> Texture802 is integrated; the raw list has8 Moving frames at8FPS, not the catalog7. SkeletonView batches baked frames with instancing and is shared by game and Lab Enemies (Walk/Hit/Death). Animation follows Run.elapsed, so pause freezes it; visual corpses retain death animation time. Existing skeleton mesh files remain archived. Web1.6m size, AI, combat, loot and encounter tuning remain; no new enemy species/boss is added. Native toon shaders/state transitions are incomplete. See ENEMY_IMPLEMENTATION.md for evidence, bounds and tests. No GPU/FPS/visual parity claim; user handles image/audio/gameplay testing. Automatic commit/push applies.


## Further slower Gold attraction - 2026-11-13

User requested slower Gold flight again. Gold Bezier progress multiplier0.75 ->0.60 (20% slower progress than previous tuning). Arc shape, automatic collection, glow/shrink, EXP/Silver and awards remain unchanged. User-directed feel tuning; automatic delivery applies.


## Lower LEVEL UP position by40% - 2026-11-13

User reported the level-up sign sits too high. Reduced its vertical player-relative anchor1.85 ->1.11m (40% lower offset), both initial spawn and player-follow updates. Text size, rise/sway and collapse timing remain unchanged. Shared game/Lab tuning; automatic delivery applies.


## Correct LEVEL UP dimensional tuning - 2026-11-13

User clarified40% reduction refers to letter height, not sign position. Restored vertical anchor1.11 ->1.85m. Text applies independent width1.10 and height0.60 multipliers after its existing pop/center-collapse animation. This makes the word40% shorter vertically and10% wider without moving it down. Prior lowered-position entry is superseded. Shared game/Lab, automatic delivery applies.


## FPS-drop response: reduce repeated render/camera work - 2026-11-13

User reported substantial FPS drop after enemy animation. Animation raises enemy frame batches1 ->up to8 but retains1694 vertices/1040 triangles per enemy; no measured attribution to a single cause is claimed. Optimizations: original89 trees become2 instanced trunk/crown batches instead of178 mesh draws; camera terrain raycasts (80,000 triangles) reduce3 ->1 per changed pose, with cache reuse when stationary; SkeletonView conservatively culls offscreen enemies/corpses, hides empty batches, reuses transform scratch values and marks dynamic buffers with occupied update ranges only; live enemies skip dissolve hash work in the shader. Native8-frame animation, source art, enemy count limits, game rules and pixel resolution remain. Instanced tree buffers dispose with Engine.

Validation adds render-cost structure checks (identical tree transforms, camera cache/update count), occupied-instance upload checks and offscreen-culling regression. No GPU profiling or actual FPS uplift is claimed; user tests the deployed version. Automatic delivery applies.


## LEVEL UP above-head placement correction - 2026-11-13

User screenshot shows text at the character upper torso. Raised the player-relative text anchor1.85 ->2.5m at both spawn/follow updates. Letter width1.10/height0.60 overrides remain unchanged; this is position only. Current follow behavior prevents the earlier world-anchor drift. Shared game/Lab tuning; automatic delivery applies.


## Wider LEVEL UP backing with smaller letters - 2026-11-13

User requested a longer banner but smaller text. Native lettering base multiplier0.45 ->0.40 (about11% smaller on both axes), retaining width1.10/height0.60 proportions. Separate procedural dark-brown backing and thin darker border extend sideways behind the smaller source lettering (relative widths1.40/1.46), rather than enlarging the letters to lengthen the sign. Backing inherits head-follow, tilt, opening and centered collapse. Colors/dimensions are explicit web UI tuning; original atlas untouched. Shared game/Lab; automatic delivery applies.


## Unify LEVEL UP lettering and border - 2026-11-13

User reported letters did not follow the widened border. Removed the two separate procedural backing/border sprites added previously. The source atlas already contains a complete sign, so it is now rendered as one sprite with horizontal multiplier1.60 and vertical0.60 at base0.40. This preserves approximately the widened outer sign width while extending the letters with its border; native dark backing stays intact. Opening/sway/tilt/center-collapse now transform the whole sign together. No new textures or separate background layer. Automatic delivery applies.


## Closer above-head LEVEL UP gap - 2026-11-13

User screenshot shows2.5m anchor too far above the hat. Lowered only the text spawn/follow anchor to2.1m, leaving the latest unified sign proportions, motion and pause behavior unchanged. Shared game/Lab tuning; automatic delivery applies.


## Pickup counter growth per collection - 2026-11-13

User clarified size should accumulate per new pickup while the previous number remains visible:1x,1.1x,1.2x etc. Each currency now starts1x, adds0.1 per subsequent collection and caps at1.8x, including its small retriggered pulse. Chain/value reset only after the1.4s visible lifetime expires (previous growth window0.9s). EXP receipts preserve pickup count separately from award value so multiple entities collected within one fixed tick increase size correctly without treating one valuable gem as many pickups. Gold/Silver/EXP remain independent. Row spacing25 ->28px prevents capped text overlap. Cap/timing are web tuning, not recovered native behavior. Automatic delivery applies.


## Upgrade resume race and per-pickup punch feedback - 2026-11-13

User reports silence/movement stopping after upgrade selection. Identified a pointer-lock race: hadLock could remain true after programmatic exit; a delayed pointerlockchange following resume could call pause again, stopping gameplay and voices. PointerLockState now clears ownership synchronously on intentional pause, ignores that delayed exit, and retains normal Escape/user-exit behavior. Input keeps physically held WASD separately from active actions and restores those held keys on resume; blur clears both to prevent stuck movement. Successful upgrade selection unlocks/resumes audio and reconciles the modal loop immediately, then resumes without duplicate clicks. Mock audio and lifecycle tests cover these paths; this does not claim browser listening/end-to-end reproduction.

User clarified counters should punch bigger on every pickup and shrink back, rather than accumulating a permanently larger base size. Each new receipt now immediately sets a1.5x peak and decays quadratically to1x over0.22s; rapid pickups retrigger the same bounded punch. Displayed amounts still accumulate while visible, per currency. This supersedes the prior permanent+0.1 size chain rule; source timing is not claimed. Automatic delivery applies.


## Bandit second enemy integration - 2026-11-13

User authorized adding the next existing enemy after the Skeleton slice. Added native Bandit via EnemyData8032 -> AnimatedMesh7779 (8 frames/7FPS), Material106 -> Texture824. Generalized baked instancing renderer for per-species assets and death identity; retains culling and partial dynamic uploads. Bandit appears every4th spawn under the existing total cap, and shares provisional sandbox HP/speed/contact/loot. This is a first visual integration, not native encounter/AI parity. Bandit Walk/Hit/Death rooms added to Enemies Lab; switching rooms clears old instances. No catalog-based monster sounds added. See ENEMY_IMPLEMENTATION.md; raw evidence/provenance in public/enemies/bandit. User handles rendered validation/performance; automatic delivery applies. No further phase transition.

User clarified per-stage enemy rosters and accepted the current mixture only for testing. Created docs/EXTRACTION_BACKLOG.md with prioritized missing evidence and ready-to-use handoff requirements for another extraction AI; do not re-extract verified models/media.

## Lab stale module graph recovery - 2026-11-13

User screenshot confirms a cached Lab entry requests an obsolete XpView chunk and receives404 before the Lab module executes, leaving the initial Loading UI. Current published HTML references lab-Bj7H4WLN.js and XpView-3Ce7JExI.js, unlike the screenshot's older hashes. Embedded Lab URLs now include a build-specific version so a new game build does not reuse old Lab HTML. A small classic-script resource-error handler in lab.html works independently of the failed module graph and offers Reload latest Lab with a fresh URL, preserving embedded/room parameters. No automatic reload loop. Existing cached pages need a hard refresh once to obtain the fix. Build, deploy-package checks and focused VM recovery/version checks pass; no claim of live browser reproduction (computer-use access to Edge was denied).

## Per-enemy Lab selectors - 2026-11-13

User requested grouping enemy previews by individual monster to avoid a growing combined list. Enemies now shows an Enemy selector (Skeleton/Bandit) followed by the existing room selector containing only Walk/Hit/Death for that species. Species entries derive from registered enemy rooms. Switching species retains the selected action; category memory and existing weapon=bandit-death deep links remain supported. The room heading retains the full species/action name. Other categories keep their existing selectors. No gameplay or phase changes.

## Load Lab assets by selected room - 2026-11-13

Lab no longer loads every model/effect before becoming ready. Room dependencies load on demand and share a cache of pending/completed promises within the Lab session. Skeleton/Bandit load independently; weapon rooms load Fox, their renderer and damage font (Sword also needs StaffView for shared hit effects). Pickup/effect rooms share Fox/XP/progression/counter assets. Failed keys leave the cache so reselecting can retry. Tabs/species selectors remain usable while loading; playback/timeline/facing wait for the current room. A separate load ticket prevents stale completions/errors from replacing current UI, and pending audio preparation cannot re-enable playback after switching. Loading clears the viewport; loaded inactive views are cleared by the shared reset/render path. Existing category memory/deep links remain. This defers asset fetch/decode/GPU setup, not JavaScript module downloads; audio preparation remains the existing on-play behavior. Cache lasts until the Lab iframe closes, and game/Lab GPU resources remain separate. No phase change or measured load-time/FPS claim.

Validation: production build, deployment/boot checks, baked-enemy single-species loading/switching checks, and focused dependency/cache checks for concurrent requests, warm reuse and failed-load retry. User handles visual/audio feel.

## Existing weapon-model batch in Lab - 2026-11-13

User authorized adding the existing asset batch and asked whether only one character is ready. Added seven inspection rooms (Axe, Bow/Arrow projectile, Dice, Mine, Rockets, Bluetooth Dagger, Aegis) from existing OBJ/material/PNG exports, using same-node MeshFilter/MeshRenderer pairing in supplied hierarchy. No native containers or extraction importers used. Copied source data/hierarchy/material and file hashes accompany each preview. Opaque Lambert approximation and normalized2m longest dimension are gallery tuning, not native shader/size/attack claims. Model rooms rotate on command without inferred combat/audio, and load only the chosen model. Weapons now use separate Weapon/Room selectors like Enemies to avoid mixing entity names with actions. Existing Sword/Firestaff combat remains. Model switching hides cached views; close/late-load/error cleanup disposes resources.

Bananarang Cube mapping and Poison Flask multiple meshes/material slots remain in the extraction backlog. Character audit records21 catalog entries/8 nonempty hierarchies but only Fox has a complete playable web rig at present; another AI supplies missing playable exports after checking existing files. Details/per-weapon behavior questions: WEAPON_MODEL_PREVIEWS.md. Build, focused source-hash/geometry/UV/gallery-fit/switching/disposal tests and existing Lab/enemy/deployment checks pass; user handles visual/audio review. No phase change.

## Cross-platform weapon provenance fix - 2026-11-13

User reported Pages workflow failure in check_weapon_models.mjs for53300ba: Git normalized copied CRLF OBJ/JSON into LF blobs, so Windows working files passed but Linux checkout hashes differed and deployment was skipped. Added scoped -text attributes for exact-byte model.obj/data.json/hierarchy.json/material.json copies and restaged original existing bytes. Provenance hashes remain strict and unchanged; no normalization in the test or weakening of integrity checks. Verified staged blobs against all recorded copy hashes before commit. No extraction, gameplay, or phase change. Resume pending upgrade-system work after checking deployment.

## Tome selection foundation using existing sandbox effects - 2026-11-13

User authorized working on level-up choices while deferring incomplete weapon/character/enemy work. Read existing142 item records only:26 Tomes have blank descriptions and no numeric effect fields; Equipment87 has29 blank descriptions, Passives21 has5, Shop8 has1. All referenced icons exist. No extraction performed. Reused hash-matched Damage/Cooldown/Quantity PNGs and catalog names; recorded source metadata/icon hashes. Implemented run-local Tome levels/owned HUD, before→after values, centralized effect eligibility and capped-option omission/rejection. Existing+5 damage, cooldown*.85 floor.15s and quantity+1 cap8 retained explicitly as web tuning; no invented rarity rolls/native modifiers or equipment effects. Queued upgrade freeze/resume and verified click/modal sounds retained. Snapshot copies protect inventory/choices, reset clears ownership. UPGRADE_IMPLEMENTATION.md and EXTRACTION_BACKLOG.md record all missing modifier/pool/unlock/slot/localization questions for another AI. No phase change.

Validation: build/typecheck; combat ownership/cap/invalid-choice/snapshot/queued freeze-resume-reset tests; staff/progression/audio/input-pointer resume checks; deployment/Lab/enemy regression checks. User handles visual/audio/gameplay review. The earlier53300ba deployment failure was separately fixed and0f10ceb Pages run43440864794 completed successfully before this delivery.

## Connect complete existing weapon media to Lab - 2026-11-13

User requested using complete existing image/audio/effect data instead of merely listing it. Seven model weapons now have Sounds rooms with17 unique original WAVs (15 new byte-identical copies, two reused from existing packaged audio) and explicit per-node bindings. Manual auditions use fixed serialized AudioSource gain/pitch where available or documented web gain.25 fallback, master.35, one voice, bounded sample duration, lazy decode/cache and stop/mute/close/pending-decode cancellation. No clip-name-based combat triggers or random distribution claims.

Six weapons explicitly reference GeneralProjectileHit3790; their Hit effect rooms reuse the existing full7145/7001 particle layers/materials and textures, with an isolated hit-only manifest and same StaffView renderer (optional asset root, unchanged default). Fixture gives a visible effect/Hit2 on manual playback and silent deterministic scrubbing, no damage or native weapon attack timing. Aegis has no hit room; unavailable weapon-specific explosion/full procedural motion remains in backlog. Source package and game containers untouched; no extraction. Details/media provenance in WEAPON_MODEL_PREVIEWS.md and per-model media.json. No phase change.

Validation: build/typecheck, model and media hashes/packaged paths, same hit data and two-layer-only loading, fixture pause/seek/reset, sample lifecycle, existing StaffView/game audio and combat regressions. No rendered/listening parity claim; user handles visual/audio/gameplay review.

## Firestaff softer knockback and slightly wider hit area - 2026-11-13

User reports the first hit pushes monsters too far, causing remaining burst shots to miss. Firestaff now uses knockback1.6 instead of the shared5 (68% lower), collision radius0.30→0.42 and compact damage radius0.90→1.05. Sword retains its prior5 knockback. Target range19.2, cadence, damage and visuals retain the user's prior tuning. These are web feel adjustments, not recovered native formulas. No extraction or phase change.

## Reference-style persistent audio settings - 2026-11-13

User requested audio settings and supplied main/settings screenshots. Added reference-style dark green settings panel, original BorderWindow/Alagard, section strip, square white sliders and numeric readouts for Master/Music/Game Sounds/Ambience/UI/XP and Gold. Only Audio is functional; other sections disabled. Opening settings pauses/releases pointer lock; X/Escape closes to the paused screen, preserving pending upgrades. Focus trap/return, test UI sound and reset provided. Values/mute persist via validated warcore.audio.v1 preferences, with in-memory fallback, and synchronize game/Lab via subscribers/storage events.

GameAudio adds independent category gain buses before the existing master.35 calibration; source gains/pitches and lifecycle preserved. Default slider values1 preserve current loudness. Lab samples follow master/Game Sounds and shared mute. Existing upgrade ambience maps to Ambience, modal open/click/hover to UI, receipts to XP and Gold, other current clips to Game Sounds. No BGM currently plays; Music preference is saved for later and the panel states that no background music is playing. No invented native mixer/track rules, no source asset edits/extraction, no phase change. AUDIO_SETTINGS.md documents scope/routing; backlog records future BGM evidence.

Validation covers production build, stored/reloaded/corrupt/blocked preferences, clamps, independent/live routing, mute/reset, cross-window updates, six-control markup, listener/audio cleanup, original audio behavior and Lab audition live volume. User performs visual/listening/gameplay review.

## Desktop Controls tab with no controller scope - 2026-11-13

User supplied Controls reference images, explicitly excluded Controller input and reserved mobile touch gameplay for the future. Added working Controls tab using the existing Settings frame: sensitivity, optional look smoothing, invert axes, optional arrow camera and numbered upgrade selection; read-only actual WASD/Space/Escape/mouse keycaps, conditional arrow/digit hints and Reset Controls. No controller UI/code or fake unimplemented Interact/Aim/Map/Quick Reset rows. Control preferences validate/persist independently; reset/new run preserves audio/controls separation. Defaults preserve the prior mouse calibration and immediate look. Smoothing/rate/ranges are documented web policy, not native formula claims; unknown native details are recorded for another AI. Future mobile means touch stick/look/jump/multi-touch, not gamepad; no mobile implementation/phase transition now.

Camera pending look resets on pause/blur/settings changes, clamps pitch and retains collision caching. Optional number keys act only in the offered upgrade dialog, ignore repeat/modifiers/text fields, and use visible choice order. Existing settings pause/focus flow remains. Validation covers build/typecheck, control persistence, mouse defaults/inversion, frame-rate-independent smoothing, paused input, arrow keys, offered digit validation, no-controller markup, cleanup and existing audio/resume/render-cost checks. User handles visuals/gameplay feel.

## Browser Video settings, preserve working systems - 2026-11-13

User supplied Video/Game/Effects reference screenshots, noted some native PC options do not fit a web game and asked to keep useful working systems. Added Video tab with actual drawing-buffer resolution, render scale, draw-only FPS cap, game FOV/camera distance/view distance, browser fullscreen and reset, with validated persistent preferences and cross-window sync. Defaults preserve previous DPR caps, FOV75, camera3.6, far250/fog45-135 and uncapped browser cadence. Existing audio/controls, instancing/culling/uploads, camera caching, debug HUD, MSAA and Lab lazy loading remain. Game physics/input/modal audio stay outside the rendering gate. Lab uses shared scale/cap but keeps fixture framing. Camera distance changes invalidate collision cache; FPS/FOV-only changes avoid canvas reallocation. Fullscreen is user-triggered and reflects actual browser state, not restored automatically.

Unsupported desktop monitor/VSync/native window modes and absent grass/shadow/postprocess pipelines have no fake controls. Additional Game/Effects references and unknown formulas are recorded in SETTINGS_REFERENCE_BACKLOG.md; another AI supplies missing evidence, no extraction here. Current web settings/ranges/fog formulas are not claimed native. Controller remains excluded; no mobile/phase transition. VIDEO_IMPLEMENTATION.md documents scope and limitations.

Validation: build/typecheck, settings storage/clamps/reload/blocked fallback, preserved defaults and pixel counts, projection/fog, no redundant resize, game/Lab profiles, cadence across refresh rates/gaps, camera cache/collision, supported UI/fullscreen rejection, existing audio/controls/render-cost/Lab checks. No rendered parity or measured FPS claim; user handles visuals/gameplay feel.

## Three supported Effects settings - 2026-11-13

User approved Effects controls from the supplied reference. Added Damage Numbers and Damage Flash toggles plus manual Particles Opacity, persistent/shared with Lab and defaults preserving prior visuals. Damage labels hide without changing combat/hit records; living enemy flash can be disabled independently of white corpse/dissolve. Opacity multiplies source alpha for Sword/Staff/shared-hit, level-up burst and dust without compounding; zero hides Staff batches/dust while lifetime/simulation/audio remain. EXP/coins/glow, receipt counters, LEVEL UP sign, models/HUD stay readable. These scopes are web policy pending native confirmation; unknown scope/order/Auto Opacity questions recorded automatically. Low HP/Auto Opacity/indicator-color remain deferred. No extraction/phase/controller/mobile changes.

Engine and Lab subscribe for live/cross-window updates, including while paused; Lab repaint is silent. Existing instancing, source art/colors, gameplay/loot, audio and Video/Controls defaults remain. EFFECTS_IMPLEMENTATION.md documents exact scope. Build and focused preference/visibility/flash-death/alpha/restore/readability tests plus existing staff/enemy/media/settings checks pass; no GPU visual/native-parity claim, user handles feel review.

## Game UI customization and debug visibility - 2026-11-13

User approved Game-tab options already supported by the web HUD. Added normalized crosshair height, size and alpha multipliers, HP fill palette and independent FPS/speed visibility; default height.5/size1/alpha1/Red#c83234/both metricsOn preserve the prior appearance. Existing crosshair source color alpha remains, scaling keeps its current center; no attack aiming/health/physics/telemetry sampling changes. Both debug fieldsOff hide the shared movement-state block; eitherOn retains state alongside it. Reset Game UI affects only validated/persistent warcore.game.v1 settings. Main HUD updates live through an App subscription and keeps preferences across new runs/reloads/windows; Lab's fixture UI is unchanged.

GAME_SETTINGS.md records exact web ranges/palette and native mapping questions for the other AI; other unsupported reference systems remain in backlog. No source media/extraction, controller/mobile or phase changes. Build and focused default/storage/clamp/palette/cross-window/component/reset-isolation checks plus existing settings/deploy checks pass; user handles visual feel, no native-pixel parity claim.


## Phase 2 playtest tools / Pause and death references - 2026-11-13

Phase transition announced before implementation. Added the ten authorized tools: reference-shaped Pause and death screens, bounded local run history, five-action keyboard rebinding, web video presets, current stats/Tome bonuses, Lab readiness and per-category search, game/room load retry and visible commit build. PLAYTEST_SYSTEMS.md records actual scope/policies. Native damage totals/DPS, weapon levels, Quests, stage/tier/Shrine Logs and end-Silver rewards remain unavailable; PAUSE_END_REFERENCE.md requests their evidence without inventing values. Existing game rules/tuning and source art/audio are preserved; no extraction or controller support. Deployment branch name remains historical. Phase 1 playable foundation delivered does not mean native movement parity is complete.

Build and focused checks cover death/reset recording once, empty-run suppression, 30-record retention, snapshot isolation, storage fallback/corruption, custom-key translation/duplicates/reserved keys/held-key resume, preset camera preservation/Custom detection, modal output and missing-data labels, existing combat/audio/media/rendering and deployment packaging. User handles visual/listening/feel review.


## Characters tab / Fox animation Lab - 2026-11-13

Added Characters -> Fox with five existing exported clips: FoxIdle, FoxRun, FoxJump4, FoxFalling and FoxGrind2. Uses the same Fox renderer/rig and on-demand fox-only dependency; supports timeline scrub, facing angle, play/stop, category search/readiness and failed-load retry. Clip durations come from loaded animation data, preview speed is 1x raw source (gameplay air tuning unchanged), and scrub resets mixer actions deterministically. Grind is labeled a clip preview; no gameplay skill is enabled. No invented character sounds or other-character rigs. Missing character payloads and event mappings remain in EXTRACTION_BACKLOG.md. Build/package and focused clip/source/scrub/state-restoration checks; user handles visuals.


## Character selection flow and supplied menu reference - 2026-11-13

Play opens a 21-entry searchable character roster; Fox-only Confirm starts the existing run. Pause/death New Run resets and opens selection. Reference layout has framed roster left, shared Fox idle model centre and details right. Copied 20 existing portraits unchanged with metadata/media SHA provenance; TonyMcZoom portrait is missing and explicitly labelled. Other cards remain inspectable but cannot launch, with no invented unlock price/rank/runs/skins. Fox text from the user screenshot (Firestaff and RNG Blessing) is descriptive only; luck/passive behavior is not implemented. Existing Firestaff/Sword playtest override remains. Preview has independent retry/cleanup and 30FPS cap; game rules/tuning unchanged. CHARACTER_SELECTION.md and EXTRACTION_BACKLOG.md list unknowns for the other AI, no extraction and no phase transition. Build/package checks plus roster/hash/Fox-gate/loading/error/reference-state checks; user handles visual/audio/feel review.


## Character selection facing, silhouettes and rotation - 2026-11-14

Corrected selection-only Fox yaw by 180 degrees so its front faces the camera. Primary-button drag on the model viewport rotates yaw with pointer capture; release/cancel/focus loss and unmount end dragging and remove listeners. Starting view and drag do not alter game/Lab facing. Unplayable roster portraits and their selected detail portrait use brightness(0), retaining PNG alpha and readable names/status; original art is unchanged, and missing portraits remain explicitly missing. User-directed web presentation, no native unlock inference. Build and existing character selection/package checks; user handles visual/drag feel.


## Upgrade Offers reference layout and animated spectrum - 2026-11-14

Replaced the old three-across wood cards with reference-shaped Inventory / vertical Upgrade Offers / Stats columns. Inventory separates Weapons/Tomes/Items and uses actual ownership; items unavailable, no guessed capacities/weapon levels. Shared PlayerStats preserves Pause's real values/bonuses. Offer choices still use the existing three Tome effects, current->next values, caps, keyboard preference and queued-upgrade pause/resume. Added a decorative six-color continuously looping top stripe while the modal is open (4s web tuning; reduced-motion static). Banish/Skip/Refresh are explicitly disabled pending native rules, with no made-up charge counts. UPGRADE_SCREEN_REFERENCE.md records the large missing-data scope and links the broader extraction backlog. No new attacks/items/stat formulas/audio rules or phase transition. Build and existing combat/resume/controls/panel/package checks; user handles visual feel.


## Removed pickup glow - 2026-11-14

User requested no money or EXP glow. Removed the additive EXP halo batch/material and Gold halo sprite/generated texture; reset EXP's extra brightness multiplier to 1. Actual atlas art, tier tints, size/rotation, gold arc/shrink, pickups, sound and LEVEL UP effects are preserved. Shared renderers apply this to gameplay and Lab. Supersedes earlier glow tuning; no source asset edits or phase change. Build and existing progression/effects checks; user handles appearance.


## Warm compact level-up sparkles - 2026-11-14

User screenshot tuning: changed the selection-independent LEVEL UP burst tint from serialized blue to pale warm yellow, reduced sparkle size to 18% and radial launch speed to 2.5-4.5 (previously 7-12). Random in-plane sparkle rotation, faint additive warmth for burst/text only, and lighter cream/gold sign text follow the supplied image. Text anchor/size/sway/collapse/pause behavior are preserved. Glow is restricted to level-up effects; Gold/Silver/EXP remain without added glow. Source atlas/manifest unchanged, shared gameplay/Lab renderer, no native-parity claim or phase change. Build and existing effect/pause/coin-no-glow checks; user handles appearance.


## Silver receipt row and prefix - 2026-11-14

User clarified Silver collection feedback: show +number in the existing pale silver coin color, one row above EXP. Replaced S prefix with + and moved Silver from below Gold to 28px above EXP; Gold remains below EXP. Existing pulse, accumulated values, pause and end-of-life fade are preserved (the supplied screenshot shows fade-out, not permanent low opacity). Shared gameplay/Lab counters; no currency balance/drop-rule change or phase transition. Build and existing collection feedback checks.


## Faster level-up spectrum - 2026-11-14

User requested faster looping upgrade-screen EXP colors. Reduced the decorative spectrum cycle from 4s to 1s (4x speed). Normal EXP fill, gameplay timing and reduced-motion static behavior unchanged; web visual tuning only. Build checked.


## Brighter EXP and level-up sparkles - 2026-11-14

User requested brighter EXP with glow and brighter yellow level-up sparkles with a slight glow. EXP brightness is 1.35 with a soft additive instanced halo; level-up burst tint and existing subtle glow are brighter. Existing pickup size, tier colors, gold/silver, burst size and motion remain unchanged. Shared game/Lab web visual tuning; not a native shader claim. Supersedes the earlier removal of EXP glow. No extraction or phase change.


## Brighter LEVEL UP sign - 2026-11-14

User supplied a screenshot and requested brighter level-up color. Brightened the LEVEL UP sign toward warm yellow and increased its subtle additive glow. Existing sign animation, sparkle tuning and gameplay remain unchanged. Shared game/Lab web visual tuning, not a native shader claim; no phase change.


## Brighter level-up sparkles - 2026-11-14

User requested brighter golden level-up fragments. Lightened the burst tint and increased its additive glow; size, speed, sign and gameplay are unchanged. Shared game/Lab web visual tuning; no native shader claim or phase change.
