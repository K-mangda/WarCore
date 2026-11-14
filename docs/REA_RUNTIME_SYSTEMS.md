# REA findings — runtime systems: spawner, enemy scaling, special attacks, drops — 2026-11-14

Continuation of [REA_GAME_DATA_FINDINGS.md](REA_GAME_DATA_FINDINGS.md). Static analysis only; tiers **V** (read from binary/asset), **I** (inferred from V), **U** (not traced). RVAs are GameAssembly.dll method addresses. Reproduce with `python tools/disasm_methods.py "<regex>" out.txt` and `tools/summarize_disasm.py`. Stat IDs are `EStat` values: Difficulty=38 (0x26), EliteSpawnIncrease=39 (0x27), PowerupChance=41 (0x29), EnemyAmountMultiplier=50 (0x32), EnemyScalingMultiplier=55 (0x37).

## 1. Enemy spawner = credit director (V structure, constants V)

Namespace `Assets.Scripts.Game.Spawning.New`. `SummonerController` owns `StageSummoner` (normal waves), `SpecialSkeletonSummoner`, `SwarmSummoner`, `FinalSwarmSummoner` (and `BossSummoner`, `ChallengeSummoner`). All derive from `BaseSummoner` (credits, `List<EnemyCard>`, timers; consts `maxEnemiesPerSecond = 500`, `maxEnemiesPerCycle = 200`).

- **Cards (V):** `EnemyCard{enemy, isElite, cost, weight}`. `RefreshWeightAndCost` (RVA 0x470B20): `cost = EnemyData.creditCost`; weight starts 1.0; the elite branch doubles `cost` and sets `weight = 1 × 0.04 × EliteSpawnIncrease` (stat treated as 1 when the player has no stats yet) — branch condition `isElite` (I: jump targets filtered, but constants and field offsets are V). So an elite copy of an enemy costs 2× and has a 4 % base weight relative to the normal card.
- **Credit multiplier (V)** `BaseSummoner.GetMultiplier` (RVA 0x46CD20): if the summoner uses it, `= 1 + 0.7 × Difficulty + 0.4 × stageNumber` (`CombatScaling.GetStageMultiplier()` returns the integer stage counter as float), else 1.
- **StageSummoner (V)**
  - `GetBaseCreditsPerSecondUncapped` (RVA 0x486180) = `EnemyAmountMultiplier × (1 + 0.5 × minutes)` where `minutes = static timer (+0x1C) / 60`. `GetBaseCreditsPerSecond` additionally gates on `IsGainingCredits` and a cap derived from `EnemyManager.GetEnemiesFromSummoner`.
  - `GetSummonInterval` (RVA 0x4864B0) = `2 × clamp(1 − 0.5 × Difficulty, 0.1, 2)` seconds (default 2 s, min 0.2 s).
  - `GetNumTargetEnemies` (RVA 0x4862E0): contains `200`, `5`, `0.7`, `0.4`, Difficulty and EnemyAmount stats — a target population around `5 + 200 × f(time, stage)`; exact composition not fully decoded (**U**).
- **SwarmSummoner (V):** `swarmSummonInterval = 0.5 s`; target enemies `= 50 + GetMultiplier × …` bounded by `2.5 × EnemyManager.GetNumMaxEnemies` (RVA 0x489420, partial **I**); credits/second contains `×0.05` of an enemy's cost (RVA 0x489200). Fields `swarmHpMultiplier`, `swarmSpeedMultiplier`, `ghostTier`, `finalSwarmEnemies`.
- `EnemyManager`: `maxNumEnemiesPooled` static, `HasMaxEnemies`, `GetNumMaxEnemies`, `IsFinalSwarm`, `SpawnBoss(EEnemy, summonerId, flag, pos)`. **U:** the numeric max-enemy value and spawn-position rules (`SpawnPositions`, `useDirectionBias`).

**Web implication:** a faithful wave system = a credit director fed by `docs/rea/stages.json` timeline (which enemies join the card pool at each `timeMinutes`, swarm events) and `enemies.json` `creditCost/minStage/canSpawnAfterTime/maps`. It is *not* "every 4th enemy is a Bandit".

## 2. Enemy scaling (V constants, I composition)

