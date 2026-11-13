# Audio settings — 2026-11-13

Implemented from the user's supplied settings screenshot: dark-green panel/header, original BorderWindow corners, Alagard lettering, horizontal section strip, white square-thumb sliders and two-decimal readouts. The six labels/order follow the reference: Master Volume, Music Volume, Game Sounds, Ambience, UI, XP and Gold. This does not replace the arena with the original menu scene or claim pixel-perfect Unity UI reproduction. Audio, Controls, Video and Effects are available; Game/Other remain disabled. See the matching implementation documents for the follow-ups.

## Behavior

- SETTINGS sits next to LAB. Opening pauses gameplay and releases pointer lock without resetting the run or consuming pending upgrades. Close with X/Escape; return to the existing paused screen and resume explicitly. An upgrade dialog reappears with its pending choices intact. Focus stays within settings, then returns to the opener.
- Volume0..1 in0.01 steps updates currently playing voices, not just future clips. Defaults are all1, preserving the established0.35 master calibration and source gains. Default values are not copied from the screenshot's user's personal0.69/0.48 choices.
- AudioPreferences stores six volumes plus mute under warcore.audio.v1. It validates/clamps finite numeric values, ignores malformed stored JSON safely, and keeps in-memory settings if storage is blocked. Reset restores defaults/unmutes. These preferences survive New Run.
- Same-window subscribers and browser storage events synchronize the game and Lab iframe. Lab mute state/label and manual weapon auditions follow the same preferences; auditions use Game Sounds. Listeners detach when views/audio dispose.
- GameAudio retains each source's gain/pitch/event/voice-cap behavior, then routes through a category bus and master. This is web mixing policy, not recovered native mixer routing.

## Channels

**Unverified native routing:** These are the current web assignments, not a verified description of what the original sliders control. UI labels come from the user's image; clip membership, especially Levelup4/LevelupAmbience/LevelupAfter and Silver, still needs evidence. The detailed questions and current mappings for the other AI are in [AUDIO_MIXER_HANDOFF.md](AUDIO_MIXER_HANDOFF.md). Verified clip/event identity must not be confused with verified mixer routing.

- Master: overall mix, with the existing0.35 calibration retained.
- Game Sounds: attacks/impacts, player movement/hurt/death, world level-up notification and manual weapon samples in Lab.
- Ambience: existing LevelupAmbience loop while the upgrade modal is open.
- UI: hover/menu click and Levelup4 modal-opening sound.
- XP and Gold: EXP, Gold and Silver receipts.
- Music: preference/bus ready and saved, but the current arena has no background-music playback. The settings panel says no music is playing. No unrelated loop is mislabeled music, and no new soundtrack or native track-selection rules were invented.

Existing audio files/provenance and the user-tuned source gains are unchanged. No extraction performed, no phase change. If adding actual BGM later, inspect existing exported clips first and obtain track/event/loop/routing evidence from the other extraction AI as needed.

## Validation

Build/typecheck, independent bus/live-voice gains, defaults/mute/reset, saved/reloaded/corrupt/blocked preferences, cross-window storage event synchronization, six accessible controls/server markup, source audio lifecycle, Lab audition live gain and disposal. Existing pointer/input resume checks cover the pause foundation. No browser visual/listening parity claim; the user handles visual/audio/gameplay feel review.
