# Additional settings reference and readiness — 2026-11-13

The user supplied six screenshots spanning Video, Effects and Game. Treat them as visual/label evidence, not instruction to implement every native desktop option or proof of formulas/defaults. Preserve working web systems and the user's existing tuning. Implement useful supported options; record unknowns instead of guessing. Controller input remains excluded; mobile touch is future work.

## Video: completed and browser differences

Completed browser options are documented in VIDEO_IMPLEMENTATION.md. Resolution/render scale/FPS limit/FOV/camera distance/view distance/fullscreen work. Native monitor selection and native window modes are not web requirements. VSync is browser-managed; do not create a toggle that does nothing. No task to implement those native desktop options is implied by the image.

Graphics options shown: Grass Quality, Shadow Quality, Shadow Resolution, Anti Aliasing, Soft Particles, Bloom, Motion Blur, Ambient Occlusion. Existing renderer antialiasing stays enabled. The remaining graphics pipelines are not currently implemented, which differs from missing asset files. Before adding them, identify actual engine capability/performance cost and obtain original enum/parameter/shader mappings from the other AI where required. Do not label a generic effect as the native effect without evidence.

## Effects: future work, not fake settings now

อัปเดต: Damage Numbers, Damage Flash และ Particles Opacity ต่อแล้ว ดู EFFECTS_IMPLEMENTATION.md สำหรับขอบเขตเว็บที่ชัดเจน ส่วนสูตร/ขอบเขต native ยังต้องให้ AI อีกตัวตรวจ ไม่ต้องสกัดภาพ/เสียงเดิมซ้ำ

- Damage Numbers: visibility toggle implemented for game/Lab damage labels; hit/damage simulation and pickup counters remain. Confirm native scope separately.
- Damage Flash: living-hit flash toggle implemented with white death/dissolve preserved; native option scope still needs confirmation.
- Low HP Effects: no complete native low-health visual behavior is integrated. Need threshold, visual/postprocess parameters, interpolation, health/regen/pause transitions and event evidence.
- Particles Opacity: manual web multiplier implemented for combat particles, level-up burst and dust; source alpha is recomputed, not compounded. Native scope/multiplication order and any effect on coins/EXP/text still need confirmation. Current pickups/HUD/LEVEL UP sign remain readable.
- Particles Auto Opacity: need the actual algorithm/input (distance/overlap/particle count/other), thresholds and interaction with manual opacity. A catalog component named ParticleOpacity is not sufficient evidence.
- Enemy Attack Indicator Color: wait for proven enemy attack/telegraph behavior. Need palette enum/color values and which indicators the setting changes. Existing ordinary contact damage has no complete telegraph system.

## Game/UI: existing useful systems versus missing behavior

อัปเดต: Game tab ต่อ Crosshair Height/Size/Alpha, HP Bar Color และ Debug FPS/Speed แล้ว ดู GAME_SETTINGS.md ค่าเริ่มต้นรักษา HUD เดิมทั้งหมด ขอบเขต/ช่วงค่า/CSS multiplier/palette เป็น web choices ส่วนค่า native ที่ยังไม่ยืนยันยังต้องตามหลักฐาน ไม่ต้องสกัดภาพเป้าใหม่

- Keep the current FPS/speed sampling and pause/resume/input foundation. Independent visibility toggles are implemented, both defaultOn; the underlying working metrics remain.
- Crosshair Height/Size/Alpha and HP Bar Color: web customization implemented using existing HUD. Need native units/ranges/pivot/alpha/palette mapping for fidelity; screenshot values0.50/0.90/1.00/Red do not prove conversion/defaults.
- Camera Shake: no recovered shake profile/options integration; need trigger, amplitude/frequency/decay and toggle scope before claiming native parity.
- Input Delay: **do not equate the screenshot's2 to the existing four-fixed-tick jump buffer.** Need settings field/callback, units and all affected input paths.
- Enemy Targeting Mode (Smart Aim) / Random Enemy Targeting0.75: need enum/rules and runtime formula per weapon. Do not assume0.75 is a simple per-shot probability or replace the user-tuned Firestaff targeting/range from a label alone.
- Show Tips / Language: current help text exists, but native tip scheduling/localization behavior is not implemented; inspect existing localization files before requesting new extraction.
- Minimap Size/Rotation, Shrine Counter and Quick Reset: corresponding complete UI/gameplay systems are not in the arena; reference rows alone are not evidence they are ready. Preserve the existing explicit New Run action.
- Leaderboards/score upload: no leaderboard service is connected. The screenshot's On is a reference state, not a request to upload scores or player data. Do not add a nonfunctional upload switch.
- Debug RAM: no portable/native-equivalent web memory display implemented; browser limitations are not an extraction task. Keep absent unless a useful accurate browser-specific feature is deliberately scoped.
- Auto Select Levelup Upgrades by Highest Rarity / Auto Select After Level200: native rarity/pool/eligibility/tie-breaking and threshold semantics are missing. Do not automate the provisional Tome choices by inventing rarity. Preserve user selection, queued upgrades and pause behavior.
- Show Advanced Settings: needs an actual set of supported advanced options before exposing a switch that reveals nothing.

## Other AI handoff

Read existing reports, metadata and code first. Send only missing settings-field/enum/range/default/callback mappings, runtime method-body evidence, shader/effect parameter chains and affected systems, with source hashes/PPtr/RVA and confirmed/inferred/unknown statuses. Separate available asset/implemented web capability from missing native behavior. No new extraction by the web agent; do not overwrite current tuning or add every reference row merely to match the screenshot.
