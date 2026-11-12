export class Input {
  keys = new Set<string>();
  jumpUntil = 0;
  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.clear);
    document.addEventListener('pointerlockchange', this.lock);
  }
  private down = (event: KeyboardEvent) => {
    if (document.pointerLockElement !== this.canvas) return;
    if (['Space','ControlLeft','ControlRight','Tab'].includes(event.code)) event.preventDefault();
    this.keys.add(event.code);
    if (event.code === 'Space' && !event.repeat) this.jumpUntil = performance.now() + 120;
  };
  private up = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  private clear = () => { this.keys.clear(); this.jumpUntil = 0; };
  private lock = () => { if (document.pointerLockElement !== this.canvas) this.clear(); };
  dispose() { window.removeEventListener('keydown',this.down); window.removeEventListener('keyup',this.up); window.removeEventListener('blur',this.clear); document.removeEventListener('pointerlockchange',this.lock); }
}
