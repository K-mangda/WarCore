# REA findings — serialized game data (enemies, stages, weapons, tomes, items, characters, XP) — 2026-11-14

Static analysis only. No game launch, no web code changed, nothing pushed. Tiers: **V** verified from shipped files, **I** inferred, **U** unknown / not traced.

## How the data was obtained (reproducible)

| Step | Command | Output |
|---|---|---|
| Enum + class layout from Il2CppDumper | `python tools/extract_dump_schema.py <megabonk_decompiled/dump.cs> docs/rea` | `docs/rea/dump_schema.json` (19 enums, 45 classes, field offsets, `const` values, method RVAs; dump.cs sha256 inside) |
| Serialized values from the installed game | `python -I tools/read_game_data.py .local-evidence/game-data2.json EnemyData,StageData,MapData,WeaponData,TomeData,ItemData,CharacterData,PassiveData,UpgradeData,...` | 291 records, 2 failures (DeathPP / one level2 object: needs `Unity.Postprocessing.Runtime` DLL) — raw file stays in `.local-evidence/` |
| Compact tables | `python tools/build_rea_tables.py` + `python tools/build_rea_tables2.py` | `docs/rea/{enemies,stages,weapons,tomes,items,characters,maps}.json` |
| Disassembly of formulas | `python tools/disasm_methods.py "<regex>" out.txt` + `tools/summarize_disasm.py` | local only |

Inputs: `Megabonk_Data/*.assets` + `level*` (Steam install), `GameAssembly.dll`, schema from `megabonk_decompiled/DummyDll`, metadata evidence `ev_03e4dbb0…cecb93e9` (REVERSE_ENGINEERING_FINDINGS.md).

**Tooling fix worth remembering.** UnityPy's AssetsTools backend puts the `[SerializeReference]` registry (`references`) after `UnlockableBase` instead of at the very end of the object, which silently shifts every field of `WeaponData / TomeData / ItemData / CharacterData / MapData` (garbage values like `eWeapon=1061`, or "read out of bounds"). `tools/read_game_data.py` moves that node last (`FixedGen`); with it all 291 records read cleanly and values are sane (Aegis `eWeapon=7`, Tome stats, characters). **Earlier extraction audits that read those classes without this fix are unreliable** — see "Corrections" below.

All rows carry their source `file#pathID` inside the JSON.

## 1. Official identities (V — enums from dump.cs)

- **ECharacter (21):** Fox, Calcium, SirOofie, Cl4nk, Megachad, Ogre, Robinette, Athena, Birdo, Bush, Bandit, Monke, Noelle, TonyMcZoom, Amog, Spaceman, Ninja, Vlad, Dicehead, SirChadwell, Roberto (values 0–20).
- **EWeapon (32):** FireStaff0 Bone1 **Sword2** Revolver3 Aura4 Axe5 Bow6 Aegis7 Test8 LightningStaff9 Flamewalker10 Rockets11 Bananarang12 Tornado13 Dexecutioner14 Sniper15 Frostwalker16 SpaceNoodle17 DragonsBreath18 Chunkers19 Mine20 PoisonFlask21 BlackHole22 Katana23 BloodMagic24 BluetoothDagger25 Dice26 **HeroSword27** CorruptSword28 Shotgun29 Scythe30 (None=−1). Sword and HeroSword are separate IDs (resolves SWORD_ASSET_REVIEW enum doubt).
- **ETome (27):** Damage Agility Cooldown Quantity Knockback Armor Health Regeneration Size ProjectileSpeed Duration Evasion Attraction Luck Xp Golden Precision Shield Blood Thorns Bounce Cursed Silver Balance Chaos Gambler Hoarder.
- **EStat (57)** incl. MaxHealth, HealthRegen, Shield, Thorns, Armor, Evasion, DamageMultiplier, AttackSpeed, Projectiles, Lifesteal, CritChance/CritDamage, element damages, PickupRange, Luck, Gold/Xp/Silver multipliers, EnemyAmount/Size/Speed/Hp/Damage/Scaling multipliers (full list in `dump_schema.json`).
- **EStatModifyType:** Addition=0, Multiplication=1, Flat=2. **ERarity (6):** New, Common, Uncommon, Rare, Epic, Legendary. **EItemRarity (6):** Common, Rare, Epic, Legendary, Corrupted, Quest. **EEncounter (12):** Levelup, RandomStats, GreedAltar, ChestNormal, ChestFree, ChestEvil, Moai, ShadyGuy, BalanceShrine, Microwave, ChestFreeCrypt, ChestGhost. **EStatusEffect (11):** Haste Rage Shield Stonks TimeFreeze Invulnerability Slow Freeze Bleed Poison BossPoison. **EMap:** Forest1 Desert2 Hell4 Graveyard8 (flags). **EElement:** Neutral Lightning Ice Fire Bleed. **EAmplificationMode:** Bounce Pierce ShieldStack. **EWaveType:** Normal Swarm Boss FinalSwarm. **ETimelineEvent:** AddEnemyCard, MiniBoss, Swarm.
- **EPassive (22):** Bullseye RngBlessing SpeedDemon Reinforced Flowstate CritHappens Warrior Flex WallClimb None Float Enduring Plague Quantum Shadowstep Gamba Vampire Curse Stonks LockIn Zap Hoarder.

