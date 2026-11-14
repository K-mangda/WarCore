# Level-up screen effects - extracted from the game (2026-11-14)

Source: `Megabonk_Data/level2`, `LevelupScreen` MonoBehaviour (pathID 15763) -> `effects` GameObject `Levelup` -> `Particles`. Reproduce with `python -I tools/read_levelup_screen.py out.json` then `python -I tools/summarize_levelup_particles.py out.json summary.json <texture-dir>`. Raw JSON stays in `.local-evidence/`. Tiers: **V** serialized value, **I** inferred mapping.

`LevelupScreen` fields (dump.cs): `window`, `effects`, `audioLevel`, `button`, `upgradePicker`, `upgradeInventoryUi`, `t_title`, `t_description`, `b_skip/b_refresh/b_banish` (MyButtonOffersUtility), `b_leave`, statics `hasBanishes/hasRefreshes/hasSkips`, `refreshTime`. `Levelup` (RectTransform anchored to the screen centre, inactive until the screen opens) contains `Particles` (RectTransform stretched over the canvas + AudioSource) with these particle systems. All use the shader `Archanor VFX/Retro Arsenal/BasicGlowUI` (additive glow UI) and material colour white (1,1,1,1).

## Where the colours come from

The textures are plain white/grey shapes. Colour comes from the particle system's **Start Color** / **Color over Lifetime** (and the material `_Color`, which is white here), multiplied in the shader. That is why the exported atlases are white: the tint is data in the scene, read from the serialized ParticleSystem settings below.

| System | Rate | Lifetime | Speed (units/s) | Size (units) | Gravity | Sim speed | Shape | Colour | Texture |
|---|---|---|---|---|---|---|---|---|---|
| CrystalBlueFountain | 30/s | 3-8 s | 1-3.33 | 0.12-0.20, size curve 0.83 -> 1 | 1.3 | 1.5 | cone 25 deg, radius 0.9 (thickness 0.15), emitter scale 200 | 3 discrete random picks: blue (0.307,0.799,1.0), green (0.408,1.0,0.357), red-orange (1.0,0.362,0.316) | `atlas02` 512x256, 16 px tiles, single row 12 (rotating gem frames 0-7), random spin +-45 deg/s |
| Sparks | 45/s | 0.4-1 s | 1-7 | 0.02, size curve 1 -> 0.23 | 1.0 | 0.75 | cone 35 deg, radius 0.25 | white -> (0.463,0.775,1.0) over life | `grain` 4x4 |
| TreasureCircleRays | 35/s | 1 s | ~0 | width 0.05-0.07 x curve, length 1.0 x curve; emitter scale 2537 | 0 | 0.5 | cone 69.88 deg, radius ~0 | (1.0, 0.796, 0.412) golden yellow; alpha 0 -> 1 (at 50 %) -> 0 | `atlas01` tile 32 px, row 3 frame 14 (alpha gradient across width), stretched billboard |
| Sparkle (birth sub-emitter of the fountain) | burst | 0.5-1 s | 1-2 | 0.02 | 0 | 1 | sphere 0.1 | white 0.5 alpha -> blue shades | `minisparkles` 64x16 |
| EndSparkle (death sub-emitter) | burst 1 | 0.2-0.3 s | 0 | 1.0 | 0 | 1 | - | blue-white shades | `atlas01` row 1 |

Rays width curve (random between): max 1.0 -> 0.227, min 0.23 -> 1.0; length curve: max 0.132 -> 1.0, min 0.51 -> 1.0. Rays and Sparks are `prewarm`.

## Web implementation

`src/ui/LevelUpEmitters.ts` (data + pure simulation) and `src/ui/LevelUpBackdrop.tsx` (canvas, additive blending) replace the earlier CSS decoration in the upgrade screen; the particle opacity setting still scales it. Textures: `public/levelup/atlas01.png`, `atlas02.png` with `provenance.json` (hashes). Checks: `tools/check_levelup_emitters.mjs`.

Inferred (I): the cone axis points along the UI Z axis (both the transform and the shape rotation are -90 deg about X for the fountain), so only the lateral part of the velocity is visible and gravity pulls the crystals down; the crystal frame animation is approximated as a looping 8-frame spin at 12 fps; Sparkle/EndSparkle sub-emitters are not drawn. **Not extracted yet:** the top spectrum bar, card frame/rarity tints, `audioLevel` clip, open animation timings.
