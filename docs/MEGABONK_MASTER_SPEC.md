# Megabonk web — evidence ledger

Scope: Phase 0–1 only. This is an experimental reimplementation, not verified 1:1 parity.

Source SHA256: 4a8ae0ac2aee45c6e956c0fc464e77a83dab22bb896fb960ed3242b18ca4d163

PlayerMovementValues, line 374017: constants 2700, 10, 200, 0.003, 11 and swim speed 10 are directly declared. Methods in this IL2CPP declaration dump have empty bodies. Rigidbody mass, counter movement, jump impulse, camera settings, collision tolerances and native formulas remain unresolved. Camera distance 3.6 and half-height crouch are user requirements, not verified source constants.

The browser motor is a fixed-step experimental translation. Gravity interpretation, jump speed 13, air steering 0.06, ground friction 12, jump buffer 0.12 seconds and particle settings are explicitly provisional. No Steam assets are copied into the public repository.

## EMovementState
Source line 374136
```ts
export enum EMovementState {
  Idle = 1,
  Walking = 2,
  Crouching = 4,
  Sliding = 8,
  Airborne = 16,
  Wallrunning = 32,
  CategoryCrouched = 12,
  CategoryFootstepNoise = 34,
}
```

## EWeapon
Source line 335352
```ts
export enum EWeapon {
  None = -1,
  FireStaff = 0,
  Bone = 1,
  Sword = 2,
  Revolver = 3,
  Aura = 4,
  Axe = 5,
  Bow = 6,
  Aegis = 7,
  Test = 8,
  LightningStaff = 9,
  Flamewalker = 10,
  Rockets = 11,
  Bananarang = 12,
  Tornado = 13,
  Dexecutioner = 14,
  Sniper = 15,
  Frostwalker = 16,
  SpaceNoodle = 17,
  DragonsBreath = 18,
  Chunkers = 19,
  Mine = 20,
  PoisonFlask = 21,
  BlackHole = 22,
  Katana = 23,
  BloodMagic = 24,
  BluetoothDagger = 25,
  Dice = 26,
  HeroSword = 27,
  CorruptSword = 28,
  Shotgun = 29,
  Scythe = 30,
}
```

## EStat
Source line 360037
```ts
export enum EStat {
  MaxHealth = 0,
  HealthRegen = 1,
  Shield = 2,
  Thorns = 3,
  Armor = 4,
  Evasion = 5,
  Evolve = 6,
  DamageReductionMultiplier = 7,
  DamageCooldownMultiplier = 8,
  SizeMultiplier = 9,
  DurationMultiplier = 10,
  ProjectileSpeedMultiplier = 11,
  DamageMultiplier = 12,
  Unused0 = 13,
  EffectDurationMultiplier = 14,
  AttackSpeed = 15,
  Projectiles = 16,
  Lifesteal = 17,
  CritChance = 18,
  CritDamage = 19,
  FireDamage = 20,
  IceDamage = 21,
  LightningDamage = 22,
  EliteDamageMultiplier = 23,
  KnockbackMultiplier = 24,
  MoveSpeedMultiplier = 25,
  JumpHeight = 26,
  FallDamageReduction = 27,
  Slam = 28,
  PickupRange = 29,
  Luck = 30,
  GoldIncreaseMultiplier = 31,
  XpIncreaseMultiplier = 32,
  ChestIncreaseMultiplier = 33,
  ChestPriceMultiplier = 34,
  ShopPriceReduction = 35,
  Holiness = 36,
  Wickedness = 37,
  Difficulty = 38,
  EliteSpawnIncrease = 39,
  PowerupBoostMultiplier = 40,
  PowerupChance = 41,
  BurnChance = 42,
  FreezeChance = 43,
  WeaponBurstCooldown = 44,
  ProjectileBounces = 45,
  ExtraJumps = 46,
  Overheal = 47,
  HealingMultiplier = 48,
  SilverIncreaseMultiplier = 49,
  EnemyAmountMultiplier = 50,
  EnemySizeMultiplier = 51,
  EnemySpeedMultiplier = 52,
  EnemyHpMultiplier = 53,
  EnemyDamageMultiplier = 54,
  EnemyScalingMultiplier = 55,
  PoisonDamageMultiplier = 56,
}
```

## ECharacter
Source line 328124
```ts
export enum ECharacter {
  Fox = 0,
  Calcium = 1,
  SirOofie = 2,
  Cl4nk = 3,
  Megachad = 4,
  Ogre = 5,
  Robinette = 6,
  Athena = 7,
  Birdo = 8,
  Bush = 9,
  Bandit = 10,
  Monke = 11,
  Noelle = 12,
  TonyMcZoom = 13,
  Amog = 14,
  Spaceman = 15,
  Ninja = 16,
  Vlad = 17,
  Dicehead = 18,
  SirChadwell = 19,
  Roberto = 20,
}
```

## EEnemy
Source line 359031
```ts
export enum EEnemy {
  Skeleton = 0,
  GoldenSkeleton = 1,
  XpSkeleton = 2,
  ArmoredSkeleton = 3,
  SkeletonDusty = 4,
  ArmoredSkeletonDusty = 5,
  Ghoul = 6,
  MinibossPig = 7,
  Mummy = 8,
  Slime = 9,
  Test = 10,
  Test2 = 11,
  Goblin = 12,
  GoblinStrong = 13,
  GoblinTank = 14,
  MinibossGolem = 15,
  Ghost = 16,
  GreaterGhost = 17,
  SkeletonMage = 18,
  Ent1 = 19,
  Ent2 = 20,
  Ent3 = 21,
  BoomerSpider = 22,
  Golem = 23,
  Bee = 24,
  MinibossGolemSand = 25,
  Scorpion = 26,
  MinibossScorpion = 27,
  Wisp = 28,
  CactusShooter = 29,
  ScorpionMedium = 30,
  MummyTank = 31,
  MummyAncient = 32,
  Tumblebone = 33,
  Pharaoh1 = 34,
  Pharaoh2 = 35,
  Pharaoh3 = 36,
  Bandit = 37,
  Bush = 38,
  GhostRed = 39,
  GhostPurple = 40,
  Zombie = 41,
  Head = 42,
  GhostKing = 43,
  GhostGrave1 = 44,
  GhostGrave2 = 45,
  GhostGrave3 = 46,
  GhostGrave4 = 47,
  GhostInvincible = 48,
  Ghostham = 49,
  CalciumDad = 50,
  FrogGreen = 51,
  FrogBlue = 52,
  FrogRed = 53,
}
```

## EWaveType
Source line 371886
```ts
export enum EWaveType {
  Normal = 0,
  Swarm = 1,
  Boss = 2,
  FinalSwarm = 3,
}
```

## EMap
Source line 359622
```ts
export enum EMap {
  None = 0,
  Forest = 1,
  Desert = 2,
  Hell = 4,
  Graveyard = 8,
}
```