## 2. Stages / waves / bosses (V serialized, U runtime spawner)

`docs/rea/stages.json`, `maps.json`. Each `StageData.stageTimeline`: `stageTime`, `checkNewEnemyInterval` (60 s everywhere), `startEnemies`, `events[]` (type, enemies, `timeMinutes`, `duration`), `minibosses`, `boss`.

| Map | Stages (`stageDuration` per MapData = 600 s) |
|---|---|
| MapForest | StageForest1 (stageTime 600) / 2 (540) / 3 (480) |
| MapDesert | StageDesert1 (600) / 2 (540) / 3 (480) |
| MapGraveyard | StageGraveyard (960) |
| MapHell | StageHell1 ×3 slots (same asset) |
| MapDungeon | StageDungeon (600) — MapData.eMap reads `None` for Dungeon and Hell |

- **Forest 1:** start Goblin; MiniBoss @3 min (MinibossGolem, MinibossPig, 30 s); Swarm Goblin @4; Swarm GoblinStrong @7; MiniBoss @8 (30 s); boss `EntStage1` (Ent1).
  Forest 2 shifts to 2/3/6/7 min, Forest 3 to 1.5/2.5/4/5 min; boss Ent2/Ent3.
- **Desert 1:** start Mummy; MiniBoss @3 (Scorpion, GolemSand); Swarm Mummy @4; Swarm Scorpion @7; MiniBoss @8 (Golem, Pig, 60 s); boss Pharaoh1 (2/3: 2,3,6,7 and 1.5,2.5,4,5 min).
- **Graveyard (960 s):** start Ghost; Swarm @4 Ghost, @8 GreaterGhost, @11 GhostPurple, @14 GhostRed; MiniBoss events @3/7/10/13 with **empty enemy lists** (minibosses `CalciumDad`, `Ghostham` come from `minibosses`); boss PPtr resolves to `EntStage1` (**suspect — pathID 8008 is shared with Forest; treat as U**).
- **Hell1:** same shape as Forest 1 (start Goblin, GoblinStrong swarm); boss PPtr unresolved/suspect. **Dungeon:** start Slime; MiniBoss events list Slime, GreaterGhost @3/8; Swarm Golem @4, GoldenSkeleton @7; boss none.
- Elite/miniboss/boss classification (V from data): minibosses = `MinibossGolem(Sand)/Pig/Scorpion`, `CalciumDad`, `Ghostham`; bosses = `Ent1-3`, `Pharaoh1-3`, `Bandit`, `Bush`, `GhostKing` (creditCost 40, no `canBeElite`, 3–5 special attacks, hp 8,000–500,000). Frogs (creditCost 99, hp 1000, dmg 1) and `GhostGrave1–4`, `GhostInvincible`, `Test*` look like special/event entities.
- Wave type for `EnemyWave` objects (`eWaveType, enemies, waveTime, minNumEnemies, spawnInterval`) is a runtime class (TypeDef 5726); **U:** how `creditCost`, `minStage`, `canSpawnAfterTime`, `Difficulty` and `EnemyAmountMultiplier` combine inside `EnemySpawner/EnemyManager`. Methods and RVAs are in `dump_schema.json`; trace them next.

## 3. Enemies — `docs/rea/enemies.json` (53/53 EnemyData read, V)