`CombatScaling` statics set in `.cctor` (RVA 0x4700F0): `speedPerMinute = 0.025`, `hpPerMinute = 0.1`, `damagePerMinute ≈ 0.0280` (`0x3CE56042`), `knockbackResistancePerMinute ≈ 0.0280`, `stageSpeedMultiplier = 0.15`, `stageDamageMultiplier = 0.5`, `stageKnockbackResMultiplier = 0.5`. `GetMinutes = timer(+0x28)/60`.

- `GetHpMultiplierAddition` (RVA 0x46F6B0) returns the sum of three terms: **base** `= hpPerMinute × minutes × EnemyScalingMultiplier`; **swarm** `= 4^(swarmTimer/60) − 1`; **stage** `= 0` when stage counter = 0; `(1 + 0.45×Difficulty) × 27` when 1; `(1 + 0.45×Difficulty) × 145` when 2; otherwise `20^(n) − 1` with `n` an int from a helper (RVA 0x34A740) (I: the stage counter here behaves like a "tier/loop" index). Speed (RVA 0x46FAB0) and damage (RVA 0x46F320) follow the same three-term pattern with their own per-minute constants and, for damage, `2^(t/60)−1` / `20^n−1`.
- `EnemyStats.GetHp` (RVA 0x41B5E0): `baseHp × RunConfig.GetEnemyHp × stat × (1 + HpAddition + stat) × 1.1`, then multipliers `×7`, `×10`, `×15` for elite-challenge / elite / challenge variants and `×2.5`, `×5` for boss variants (I: exact branch mapping). `GetDamage` (0x41B290): scaling above, `×1.5` if elite. `GetSpeed` (0x41BC50) includes `0.5`, `0.2`, `÷60 ×6` terms; `GetMaxSpeed` `minutes×6`. `GetEliteChance` (0x41B440) = `EliteSpawnIncrease × 0.006` (V; only for enemies that can be elite).
- Statics: `EnemyStats.startPenetrationAtTime / penetrationPerMinute`, stun-immunity and CC caps (`maxStunsAndFreezes`).

## 3. Special attacks — fully serialized (V), `docs/rea/special_attacks.json`

`EnemyData.specialAttacks` is an *inline* array (not PPtrs); each entry holds `attackName, attackPrefab(pathID), attackChargeTime, attackRadius, attackCooldown, initialCooldown, duration, nextSpecialAttackCooldown, triggerDistance, endLag, damageMultiplier, priority`. 50 attacks over 22 enemy assets:

- **Skeleton (8037): none** → plain chase/contact. **Bandit (8032): one attack `BanditAttack`** (charge 0.4 s, radius 0.6, cooldown 10 s, trigger distance 15, end lag 1 s, damage ×0.8, next-attack lockout 3 s).
- Boss waves: Ent1-3 five root attacks each; Pharaoh1-3 laser disco/target + desert pillars; GhostKing darkness/root/spikes; minibosses Golem(+Sand), Pig/Ghostham (SphereSlam, MudSplash), Scorpion (spikes), SkeletonKing (bone pillars, laser). `CactusShooter` has a ranged `CactusProjectile`.
- Per-attack behaviour code lives in `EnemySpecialAttack*` components on the prefab (e.g. `EnemySpecialAttackCactusProjectile` fields: `grounded`, `predictive`, `arcHeight`); prefab pathIDs are listed — tracing each is **U**.

Table (values straight from the assets; times in seconds):

