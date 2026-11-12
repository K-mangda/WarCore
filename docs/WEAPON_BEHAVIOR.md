# Weapon behavior checks

Every new weapon needs a verified identity chain and a separate behavior assessment. This is a prerequisite for implementation, not a claim that all weapons have already been investigated.

## Sword correction (2026-11-12)

Verified local Sword ID2 (WeaponData8633) differs from HeroSword27. Its serialized values include onlySpawnWhenCloseEnemies=false, projectiles1, endCooldown0.75, burstTime0.5, minBurstInterval0.1, spawnOffset(0,0.5,2.5), canMultiHit=true. WeaponAttack declares attackQuantityCurrent/burstInterval and FixedUpdateAttack. There is no evidence for the previous 60-degree quantity fan.

The web now schedules quantity as repeated forward swings, each with separate hit history. It remains autonomous without enemies. The web uses max(0.1,0.5/quantity) for burst spacing and the existing upgrade-controlled end cooldown; the exact native interval normalization is NOT reconstructed. Do not call that formula native.

Sword particle7070 has local starting rotations X90/Y90/Z15 degrees. Web pose now composes local rotation, X-reflected geometry conversion and weapon facing instead of treating the changing atlas crescent edge as a fixed local+X arrow. Web origin includes native0.5Y and forward2.5 offset. Native runtime ProjectileMelee direction/opacity behavior is not fully reconstructed. User size multiplier0.55 remains in place.

## For each future weapon

Record these before implementing its behavior:

- Character/weapon enum and asset reference chain; distinguish variants and similarly named assets.
- Activation: autonomous, requires target, requires proximity, continuous or triggered.
- Aiming: player/camera facing, closest target, random direction, orbit or other source-backed mode.
- Quantity: repeated attacks, simultaneous volley, spread or another policy; timing formula and any caps.
- Spawn position, orientation and local/world transform conventions.
- Projectile motion, collision, penetration/bounces, hit history and whether later instances may hit again.
- Visual lifetime, animation/atlas and damage lifetime separately.
- Audio on spawn/hit/expiry and each variant/filter; don't reuse a generic hit clip without evidence.

For every item separate extracted fields, verified runtime logic, observed reference gameplay and provisional web decisions. Missing data must remain visible in TEMPORARY_IMPLEMENTATIONS.md. Existing bolt target distribution is still provisional and is not a policy for future weapons.

## Native burst timing recovered

A focused static disassembly of installed GameAssembly.dll now resolves GetBurstInterval RVA0x434840. For burstTime>0 it returns max(burstTime/quantity/AttackSpeed, minBurstInterval/AttackSpeed, fixedDeltaTime); otherwise0. StartAttackNoCoroutine RVA0x450C30 initializes timer=burstInterval, so the first instance starts on the next fixedtick. FixedUpdateAttack RVA0x450150 spawns at most one instance per fixedtick for a positive interval and resets timer to0 (no remainder/catchup).

AttackTiming.ts now implements that recovered formula. Sword uses burstTime0.5/minBurstInterval0.1 from its own WeaponData. The web's haste upgrade maps to effective AttackSpeed=baseWebCooldown/currentWebCooldown; the complete native player-stat calculation and end-cooldown system are still not ported. The native zero-interval bounded spawning policy is not used by the current Sword, and must be separately implemented for weapons that require it. This supersedes the earlier statement that the interval formula itself was unknown.

## Deliver features together

Treat an implementation as one package: attack rules/timing/quantity, visual animation and pivots, audio triggers/variants, and pause/reset/cleanup. Inspect the whole animation rather than a chosen axis or one frame. Run an integrated check before presenting the result. Do not use the user as a tester for each tiny correction. Native fidelity remains an evidence claim, not a synonym for using extracted assets.
