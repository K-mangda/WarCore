# EXP pickup: implemented and missing evidence

## Implemented locally

- tools/export_xp_assets.py follows sharedassets2.assets XpPickup872 -> ParticleSystem2314 / Renderer2588 -> external sharedassets1.assets Material424 -> Texture545 atlas02Custom.
- Native row12 columns0..6 exported losslessly as public/pickups/xp/frames.png. Raw serialized particle/renderer/material saved in source.json; compact provenance and colors in manifest.json.
- XpView replaces provisional octahedra with shared instanced camera-facing atlas billboards in game and Lab. Source start size1, lifetime0.5 and low-tier color are used.
- Lab EXP pickup room automatically creates three pickups, replays attraction and uses the game's Run/GameAudio collect event and Xp2 sound. Scrubbing is silent; playback respects mute/stop. No extra speculative sound was added.

## Remaining approximations

- Billboard frame progresses for0.5s then holds the last frame while pickup exists. Native ringBufferMode1 is serialized, but exact runtime age/visual updates remain unverified.
- Source material extra glow2.5/custom shader is not ported. Native atlas art, not full shader parity.
- Movement remains the previous web implementation: spawn at death position plus0.35m, magnet range5m, collect range1.4m, attraction speed10m/s, one low-tier XP per enemy. No invented bounce, sparkle or spawn sound is presented as native.
- Only low-tier drops are implemented; native tier values/merge/echo behavior require gameplay evidence.
- Build/type validation; visual/audio feel is left to user playtesting. Local only; no push/deploy.

## Prompt for the other extraction chat

Investigate only EXP pickup behavior and remaining dependencies in the installed Megabonk build. Do not change the web project or push/deploy. Existing visual chain above is already extracted; do not repeat that work.

1. Follow XpPickup872 -> XpVisuals3096, Pickup3389 and component3457 in sharedassets2.assets, resolving MonoScript names and external references. Preserve serialized raw bytes/typed fields, fileID/pathID and hashes.
2. Recover XP spawn/drop launch, gravity/bounce/settle, attraction activation/acceleration, collect distance, pickup value/tier/merge/echo rules and any dynamic particle size/lifetime/frame/color changes. Use serialized evidence or native disassembly with RVA; empty dump.cs method declarations are not method bodies.
3. Trace separate spawn/attract/collect VFX and audio, including all child/subemitters/materials/textures and actual triggering call sites. Establish whether Xp2 has variants, pitch/volume/random/filter settings. If no extra effect or sound is proven, mark unverified rather than inventing one.
4. Return a manifest, raw dependencies, readable behavior summary and UNVERIFIED.md. Label verified serialized values separately from inferred runtime behavior. Do not mark trigger_verified based solely on a filename/category label.

Separately catalog missing coin-drop/collect and level-up VFX dependency chains (prefab -> children/subemitters -> material/shader -> textures, plus audio triggers). Existing Levelup3/4/After/Ambience and coin WAV files are available; prioritize missing visual chains and when each sound actually plays.


## Follow-up integration — 2026-11-13

See PROGRESSION_IMPLEMENTATION.md for the implemented EXP value/tier/stack/attraction, currency, level-up and Lab changes. Earlier descriptions of low-tier-only collection and constant10m/s attraction are superseded. The external report contains incorrect currency component and text texture IDs; direct native reference traversal corrected them. Runtime disassembly conclusions remain attributed to the external report. Formula/drop-rate/shader gaps are explicitly retained in the new document.
