export class Input {
  keys = new Set<string>();
  private heldMovement=new Set<string>();
  private movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD']);
  // PlayerInput queues a press for four physics ticks, independent of render FPS.
  jumpTicks = 0;
  constructor(private isActive: () => boolean, private pause: () => void) {
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.blur);
  }
  private down = (event: KeyboardEvent) => {
    if(this.movementKeys.has(event.code))this.heldMovement.add(event.code);
    if (!this.isActive()) return;
    if (event.code === 'Escape') { this.pause(); return; }
    if (['Space','ControlLeft','ControlRight','Tab'].includes(event.code)||getControlPreferences().arrowLook&&event.code.startsWith('Arrow')) event.preventDefault();
    this.keys.add(event.code);
    if (event.code === 'Space' && !event.repeat) this.jumpTicks = 4;
  };
  private up = (event: KeyboardEvent) => { this.keys.delete(event.code);this.heldMovement.delete(event.code); };
  resume(){for(const code of this.heldMovement)this.keys.add(code);}
  private blur=()=>{this.heldMovement.clear();this.clear();};
  clear = () => { this.keys.clear(); this.jumpTicks = 0; };
  dispose() { window.removeEventListener('keydown',this.down); window.removeEventListener('keyup',this.up); window.removeEventListener('blur',this.blur); }
}
import {getControlPreferences} from './ControlPreferences';
