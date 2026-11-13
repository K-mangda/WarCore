# Phase parity ledger

2026-11-13 enemy slice: Skeleton now uses native baked Moving mesh animation (8 frames at8FPS), shared by game and Lab. See [enemy implementation](ENEMY_IMPLEMENTATION.md). This supersedes older static/deferred enemy-visual status below; native AI and encounter parity remain incomplete.

No system has verified 100% behavioral parity. Native method bodies and reference captures are required.

Current visual update: Fox default skin, original 23-joint rig and Idle/Run/Jump/Falling clips are integrated; see [Fox provenance](FOX_ASSETS.md). Map replacement and sliding are deferred at the user's request. Native Animator transition/shader parity is not claimed.

| Source | Browser module | Evidence / status |
| --- | --- | --- |
| PlayerMovementValues / PlayerMovement | player/Motor.ts | Declared constants and movement enum extracted; motor formulas provisional |
| SlideEffect | vfx/Effects.ts | Dirt effect present; source thresholds unavailable |
| VelocityParticles | vfx/Effects.ts + UI | Velocity-driven streaks; appearance provisional |
| Third person camera | camera/Orbit.ts | Requested 3.6m offset, terrain raycast; original settings unresolved |
| SpawnPositions / knockbackVelocity / flyingKnockupVel | enemies/ | Deferred Phase 2+ |
| Desert / Tumbleweed / sandstorm | environment/desert/ | Deferred Phase 2+ |
| Hell lava damage | environment/hell/ | Deferred Phase 2+ |
| AudioSpamFilter | audio/ | Deferred; Phase 1 has no audio |
| WeaponInventory / TomeInventory / ItemInventory | UI | Deferred Phase 2+; no invented combat |

## Acceptance
Build and strict type check are automated. Interactive movement feel, slope traversal, collision and 60+ FPS require testing on target hardware. FPS is displayed live; no unmeasured performance claim is made.
