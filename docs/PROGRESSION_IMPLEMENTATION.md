# EXP, currency and level-up — local integration 2026-11-13

## Evidence and corrections

Input: external extraction report and `WarCore/megabonk_extracted_assets/pickups_manifest.json`. The report's disassembly conclusions are consumed as reported evidence; this change does not independently reproduce native disassembly.

Direct UnityPy reference traversal corrected incorrect currency component IDs in that report:

- sharedassets2 MoneyFlying899: Transform1295, Particle2403, Renderer2582, MonoBehaviour3138. Reported Particle2341/Renderer2615 were wrong; the latter points to grain artwork.
- sharedassets2 SilverFlying965: Transform1333, Particle2203, Renderer2685, MonoBehaviour3289. Reported Particle2407/Renderer2681 were wrong.
- level2 LevelupEffect2967: Particle9162, Renderer9328, AudioSource8892. LevelUpText2953: Particle9076, Renderer9389. Confirmed by component and GameObject links.
- Resolve textures through each renderer's material `_TextureSample`, including external references. LevelUpText uses atlas_emojis_PSD, not the report's icon_question. No hardcoded texture PathID is trusted across files.
- Directly checked level2 AudioSources: 8892=LevelupAfter volume .6 pitch1; 8838=Levelup4 volume .3 pitch1; 8896=Xp2 volume .22 serialized pitch1.1. Runtime XP pitch formula is from the report, not that serialized pitch.

`tools/import_progression_assets.py` exports full source atlas rows and raw particle/renderer/material fields. `public/progression/provenance.json` hashes source asset files and exported progression files. Original WAVs are copied from the supplied package; native compressed audio is not independently decoded. Source WAV hashes are recorded separately by the importer.

## Implemented

- EXP value-aware collection; tiers at 10 and 50 with source colors/scales; echo color can be explicitly supplied. Per-pickup attraction latches, accelerates and collects without overshooting. Shared game/Lab renderer.
- Reported expanding stack radius .5→8 over 900 seconds; maximum300 XP objects, oldest value merged rather than awarding uncollected XP. Stack entries reaching500 move to the list tail. Merge capacity ordering is a bounded approximation of the native list implementation.
- Gold/silver atlas billboards and distinct collection sounds; separate run balances in HUD, reset on a new run.
- LevelupAfter world sound, stopped after2s; Levelup4 modal open and LevelupAmbience loop while choices remain. Removed Levelup3 from in-run events. Loop stops on final selection/reset/dispose.
- XP volume .22 and reported rolling2s count pitch .8→1.8; gold .26/pitch .92; silver .45/pitch1; level sounds use reported source gains. Existing web master gain .35 remains.
- Level-up five-particle burst and atlas text use native art, sizes, lifetimes and row selection. World effect animates during the upgrade modal using bounded UI time so it cannot remain frozen forever.
- Lab rooms: EXP tiers, Gold pickup, Silver pickup, Level up. Silent scrubbing, audible playback, stop and mute. These use the game Run, views and audio.

## Remaining approximations / missing information

- No recovered EXP-per-level formula or upgrade selection probabilities: existing5+3 per level and three provisional choices remain. EXP overflow and queued choices are preserved.
- Native money drop chances and values remain unknown. For accessible playtesting only, every5th sandbox kill drops1 gold and every12th drops1 silver. These are explicit web rules. Money entities have a web cap100 per kind and merge value at saturation. No economy/shop/persistent wallet is claimed.
- Reported standard drops use ground+2 hover. Random spawn displacement amplitude, activation rules and player target offset are not known: no speculative random displacement; activation stays web radius5, target player+.35Y.
- No boss/chest PickupOrb physics, automatic echo generation or XpDamager combat proc is implemented.
- Shader glow/postprocessing, Unity emission shapes, full color/size curves, exact level-up runtime transform and event/UI ordering remain incomplete. Level burst directions and text placement are web approximations. Pickup frame age still advances over .5s then holds; native ring buffer runtime behavior remains unresolved.
- Voice cap/priorities, mute/unlock, notification preservation on ordinary pause and stop behavior are web policies. Native mixer/spatial routing/filtering is not reconstructed.

## Validation and handoff

Run `npm run build`, `node tools/check_combat.mjs`, `node tools/check_staff.mjs`, and `node tools/check_audio.mjs`. These validate types/build, progression conservation/tiers/money/reset/attraction, existing combat and staff simulation, and mocked audio pitch/loop lifecycle. No rendered fidelity or listening verification is claimed; user performs image/audio/gameplay testing. No push/deploy.
