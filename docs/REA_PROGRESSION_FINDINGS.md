# REA findings — level-up, rarity, XP/Gold per kill — 2026-11-14

Third pass (after [REA_GAME_DATA_FINDINGS.md](REA_GAME_DATA_FINDINGS.md) and [REA_RUNTIME_SYSTEMS.md](REA_RUNTIME_SYSTEMS.md)). Static analysis only; **V** = read from binary/asset, **I** = inferred, **U** = not resolved. RVAs are GameAssembly.dll addresses (use `tools/disasm_methods.py`).

## 1. XP and Gold per kill (V, small functions read byte-for-byte)

| Function | RVA | Result |
|---|---|---|
| `EnemyData.GetGold()` | 0x383BD0 | `return 1` — constant, no scaling |
| `EnemyData.GetXp()` | 0x383C40 | `return xp` (field `+0x94`; **every EnemyData has xp = 1**, see enemies.json) |
| `EnemyData.GetEliteXp()` | 0x383B20 | `round(xp × XpUtility.eliteEnemyXpMultiplier)` with multiplier **10** → 10 |
| `Enemy.GetXp()` | 0x4AD860 | if the enemy's flag test (`EEnemyFlag` at `+0xBC`, mask 1 = elite) is set → `GetEliteXp()`, else `EnemyData.xp` |

