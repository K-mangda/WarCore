# Pause and end-of-run reference — 2026-11-13

User supplied two screenshots: Pause has Inventory left, PAUSED and stage/tier centre, Stats right; death has Damage / Summary / Quests columns. Use existing exported BorderWindow, weapon and Fox art where present. Screenshots establish layout and visible labels, **not formulas or event timing**.

## Available in the web runtime

- Current weapon, selected Tome levels, health, elapsed simulation time, kills, level, collected Gold/Silver, current attack damage, interval and projectile count.
- Resume, settings, Lab and new run. Local history and web graphics presets are web conveniences, not claims about the original game.

## Request for extraction AI — do not guess

1. Death Damage panel: per-source damage accounting (overkill, DOT, reflected damage), weapon level definition, DPS denominator/rounding; exact reset/finalization events.
2. Summary: final Silver reward formula, multipliers and rounding, collected-versus-earned currency, when persistence occurs, confirm behavior and any animation/audio sequence. Screenshot `+1 Silver` is an example, not a fixed reward.
3. Quests: tracked quest schema, progress events, completion/reward presentation and source assets. Do not create fabricated quests.
4. Pause: native stat units, base values, stacking/formulas, display rounding/order, inventory slot types/capacity and hover descriptions.
5. Forest/tier panel and Silver multiplier: map/tier source and calculation. Current sandbox has no verified stage/tier progression; do not label it Forest Tier 3.
6. Shrine Logs: event schema, additive versus multiplicative bonuses, lifetime/order and icons. No native shrine system currently connected.
7. Map/restart/exit: confirmation, run abandonment, retained currency and menu transitions; pause/unpause audio and whether simulation/audio stop independently.
8. Original Pause/death layout assets, nine-slice/padding/scale, UI audio event bindings and animation timings. Reuse available assets first; no extraction in this web repo.

For each item return raw fields/PPtr provenance and method-body evidence where formulas are involved; distinguish verified / inferred / unknown. Preserve existing exports. Do not modify or push the web repository.
