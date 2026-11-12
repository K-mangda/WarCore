# First playable combat loop

Scope: automatic nearest-target magic bolts, approaching enemies, contact damage, XP drops/collection, queued level-up choices and death/restart. Walking/jump parameters, deferred sliding and the existing test arena remain unchanged. This is a functional sandbox, not a completed 1:1 gameplay/balance port.

The simulation is independent of rendering. Enemy, projectile and XP counts are bounded. Projectile collision checks the swept movement segment to avoid skipping enemies between physics steps. Enemies spawn on terrain outside the current camera view; contact damage has an interval, and jump height separates the player from enemies. Health cannot become negative.

Level-up pauses the simulation and releases mouse capture. Choose damage, attack speed or one extra projectile to continue. Multiple earned levels preserve all upgrade choices. Defeat freezes the run and offers a full restart. Esc/manual pause freezes the same simulation. Restart clears enemies, projectiles, XP, queued upgrades, health, timer and upgrade effects.

## Source versus sandbox choices

All combat tuning in src/combat/Balance.ts is explicitly provisional: damage, health, attack cooldown/range, projectile speed, enemy speed/spawning, pickup distance and XP thresholds. Upgrade values and the three fixed choices are a prototype. No native wave scheduler, item pool, FireStaff upgrade table or formula parity is claimed.

Fox uses the original base skin and rig from the preceding work. The enemy Skeleton reuses a static mesh/texture export from the older local WarCore project; its rig/animation and default material mapping are not yet verified. Bolts, damage-number rendering, XP shape and HUD layout are browser representations.

XP low-tier color is directly read from sharedassets2.assets, GameObject 872 (XpPickup), XpVisuals component 3096. Its RGBA c_low is (0.4392156899, 0.7686274648, 1, 1), displayed as #70c4ff. c_mid is yellow, c_high red/pink and c_echo purple. The first loop drops one low-tier XP per enemy, so it uses the low-tier color only. The earlier green provisional color was removed. Reproduce the color read with python tools/extract_xp_colors.py.

## Verification

node tools/check_combat.mjs covers automatic hits including a swept hit, XP drop/collection, multiple queued level-ups, upgrade pause/resume, contact damage interval, death, reset and rejection of visible spawn positions. Motor regressions and strict production build are checked separately. Browser playtest is used to verify the visible loop; synthetic checks do not establish native gameplay parity.

Browser check: 10 kills, XP reached level 2, the upgrade dialog paused the run, Multishot changed the weapon count to 2, and Escape returned to the pause screen. No console warnings/errors were returned in that check. FPS telemetry now uses elapsed wall time rather than the clamped simulation delta; no 60 FPS claim is made.

Local converted game assets are included in the local commit. Publication to GitHub remains pending the separate, previously requested approval for extracted game assets; no push is claimed.
