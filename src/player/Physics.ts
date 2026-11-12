// Installed artifact evidence and method RVAs: docs/MOVEMENT_REBUILD.md.
export const physics = {
  fixedStep: 2822399 / 141120000,
  gravity: -19.6200008392334,
  extraGravity: 11,
  baseJumpStat: 7,
  baseExtraJumps: 0,
  jumpUpMultiplier: 1.5,
  jumpNormalMultiplier: .5,
  slideAcceleration: 200,
  slideCounterMovement: .1,
  movementForce: 2700,
  sourceForceScale: .02,
  jumpCooldown: .2,
  slideCooldown: .5,
} as const;

// Default AddForce: F * fixedDelta / mass. CreateMovement multiplies F by
// mass first, so mass cancels for the base (non-fall-bonus) slide force.
export function slideStartDelta() { return physics.slideAcceleration * physics.fixedStep; }
export function jumpDelta(normal: {x:number;y:number;z:number}, stat: number) {
  return {x:normal.x*stat*physics.jumpNormalMultiplier,
    y:stat*(physics.jumpUpMultiplier+normal.y*physics.jumpNormalMultiplier),
    z:normal.z*stat*physics.jumpNormalMultiplier};
}

// User-requested web playtest tuning; keep extracted source constants above intact.
export const playtestMovement={speedMultiplier:.7,airTimeScale:.8} as const;