| enemy | attack | charge s | radius | cooldown s | duration s | next-attack cd s | trigger dist | end lag s | dmg mult |
|---|---|---|---|---|---|---|---|---|---|
| Bandit | BanditAttack | 0.4 | 0.6 | 10 | 0 | 3 | 15 | 1 | 0.8 |
| Bush | BushAttack | 0.55 | 0.5 | 12 | 0 | 3 | 9999 | 2.5 | 0.8 |
| CactusShooter | CactusProjectile | 1 | 2 | 12 | 0 | 1 | 999 | 1 | 1 |
| Miniboss_SkeletonKing | BonePillarsPredictiveMultiple | 1 | 5 | 15 | 0 | 6 | 9999 | 1 | 0.75 |
| Miniboss_SkeletonKing | BonePillarsCircles | 1 | 6 | 15 | 0 | 6 | 9999 | 1 | 0.75 |
| Miniboss_SkeletonKing | LaserTargetAttack | 1 | 4 | 40 | 8 | 8 | 400 | 5 | 0.05 |
| EntStage1 | RootAttackContinous | 0.9 | 4 | 15 | 0 | 3 | 120 | 2 | 1 |
| EntStage1 | RootAttackLines3 | 0.9 | 4 | 8 | 0 | 3 | 60 | 2 | 1 |
| EntStage1 | RootAttackLineSingle | 1 | 7 | 12 | 0 | 3 | 70 | 2 | 1 |
| EntStage1 | RootAttackSinglePredictive | 1 | 7 | 12 | 0 | 3 | 300 | 2 | 1 |
| EntStage1 | RootAttackClose | 1.2 | 10 | 10 | 0 | 3 | 15 | 2 | 1 |
| EntStage2 | RootAttackContinous | 0.85 | 5 | 13 | 0 | 2.5 | 120 | 1.8 | 1 |
| EntStage2 | RootAttackLines3 | 0.85 | 5.5 | 8 | 0 | 2.5 | 65 | 1.8 | 1 |
| EntStage2 | RootAttackLineSingle | 0.9 | 7.5 | 12 | 0 | 2.5 | 70 | 1.8 | 1 |
| EntStage2 | RootAttackSinglePredictive | 0.9 | 8 | 12 | 0 | 2.5 | 500 | 1.8 | 1 |
| EntStage2 | RootAttackClose | 1.1 | 11 | 10 | 0 | 2.5 | 15 | 1.8 | 1 |
| EntStage3 | RootAttackContinous | 0.7 | 6 | 13 | 0 | 2.25 | 170 | 1.7 | 0.85 |
| EntStage3 | RootAttackLines3 | 0.75 | 7.5 | 8 | 0 | 2.25 | 65 | 1.7 | 0.85 |
| EntStage3 | RootAttackLineSingle | 0.8 | 9 | 12 | 0 | 2.25 | 70 | 1.7 | 0.85 |
| EntStage3 | RootAttackSinglePredictive | 0.8 | 7.5 | 12 | 0 | 2.25 | 300 | 1.7 | 0.85 |
| EntStage3 | RootAttackClose | 1.1 | 11.5 | 10 | 0 | 2.25 | 15 | 1.7 | 0.85 |
| GhostKingData | DarknessAttack | 6.5 | 0 | 30 | 1 | 4 | 999 | 1 | 1 |
| GhostKingData | GhostRootAttackContinous | 0.75 | 5.25 | 15 | 0 | 3 | 170 | 1.7 | 0.85 |
| GhostKingData | GhostSpikesMultiple | 1.5 | 5.25 | 15 | 0 | 4 | 600 | 2 | 0.8 |
| Miniboss_Ghostham | SphereSlam | 1.1 | 9 | 5 | 0 | 3 | 14 | 1 | 1 |
| Miniboss_Ghostham | PigMudSplash | 1 | 6 | 5 | 0 | 3 | 400 | 1 | 0.7 |
| Miniboss_Ghostham | PigMudSplashPredictive | 1.1 | 5 | 5 | 0 | 3 | 400 | 1 | 0.7 |
| Miniboss_Golem | StoneAttackClose | 1 | 8 | 8 | 0 | 3 | 17 | 1 | 1 |
| Miniboss_Golem | StoneAttackContinous | 1.15 | 6 | 16 | 0 | 3 | 100 | 1 | 0.75 |
| Miniboss_Desert_Golem | StoneAttack | 1 | 8 | 8 | 0 | 3 | 17 | 1 | 1 |
| Miniboss_Desert_Golem | StoneAttackContinous | 1.1 | 5.5 | 16 | 0 | 3 | 100 | 1 | 0.75 |
| Miniboss_Pig | SphereSlam | 1.1 | 9 | 5 | 0 | 3 | 14 | 1 | 1 |
| Miniboss_Pig | PigMudSplash | 1 | 6 | 5 | 0 | 3 | 400 | 1 | 0.7 |
| Miniboss_Pig | PigMudSplashPredictive | 1.1 | 5 | 5 | 0 | 3 | 400 | 1 | 0.7 |
| Miniboss_Scorpion | ScorpionSpikesMultiple | 1.5 | 6 | 16 | 0 | 3 | 600 | 2 | 0.8 |
| Miniboss_Scorpion | ScorpionSpikesPreditctive | 1 | 7 | 12 | 0 | 3 | 600 | 2 | 1 |
| Miniboss_Scorpion | ScorpionSpikesHitscan | 1 | 0.6 | 12 | 0 | 3 | 350 | 2 | 0.8 |
| Pharaoh1 | LaserDiscoAttack | 1 | 4 | 25 | 14 | 7 | 200 | 0 | 0.15 |
| Pharaoh1 | LaserTargetAttack | 1 | 4 | 40 | 8 | 8 | 400 | 5 | 0.05 |
| Pharaoh1 | DesertPillarsPredictiveMultiple | 1 | 5 | 15 | 0 | 6 | 9999 | 1 | 0.75 |
| Pharaoh1 | DesertPillarsCircles | 1 | 8 | 15 | 0 | 6 | 9999 | 1 | 0.75 |
| Pharaoh2 | LaserDiscoAttack | 1 | 4 | 25 | 15 | 3.5 | 200 | 0 | 0.15 |
| Pharaoh2 | LaserTargetAttack | 1 | 4 | 30 | 8 | 5 | 400 | 5 | 0.05 |
| Pharaoh2 | DesertPillarsPredictiveMultiple | 1 | 5 | 15 | 0 | 3.5 | 9999 | 1 | 0.75 |
| Pharaoh2 | DesertPillarsCircles | 1 | 8 | 15 | 0 | 3.5 | 9999 | 1 | 0.75 |
| Pharaoh3 | LaserDiscoAttack | 1 | 4 | 25 | 15 | 2 | 200 | 0 | 0.15 |
| Pharaoh3 | LaserTargetAttack | 1 | 4 | 45 | 8 | 2 | 400 | 5 | 0.05 |
| Pharaoh3 | DesertPillarsPredictiveMultiple | 1 | 5 | 15 | 0 | 3 | 9999 | 1 | 0.75 |
| Pharaoh3 | DesertPillarsCircles | 1 | 8 | 15 | 0 | 3 | 9999 | 1 | 0.75 |
| _Test |  | 1 | 1.5 | 8 | 0 | 1 | 9999 | 1 | 1 |

