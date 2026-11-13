/** Distinguish user lock loss from delayed events after an intentional pause. */
export class PointerLockState {
 private held=false;
 release(){this.held=false;}
 changed(locked:boolean){const userExit=this.held&&!locked;this.held=locked;return userExit;}
}
