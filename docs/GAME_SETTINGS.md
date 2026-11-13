# Game UI settings — 2026-11-13

User approved the supported Game-tab UI options from the supplied reference: crosshair height/size/alpha, HP bar color, Debug FPS and Debug Speed. The tab uses the existing settings frame/rows. Other gameplay settings remain deferred rather than displayed as nonfunctional controls.

## Functional scope and defaults

- Crosshair Height0.10..0.90: normalized top position within the game viewport. Default0.50 preserves the existing50% top position. Safe web bounds keep the marker near the visible viewport.
- Crosshair Size0.50..2.00: CSS scale around the marker's existing center. Default1.00 leaves its original glyph/font/position unchanged. No new crosshair image or aiming algorithm.
- Crosshair Alpha0..1: CSS opacity multiplier on the existing crosshair color (`#fffa`), not replacement of that source alpha. Default1 preserves its previous appearance;0 hides the marker.
- HP Bar Color: Red/Green/Blue/Yellow/White web palette. DefaultRed is exactly the existing#c83234. It changes only the HP fill; health numbers/value/width, damage and XP bar stay unchanged. Palette enum/colors are not verified native values.
- Debug FPS / Debug Speed: independent visibility of existing telemetry, default bothOn to preserve the useful HUD. Movement-state text remains alongside either visible metric; bothOff hide the whole debug block. Engine FPS/speed sampling and render/physics cadence continue unchanged.
- Reset Game UI: resets only these presentation preferences. It does not restart the run, alter health/inventory/upgrades or reset Audio/Controls/Video/Effects.

Preferences use validated immutable warcore.game.v1 values, clamp numeric ranges, whitelist the color enum, tolerate malformed/blocked storage and synchronize same-origin windows. They persist through new runs/reloads. App's persistent subscription applies updates even when the menu is closed. Main game HUD only: Lab has no equivalent HP/crosshair/performance HUD to customize here.

## Native fidelity questions

The screenshots prove the labels and visible selected values, not native units/ranges/defaults, crosshair pivot/alpha composition, HP palette mappings or debug grouping. The web's safe ranges, CSS multipliers and chosen palette are explicit presentation choices. Ask the other AI to inspect existing data and return actual settings fields/enum/color/callback/RectTransform or shader mappings with source evidence. Preserve user tuning when integrating results. No game-container/DLL extraction by this change.

Camera Shake, Input Delay, Smart Aim/random targeting, minimap, shrine counter, leaderboard uploads, auto-upgrade rarity and other unsupported reference rows remain in SETTINGS_REFERENCE_BACKLOG.md. Existing explicit New Run, useful debug telemetry, all combat/render/audio systems and the no-controller/future-touch-mobile direction remain. No phase change.

## Validation

Build/typecheck, preserved default HUD values/color, storage/reload/corrupt/blocked cases, range/palette validation, shared-window update, rendered component props, independent debug fields/hidden state, three supported sliders and reset isolation. These are DOM/server markup and logic checks, not browser-rendered pixel/native-parity claims; user handles visual/gameplay review.
