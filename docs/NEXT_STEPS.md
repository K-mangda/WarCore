# Next steps and blockers — 2026-11-14

Single list of what is done, what is ready to do now, and what waits for data. Detail and evidence live in the linked docs. Update this file whenever an item moves.

## Done and verified (web)

- Native XP table, rarity helper (not wired), Fox stat sheet with Armor/Evasion, danger vignette, credit-based director with Forest 1 timeline, elites, target population, native Tome values, Sword/FireStaff base stats, Lab tabs: Data and Level-up selection screen. See [DIRECTOR_IMPLEMENTATION.md](DIRECTOR_IMPLEMENTATION.md), [REA_PROGRESSION_FINDINGS.md](REA_PROGRESSION_FINDINGS.md).

## Ready now (data exists, no waiting)

| Item | Why it is ready | Status |
|---|---|---|
| Level-up screen look (backdrop rays/crystals/leaves, top bar, card frames) | `LevelupScreen.effects` GameObject and its particle/UI data can be read from the game files | backdrop done from the real particle data ([LEVELUP_SCREEN_EXTRACTION.md](LEVELUP_SCREEN_EXTRACTION.md)); card background tint done (rarity colour x 0.2, disassembled); spectrum bar, icon border/background tint (SetUpgrade body 0x55F890), open animation, `audioLevel` still to read |
| Spawn portal sequence | order and timings in [REA_PLAYER_PRESENTATION.md](REA_PLAYER_PRESENTATION.md); three wait values and the portal VFX still missing, so web would use its own visuals | not started |
| Damage flash colour, low-HP vignette colour/texture | read from scene data (see REA_PLAYER_PRESENTATION addendum) | done in web; status tints (freeze/mud/poison/shield) known, not applied |
| Death sequence look (DeathPP numbers known) | colour grading values verified; wipe shader unknown | partly possible |
| Weapon level-up cards | data complete; effects of `DamageMultiplier Flat` unknown | blocked, see below |

## Decompile job 3 finished (UpdateStat, Tome rarity scaling, AddUpgrade, max levels)

Done from it: stat folding (verified), Tome linear accumulation, rarity per card with Luck, rarity colours, Round(value x multiplier, 2). Still open:

- Weapon cards and their effect: the seed values of a fresh weapon's StatComponents are unread, so `DamageMultiplier Flat 2.0` per level is unclear. A short follow-up decompile of `WeaponInventory` entry creation (RVA 0x432260) would settle it.
- Stat hooks: HP regen (stat/60 per second, tick cadence inferred) and Pickup range (magnet radius = stat, Fox 5+4 = 9) now drive gameplay. Luck already drives rarity. Still display-only: Move speed (Fox +0.04) and Jump height/extra jumps, which belong to the movement parity work in `Motor.ts`.
- Slot caps 4 / 4, weapon max level 40, Tome max level 99 are known; the web has one weapon and three Tomes so they do not bind yet.

## UI parity round 2026-11-14 (from user screenshots of the real game)

- Done: thin spectrum bar, Weapons / Tomes / Items rows with 4 slots (Items uncapped), compact stat list without group titles/scroll, brackets only on hover (no stuck focus frame), rarity label top-left, `New` rarity (white, x1, grey card) for unowned offers (inferred from the screenshot), silver now collected like gold (auto arc, delay, same pull).
- Done too: BorderWindow frame at original thickness, rarity-coloured icon frame (SetUpgrade tint wiring read).
- Still different: icon background gradient texture, Banish/Skip/Refresh charge badges (3/2/3 in the real game; sources unknown), weapon offers (needs weapon cards and a second weapon slot in Run), the in-world XP gem seen near the bottom centre while paused (not yet reproduced).

## Blocked on extraction (no data yet)

- Models, rigs and animations for every enemy other than Skeleton/Bandit, the other 20 characters and the other 28 weapons (stand-in visuals are used meanwhile).
- Boss behaviour code (Ent, Pharaoh, GhostKing): attack parameters are known, how each attack acts is not.
- Items (87): effects are per-class code; nothing decoded.
- Banish / Skip / Refresh charge sources and costs.
- Silver rewards, chests, shrines, pots, portal end-of-stage, quests, saves.
- Audio mixer routing, settings fields not yet linked, movement parity gaps (see [PARITY_MATRIX.md](PARITY_MATRIX.md)).

## Needs the user

- Play-test the deployed build and report: enemy count at 3 minutes, level-up timing, hit frequency/damage, anything that feels off against the real game. Values marked inferred (I) or provisional (P) in the docs are the first candidates to retune.
