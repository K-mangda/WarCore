// Defaults recovered from PlayerMovement constructor in GameAssembly.dll.
// Serialized scene/prefab overrides and tick-rate conversion remain unverified.
export const slideDefaults = { thresholdSpeed: 8, angleDegrees: 30 } as const;
export class Slide {
  active = false;
  private held = false;
  private cooldown = 0;
  started = false;
  tick(dt:number) { this.cooldown=Math.max(0,this.cooldown-dt); }
  update(pressed: boolean, grounded: boolean, speed: number, angle: number, limited: boolean) {
    this.started = false;
    if (!pressed || limited) this.active = false;
    if (pressed && !this.held && !limited && grounded && this.cooldown<=0 &&
        (speed > slideDefaults.thresholdSpeed || angle > slideDefaults.angleDegrees)) {
      this.active = true;
      this.started = true;
      this.cooldown = .5;
    }
    if (this.active && speed < slideDefaults.thresholdSpeed) this.active = false;
    this.held = pressed;
    return this.active;
  }
  reset() { this.active = false; this.held = false; this.cooldown=0; this.started=false; }
}
