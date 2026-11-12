import {Vector3} from 'three';
import {Swarm,type Enemy} from '../enemies/Swarm';
import {balance} from './Balance';
export type Upgrade='damage'|'haste'|'projectiles';
export interface Projectile {position:Vector3;velocity:Vector3;life:number;damage:number;}
export interface Gem {position:Vector3;}
export interface Hit {position:Vector3;damage:number;life:number;}
export interface RunSnapshot {health:number;maxHealth:number;level:number;xp:number;xpNeeded:number;kills:number;elapsed:number;enemyCount:number;pendingUpgrades:number;dead:boolean;damage:number;attackInterval:number;projectiles:number;}
export const initialRun:RunSnapshot={health:balance.maxHealth,maxHealth:balance.maxHealth,level:1,xp:0,xpNeeded:5,kills:0,elapsed:0,enemyCount:0,pendingUpgrades:0,dead:false,damage:balance.damage,attackInterval:balance.attackInterval,projectiles:1};
export class Run {
  readonly swarm=new Swarm();readonly bolts:Projectile[]=[];readonly gems:Gem[]=[];readonly hits:Hit[]=[];
  private state:RunSnapshot={...initialRun};private spawnClock=0;private attackClock=0;private hurtClock=0;private started=false;
  constructor(private ground:(x:number,z:number)=>number,private visible:(point:Vector3)=>boolean,private random:()=>number=Math.random){}
  get blocked(){return this.state.dead||this.state.pendingUpgrades>0;}
  snapshot():RunSnapshot{return {...this.state,enemyCount:this.swarm.enemies.length};}
  reset(){this.state={...initialRun};this.spawnClock=0;this.attackClock=0;this.hurtClock=0;this.started=false;this.swarm.clear();this.bolts.length=0;this.gems.length=0;this.hits.length=0;}
  choose(upgrade:Upgrade):boolean{
    if(this.state.pendingUpgrades<=0||this.state.dead)return false;
    if(upgrade==='damage')this.state.damage+=5;
    if(upgrade==='haste')this.state.attackInterval=Math.max(.15,this.state.attackInterval*.85);
    if(upgrade==='projectiles')this.state.projectiles=Math.min(8,this.state.projectiles+1);
    this.state.pendingUpgrades--;return true;
  }
  private kill(enemy:Enemy){
    const index=this.swarm.enemies.indexOf(enemy);if(index<0)return;
    this.swarm.enemies.splice(index,1);this.state.kills++;
    if(this.gems.length<balance.maxGems)this.gems.push({position:enemy.position.clone().add(new Vector3(0,.35,0))});
    else this.gainXp(); // Saturation must not silently lose progression.
  }
  private gainXp(){
    this.state.xp++;
    while(this.state.xp>=this.state.xpNeeded){this.state.xp-=this.state.xpNeeded;this.state.level++;this.state.xpNeeded=5+(this.state.level-1)*3;this.state.pendingUpgrades++;}
  }
  private fire(player:Vector3){
    const origin=player.clone().add(new Vector3(0,1,0));
    const targets=this.swarm.enemies.filter(enemy=>enemy.position.clone().add(new Vector3(0,.7,0)).distanceTo(origin)<=balance.attackRange).sort((a,b)=>a.position.distanceToSquared(origin)-b.position.distanceToSquared(origin));
    if(!targets.length)return false;
    for(let i=0;i<this.state.projectiles&&this.bolts.length<balance.maxProjectiles;i++){
      const target=targets[i%targets.length];
      const direction=target.position.clone().add(new Vector3(0,.7,0)).sub(origin).normalize();
      // Multiple bolts are timed together; distribute their origins to remain visible.
      const start=origin.clone().add(new Vector3((i-(this.state.projectiles-1)/2)*.18,0,0));
      this.bolts.push({position:start,velocity:direction.multiplyScalar(balance.projectileSpeed),life:balance.projectileLifetime,damage:this.state.damage});
    }
    return true;
  }
  step(dt:number,player:Vector3){
    if(this.blocked)return;
    this.state.elapsed+=dt;this.hurtClock=Math.max(0,this.hurtClock-dt);
    if(!this.started){for(let i=0;i<balance.initialEnemies;i++)this.swarm.spawn(player,this.ground,this.visible,this.random);this.started=true;}
    this.spawnClock-=dt;
    if(this.spawnClock<=0){this.swarm.spawn(player,this.ground,this.visible,this.random);this.spawnClock=balance.spawnInterval;}
    this.swarm.step(dt,player,this.ground);
    this.attackClock=Math.max(0,this.attackClock-dt);
    if(this.attackClock===0&&this.fire(player))this.attackClock=this.state.attackInterval;
    for(let i=this.bolts.length-1;i>=0;i--){
      const bolt=this.bolts[i],previous=bolt.position.clone();bolt.position.addScaledVector(bolt.velocity,dt);bolt.life-=dt;
      const segment=bolt.position.clone().sub(previous);const lengthSq=segment.lengthSq();
      let target:Enemy|undefined;let first=Infinity;
      for(const enemy of this.swarm.enemies){
        const center=enemy.position.clone().add(new Vector3(0,.7,0));
        const fraction=lengthSq?Math.max(0,Math.min(1,center.clone().sub(previous).dot(segment)/lengthSq)):0;
        if(center.distanceToSquared(previous.clone().addScaledVector(segment,fraction))<.7*.7&&fraction<first){target=enemy;first=fraction;}
      }
      if(target){target.health-=bolt.damage;target.flash=.15;target.velocity.copy(bolt.velocity).normalize().multiplyScalar(5);this.hits.push({position:target.position.clone().add(new Vector3(0,1.5,0)),damage:bolt.damage,life:.6});if(target.health<=0)this.kill(target);bolt.life=0;}
      if(bolt.life<=0)this.bolts.splice(i,1);
    }
    for(let i=this.gems.length-1;i>=0;i--){
      const gem=this.gems[i],target=player.clone().add(new Vector3(0,.35,0)),distance=gem.position.distanceTo(target);
      if(distance<balance.pickupRadius){this.gems.splice(i,1);this.gainXp();}
      else if(distance<balance.magnetRadius)gem.position.addScaledVector(target.sub(gem.position).normalize(),Math.min(distance,10*dt));
    }
    for(let i=this.hits.length-1;i>=0;i--){const hit=this.hits[i];hit.life-=dt;hit.position.y+=dt;if(hit.life<=0)this.hits.splice(i,1);}
    if(this.hits.length>60)this.hits.splice(0,this.hits.length-60);
    if(this.hurtClock===0&&this.swarm.enemies.some(enemy=>enemy.position.distanceTo(player)<1.1)){
      this.state.health=Math.max(0,this.state.health-balance.contactDamage);this.hurtClock=balance.contactInterval;
      if(this.state.health===0)this.state.dead=true;
    }
  }
}
