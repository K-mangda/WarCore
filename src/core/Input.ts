export class Input {
  keys = new Set<string>();
  jumpUntil = 0;
  constructor(private isActive: () => boolean, private pause: () => void) {
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.clear);
  }
  private down = (event: KeyboardEvent) => {
    if (!this.isActive()) return;
    if (event.code === 'Escape') { this.pause(); return; }
    if (['Space','ControlLeft','ControlRight','Tab'].includes(event.code)) event.preventDefault();
    this.keys.add(event.code);
    if (event.code === 'Space' && !event.repeat) this.jumpUntil = performance.now() + 120;
  };
  private up = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  clear = () => { this.keys.clear(); this.jumpUntil = 0; };
  dispose() { window.removeEventListener('keydown',this.down); window.removeEventListener('keyup',this.up); window.removeEventListener('blur',this.clear); }
}
