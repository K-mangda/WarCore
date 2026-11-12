// Generated from local dump.cs. Run python tools/extract_spec.py.
export enum EMovementState {
  Idle = 1,
  Walking = 2,
  Crouching = 4,
  Sliding = 8,
  Airborne = 16,
  Wallrunning = 32,
  CategoryCrouched = 12,
  CategoryFootstepNoise = 34,
}
export interface PlayerMovementValues { moveSpeed: number; maxRunSpeed: number; airDeceleration: number; slideForce: number; extraGravity: number; swimSpeed: number; }
export const movementValues: Readonly<PlayerMovementValues> = { moveSpeed: 2700, maxRunSpeed: 10, airDeceleration: 0.003, slideForce: 200, extraGravity: 11, swimSpeed: 10 };
