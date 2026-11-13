# Level-up / inventory / stats screen — 2026-11-14

User reference: codex-clipboard-8905d05b-cbc2-43e4-ae3a-7b28118429ff.png and user observation that the top level bar loops during the upgrade screen.

## Connected now

- Inventory left, vertically stacked Upgrade Offers centre, Stats right; existing exported frame/icons/font. Inventory separates Weapons / Tomes / Items. Only actual held weapon and Tome levels are displayed. Items have an explicit unavailable state; no invented slot capacity or weapon level.
- Offer rows show current real web values -> next values using nextUpgrade/upgradeValues, source Tome icon, actual current Tome level or NEW, existing 1–3 selection preference. Three sandbox Tome effects and caps remain unchanged; no additional weapon unlock or random rarity is implied.
- Shared PlayerStats component is reused by Pause and Upgrade. It shows current HP, per-hit damage, interval, attack count and effective three Tome bonuses. Screenshot stats that do not exist in the web run are not seeded with screenshot numbers or assumed defaults.
- Segmented green/cyan/magenta/red/orange/yellow top stripe loops while selection is open, independent of paused simulation. One-second cycle (sped up from four seconds by user request) and exact colors are web tuning based on the image/user description, not recovered native shader/timing. It is decorative (not fake XP progress); reduced-motion users get a static stripe. Normal gameplay XP progress remains unchanged.
- Banish / Skip / Refresh appear disabled, explicitly not available. No fabricated charge counts/costs or event actions. Underlying gameplay, loot, audio and queued-upgrade freeze/resume remain unchanged.

## Request for extraction AI — inspect existing exports first

1. Upgrade UI hierarchy, frame/sprite/rarity tint mappings, layout scale and selection/hover/confirm animation timings. Top spectrum material/shader, color stops, speed/direction, triggers and relationship to XP text/progress. The screenshot itself does not prove those values.
2. Pool of weapons/Tomes/items: eligibility/unlocks/slot limits, new versus owned upgrades, number of offers, duplicate exclusions, fallback when capped, rarity labels/colors/weights and modifiers. Existing model/sound/icon assets are ready for several weapons; missing attack/stat behavior is separately documented. Do not re-extract ready files.
3. Bone damage upgrade values and level model; Bananarang and Flamewalker native attack/dependency chains. A pictured offer is not sufficient evidence to implement its behavior or include it in the playtest pool.
4. Banish / Skip / Refresh: starting charges, acquisition, charge counters versus hotkeys, costs, selection mode, effect on pool, pending level/XP consumption, persistence/reset and exhausted-pool behavior. Do not mistake the screenshot's numbers above buttons for keyboard bindings.
5. Stats schema, units, base values, stacking and rounding: Max HP, HP Regen, Overheal, Shield, Armor, Evasion, Lifesteal, Thorns; Damage, Crit Chance/Damage, Attack Speed, Projectile Count/Bounces; Size, Projectile Speed, Duration, Damage to Elites, Knockback, Movement Speed; Extra Jumps, Jump Height, Luck, Difficulty; Pickup Range, XP/Gold/Silver Gain, Elite Spawn Increase, Powerup Multiplier/Drop Chance. Source per-character/weapon/Tome/item/shrine modifiers and calculation/display order are needed. Current movement tuning must not be overwritten by screenshot values.
6. Inventory weapon/Tome/item capacities, slot layout, weapon and item levels/counts, overflow/full-slot behavior and tooltips. Native item effects are not implemented just because an icon exists.
7. Native upgrade-opening backdrop rays/floating pickups/sparkles and their material/audio/event/pause scopes. Existing in-game LEVEL UP popup/burst remains a separate effect; do not substitute it for the whole selection backdrop.
8. HUD: meaning of the two shown clocks (0:16 and 9:43), progression/countdown duration, gold/silver/chest counters, compass and health/icon placement. The web timer is actual elapsed time; no native countdown/chest count/compass is invented.

Return raw references and source hashes; formulas need method-body evidence, with verified / inferred / unknown distinguished. The other AI owns extraction. See EXTRACTION_BACKLOG.md for the broader unimplemented item/interactable/weapon queues.
