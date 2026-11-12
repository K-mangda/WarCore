# Movement rebuild plan and evidence

## Revised execution order

1. Direct artifact investigation: derive native formulas, settings, state transitions and stat defaults. Keep native method addresses and serialized object IDs with each conclusion.
2. Correct the default unmodified sandbox motor: initial slide force, drag, slope contacts, jump impulses, gravity, cooldown and stat-controlled aerial jumps. Regression-test the whole motor, rather than enum values alone.
3. Recover input/Bhop behavior, full character profiles, serialized player overrides and landing/fall bonuses. Compare captured native trajectories with browser telemetry before claiming equivalence.
4. Replace primitive visuals with verified local exported models/textures and restore rig/animation/material behavior; verify source provenance first. Port original UI layout/assets.
5. Review remaining Phase 1 collision, camera and VFX gaps. Broaden into combat, maps and progression only after movement review; do not call incomplete work a 1:1 port.

## New findings, 2026-11-12

- `globalgamemanagers`, TimeManager path ID 8: fixed step count/rate = 2822399/141120000, approximately 0.02 seconds. Runtime tick-rate changes still need investigation.
- Same file, PhysicsManager path ID 10: world gravity y = -19.6200008392334. It is not the assumed -9.81.
- `PlayerMovementValues.CreateMovement` RVA 0x4b79f0 sets extra gravity to mass*11 for default characters, mass*0 for Vlad and mass*(-11)*0.75 for Spaceman. MovementTick applies the extra down-vector force while airborne in addition to world gravity. Default acceleration is therefore approximately -30.62, not -107.91.
- `PlayerStatsNew.GetBaseValue` RVA 0x445920: switch table byte at 0x44599c+26 selects entry 5, target RVA 0x44595e, returning 7 for JumpHeight. Stat 46 selects zero for ExtraJumps. Character/items/shop modifiers may change these defaults.
- `GetJumpForce` RVA 0x33d2f0 multiplies JumpHeight stat by mass and underwater multiplier (1.4 when underwater). Normal flat jump path in Jump RVA 0x33eb10 clears negative vertical speed, applies up*force*1.5 plus groundNormal*force*0.5 using ForceMode.Impulse. Mass cancels, giving base flat upward delta 14. Slope/ramp, ladder, rail, wall-climb, Monke and Ninja branches require separate parity work.
- `CreateMovement` sets slide force to mass*200. `StartSlide` invokes default AddForce once; base velocity delta is 200*fixedDelta, approximately 4 m/s, not 200 per step. The direction combines normalized horizontal velocity with requested direction. Fall-speed bonus and landing exceptions remain unimplemented and must not be inferred.
- `CounterMovement` RVA 0x33c5e0, sliding path at 0x33cdd7: opposing normalized-velocity force = moveSpeed * 0.02 * slideCounterMovement. Constructor slideCounterMovement is 0.1; base acceleration magnitude is 5.4 after mass cancellation. This explains why a slide should lose momentum on flat ground.
- `UpdateTickRate` RVA 0x3440c0 scales cooldown counts by tickRate*0.02. Baseline readiness is 10 ticks (jump), 25 ticks (slide), corresponding to 0.2/0.5 seconds at 50 Hz. Constructor values alone were misleading because tick-rate setup overwrites them.

## Applied and unresolved

Applied base one-shot slide force and counter-force, extracted fixed timestep, correct default world+extra gravity, stat-derived flat jump impulse, jump readiness, slide readiness and stat-controlled aerial jump allowance. Grounded slope gravity uses a heightfield constraint projection, which is an approximation of PhysX contacts.

Still provisional: walking friction, air acceleration/deceleration translation, input buffering, all character-specific profiles, scene overrides, fall-to-slide conversion, exact landing windows, surfing and general capsule collision. No runtime native trajectory capture has been performed. Build/regression success does not establish full behavioral parity.
