# Tome upgrade selection — 2026-11-13

## Existing data audit

Read the existing extracted JSON only; no native asset/DLL inspection or extraction. The142 item records contain metadata/art but no stats/modifiers/upgrades/effects fields in the checked files. Detailed per-entry source paths/hashes are in UPGRADE_DATA_AUDIT.json.

- 26 Tomes: every description is empty. All icons exist. No numeric upgrade effects or roll/rarity rules are present.
- 87 Equipment:29 empty descriptions;58 have text, sometimes truncated. Descriptions alone do not establish a complete executable effect or level-up eligibility.
- 21 Passives:5 empty descriptions.
- 8 Shop records:1 empty description.

Do not treat the source README's completeness claim as evidence that runtime effects are provided. Keep equipment/chest drops, passives and shop records out of the level-up pool until their eligibility and behavior are proven. Do not use the catalog's generic levelup_new audio label to replace the user-verified Enter5 click/Levelup4/ambience flow.

## Implemented now

The existing three web effects now use named Tome entries, run-local levels and explicit eligibility. Source identity is catalog metadata (not newly verified native references): TomeDamage8559/DamageTome, TomeCooldown8557/CooldownTome, TomeQuantity8570/QuantityTome. Their existing public/game-ui PNGs match the supplied PNG bytes; hashes are in public/progression/tomes-provenance.json. No duplicated icon exports.

Cards show the owned level → next level and exact before/after value; the HUD shows chosen Tomes and levels. Run.snapshot exposes independent inventory and available choices rather than a fixed UI-only list. The selected effect and Tome level update together, consuming exactly one pending choice. Full Quantity8 and cooldown floor0.15s are omitted from the offer list, and attempts to select a capped/unknown effect are rejected without consuming a choice. Damage remains available so queued choices cannot be stranded behind capped options. Choices stay in fixed order, with no invented native rarity or weighted roll. One or two remaining options center in the same card area.

Existing effects are retained as web balance: Damage+5, cooldown×0.85 with0.15s floor, Quantity+1 with8 cap. Tome levels record successful selections; they do not imply a recovered native level cap. Upgrades.ts owns these effects and next-value formatting; UpgradeMenu.tsx owns the cards/loadout. Main UI no longer duplicates the pool. No new native modifier values, equipment procs, random rarity, slots/unlocks, reroll/banish or new stats were invented.

Multiple earned levels remain queued and freeze simulation until all choices resolve. Existing Engine choose/resume and audio lifecycle are retained. Reset/new run clears Tome levels and restores the current weapon's base effects. Snapshot inventory/choice arrays cannot mutate the run. Lab's automatic choose('damage') for pickup previews remains compatible.

## Extraction handoff

Another AI supplies numeric modifier/operation/stat-enum mapping and level/rarity scaling for all26 Tomes, their actual localized titles/descriptions, pool eligibility/unlocks/slot limits, offer roll and exhaustion/duplicate rules, plus runtime formulas and call sites. Read EXTRACTION_BACKLOG.md. Remaining23 Tomes are not ready for playable effects merely because their icons exist. Equipment/passive/shop effects need separate provenance and entry rules. These gaps are recorded, not extracted by the web agent.

## Validation

Production build/typecheck; focused combat tests cover ownership, capped/invalid rejection without spending, snapshot isolation, queued choices/freeze/resume/reset; existing staff, audio and pointer/input resume checks remain. User performs rendered/audio/gameplay review. No phase change.
