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