So a normal kill gives **1 XP**, an elite **10 XP**; player-side `PlayerXp.AddXp` then multiplies by the `XpIncreaseMultiplier` stat (REA_GAME_DATA §8). There is **no per-stage XP scaling**; progression comes from the level table (7, 23, 45, 74, 108 … cumulative). Gold per kill is **1 coin** (`GetGold`), with only the Stonks status effect adding a burst effect. This answers the backlog items "XP per EnemyData" and "Gold per enemy" (the web's all-1 test setting happens to match). **Silver** per-kill/over-run rules are still **U** (there is `SilverFlying`, `GetSilverReward` in `UnlockableBase`, `FinalSwarmSilverUi`).

## 2. Level-up offer (V constants / flow)

- `UpgradePicker` (TypeDef 5002): `buttons[]`, `numUpgrades`, `banishMode`, `banishCooldownOverAtTime`, `moaiLuckMode`. `ShuffleUpgrades(EEncounter)` (RVA 0x561870) fills the cards: for the Moai encounter it calls `InventoryUtility.GetRandomItemsMoai`, otherwise `InventoryUtility.GetRandomUpgrades()` and sets each button with `UpgradeButton.SetUpgrade`; when nothing can be offered it finishes via `EncounterWindows.RewardFinished`.
- `InventoryUtility.GetNumUpgrades` (RVA 0x4203D0) **= 3** choices. `GetNumMaxWeaponSlots` and `GetNumMaxTomeSlots` (0x4203C0, same body) **= 4 each**. `GetNumAvailableTomeSlots/WeaponSlots` add run-dependent extras (`+2` / stat-driven, I). `GetWeaponMaxLevel` / `GetTomeMaxLevel` read an inventory stat plus a base (`+0x63` = 99, I).
- `GetRandomUpgrades` (RVA 0x420EF0) builds the pool from `UnlockUtility.GetAvailableWeapons()` + `GetAvailableTomes()`, filters each candidate with `CanUnlockItem` (weapon/tome slot full → only already-owned ones qualify; banished entries are excluded via `RunUnlockables.banishedUpgradables`), and picks with a weight; the code contains the constant `0.3333` (I: a third of offers prefer owned/new — exact rule **U**).
- `UpgradePicker.SelectUpgrade(IUpgradable, List<StatModifier> offer, UpgradeButton, ERarity)`: the chosen card applies a `StatModifier` list that already includes the rolled rarity.
- **Banish:** `StartBanishMode/StopBanishMode/Banish`, cooldown timestamp `banishCooldownOverAtTime`; banished sets live in `RunUnlockables` (`banishedItems`, `banishedUpgradables`). Charge counts for Banish/Skip/Refresh are **U** (stat/inventory-driven).
- **Encounter kinds** (`EEncounter`): Levelup, RandomStats, GreedAltar, ChestNormal/Free/Evil, Moai, ShadyGuy, BalanceShrine, Microwave, ChestFreeCrypt, ChestGhost. `EncounterData.offers[]` each `EncounterOffer{rarity, effects[]}`; effects `EEncounterEffect`: StatChange, EGold, EHealth, StatChangeBalanceShrine.

## 3. Rarity roll (V)

- `Rarity.CalculateRarityWeights(float[] w, float luck)` (RVA 0x42D1B0): `c = 1.5 × f(1 + luck)` where `f` is the helper at 0x180300CD0, **confirmed natural log (V)**: it is a polynomial `logf` that reconstitutes `exponent × ln2` from the split constants 0.693115234375 + 3.1946e-5, then for index i (0 = commonest) `w[i] *= 1.5^(−c × (n − 1 − i))`, then normalise by the sum. So with luck > 0 the common end is suppressed geometrically and the rare end is not; with luck 0 the weights are unchanged.
- `Rarity.GetUpgradeOfferRarity / GetEncounterOfferRarity(luck)` (RVA 0x42D2C0, same body): builds the 5-element weight array and its matching rarity array from static data, calls `CalculateRarityWeights`, rolls `Random.Range(0,1)` and walks the cumulative sum. **Resolved (V):** the two 20-byte `__StaticArrayInitTypeSize=20` blobs in Assembly-CSharp's `<PrivateImplementationDetails>` (global-metadata offsets 0x73DEC8 and 0x748388) are the rarity ids `{1,2,3,4,5}` (Common…Legendary) and the weights **`{1.5, 0.3, 0.15, 0.04, 0.009}`**. At luck 0 these normalise to 75.0 / 15.0 / 7.5 / 2.0 / 0.45 %. A 4-weight blob `{0.75, 0.15, 0.075, 0.025}` (0x73DF20) sits beside them (likely Shady Guy / item custom weights, I).
- `Rarity.GetItemRarity(luck)` (RVA 0x42D3F0) **base weights (V, immediates)**: **Common 70, Rare 15, Epic 6, Legendary 1.5** (EItemRarity; Corrupted/Quest are separate), then the same `CalculateRarityWeights` + roll. `GetShadyGuyRarity(luck, customWeights)` takes overrides.
- `Rarity.GetMultiplier(ERarity)` (RVA 0x42DA00, jump table decoded): **New 1.0, Common 1.0, Uncommon 1.2, Rare 1.4, Epic 1.6, Legendary 2.0** — the multiplier on an upgrade's numeric effect for the rolled rarity.
- `EncounterUtility.GetRandomStatValue(stat, out type)` (RVA 0x436B10) contains the shrine/encounter stat magnitudes `15, 20, 5, 0.12, 0.06, 0.08, 0.2, 0.15, 0.1, 0.05, 1, 0.075` (per-stat mapping **U**); the stat pools (`upgradableStatsShrines`, `…ChaosAndGamble`, `…BalanceShrine`) are built in `EncounterUtility..cctor` (stat IDs read from immediates, e.g. 0x0A..0x1F, 0x27–0x29, 0x2E; exact lists **U** until the sequential `Add` calls are decoded).

### Pool selection - `InventoryUtility.GetRandomUpgrades` (RVA 0x420EF0), now decoded from the Ghidra pseudocode (V)

1. Candidates are all available weapons and Tomes (`UnlockUtility.GetAvailableWeapons/Tomes`) that are not at max level. Each has `GetLevel()` and `GetMaxLevel()`.
2. **List A** = not owned (level < 1) and `CanUnlockItem` (a free weapon/Tome slot exists). **List B** = owned and below max level.
3. Offers `n = 3` (`n = |A|+|B|` if fewer than 4 exist; empty -> no offer). `p = 1/3` (or `1/n` when fewer than 4 candidates).
4. For each offer: if A is empty take a random entry of B; else if B is non-empty and `random < p` take a random entry of B; otherwise take a random entry of A. The pick is removed from its list. So new items are favoured about 2:1 over levelling owned ones.
Rarity is rolled per card afterwards (`GetUpgradeOfferRarity`, section 3). The web's three Tomes always satisfy this rule (all offers are available), so no code change was needed; it becomes relevant when weapon cards are added.

## 4. What this changes for the web upgrade screen

| Topic | Now verified | Replace provisional web value |
|---|---|---|
| Offers per level-up | 3 | (matches) |
| Weapon / Tome slots | 4 / 4 maximum | verify web caps |
| Tome effect numbers | `docs/rea/tomes.json` (+ `Rarity.GetMultiplier` for rarity scaling, I) | +5 / ×0.85 / +1 test values |
| Weapon level effect | `docs/rea/weapons.json` `upgradePerLevel` | Damage/Cooldown/Quantity test values |
| Item rarity odds | 70 / 15 / 6 / 1.5 (+ Luck formula) | any invented odds |
| XP per kill | 1 (elite 10) × XpIncreaseMultiplier; level table from REA_GAME_DATA §8 | "5+3 per level" |
| Gold per kill | 1 | — |

## Still open

The weighted pick inside `GetRandomUpgrades` (owned-vs-new rule); Banish/Skip/Refresh charge sources; `StatModifier` application order for `Addition / Multiplication / Flat` inside `PlayerStatsNew`; per-item behaviours; Silver; audio mixer routing; settings fields; movement parity gaps.


## Addendum - weapon offers, stat folding, armor/evasion (Ghidra + disassembly, 2026-11-14)

- **Weapon/upgrade offer (`UpgradeData.GetUpgradeOffer(rarity, eWeapon)`, RVA 0x44FB40, V):** the offer is a random subset of the weapon's `upgradeModifiers`. Count: for **Common** rarity `Random.Range(0,2)` decides 1 modifier (50 %) or 2 modifiers (50 %, if the list has more than one); every other rarity offers **2** (when at least 2 exist). A stat id 0x29 lookup in the player's stat dictionary can add extra modifiers (loop `i < stat`, meaning not understood, **U**). Each picked modifier is copied with `value = Round(value x Rarity.GetMultiplier(rarity), 2)` (`GetRandomModifier`, RVA 0x44FA30) and keeps its stat and operation type. Modifiers are drawn without replacement.
- **Tome offer (`TomeData.GetUpgradeOffer`, RVA 0x391E20):** all Tomes except Balance (eTome 23) return their single `statModifier`; at rarity 0 unscaled, otherwise `value` goes through `FUN_18044DDD0(value, rarity, 2)` (scaling helper, not yet read - **U**).
- **Applying modifiers (`PlayerStatsNew.ApplyStatModifier`, RVA 0x445810, V):** `Flat` adds `value x levels` to the flat accumulator, `Addition` adds to the additive accumulator, `Multiplication` multiplies the multiplicative accumulator by `value x levels` (`StatModifier.GetModificationTotal` = value summed `levels` times, i.e. linear). `StatComponents{flat +0x14, additive +0x18, multiplicative +0x1C (starts 1)}`; `StatComponents.GetFinalValue(a, b)` (RVA 0x44C980) = `(a.additive + b.additive) x (a.flat + b.flat) x (a.mult x b.mult)`. `WeaponUtility.GetNewDamage` (RVA 0x435770) returns `GetFinalValue(playerDamageComponents, weaponModifierComponents) x baseWeaponDamage` when the weapon has modifications, else `PlayerStats.GetStat(DamageMultiplier) x baseWeaponDamage`. The initial accumulator values live in `PlayerStatsNew.UpdateStat` (RVA 0x446290) - decompile pending, so the effect of "DamageMultiplier Flat 2.0" per weapon level is **U**.
- **Final-value clamps (`PlayerStatsNew.CheckFinalValue`, RVA 0x4458A0, V):** MaxHealth clamped to [1, 2.147e9]; **Armor** `a / (a + 0.75) x 0.999`; **Evasion** `e / (e + 1) x 0.999` (diminishing returns, never reaching 100 %).

- **Base stat values (V, `PlayerStatsNew.GetBaseValue` switch decoded; `docs/rea/stat_base_values.json`):** MaxHealth 100, HealthRegen 10 (per minute), Evasion 0.01, CritChance 0.01, JumpHeight 7, PickupRange 5; 29 multiplier-style stats (Damage, AttackSpeed, Size, ProjectileSpeed, Duration, Knockback, MoveSpeed, XP/Gold/Silver gain, EliteSpawnIncrease, PowerupChance, ...) start at 1; the rest (Shield, Thorns, Armor, Lifesteal, Luck, Difficulty, Projectiles, Overheal, ExtraJumps, ...) start at 0. Web use: `src/player/StatSheet.ts` (Fox = base + CharacterData modifiers + Tomes), shown in the Stats panel; Evasion and Armor now affect contact hits.

## Addendum - Ghidra job 3 results (stat folding, Tome accumulation, rarity, max levels), 2026-11-14

- **`PlayerStatsNew.UpdateStat` (RVA 0x446290, V):** for each stat: flat = 0, additive = 0, multiplicative = 1; every modifier source (character modifiers, each Tome's accumulated modifier, weapons, items, status effects) adds `GetModificationTotal(modifier, 1)` to flat (type Flat), additive (Addition) or multiplies the product (Multiplication). **`value = (base + flat) x (1 + additive) x product`**, then clamps: MaxHealth to [1, 2.147e9], Armor `v/(v+0.75) x 0.999`, Evasion `v/(v+1) x 0.999`. Base = `GetBaseValue`.
- **Tome accumulation (`TomeInventory.AddUpgrade`, RVA 0x42F950, V):** each Tome owns one accumulated `StatModifier` (stat and type copied from the Tome; `modification` starts at **1.0 for Multiplication, 0 otherwise**) and every level adds that level's offered value to it. So Damage Tome = `1 + sum of level values` (linear: three Common levels = 1.24, not 1.08^3), Cooldown/Agility etc. add to the additive sum, Quantity adds to the flat sum.
- **Level value (`TomeData.GetUpgradeOffer` RVA 0x391E20 + helper RVA 0x44DDD0, V):** rarity 0 (New) uses the unscaled value; otherwise `Round(value x Rarity.GetMultiplier(rarity), 2)`. Consequence: Common Cooldown Tome `Round(0.075, 2)` = **0.08** (tie; half-even and half-up both give 0.08). Weapon offers use the same rounding (section above).
- **Rarity per card (`UpgradeButton.SetUpgrade`, RVA 0x55F890, V):** `rarity = Rarity.GetEncounterOfferRarity(PlayerStats.GetStat(Luck))`, rolled when the card is filled; the card shows the rarity name (`t_rarity`) and tint from `MyColorUtility.RarityToColor` / `GetRarityColorBackground`.
- **Rarity colours (`MyColorUtility..cctor`, parsed with `ColorUtility.TryParseHtmlString`, V, `docs/rea/ui_colors.json`):** New `#FFFFFF`, **Common `#4dff97`**, **Uncommon `#0ca7fa`**, **Rare `#FF00F4`**, **Epic `#ff2929`**, **Legendary `#FFE300`**. Other UI colours in the same file: tier 1/2/3 `#3EBE71 / #177FFF / #FF8100`, haste `#00B4FF`, magnet `#FF7F19`, shield `#00FF41`, time freeze `#00FF97`, health `#FF1800`, rage `#FF42F0`, stonks `#FFF814`, aegis `#ffcd29`, fire `#fc9d3d`, poison `#d063ff`, echo `#42ff91`, difficulty easy/medium/hard `#CCFFD0 / #009DFF / #FF1027`.
- **Max levels (`InventoryUtility.GetWeaponMaxLevel/GetTomeMaxLevel`, V):** weapon **40** (+ an inventory stat bonus), Tome **99** (+ bonus).
- **Weapon level-up path:** `WeaponInventory.AddUpgrade` (RVA 0x4325E0) creates/increments a per-weapon entry (level at `+0x20`) and folds the offered modifiers into the weapon's StatComponents; weapon damage = `baseDamage x GetFinalValue(player DamageMultiplier components, weapon components)` where the product of `(additive sum) x (flat sum) x (mult product)` uses the same accumulators. The seed values of a fresh weapon's components are still unread, so `DamageMultiplier Flat 2.0` per weapon level is still **U** (it adds 2.0 to the flat sum of the weapon's own components).

## Addendum: decompile job 4 (weapon object construction, RVA 0x432260)

Ghidra, 45 minutes. The function is the **WeaponBase constructor** (called from `WeaponInventory.AddWeapon`):

- stores the `WeaponData` (+0x18) and creates the weapon's stat container (+0x28) and a second helper object (+0x30);
- sets level field (+0x20) = 1 and a flag (+0x40) = 1;
- for `eWeapon` 0x18 and 0x1a it builds a dedicated attack-behaviour object (constants 0.05 / 0.005 and a cooldown from a static float divided by 60) - these are special weapons with their own logic;
- then loops over **`WeaponData.baseStats` (Dictionary<EStat,float>, +0x68)** and applies every entry through one helper (`FUN_180431840`, RVA 0x431840) with value 0.

So a fresh weapon's seed stats are not in a separate table: they are the `baseStats` dictionary of its `WeaponData` plus the plain fields (`damage`, `critChance`, `projectiles`, ...) already extracted. Dictionaries are not Unity-serialized, so `baseStats` is filled in code (not yet located), which is why the asset readout lacks it.

Still open: what `DamageMultiplier Flat 2.0` per weapon level means exactly (the helper at 0x431840 is the next function to read), and where `baseStats` is populated. Weapon cards in the web stay on hold; the web only owns one weapon at a time anyway.
