# Browser Video settings — 2026-11-13

## Scope and preserved systems

User supplied Video/Game/Effects screenshots and clarified that desktop-only options may be unnecessary for a web game, while useful working systems should be kept. Video is implemented in the existing Settings frame. Existing Audio/Controls, instanced trees, baked enemy instancing/culling, partial buffer uploads, camera collision cache, Lab lazy loading, debug FPS/speed display and original antialiasing remain. No phase change, controller support or mobile gameplay added.

## Functional browser options

- Resolution: read-only actual drawing-buffer dimensions reported by the game renderer, not a fabricated monitor/display mode.
- Render Scale50..125%, default100%: scales the existing device-pixel-ratio caps (game1.75, Lab1.5). At50% the canvas has one quarter as many pixels; actual FPS gain depends on hardware/load and is not benchmarked. CSS UI sizes/input coordinates do not change. Browser zoom ratios below1 remain supported as before.
- FPS Limit: Auto/browser refresh,30/60/90/120/144/240. Auto is the default and preserves prior scheduling. RenderCadence gates game drawing/visual updates only; input, fixed-step gameplay and modal audio continue on every animation callback. It cannot exceed the browser/display cadence or recover missing GPU performance. Long gaps do not generate catch-up render bursts.
- FOV60..110, default75: updates the real game camera projection. Screenshot85 is a selected reference value, not assumed native default.
- Camera Distance0..3, default0: additive offset on the existing3.6-world-unit camera distance. Terrain collision and the one-cast-per-changed-pose cache remain; changing the distance invalidates that cache once.
- View Distance50..250, default250: controls game camera far plane and scales the existing fog nearer when lowered. Default fog45/135 and far250 are preserved. It does not change enemy counts, simulation, attack range or map data, and is not a terrain LOD system.
- Fullscreen Mode: uses browser Fullscreen API only on an explicit click, reflects actual fullscreenchange state, and reports denial. Omitted when unavailable. No automatic/persisted fullscreen request on startup.
- Reset Video restores only Video preferences. Validated preferences use warcore.video.v1, tolerate corrupt/blocked storage and synchronize same-origin windows. Preferences survive new runs. FPS/FOV-only changes do not reallocate canvas buffers.

Render Scale and FPS cap also apply to Lab playback. Lab keeps its fixture FOV/far plane/camera positions; game FOV/view/camera-distance controls do not alter fixture framing. Direct scrubbing/resizing/selection repaints immediately; playback steps catch up from timeline time through the existing fixture simulation. Source art/audio, particle settings and gameplay tuning are untouched.

## Omitted rather than fake controls

Target Monitor, native PC window modes and user-controlled VSync are omitted; browser/window/display handling differs. Grass quality has no grass system to control. Shadow quality/resolution, soft particles, Bloom, motion blur and ambient occlusion are not exposed because their corresponding pipelines are not present. Existing MSAA at renderer construction is retained, not silently removed. See SETTINGS_REFERENCE_BACKLOG.md for the additional reference pages and readiness questions.

## Evidence limits and handoff

UI labels/appearance come from the user's screenshots. Rendering scale/caps, FPS choices, FOV/distance ranges, fog scaling and additive distance are documented web choices, not recovered Unity formulas. The screenshot does not establish defaults, enum lists, render scaling, camera-distance conversion, postprocessing settings or Game/Effects algorithms. Another AI should inspect existing reports/exports and supply missing native mappings/formulas only if needed; the web agent does not extract game containers.

## Validation

Production build/typecheck; validated storage/reload/corruption/blocked-storage paths; unchanged defaults; pixel counts; projection/fog; no redundant resize on FPS/FOV changes; game/Lab profiles; cadence under30/60/120/144Hz callbacks and large gaps; camera-distance cache/collision; supported-only UI controls and fullscreen request/exit/rejection with mocks; existing Audio/Controls/render-cost/Lab checks. No browser-rendered fidelity or GPU/FPS benchmark claim. User performs visual/audio/gameplay testing.
