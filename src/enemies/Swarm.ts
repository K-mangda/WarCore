import {Vector3} from 'three';
import {balance} from '../combat/Balance';
export type EnemyKind='skeleton'|'bandit';
export interface Enemy {kind?:EnemyKind;id:number;position:Vector3;velocity:Vector3;health:number;flash:number;}
export class Swarm {
  readonly enemies:Enemy[]=[];
  private nextId=1;
  spawn(player:Vector3,ground:(x:number,z:number)=>number,visible:(point:Vector3)=>boolean,random:()=>number):boolean{
    if(this.enemies.length>=balance.maxEnemies)return false;
    for(let attempt=0;attempt<24;attempt++){
      const angle=random()*Math.PI*2,radius=balance.spawnRadius+random()*8;
      const x=player.x+Math.cos(angle)*radius,z=player.z+Math.sin(angle)*radius;
      if(Math.abs(x)>94||Math.abs(z)>94)continue;
      const position=new Vector3(x,ground(x,z),z);
      if(visible(position.clone().add(new Vector3(0,1,0))))continue;
      this.enemies.push({kind:this.nextId%balance.banditEvery===0?'bandit':'skeleton',id:this.nextId++,position,velocity:new Vector3(),health:balance.enemyHealth,flash:0});return true;
    }
    return false;
  }
  step(dt:number,player:Vector3,ground:(x:number,z:number)=>number){
    for(const enemy of this.enemies){
      const direction=new Vector3(player.x-enemy.position.x,0,player.z-enemy.position.z);
      if(direction.lengthSq()>.5)enemy.position.addScaledVector(direction.normalize(),balance.enemySpeed*dt);
      enemy.position.addScaledVector(enemy.velocity,dt);enemy.velocity.multiplyScalar(Math.exp(-8*dt));
      enemy.position.y=ground(enemy.position.x,enemy.position.z);enemy.flash=Math.max(0,enemy.flash-dt);
    }
  }
  clear(){this.enemies.length=0;this.nextId=1;}
}
