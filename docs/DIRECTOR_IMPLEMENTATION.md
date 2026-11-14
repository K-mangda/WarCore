# Enemy director, native data module and Tome values — 2026-11-14

Web implementation of Phase A items 1-2 from the gap analysis. Source evidence: [REA_RUNTIME_SYSTEMS.md](REA_RUNTIME_SYSTEMS.md), [REA_GAME_DATA_FINDINGS.md](REA_GAME_DATA_FINDINGS.md), [REA_PROGRESSION_FINDINGS.md](REA_PROGRESSION_FINDINGS.md). Evidence tiers: **V** verified serialized/disassembled value, **I** inferred, **P** provisional web choice (replace when the native method is decoded).

## Data module — `src/data/NativeData.ts` (generated)

`python tools/build_web_data.py` turns `docs/rea/{enemies,stages,tomes,weapons}.json` into one typed TypeScript module (53 enemies, 9 stage timelines, 26 Tomes, 30 weapons with per-level modifiers). It carries `nativeDataMeta` (generator, date, `dump.cs` SHA-256, global-metadata SHA-256, evidence docs, tier note) and each row keeps its `source` (`file#pathID`). Do not edit by hand: re-run the Python pipeline (`read_game_data.py` -> `build_rea_tables*.py` -> `build_web_data.py`).

## Director — `src/combat/Director.ts`

| Behaviour | Tier | Notes |
|---|---|---|
| Cards = enemies with `creditCost`; spending random affordable card while credits last | V (structure) | normal-card weight 1 |
| Credits/second = `EnemyAmount x (1 + 0.5 x minutes)` x `1 + 0.7 x Difficulty + 0.4 x stage` | V | RVA 0x486180 / 0x46CD20; Difficulty=0, EnemyAmount=1 defaults assumed |
| Summon interval `2 x clamp(1 - 0.5 x Difficulty, 0.1, 2)` s | V | RVA 0x4864B0 |
| No credit earning at max enemies; <=200 spawns per cycle | V | `BaseSummoner.AddCredits`, `maxEnemiesPerCycle` |
| Stage `startEnemies`, MiniBoss and Swarm events at `timeMinutes` | V | Forest 1: Goblin; miniboss 3 min (Golem, Pig); Swarm Goblin 4 min; GoblinStrong 7 min; miniboss 8 min |
| Pool check every `checkNewEnemyInterval` (60 s) adds the cheapest eligible regular map enemy (`canSpawnAfterTime`, `minStage`, cost <= 4) | **P** | native `AddEnemyToPoolAndPickNewCard` undecoded |
| Initial credits 4 (first cycle fires at t=0, ~6 opening enemies) | **P** | `GetInitialCredits` undecoded |
| Swarm: batches of 3 per 0.5 s up to 50 enemies | **P** | interval 0.5 s is V; target/rate partly decoded |
| Elite cards (cost x2, weight 0.04), elite chance `0.006 x EliteSpawnIncrease`, boss at stage end | not built | needs elite HP multiplier mapping and a boss model/behaviour |

`Run.step` feeds the director with elapsed time and live enemy count; spawn positions still use the sandbox ring around the player.

## Enemies — `src/enemies/Roster.ts`

Stats are the serialized `EnemyData` (hp, damage, xp). Per-minute scaling uses `CombatScaling` constants (HP +10 %/min, damage +2.8 %/min; swarm and stage terms **not** applied - I). Speed is `native speed / 5.5` relative to the tuned Skeleton speed (I). Contact damage uses the touching enemy's damage. XP per kill = EnemyData xp (1). Only Skeleton and Bandit have baked models, so all other species render with a stand-in (`placeholderVisual`): regular -> Skeleton, miniboss-class (creditCost >= 40) -> Bandit. **Waiting for data:** baked models/animation for Goblin, Golem, Pig, Slime, Bee, etc.

## Tomes — `src/combat/Upgrades.ts`

Values come from `nativeTomes`: Damage `DamageMultiplier` Multiplication 0.08 (compounds per level, I), Cooldown `AttackSpeed` Addition 0.075 (attack-speed multiplier `1 + 0.075 n`, I), Quantity `Projectiles` Flat 1. Cap 8 projectiles and 0.15 s interval floor remain web safety limits. **Waiting for data:** `PlayerStatsNew.GetStat` combination order (Ghidra decompile pending), rarity roll wiring (`Rarity.ts` exists, unused by UI), the other 23 Tomes.

## Weapons

`nativeWeapons` holds all 30 weapons with `upgradePerLevel`; the web still has Sword/Firestaff with `balance.damage = 10` for both (native Sword 11). Applying per-weapon base stats and weapon level-ups is the next step.

## Verification

`tsc --noEmit`, `vite build` and all `tools/check_*.mjs` scripts pass locally (new Director checks in `check_combat.mjs`). Not play-tested; balance versus the original needs side-by-side measurement (kills and enemy count at 3 min, level-up times).
