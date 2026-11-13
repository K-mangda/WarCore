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