Per-enemy: hp, damage, shield, speed, mass, knockbackResistance, **xp (=1 for every enemy → real XP is a runtime formula, U)**, creditCost, minStage, canSpawnAfterTime, maps flags, isFlying, isRunningFromPlayer + stay distance, teleportCooldown, canBeElite/canBeExecuted, isPoison, nukeProtection, despawnTime, maxSuckTime, collider, renderer offset/scale, AnimatedMesh/Material pathIDs, **`specialAttacks` count and raw PPtr entries**.

Highlights: Skeleton 20 hp/20 dmg/5.5 speed, creditCost 1, maps Forest+Graveyard (not Desert), `canBeElite`. Bandit (EnemyData 8032): hp 11,000, dmg 50, speed 10, creditCost 40, **no `canBeElite`, maps=0** (not a wave enemy), **1 special attack** → Bandit is a boss-class entity, **resolves the backlog question "Bandit normal/elite/miniboss/boss?" toward boss-tier (I; needs spawn site)**. Skeleton has 0 special attacks (V: `specialAttackCount = 0`), i.e. plain chase/contact. Special-attack PPtr targets (Bandit 1, Pharaoh 4, Ent 5, Ghostham 3, …) are in the JSON for follow-up resolution.
Credit-cost ladder: Slime 0.75; most basics 1; strong variants 1.1–2.5; ArmoredSkeletonDusty 3; GoldenSkeleton/XpSkeleton 10 (`isRunningFromPlayer`, `minStage −1`); bosses/minibosses 40.

## 4. Weapons — `docs/rea/weapons.json` (30/30, V)

Base fields per weapon (damage, knockback, critChance, element, projectiles, projectileBounces, attackDuration, effectDuration, projectileSpeed, endCooldown, burstTime, minBurstInterval, amplificationMode, procCoefficient, useVision, canMultiHit, hasCrosshair, isAura, spawnOffset, attack prefab pathID) **plus `upgradePerLevel`** (UpgradeData list of `{stat, op, value}` — what one weapon level-up adds). Examples: Sword dmg 11, endCooldown 0.75, burst 0.5, level adds +0.20 Size, +2.0 DamageMultiplier (Flat), +1 Projectile, +0.25 Knockback; FireStaff dmg 10, Fire, cooldown 0.5, level adds +0.2 projSpeed, +2.5 damage, +1 projectile, +0.16 size; Axe dmg 6, 2 projectiles, cooldown 1.4; Bow dmg 9, Pierce; Aegis dmg 10, `ShieldStack`, isAura; Dice dmg 0 (formula-driven); Bananarang Pierce. Burst-interval formula already in WEAPON_BEHAVIOR.md (RVA 0x434840). **U:** per-weapon targeting/motion code (attack prefab behaviours), VFX/SFX triggers; prefab pathIDs are given for each.

## 5. Tomes — `docs/rea/tomes.json` (26/26, V) — corrects UPGRADE_DATA_AUDIT

Each Tome has a `statModifier {stat, op, value}` and an English `description`. E.g. Damage `DamageMultiplier ×(Multiplication) 0.08`, Cooldown `AttackSpeed +0.075 (Addition)`, Quantity `Projectiles +1 (Flat)`, Health `MaxHealth +25 (Flat)`, Armor `Armor +0.12 (Flat)`, Agility `MoveSpeed +0.15`, Size `+0.10`, Duration `+0.15`, ProjectileSpeed `+0.15`, Knockback `+0.20`, Luck `+0.08`, Xp `+0.07`, Golden `+0.12`, Silver `+0.12`, Precision `CritChance +0.07`, Evasion `+0.10`, Regeneration `+40 (Flat)`, Shield `+25`, Thorns `+15`, Blood `Lifesteal +0.10`, Cursed `Difficulty +0.035`, Attraction `PickupRange +0.75`. **Balance / Chaos / Gambler / Hoarder** carry a placeholder (`MaxHealth +0`) and a script-driven description ("+2% every stat", "boost a random stat", "random item") — behaviour is code (U). These values replace the web's three provisional numbers (+5 / ×0.85 / +1) when you want real parity; rarity scaling of a Tome roll is **U** (see `ERarity`, not on TomeData).

## 6. Items — `docs/rea/items.json` (87/87, V)

