import {Vector3} from 'three';
export type PickupKind='xp'|'gold'|'silver';
export interface Pickup {position:Vector3;kind?:PickupKind;value?:number;echo?:boolean;following?:boolean;speed?:number;collectDelay?:number;pullStart?:Vector3;pullProgress?:number;pullLength?:number;}
// External report RVAs: Pickup.Update 0x4d7800, FixedUpdate 0x4d70b0.
// Activation radius and target height remain web choices pending evidence.
export function movePickup(p:Pickup,target:Vector3,dt:number,activationRadius:number){
 if((p.collectDelay??0)>0){p.collectDelay=Math.max(0,p.collectDelay!-dt);return false;}
 const distance=p.position.distanceTo(target);
 if(p.kind==='gold'||distance<activationRadius)p.following=true;
 const range=(p.speed??0)>50?1:.5;
 if(p.kind!=='gold'&&distance<=range)return true;
 if(!p.following)return false;
 p.speed=(p.speed??0)+((distance>10?150:50)-(p.speed??0))*Math.min(1,(distance>10?4:2.5)*dt);
 if(p.kind==='gold'){
  p.pullStart??=p.position.clone();p.pullLength??=Math.max(3,distance);
  p.pullProgress=Math.min(1,(p.pullProgress??0)+p.speed*dt*.6/p.pullLength);
  const t=p.pullProgress,u=1-t,control=p.pullStart.clone().lerp(target,.5).add(new Vector3(0,3,0));
  p.position.copy(p.pullStart).multiplyScalar(u*u).addScaledVector(control,2*u*t).addScaledVector(target,t*t);
  return t>=1||(t>.8&&p.position.distanceTo(target)<=range);
 }
 const travel=Math.min(distance,p.speed*dt);
 p.position.addScaledVector(target.clone().sub(p.position).normalize(),travel);
 return distance-travel<=range;
}
export function xpAppearance(value=1,echo=false){return echo?{tier:'echo' as const,scale:1}:value>=50?{tier:'high' as const,scale:1.5}:value>=10?{tier:'medium' as const,scale:1.25}:{tier:'low' as const,scale:1};}
