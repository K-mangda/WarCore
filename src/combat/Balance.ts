// Sandbox tuning for the first playable combat loop. Not native balance data.
export const balance={
  enemyDissolveDuration:.45,maxHealth:100,enemyHealth:20,enemySpeed:3.2,contactDamage:8,contactInterval:1,
  banditEvery:4,spawnInterval:1.1,initialEnemies:6,maxEnemies:120,spawnRadius:27,
  damage:10,attackInterval:.85,attackRange:35,projectileSpeed:25,projectileLifetime:2,
  // Provisional melee damage window/range. Native Sword uses a temporal quantity burst, not a fan.
  // User-requested smaller web slash; does not modify extracted particle data.
  swordVisualScale:.55,
  swordRange:4,swordHalfAngle:Math.PI/3,swordBurstTime:.5,swordMinBurstInterval:.1,swordHeightTolerance:1.5,swordVisualDuration:.3,maxSlashes:32,
  // Verified FireStaff WeaponData burst settings; projectile motion remains web tuning.
  // User-requested visual tuning only; native layers and damage radius are retained.
  staffImpactVisualScale:.5,staffProjectileVisualScale:.8,
  staffBurstTime:1,staffMinBurstInterval:.15,staffEndCooldown:.5,staffTargetRange:19.2,staffExplosionRadius:.9,staffCollisionRadius:.3,
  goldSpawnHeight:.35,xpHoverHeight:.35,pickupRadius:1.4,magnetRadius:5,maxProjectiles:160,maxGems:400,
} as const;
