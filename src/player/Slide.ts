// Defaults recovered from PlayerMovement constructor in GameAssembly.dll.
// Serialized scene/prefab overrides and tick-rate conversion remain unverified.
export const slideDefaults = { thresholdSpeed: 8, angleDegrees: 30 } as const;
export class Slide {
  active = false;
  private held = false;
  update(pressed: boolean, grounded: boolean, speed: number, angle: number, limited: boolean) {
    if (!pressed || limited) this.active = false;
    if (pressed && !this.held && !limited && grounded &&
        (speed > slideDefaults.thresholdSpeed || angle > slideDefaults.angleDegrees)) {
      this.active = true;
    }
    if (this.active && speed < slideDefaults.thresholdSpeed) this.active = false;
    this.held = pressed;
    return this.active;
  }
  reset() { this.active = false; this.held = false; }
}
