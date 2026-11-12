// Sandbox tuning for the first playable combat loop. Not native balance data.
export const balance={
  maxHealth:100,enemyHealth:20,enemySpeed:3.2,contactDamage:8,contactInterval:1,
  spawnInterval:1.1,initialEnemies:6,maxEnemies:120,spawnRadius:27,
  damage:10,attackInterval:.85,attackRange:35,projectileSpeed:25,projectileLifetime:2,
  // Provisional melee tuning. The 0.3s visual duration matches extracted moving-particle lifetime;
  // its use as the web hit window, range/sector/spread and cap are implementation choices.
  // User-requested smaller web slash; does not modify extracted particle data.
  swordVisualScale:.55,
  swordRange:4,swordHalfAngle:Math.PI/3,swordSpread:Math.PI/3,swordHeightTolerance:1.5,swordVisualDuration:.3,maxSlashes:32,
  pickupRadius:1.4,magnetRadius:5,maxProjectiles:160,maxGems:400,
} as const;
