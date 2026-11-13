# Effects settings — 2026-11-13

The user approved the three supported options shown in the original Effects reference: Damage Numbers, Damage Flash, Particles Opacity. Effects is a working tab in the existing Settings frame. Defaults are On/On/1.00, preserving the previous appearance. No new extraction, controller/mobile work or phase transition.

## Implemented scope

- Damage Numbers: controls the damage-label sprites in the game and weapon Lab. Turning it off hides existing labels and avoids creating new ones until re-enabled. Damage calculation, hit events, enemy health, sounds, EXP/Gold/Silver counters and HUD remain unchanged. Re-enabling restores labels for hits still present in the simulation, including paused hits.
- Damage Flash: controls the living enemy's white damage-flash instance attribute in the shared Skeleton/Bandit renderer, including Lab. It does not change enemy.flash/health or stop hit logic. Corpses retain their white death appearance and dissolve; this deliberately separates hit flash from death effects.
- Particles Opacity0..1: a linear multiplier on the existing source alpha for Sword slash, all StaffView layers (including shared hit fixtures), level-up burst particles and movement dust. A shader uniform handles staff layers, so repeated updates do not compound the factor or change serialized colors/curves. At0 staff batches/dust are hidden but simulation/lifetimes/damage/audio continue. Reset to1 restores source alpha.
- Pickups/EXP gems/coin glow, collection numbers, LEVEL UP sign, models and HUD stay readable and are not multiplied by this particle setting. The level-up burst is affected; its separate sign is not.

These are useful web scopes, not a claim that Unity's original setting affects exactly the same objects. Native scope, alpha multiplication order and interaction with automatic opacity remain questions for the other AI.

## Preferences and lifecycle

Immutable validated preferences use warcore.effects.v1, with clamping, corrupt-storage fallback and in-memory behavior if saving is blocked. They persist across new runs and synchronize same-origin game/Lab windows. The engine keeps a subscription so external settings updates are seen even when the menu is closed; it requests a fresh render without advancing paused simulation. Lab repaints the current timeline silently without replaying audio or resetting the room. All new subscriptions detach on close/dispose.

Existing geometry, source files, combat/loot rules, camera/render settings, voice behavior, instancing/culling and buffer upload policies remain. Opacity is visual, not a new particle-count or automatic-performance setting.

## Deferred

Low HP Effects, Particles Auto Opacity and Enemy Attack Indicator Color remain absent until their actual systems/algorithms are ready. SETTINGS_REFERENCE_BACKLOG.md records required evidence and current capabilities. Do not fabricate auto-opacity rules, recolor nonexistent telegraphs, alter death dissolve with the hit toggle or claim complete native parity from a matching UI label.

## Validation

Build/typecheck; stored/reloaded/corrupt/blocked preferences and cross-window updates; label visibility without changing hit state; living-flash suppression with intact white death/dissolve; noncompounding Staff/Sword alpha and restore; preserved coin/LEVEL UP sign opacity; burst/dust multiplier; supported-only UI; existing enemy/staff/shared-hit/audio/settings regressions. Tests use mocked image/canvas resources, not GPU rendering/listening. User handles visual/gameplay feel review.
