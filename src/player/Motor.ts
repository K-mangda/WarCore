import { Vector3, MathUtils } from 'three';
import { EMovementState, movementValues as values } from '../types/movement';
import { heightAt } from '../environment/forest/Sandbox';
import type { Input } from '../core/Input';
export class Motor {
  position=new Vector3(0,0,8); velocity=new Vector3(); grounded=true; state=EMovementState.Idle; jumps=0;
  get speed() { return Math.hypot(this.velocity.x,this.velocity.z); }
  reset(top=false) { this.position.set(0,top?16:0,top?-34:8); this.velocity.set(0,0,0); this.grounded=true; }
  step(dt:number,input:Input,yaw:number) {
    const k=input.keys; const slide=k.has('KeyC')||k.has('ControlLeft')||k.has('ControlRight');
    const wish=new Vector3(Number(k.has('KeyD'))-Number(k.has('KeyA')),0,Number(k.has('KeyS'))-Number(k.has('KeyW'))).normalize().applyAxisAngle(new Vector3(0,1,0),yaw);
    const jump=this.grounded && input.jumpUntil>=performance.now();
    if(jump) { this.velocity.y=13; this.grounded=false; input.jumpUntil=0; this.jumps++; }
    const before=this.speed;
    if(this.grounded && !slide && !jump) { const friction=Math.exp(-12*dt); this.velocity.x*=friction; this.velocity.z*=friction; }
    if(wish.lengthSq()>0 && !slide) {
      const acceleration=values.moveSpeed*dt*(this.grounded?1:.06);
      this.velocity.addScaledVector(wish,acceleration);
      const cap=this.grounded?values.maxRunSpeed:Math.max(values.maxRunSpeed,before);
      const s=this.speed; if(s>cap) { this.velocity.x*=cap/s; this.velocity.z*=cap/s; }
    }
    if(this.grounded && slide) {
      const e=.1; const gx=(heightAt(this.position.x+e,this.position.z)-heightAt(this.position.x-e,this.position.z))/(2*e); const gz=(heightAt(this.position.x,this.position.z+e)-heightAt(this.position.x,this.position.z-e))/(2*e);
      const slope=new Vector3(-gx,0,-gz); if(slope.lengthSq()>0) this.velocity.addScaledVector(slope.normalize(),values.slideForce*dt); else { this.velocity.x*=Math.exp(-.15*dt); this.velocity.z*=Math.exp(-.15*dt); }
    }
    if(!this.grounded) { this.velocity.y-=9.81*values.extraGravity*dt; this.velocity.x*=Math.exp(-values.airDeceleration*dt); this.velocity.z*=Math.exp(-values.airDeceleration*dt); }
    const oldGround=heightAt(this.position.x,this.position.z);
    const next=this.position.clone().addScaledVector(this.velocity,dt); const ground=heightAt(next.x,next.z);
    if(ground-next.y>0.7 && ground-oldGround>0.7) { next.x=this.position.x; next.z=this.position.z; this.velocity.x=0; this.velocity.z=0; }
    const floor=heightAt(next.x,next.z);
    if(next.y<=floor || (this.grounded && !jump && Math.abs(next.y-floor)<.7)) { next.y=floor; this.velocity.y=0; this.grounded=true; } else this.grounded=false;
    this.position.copy(next); this.position.x=MathUtils.clamp(this.position.x,-95,95); this.position.z=MathUtils.clamp(this.position.z,-95,95);
    this.state=!this.grounded?EMovementState.Airborne:slide?EMovementState.Sliding:this.speed>.1?EMovementState.Walking:EMovementState.Idle;
  }
}