Fields read: `eItem`, `rarity` (EItemRarity), `inItemPool`, `maxAmount`, `maxAmountPerRun`, `price`, `itemTickPriority`. Counts: Common 22, Rare 21, Epic 20, Legendary 21 (+1 not in pool), Quest 2 (all `inItemPool`, except one legendary). Item *effects* are code (`ItemBase` subclasses) — **U**, per item class.

## 7. Characters — `docs/rea/characters.json` (21/21, V)

Per character: price, `statModifiers` (e.g. Fox: JumpHeight +1, Evasion +0.05, Luck +0.15, PickupRange +4, MoveSpeed +0.04), starting weapon (Fox FireStaff, SirOofie Sword, Calcium Bone, Cl4nk Revolver, Megachad Aura, Ogre Axe, Robinette Bow, Athena Aegis, Birdo Tornado, Bush Sniper, Bandit Dexecutioner, Monke Bananarang, Noelle Frostwalker, TonyMcZoom WirelessDagger (asset name; enum EWeapon has BluetoothDagger=25 — same weapon is likely, I), Amog PoisonFlask, Spaceman BlackHole, Ninja Katana, Vlad BloodMagic, Dicehead Dice, SirChadwell CorruptedSword, Roberto Scythe), passive (EPassive), collider height/width, footstep clip pathIDs, prefab pathID, stat category ratios, quest-gated visibility. **U:** passive formulas, unlock rank/run counts (achievement refs), rig/animation clips for non-Fox characters (prefab pathIDs listed).

## 8. EXP curve (V disassembly)

`XpUtility..cctor`: `eliteEnemyXpMultiplier = 10`, `baseXp = 5`, `increaseRate = 1.065`, `exponent = 1.065`, `maxLevel = 9999`; `PlayerXp` static `maxXpMultiplier = 10`. `XpUtility.Init` (RVA 0x3D3920) builds `xpForLevelsTable[1..9999]` cumulatively: term(L) = `L^1.065 × 1.065 × 5` (+5 when L>1; **L=1 uses 7**), running sum S, entry = rounding of S (rounding mode via helper at 0x180331070 — **U** floor/round). `XpToLevel(xp)` returns the largest L−1 with `table[L] > xp`, i.e. cumulative XP at level n ≈ **7, 23, 45, 74, 108, 149, 196, 250, 310, 377, 451, 531 …** (n=1…12). The web's "5+3 per level" is a provisional placeholder; this is the native table shape. `PlayerXp.AddXp` multiplies by the `XpIncreaseMultiplier` stat (`PlayerStats.GetStat`) then calls `XpToLevel` and fires `A_LevelUp`. `PlayerStatsNew.GetBaseValue` constants (100, 10, 0.01, 7, 5, 1) are per-stat defaults (mapping stat→default **U**).

## Corrections to earlier docs

- UPGRADE_DATA_AUDIT / UPGRADE_IMPLEMENTATION: "26 Tomes have empty descriptions and no numeric modifier" — **wrong source read** (shifted typetree). Tome modifiers and descriptions exist (§5); equipment (87 items) is item-class code.
- EXTRACTION_BACKLOG "Bandit… role unconfirmed" — see §3 (boss-tier, has a special attack, not in map flags).
- Weapon "Sword enum doubt" — Sword=2, HeroSword=27 are distinct (§1).
- Stage roster is no longer "unknown": see §2. The "every 4th = Bandit" sandbox rule is not original (Bandit is never in a wave list).

## Still open (needs the next trace, tooling is ready)

1. ~~Runtime spawner / credit formula / scaling~~ and ~~special attack data~~ — now in [REA_RUNTIME_SYSTEMS.md](REA_RUNTIME_SYSTEMS.md). Remaining: `GetNumTargetEnemies` exact form, `SpecialSkeletonSummoner`.
2. Per-attack prefab behaviours (`EnemySpecialAttack*`), Skeleton movement/AI class; death/dissolve (EnemyDissolve) timings.
3. Item/passive/Tome-special behaviour code; ERarity roll and level-up pool (`EncounterUpgrades`/Levelup path), Banish/Skip/Refresh.
4. Weapon attack prefabs (targeting/hitbox/VFX) per `attackPrefabPathID`; non-Fox character rigs.
5. Pickup/gold/silver drop formulas (`PickupManager`, drop chance), chest/shrine costs, audio mixer routing, settings fields, movement parity gaps — not started in this pass.
