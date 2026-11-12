import {burstInterval} from './AttackTiming';
import {Vector3} from 'three';
import {Swarm,type Enemy} from '../enemies/Swarm';
import {balance} from './Balance';
export type Weapon='bolt'|'sword';
export type RunEvent='sword'|'shot'|'xp'|'level'|'hurt'|'death';
export type Upgrade='damage'|'haste'|'projectiles';
export interface Projectile {position:Vector3;velocity:Vector3;life:number;damage:number;}
export interface Slash {position:Vector3;direction:Vector3;life:number;duration:number;damage:number;hits:Set<number>;}
export interface Gem {position:Vector3;}
export interface Hit {position:Vector3;damage:number;life:number;}
export interface RunSnapshot {weapon:Weapon;health:number;maxHealth:number;level:number;xp:number;xpNeeded:number;kills:number;elapsed:number;enemyCount:number;pendingUpgrades:number;dead:boolean;damage:number;attackInterval:number;projectiles:number;}
export const initialRun:RunSnapshot={weapon:'bolt',health:balance.maxHealth,maxHealth:balance.maxHealth,level:1,xp:0,xpNeeded:5,kills:0,elapsed:0,enemyCount:0,pendingUpgrades:0,dead:false,damage:balance.damage,attackInterval:balance.attackInterval,projectiles:1};
export class Run {
  readonly swarm=new Swarm();readonly bolts:Projectile[]=[];readonly slashes:Slash[]=[];readonly gems:Gem[]=[];readonly hits:Hit[]=[];
  private state:RunSnapshot={...initialRun};private spawnClock=0;private attackClock=0;private hurtClock=0;private started=false;private swordPending=0;private swordBurstClock=0;private swordBurstInterval=0;
  constructor(private ground:(x:number,z:number)=>number,private visible:(point:Vector3)=>boolean,private random:()=>number=Math.random,private sound:(event:RunEvent)=>void=()=>{}){}
  get blocked(){return this.state.dead||this.state.pendingUpgrades>0;}
  snapshot():RunSnapshot{return {...this.state,enemyCount:this.swarm.enemies.length};}
  reset(){this.state={...initialRun,weapon:this.state.weapon};this.spawnClock=0;this.attackClock=0;this.hurtClock=0;this.started=false;this.swordPending=0;this.swordBurstClock=0;this.swarm.clear();this.bolts.length=0;this.slashes.length=0;this.gems.length=0;this.hits.length=0;}
  setWeapon(weapon:Weapon):boolean{
    if(this.state.elapsed!==0||(weapon!=='bolt'&&weapon!=='sword'))return false;
    this.state.weapon=weapon;return true;
  }
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
    this.state.xp++;this.sound('xp');
    while(this.state.xp>=this.state.xpNeeded){this.state.xp-=this.state.xpNeeded;this.state.level++;this.state.xpNeeded=5+(this.state.level-1)*3;this.state.pendingUpgrades++;this.sound('level');}
  }
  /** Sandbox melee sector; native swing trajectory and hit timing are not reconstructed. */
  private swing(player:Vector3,facing:Vector3){
    if(this.slashes.length>=balance.maxSlashes)return false;
    const forward=new Vector3(facing.x,0,facing.z);
    if(forward.lengthSq()<.0001)forward.set(0,0,-1);
    forward.normalize();
    // Each temporal attack owns its hit history; extra quantity can hit again.
    this.slashes.push({position:player.clone().add(new Vector3(0,.5,0)),direction:forward,life:balance.swordVisualDuration,duration:balance.swordVisualDuration,damage:this.state.damage,hits:new Set<number>()});
    this.sound('sword');return true;
  }
  private applyHit(enemy:Enemy,damage:number,direction:Vector3){
    // Impact audio awaits verified weapon/enemy references; no universal Bonk.
    enemy.health-=damage;enemy.flash=.15;enemy.velocity.copy(direction).normalize().multiplyScalar(5);
    this.hits.push({position:enemy.position.clone().add(new Vector3(0,1.5,0)),damage,life:.6});if(enemy.health<=0)this.kill(enemy);
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
    this.sound('shot');return true;
  }
  step(dt:number,player:Vector3,facing=new Vector3(0,0,-1)){
    if(this.blocked)return;
    this.state.elapsed+=dt;this.hurtClock=Math.max(0,this.hurtClock-dt);
    if(!this.started){for(let i=0;i<balance.initialEnemies;i++)this.swarm.spawn(player,this.ground,this.visible,this.random);this.started=true;}
    this.spawnClock-=dt;
    if(this.spawnClock<=0){this.swarm.spawn(player,this.ground,this.visible,this.random);this.spawnClock=balance.spawnInterval;}
    this.swarm.step(dt,player,this.ground);
    this.attackClock=Math.max(0,this.attackClock-dt);
    if(this.state.weapon==='sword'){
      if(this.swordPending===0&&this.attackClock===0){
        this.swordPending=this.state.projectiles;this.swordBurstClock=0;
        // Native interval formula; web haste maps to an effective AttackSpeed
        // multiplier while the full native player-stat system remains incomplete.
        const attackSpeed=balance.attackInterval/this.state.attackInterval;
        this.swordBurstInterval=burstInterval(balance.swordBurstTime,balance.swordMinBurstInterval,this.swordPending,attackSpeed,dt);
      }
      this.swordBurstClock=Math.max(0,this.swordBurstClock-dt);
      if(this.swordPending>0&&this.swordBurstClock===0&&this.swing(player,facing)){
        this.swordPending--;this.swordBurstClock=this.swordBurstInterval;
        if(this.swordPending===0)this.attackClock=this.state.attackInterval;
      }
    }else if(this.attackClock===0&&this.fire(player))this.attackClock=this.state.attackInterval;
    for(let i=this.slashes.length-1;i>=0;i--){
      const slash=this.slashes[i];
      for(const enemy of [...this.swarm.enemies]){
        if(slash.hits.has(enemy.id))continue;
        const offset=enemy.position.clone().add(new Vector3(0,.7,0)).sub(slash.position);
        if(Math.abs(offset.y)>balance.swordHeightTolerance)continue;
        offset.y=0;
        if(offset.length()<=balance.swordRange&&(offset.lengthSq()<.0001||offset.normalize().dot(slash.direction)>=Math.cos(balance.swordHalfAngle))){
          slash.hits.add(enemy.id);this.applyHit(enemy,slash.damage,slash.direction);
        }
      }
      slash.life-=dt;if(slash.life<=0)this.slashes.splice(i,1);
    }
    for(let i=this.bolts.length-1;i>=0;i--){
      const bolt=this.bolts[i],previous=bolt.position.clone();bolt.position.addScaledVector(bolt.velocity,dt);bolt.life-=dt;
      const segment=bolt.position.clone().sub(previous);const lengthSq=segment.lengthSq();
      let target:Enemy|undefined;let first=Infinity;
      for(const enemy of this.swarm.enemies){
        const center=enemy.position.clone().add(new Vector3(0,.7,0));
        const fraction=lengthSq?Math.max(0,Math.min(1,center.clone().sub(previous).dot(segment)/lengthSq)):0;
        if(center.distanceToSquared(previous.clone().addScaledVector(segment,fraction))<.7*.7&&fraction<first){target=enemy;first=fraction;}
      }
      if(target){this.applyHit(target,bolt.damage,bolt.velocity);bolt.life=0;}
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
      this.sound('hurt');this.state.health=Math.max(0,this.state.health-balance.contactDamage);this.hurtClock=balance.contactInterval;
      if(this.state.health===0){this.state.dead=true;this.sound('death');}
    }
  }
}