(Asset names differ from `EEnemy` names: `EntStage1-3` = Ent1-3, `GhostKingData` = GhostKing, `Miniboss_SkeletonKing` = the CalciumDad-class miniboss — I.)

## 4. Pickups and drops (V partial)

`EPickup`: Xp0 Gold1 Health2 Nuke3 Time4 Shield5 Rage6 Haste7 Stonks8 Magnet9 Silver10. `PickupManager` statics (`.cctor`, RVA 0x4DF2F0): `maxXpObjects = 300`, `maxGoldObjects = 300`, `maxPowerupsOnMap = 50`; `SlowUpdate` runs every **10 s** (`InvokeRepeating`).

`OnEnemyDied` (RVA 0x4DE1E0) **(V)**: spawns an Xp pickup with `Enemy.GetXp()` (plus `ItemEchoShard.GetExtraShards` echo shards); then, unless in the final swarm and while `numPowerupsOnMap < 50`, rolls a power-up drop: `chance = (2 × t + 0) × enemy.dropFactor(+0x17C) × PowerupChance`, `t = clamp01((now − lastPowerupAtTime) / 120)` — chance grows with time since the last power-up (full after 120 s); if `random < chance`, `SpawnPickupOrb(randomPowerup)` and `lastPowerupAtTime = now`. If the Stonks status effect is active, `GoldBurstEffect` plays at the enemy position. `GetPowerupDropChance` (0x4DDDF0) and `GetPowerupTimeMultiplier` (0x4DDED0) use the same `÷120` clamp. **U:** where Gold/Silver amounts per kill are decided (not in `OnEnemyDied`), `Enemy.GetXp()` scaling, magnet/pickup attraction code.

## Still open

Gold/Silver kill rewards; `Enemy.GetXp`; `GetNumTargetEnemies` exact; SpecialSkeletonSummoner; boss `EnemySpecialAttack*` prefab behaviours; weapon attack prefabs; item/passive code; level-up pool (`EEncounter.Levelup`, rarity roll, Banish/Skip/Refresh); audio mixer routing; settings fields; movement parity gaps.
