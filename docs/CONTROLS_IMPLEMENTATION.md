# Controls settings — 2026-11-13

## User direction

Use the supplied Controls screenshots as visual reference. **Controller/gamepad input is explicitly out of scope, permanently unless the user changes this instruction.** Do not add controller sensitivity, vibration, disconnect handling or gamepad bindings as missing implementation/extraction tasks. Future mobile support means touch controls, not controller support. This change does not implement mobile gameplay or start a new phase.

## Implemented

Controls is now a working tab beside Audio in the existing framed Settings window. The reference's dark rows, cyan GENERAL/KEYBOARD INPUT headings, sliders/readouts, arrow-style boolean controls, keycaps and red Reset Controls action are retained as web UI styling. No controller section.

- Sensitivity0.10..8.00, default1.00: multiplier on the existing0.002-radian-per-pixel mouse calibration, for pointer lock and drag fallback.
- Look Smoothing0..1, default0: optional exponentially damped pending look deltas, alpha=1-exp(-dt/(setting*0.18s)). Default0 preserves the old immediate mouse feel; the screenshot's0.60 is not treated as a recovered native default. Small residuals are cleared to allow the existing stationary-camera raycast cache to settle.
- Horizontal/vertical inversion: defaultOff, applied to mouse and optional arrow look.
- Rotate camera with arrow keys: defaultOff; when enabled, active gameplay reads arrow keys at1.6rad/s times sensitivity (web rate). Browser scrolling is suppressed only while gameplay is active and this option is on.
- Select upgrades with number keys: web defaultOn; Digit/Numpad1–3 select the visible offered card by position. Ignore held-repeat/modifier/text-entry events and missing card slots. Turning it Off restores mouse-only card selection. It does not grant upgrades outside the mounted upgrade dialog; Settings hides/unmounts that dialog until closed.
- Reset Controls restores only control preferences. It does not reset the run, inventory or audio settings.

Keyboard display is read-only and lists actual supported actions: WASD, Space, Escape and mouse look, plus arrows/upgrade digits when enabled. Rebinding is not implemented. Do not display Interact/Aim/Quick Reset/Map Overlay or Hold Crouch/Aim as functioning settings: those gameplay systems are not exposed in the current arena. Motor's existing slide gate remains untouched.

## Persistence and pause

Validated immutable preferences use warcore.controls.v1. Clamp numeric ranges, validate booleans, tolerate malformed/blocked storage, and synchronize storage changes in other same-origin windows. Control preferences survive new runs. Settings changes/blur/pause discard pending smoothed camera input, so the camera cannot continue turning while paused or jump from stale deltas on resume. Existing camera pitch bounds and one-raycast-per-changed-pose cache remain.

## Questions for the other AI

The screenshots establish labels/appearance and currently selected user values, not native formulas/defaults. Check existing exports/reports before extracting anything else. Supply mouse sensitivity units/range/default, native smoothing algorithm/time-step behavior, axis-inversion semantics, arrow-look rate/rules, upgrade-number input filtering and save-field mapping, with actual fields/call-site evidence. Do not assume this web exponential filter or0.002 calibration is a recovered native formula. Do not request controller data.

## Mobile later

Future work: touch movement stick, drag-to-look region, jump button, touch-friendly pause/settings/upgrades, multi-touch/pointer cancellation and rotation/focus handling. Preserve desktop controls/preferences and separate touch calibration as needed. Actual mobile implementation requires a future scoped task/phase notification; responsive Settings CSS alone does not make gameplay mobile-ready.

## Validation

Build/typecheck; control storage/clamps/reload, original default mouse deltas, sensitivity/inversions/pitch clamps, smoothing at different frame rates, pause/drag/arrow behavior, numbered offered-choice validation, read-only keycaps/no controller controls, listener cleanup and unchanged stationary-camera cache. Audio settings and input/pointer resume regressions pass. These do not claim native formula or rendered/listening parity; user handles visual/gameplay feel review.
