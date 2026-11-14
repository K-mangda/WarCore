# Next steps and blockers — 2026-11-14

Single list of what is done, what is ready to do now, and what waits for data. Detail and evidence live in the linked docs. Update this file whenever an item moves.

## Done and verified (web)

- Native XP table, rarity helper (not wired), Fox stat sheet with Armor/Evasion, danger vignette, credit-based director with Forest 1 timeline, elites, target population, native Tome values, Sword/FireStaff base stats, Lab tabs: Data and Level-up selection screen. See [DIRECTOR_IMPLEMENTATION.md](DIRECTOR_IMPLEMENTATION.md), [REA_PROGRESSION_FINDINGS.md](REA_PROGRESSION_FINDINGS.md).

## Ready now (data exists, no waiting)

| Item | Why it is ready | Status |
|---|---|---|
| Level-up screen look (backdrop rays/crystals/leaves, top bar, card frames) | `LevelupScreen.effects` GameObject and its particle/UI data can be read from the game files | backdrop done from the real particle data ([LEVELUP_SCREEN_EXTRACTION.md](LEVELUP_SCREEN_EXTRACTION.md)); spectrum bar, card frames/tints, open animation, `audioLevel` still to read |
| Spawn portal sequence | order and timings in [REA_PLAYER_PRESENTATION.md](REA_PLAYER_PRESENTATION.md); three wait values and the portal VFX still missing, so web would use its own visuals | not started |
| Damage flash colour, low-HP vignette colour/texture | serialized in scene assets | not started |
| Death sequence look (DeathPP numbers known) | colour grading values verified; wipe shader unknown | partly possible |
| Weapon level-up cards | data complete; effects of `DamageMultiplier Flat` unknown | blocked, see below |

## Blocked on the Ghidra decompile (job `decompile3`: PlayerStatsNew.UpdateStat, tome rarity scaling, WeaponInventory/TomeInventory AddUpgrade, weapon max level)

- Weapon cards on the offer screen and their effect on damage/size/knockback.
- Rarity on cards (Tome value scaling at rarity > 0 is in an unread helper) and rarity colours/labels.
- Slot caps (4 weapons / 4 Tomes) and weapon/Tome max level.
- Exact stat folding order (flat/additive/multiplicative) so Luck, HP regen, Pickup range and the other display-only stats can start working.

## Blocked on extraction (no data yet)

- Models, rigs and animations for every enemy other than Skeleton/Bandit, the other 20 characters and the other 28 weapons (stand-in visuals are used meanwhile).
- Boss behaviour code (Ent, Pharaoh, GhostKing): attack parameters are known, how each attack acts is not.
- Items (87): effects are per-class code; nothing decoded.
- Banish / Skip / Refresh charge sources and costs.
- Silver rewards, chests, shrines, pots, portal end-of-stage, quests, saves.
- Audio mixer routing, settings fields not yet linked, movement parity gaps (see [PARITY_MATRIX.md](PARITY_MATRIX.md)).

## Needs the user

- Play-test the deployed build and report: enemy count at 3 minutes, level-up timing, hit frequency/damage, anything that feels off against the real game. Values marked inferred (I) or provisional (P) in the docs are the first candidates to retune.
