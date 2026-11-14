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

- Weapon cards and their effect: the seed values of a fresh weapon's StatComponents are unread, so `DamageMultiplier Flat 2.0` per level is unclear. Decompile job 4 (RVA 0x432260, the WeaponBase constructor) is done: seeds come from `WeaponData.baseStats` applied through the helper at RVA 0x431840, which is the next function to read (see REA_PROGRESSION_FINDINGS addendum).
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

## Parking lot - things said or planned, not yet done (check this before answering "what next")

Rule: when the user redirects, anything I had planned or promised goes here first, with its trigger, so it is not lost.

| Item | Trigger / blocker |
|---|---|
| Weapon cards on the level-up screen + second weapon slot in `Run` | decompile batch 6 (`.local-evidence/decompile6`, started 2026-11-14 05:47 UTC, 2,160 functions); read `key__*` files first |
| Level-up crystal emission origin (user says they fall from behind the EXP bar at the top) | read parent RectTransform of the `Levelup` effects object; check EndSparkle flash visually |
| Level-up open animation real timing | Animator/clip data unread; current timing is provisional (P) |
| `audioLevel` / `audioShadyGuy` clips on the level-up screen | read from scene data |
| Icon-background gradient texture on cards | extract texture; current gradient is a guess (I) |
| `New` rarity for unowned offers (x1, grey) | inferred from a screenshot; confirm in decompile |
| Banish / Skip / Refresh charges and effects | user: comes with the shop on the title screen |
| Move speed (Fox +0.04) and jump stats | with movement-parity work in `Motor.ts` |
| Status tints (shield, freeze, mud, poison) | needs status effects in the web first; colours already known |
| Spawn portal sequence visuals, death-screen look | three wait values still unknown; wipe shader unknown |
| Silver drop rule (currently every 12 kills, provisional) | decompile batch 6 (`PickupManager`) |
| Chests, shrines, pots, quests | decompile batch 6 (interactables) |
| **Enemy types** (53 in `docs/rea/enemies.json`: Skeleton variants, Bandit, Bee, BoomerSpider, Bush, CactusShooter, CalciumDad, Ent 1-3, Frogs, Ghost family, Ghoul, Goblins, Golem, miniboss Golem/Pig/Scorpion, Mummies, Pharaoh 1-3, Scorpions, Slime, Tumblebone, Wisp, Zombie, ...): per-type movement/attack behaviour (ranged, charge, summon, explode, invisible/invincible) and per-type models. Web only has Skeleton and Bandit models; the rest use stand-ins with the right HP/damage/speed. | decompile batch 6 (enemy classes) for behaviour; model extraction for visuals |
| Boss behaviour (Ent, Pharaoh, GhostKing), 87 item effects, Tome details | decompile batch 6 |
| **Title / main menu screen and maps**: front screen (play, shop, character select, stage/map select, unlocks, settings), the real maps/stages beyond the test arena (stage data for Forest, Graveyard, Desert etc. is in `docs/rea/maps.json` / `stages.json`; terrain/scene geometry not extracted), shop (also hosts Banish/Skip/Refresh charges) | scene extraction for map geometry; UI scene read for the title screen |
| Models and animations: other enemies, 20 characters, 28 weapons | extraction pass (UnityPy + FBX), not started |
| **Extract everything (user request)**: decompile batch 7 = remaining game classes (3,250 functions; plan in `.local-evidence/decompile7-plan.json`, regenerate with the snippet in `tools/coverage_report.py` logic), run after batch 6 finishes (each run re-imports the binary, ~35 min). Coverage report: `docs/DECOMPILE_COVERAGE.md`. Non-code still to dump wholesale: all prefab/scene hierarchies, animations, audio clips, UI sprites, models. | batch 6 finishing |
| XP table rounding mode | unresolved (Round vs floor) |
| `check_deploy` needs `MSYS_NO_PATHCONV=1` and a `--base=/WarCore/` build | run before relying on CI |
