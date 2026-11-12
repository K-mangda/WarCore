import { Vector3, MathUtils } from 'three';
import { EMovementState, movementValues as values } from '../types/movement';
import { heightAt } from '../environment/forest/Sandbox';
import type { Input } from '../core/Input';
import { Slide } from './Slide';
import { physics, jumpDelta, slideStartDelta } from './Physics';
export class Motor {
  private slideState = new Slide();
  // ConfigSaveFile settings.pege_mode == 1 blocks crouch/slide in native code.
  limitedMovement = false;
  jumpStat:number=physics.baseJumpStat;
  extraJumps:number=physics.baseExtraJumps;
  private aerialJumps=0;
  private jumpCooldown=0;
  position=new Vector3(0,0,8); velocity=new Vector3(); grounded=true; state=EMovementState.Idle; jumps=0;
  get speed() { return Math.hypot(this.velocity.x,this.velocity.z); }
  reset(top=false) { this.position.set(0,top?16:0,top?-34:8); this.velocity.set(0,0,0); this.grounded=true; this.slideState.reset(); this.aerialJumps=this.extraJumps;this.jumpCooldown=0; }
  step(dt:number,input:Input,yaw:number) {
    const k=input.keys; const crouchPressed=k.has('KeyC')||k.has('ControlLeft')||k.has('ControlRight');
    const e=.1;
    const gx=(heightAt(this.position.x+e,this.position.z)-heightAt(this.position.x-e,this.position.z))/(2*e);
    const gz=(heightAt(this.position.x,this.position.z+e)-heightAt(this.position.x,this.position.z-e))/(2*e);
    const angle=MathUtils.radToDeg(Math.atan(Math.hypot(gx,gz)));
    const normal=new Vector3(-gx,1,-gz).normalize();
    this.slideState.tick(dt);
    this.jumpCooldown=Math.max(0,this.jumpCooldown-dt);
    const slide=this.slideState.update(crouchPressed,this.grounded,this.velocity.length(),angle,this.limitedMovement);
    const crouch=crouchPressed&&!this.limitedMovement&&!slide;
    const wish=new Vector3(Number(k.has('KeyD'))-Number(k.has('KeyA')),0,Number(k.has('KeyS'))-Number(k.has('KeyW'))).normalize().applyAxisAngle(new Vector3(0,1,0),yaw);
    if(this.slideState.started) {
      const direction=new Vector3(this.velocity.x,0,this.velocity.z).normalize();
      if(wish.lengthSq()>0) direction.add(wish).normalize();
      this.velocity.addScaledVector(direction,slideStartDelta());
    }
    const jump=(this.grounded || this.aerialJumps>0) && this.jumpCooldown<=0 && input.jumpTicks>0;
    if(jump) {
      if(!this.grounded)this.aerialJumps--;
      this.velocity.y=Math.max(0,this.velocity.y);
      const impulse=jumpDelta(normal,this.jumpStat);
      this.velocity.add(new Vector3(impulse.x,impulse.y,impulse.z));
      this.jumpCooldown=physics.jumpCooldown;
      this.grounded=false; this.jumps++;
    }
    const before=this.speed;
    if(this.grounded && !slide && !jump) { const friction=Math.exp(-12*dt); this.velocity.x*=friction; this.velocity.z*=friction; }
    if(wish.lengthSq()>0 && !slide) {
      const acceleration=values.moveSpeed*dt*(this.grounded?1:.06);
      this.velocity.addScaledVector(wish,acceleration);
      const cap=this.grounded?values.maxRunSpeed*(crouch?.5:1):Math.max(values.maxRunSpeed,before);
      const s=this.speed; if(s>cap) { this.velocity.x*=cap/s; this.velocity.z*=cap/s; }
    }
    if(this.grounded && slide) {
      const drag=physics.movementForce*physics.sourceForceScale*physics.slideCounterMovement*dt;
      const length=this.velocity.length();
      if(length>0)this.velocity.multiplyScalar(Math.max(0,1-drag/length));
      // Heightfield constraint projects Unity world gravity onto the surface.
      // This approximates contacts; it does not reproduce PhysX capsule solving.
      const projected=new Vector3(0,physics.gravity,0).projectOnPlane(normal);
      this.velocity.addScaledVector(projected,dt);
      this.velocity.y=gx*this.velocity.x+gz*this.velocity.z;
    }
    if(!this.grounded) { this.velocity.y+=(physics.gravity-physics.extraGravity)*dt; this.velocity.x*=Math.exp(-values.airDeceleration*dt); this.velocity.z*=Math.exp(-values.airDeceleration*dt); }
    const oldGround=heightAt(this.position.x,this.position.z);
    const next=this.position.clone().addScaledVector(this.velocity,dt); const ground=heightAt(next.x,next.z);
    if(ground-next.y>0.7 && ground-oldGround>0.7) { next.x=this.position.x; next.z=this.position.z; this.velocity.x=0; this.velocity.z=0; }
    const floor=heightAt(next.x,next.z);
    if(next.y<=floor || (this.grounded && !jump && Math.abs(next.y-floor)<.7)) { next.y=floor; this.velocity.y=0; this.grounded=true; this.aerialJumps=this.extraJumps; } else this.grounded=false;
    this.position.copy(next); this.position.x=MathUtils.clamp(this.position.x,-95,95); this.position.z=MathUtils.clamp(this.position.z,-95,95);
    this.state=!this.grounded?EMovementState.Airborne:slide?EMovementState.Sliding:crouch?EMovementState.Crouching:this.speed>.1?EMovementState.Walking:EMovementState.Idle;
    input.jumpTicks=Math.max(0,input.jumpTicks-1);
  }
}
