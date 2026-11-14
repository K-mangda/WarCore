import {movePickup,type Pickup,type PickupKind} from './Pickups';
import {burstInterval} from './AttackTiming';
import {Vector3} from 'three';
import {Swarm,type Enemy,type EnemyKind} from '../enemies/Swarm';
import {balance} from './Balance';
import {xpForLevel} from './XpCurve';
import {Director} from './Director';
import {weaponCooldown,weaponDamage} from './Weapons';
import {playerStats} from '../player/StatSheet';
import {enemySpec} from '../enemies/Roster';
import {initialDanger,stepDanger,type DangerState} from '../player/Danger';
import {availableUpgrades,emptyUpgradeLevels,nextUpgrade,type Upgrade as TomeUpgrade,type UpgradeLevels} from './Upgrades';
import {maxWeaponLevel,offerWeapon,rollWeaponOffer,weaponNumbers,weaponOfferId,type WeaponModifier,type WeaponSlot} from './WeaponUpgrades';
import {rollUpgradeRarity,upgradeMultiplier,type UpgradeRarity} from './Rarity';
export type Weapon='bolt'|'sword';
/** A card on the level-up screen: a Tome id or a weapon (`weapon:sword`). */
export type Upgrade=TomeUpgrade|`weapon:${Weapon}`;
export {weaponOfferId,offerWeapon};
const allWeapons:Weapon[]=['bolt','sword'];
export type RunEvent='sword'|'shot'|'staffImpact'|'staffHit'|'xp'|'gold'|'silver'|'level'|'hurt'|'death';
export interface Projectile {position:Vector3;velocity:Vector3;life:number;damage:number;}
export interface StaffEffect {kind:'muzzle'|'impact'|'hit';position:Vector3;direction:Vector3;life:number;duration:number;}
export interface Slash {position:Vector3;direction:Vector3;life:number;duration:number;damage:number;hits:Set<number>;hitAudioPlayed?:boolean;}
export interface EnemyRemains {kind?:EnemyKind;id?:number;animationTime?:number;position:Vector3;heading:number;life:number;duration:number;}
export interface Gem extends Pickup {}
export interface XpReceipt {position:Vector3;value:number;time:number;kind?:PickupKind;pickups?:number;}
export interface Hit {position:Vector3;damage:number;life:number;}
export type Tool='refresh'|'skip'|'banish';
/** Level-up tool price (LevelupScreen.GetShopToolPrice, RVA 0x54EE20, V): free the first time, then round(5 x k + 15 x (used - 1)) gold.
 * k comes from a runtime call (FUN_1802ff020(2.0)) not resolved yet; taken as 1 (P). */
export const toolPrice=(used:number)=>used===0?0:Math.round(5+15*(used-1));
export interface Loadout {disabled?:string[];weaponSlots:number;tomeSlots:number;refresh:number;skip:number;banish:number;}
export interface RunSnapshot {weapon:Weapon;gold:number;silver:number;health:number;danger:number;maxHealth:number;level:number;xp:number;xpNeeded:number;kills:number;elapsed:number;enemyCount:number;pendingUpgrades:number;dead:boolean;damage:number;attackInterval:number;projectiles:number;upgradeLevels:UpgradeLevels;upgradeChoices:Upgrade[];upgradeRarity:Partial<Record<Upgrade,UpgradeRarity>>;damageBonus:number;attackSpeedBonus:number;projectileBonus:number;
  /** Owned weapons in slot order (max 4) with their level and the modifiers picked on level-ups. */
  weapons:WeaponSlot[];
  /** Modifiers each weapon card would add, rolled with the card's rarity when the offers are made. */
  weaponOffers:Partial<Record<Weapon,WeaponModifier[]>>;tools:Record<Tool,number>;toolsUsed:Record<Tool,number>;banished:Upgrade[];weaponSlots:number;tomeSlots:number}
export const initialRun:RunSnapshot={weapon:'bolt',gold:0,silver:0,health:balance.maxHealth,danger:0,maxHealth:balance.maxHealth,level:1,xp:0,xpNeeded:xpForLevel(1),kills:0,elapsed:0,enemyCount:0,pendingUpgrades:0,dead:false,damage:balance.damage,attackInterval:balance.staffEndCooldown,projectiles:1,upgradeLevels:emptyUpgradeLevels(),upgradeChoices:[],upgradeRarity:{},damageBonus:0,attackSpeedBonus:0,projectileBonus:0,weapons:[{id:'bolt',level:1,mods:[]}],weaponOffers:{},tools:{refresh:0,skip:0,banish:0},toolsUsed:{refresh:0,skip:0,banish:0},banished:[],weaponSlots:4,tomeSlots:4};
export class Run {
  readonly remains:EnemyRemains[]=[];readonly swarm=new Swarm();readonly bolts:Projectile[]=[];readonly staffEffects:StaffEffect[]=[];readonly slashes:Slash[]=[];readonly gems:Gem[]=[];readonly hits:Hit[]=[];readonly xpReceipts:XpReceipt[]=[];readonly currencyReceipts:XpReceipt[]=[];
  private state:RunSnapshot={...initialRun,tools:{refresh:0,skip:0,banish:0},toolsUsed:{refresh:0,skip:0,banish:0},banished:[],upgradeLevels:emptyUpgradeLevels(),upgradeChoices:[],upgradeRarity:{},weapons:[{id:'bolt',level:1,mods:[]}],weaponOffers:{}};private swordClock=0;private dangerState:DangerState=initialDanger();private director?:Director;evaded=0;private regenCarry=0;private attackClock=0;private hurtClock=0;private swordPending=0;private swordBurstClock=0;private swordBurstInterval=0;private staffPending=0;private staffClock=0;private staffInterval=0;
  constructor(private ground:(x:number,z:number)=>number,private visible:(point:Vector3)=>boolean,private random:()=>number=Math.random,private sound:(event:RunEvent)=>void=()=>{}){}
  /**
   * InventoryUtility.GetRandomUpgrades (RVA 0x420EF0, V): list A = not owned and a slot is free, list B = owned and below max level.
   * n = 3 (or |A|+|B| when fewer); p = 1/3 (1/n when fewer than 4 candidates); each pick takes B when A is empty or random < p, else A.
   * Rarity is then rolled per card with Luck (UpgradeButton.SetUpgrade -> Rarity.GetEncounterOfferRarity); unowned cards show New.
   */
  /** Candidate lists A (new, slot free) and B (owned, below max level). */
  candidates(){
    const tomes=availableUpgrades(this.state),tomeSlotsFree=Object.values(this.state.upgradeLevels).filter(level=>level>0).length<this.state.tomeSlots;
    const owned=new Set(this.state.weapons.map(w=>w.id)),weaponSlotsFree=this.state.weapons.length<this.state.weaponSlots;
    const banned=new Set(this.state.banished);
    const listA:Upgrade[]=[...tomes.filter(id=>this.state.upgradeLevels[id]===0&&tomeSlotsFree),...allWeapons.filter(w=>!owned.has(w)&&weaponSlotsFree).map(weaponOfferId)];
    const listB:Upgrade[]=[...tomes.filter(id=>this.state.upgradeLevels[id]>0),...this.state.weapons.filter(w=>w.level<maxWeaponLevel).map(w=>weaponOfferId(w.id))];
    return {listA:listA.filter(id=>!banned.has(id)),listB:listB.filter(id=>!banned.has(id))};
  }
  private rollOffers(){
    const {listA,listB}=this.candidates();
    const total=listA.length+listB.length,n=Math.min(3,total),p=total<4&&total>0?1/total:1/3;
    const take=(list:Upgrade[])=>list.splice(Math.min(list.length-1,Math.floor(this.random()*list.length)),1)[0];
    const choices:Upgrade[]=[];
    for(let i=0;i<n;i++)choices.push(!listA.length||(listB.length&&this.random()<p)?take(listB):take(listA));
    this.setOffers(choices);
  }
  /** Lab/test hook: show these cards (only valid candidates are kept), rarity rolled as usual. */
  forceOffers(ids:Upgrade[]){
    if(this.state.pendingUpgrades<=0||this.state.dead)return;
    const {listA,listB}=this.candidates(),valid=new Set([...listA,...listB]);
    this.setOffers(ids.filter(id=>valid.has(id)));
  }
  private setOffers(choices:Upgrade[]){
    const luck=this.liveStats().Luck,owned=new Set(this.state.weapons.map(w=>w.id));
    this.state.upgradeChoices=choices;this.state.upgradeRarity={};this.state.weaponOffers={};
    for(const id of choices){
      const rolled=rollUpgradeRarity(luck,this.random()),weapon=offerWeapon(id);
      const isNew=weapon?!owned.has(weapon):this.state.upgradeLevels[id as TomeUpgrade]===0;
      this.state.upgradeRarity[id]=isNew?'New':rolled;
      if(weapon&&!isNew)this.state.weaponOffers[weapon]=rollWeaponOffer(weapon,rolled,this.random);
    }
  }
  /** Primary-weapon numbers (slot 1) for the HUD and older callers; every weapon fires with its own numbers. */
  private refreshWeaponNumbers(){
    const first=this.state.weapons[0];if(!first)return;
    const n=weaponNumbers(first,this.state);this.state.damage=n.damage;this.state.attackInterval=n.attackInterval;this.state.projectiles=n.projectiles;this.state.weapon=first.id;
  }
  weaponNumbers(id:Weapon){const slot=this.state.weapons.find(w=>w.id===id);return slot?weaponNumbers(slot,this.state):undefined;}
  private newDirector(){return new Director({stage:balance.stage,maxEnemies:balance.maxEnemies,random:this.random});}
  get blocked(){return this.state.dead||this.state.pendingUpgrades>0;}
  snapshot():RunSnapshot{return {...this.state,upgradeLevels:{...this.state.upgradeLevels},upgradeRarity:{...this.state.upgradeRarity},upgradeChoices:this.state.pendingUpgrades>0&&!this.state.dead?[...this.state.upgradeChoices]:[],weapons:this.state.weapons.map(w=>({...w,mods:[...w.mods]})),weaponOffers:{...this.state.weaponOffers},tools:{...this.state.tools},toolsUsed:{...this.state.toolsUsed},banished:[...this.state.banished],enemyCount:this.swarm.enemies.length};}
  /** Current stat sheet (base + character + Tomes). PickupRange drives the magnet radius, HealthRegen the passive healing. */
  liveStats(){return playerStats(balance.character,{damage:this.state.damageBonus,haste:this.state.attackSpeedBonus,projectiles:this.state.projectileBonus});}
  reset(){const start=this.state.weapons[0]?.id??this.state.weapon,l=this.loadout;this.state={...initialRun,tools:{refresh:l.refresh,skip:l.skip,banish:l.banish},toolsUsed:{refresh:0,skip:0,banish:0},banished:[...(l.disabled??[])] as Upgrade[],weaponSlots:l.weaponSlots,tomeSlots:l.tomeSlots,upgradeLevels:emptyUpgradeLevels(),upgradeChoices:[],upgradeRarity:{},weapon:start,damage:weaponDamage(start),attackInterval:weaponCooldown(start),weapons:[{id:start,level:1,mods:[]}],weaponOffers:{}};this.swordClock=0;this.dangerState=initialDanger();this.director=undefined;this.evaded=0;this.regenCarry=0;this.attackClock=0;this.hurtClock=0;this.swordPending=0;this.swordBurstClock=0;this.staffPending=0;this.staffClock=0;this.remains.length=0;this.swarm.clear();this.bolts.length=0;this.staffEffects.length=0;this.slashes.length=0;this.gems.length=0;this.hits.length=0;this.xpReceipts.length=0;this.currencyReceipts.length=0;}
  private loadout:Loadout={weaponSlots:4,tomeSlots:4,refresh:0,skip:0,banish:0};
  /** Shop effects for the next run (PlayerInventory.InitSkipRefreshBanish, InventoryUtility.GetNumAvailableWeapon/TomeSlots; see Profile.runLoadout). */
  configure(loadout:Loadout){this.loadout=loadout;if(this.state.elapsed===0){const keep=this.state.weapons;this.reset();this.state.weapons=keep;}}
  /** Pay for and spend one tool charge (LevelupScreen.Skip / Banish / refresh: needs a charge and enough gold, V). */
  private spend(tool:Tool):boolean{
    if(this.state.pendingUpgrades<=0||this.state.dead||this.state.tools[tool]<1)return false;
    const price=toolPrice(this.state.toolsUsed[tool]);if(this.state.gold<price)return false;
    this.state.gold-=price;this.state.tools[tool]--;this.state.toolsUsed[tool]++;return true;
  }
  private closeOne(){this.state.pendingUpgrades--;if(this.state.pendingUpgrades>0)this.rollOffers();else{this.state.upgradeRarity={};this.state.weaponOffers={};this.state.upgradeChoices=[];}}
  /** Refresh: new offers for the same level-up. */
  refresh():boolean{if(!this.spend('refresh'))return false;this.rollOffers();return true;}
  /** Skip: close this level-up without taking anything (LevelupScreen.Skip -> CloseLevelupScreen, V). */
  skip():boolean{if(!this.spend('skip'))return false;this.closeOne();return true;}
  /** Banish: remove an offered upgrade for the rest of the run, then close the level-up (LevelupScreen.Banish -> CloseLevelupScreen, V). */
  banish(id:Upgrade):boolean{if(!this.state.upgradeChoices.includes(id)||!this.spend('banish'))return false;this.state.banished.push(id);this.closeOne();return true;}
  setWeapon(weapon:Weapon):boolean{
    if(this.state.elapsed!==0||(weapon!=='bolt'&&weapon!=='sword'))return false;
    this.state.weapon=weapon;this.state.weapons=[{id:weapon,level:1,mods:[]}];this.state.damage=weaponDamage(weapon);this.state.attackInterval=weaponCooldown(weapon);return true;
  }
  choose(upgrade:Upgrade):boolean{
    if(this.state.pendingUpgrades<=0||this.state.dead||!this.state.upgradeChoices.includes(upgrade))return false;
    const weapon=offerWeapon(upgrade);
    if(weapon){
      const slot=this.state.weapons.find(w=>w.id===weapon);
      if(slot){if(slot.level>=maxWeaponLevel)return false;slot.mods.push(...(this.state.weaponOffers[weapon]??[]));slot.level++;}
      else{if(this.state.weapons.length>=this.state.weaponSlots)return false;this.state.weapons.push({id:weapon,level:1,mods:[]});}
    }else{
      const multiplier=upgradeMultiplier[this.state.upgradeRarity[upgrade]??'Common'];
      const next=nextUpgrade(upgrade as TomeUpgrade,this.state,multiplier);if(!next)return false;
      Object.assign(this.state,next);this.state.upgradeLevels[upgrade as TomeUpgrade]++;
    }
    this.refreshWeaponNumbers();
    this.closeOne();return true;
  }
  private kill(enemy:Enemy){
    const index=this.swarm.enemies.indexOf(enemy);if(index<0)return;
    this.swarm.enemies.splice(index,1);this.state.kills++;
    this.remains.push({kind:enemy.kind,id:enemy.id,animationTime:this.state.elapsed,position:enemy.position.clone(),heading:Math.atan2(-enemy.velocity.x,-enemy.velocity.z),life:balance.enemyDissolveDuration,duration:balance.enemyDissolveDuration});
    if(this.remains.length>balance.maxEnemies)this.remains.shift();
    this.spawnPickup('xp',enemy.position,enemy.spec?.xp??1);
    // User playtest rule: every enemy drops one gold; native value remains unverified.
    this.spawnPickup('gold',enemy.position);
    // Silver schedule remains provisional until its native condition is known.
    if(this.state.kills%12===0)this.spawnPickup('silver',enemy.position);
  }
  spawnPickup(kind:PickupKind,position:Vector3,value=1,echo=false){
    if(!Number.isFinite(value)||value<=0)return;
    const spot=position.clone();if(kind==='gold'){spot.x+=.45;spot.z+=.15;}else if(kind==='silver'){spot.x-=.45;spot.z+=.15;}spot.y=this.ground(spot.x,spot.z)+(kind==='xp'?balance.xpHoverHeight:balance.goldSpawnHeight);
    const radius=.5+7.5*Math.min(1,this.state.elapsed/900);
    const existing=kind==='xp'?this.gems.find(p=>(p.kind??'xp')==='xp'&&!p.following&&!!p.echo===echo&&(p.value??1)<500&&p.position.distanceToSquared(spot)<=radius*radius):undefined;
    if(existing){existing.value=(existing.value??1)+value;if(existing.value>=500){this.gems.splice(this.gems.indexOf(existing),1);this.gems.push(existing);}return;}
    if(kind!=='xp'&&this.gems.filter(p=>p.kind===kind).length>=100){const first=this.gems.find(p=>p.kind===kind)!;first.value=(first.value??1)+value;return;}
    this.gems.push({kind,position:spot,value,echo,speed:0,collectDelay:kind==='xp'?0:.18});
    const xp=this.gems.filter(p=>(p.kind??'xp')==='xp');
    if(xp.length>300){const oldest=xp[0],next=xp[1];next.value=(next.value??1)+(oldest.value??1);this.gems.splice(this.gems.indexOf(oldest),1);}
  }
  private gainXp(value=1,player=new Vector3()){
    const last=this.xpReceipts.at(-1);
    if(last&&last.time===this.state.elapsed){last.value+=value;last.pickups=(last.pickups??1)+1;}
    else this.xpReceipts.push({position:player.clone().add(new Vector3(0,1.8,0)),value,time:this.state.elapsed,pickups:1});
    if(this.xpReceipts.length>24)this.xpReceipts.shift();
    this.state.xp+=value;this.sound('xp');
    while(this.state.xp>=this.state.xpNeeded){this.state.xp-=this.state.xpNeeded;this.state.level++;this.state.xpNeeded=xpForLevel(this.state.level);this.state.pendingUpgrades++;this.sound('level');}
    if(this.state.pendingUpgrades>0&&Object.keys(this.state.upgradeRarity).length===0)this.rollOffers();
  }
  /** Sandbox melee sector; native swing trajectory and hit timing are not reconstructed. */
  private swing(player:Vector3,facing:Vector3,damage=this.state.damage){
    if(this.slashes.length>=balance.maxSlashes)return false;
    const forward=new Vector3(facing.x,0,facing.z);
    if(forward.lengthSq()<.0001)forward.set(0,0,-1);
    forward.normalize();
    // Each temporal attack owns its hit history; extra quantity can hit again.
    this.slashes.push({position:player.clone().add(new Vector3(0,.5,0)),direction:forward,life:balance.swordVisualDuration,duration:balance.swordVisualDuration,damage,hits:new Set<number>()});
    this.sound('sword');return true;
  }
  private applyHit(enemy:Enemy,damage:number,direction:Vector3,knockback=5){
    // Enemy damage itself is silent; weapon hit effects own Hit2 dispatch.
    enemy.health-=damage;enemy.flash=.15;enemy.velocity.copy(direction).normalize().multiplyScalar(knockback);
    this.hits.push({position:enemy.position.clone().add(new Vector3(0,1.5,0)),damage,life:.6});if(enemy.health<=0)this.kill(enemy);
  }
  private hitEffect(enemy:Enemy,direction:Vector3,useAudio:boolean){
    this.staffEffects.push({kind:'hit',position:enemy.position.clone().add(new Vector3(0,.7,0)),direction:direction.clone(),life:2,duration:2});
    // Legacy event name; GeneralProjectileHit is shared by Sword and Firestaff.
    if(useAudio)this.sound('staffHit');
  }
  private fire(player:Vector3,damage=this.state.damage){
    const origin=player.clone().add(new Vector3(0,1,0));
    const targets=this.swarm.enemies.filter(enemy=>enemy.position.clone().add(new Vector3(0,.7,0)).distanceTo(origin)<=balance.staffTargetRange).sort((a,b)=>a.position.distanceToSquared(origin)-b.position.distanceToSquared(origin));
    if(!targets.length)return false;
    if(this.bolts.length>=balance.maxProjectiles)return false;
    const target=targets[0];
    const direction=target.position.clone().add(new Vector3(0,.7,0)).sub(origin).normalize();
    // Native TryInit targets an enemy, then applies forward spawnOffset.z=1.
    const start=origin.clone().addScaledVector(direction,1);
    this.staffEffects.push({kind:'muzzle',position:start.clone(),direction:direction.clone(),life:2,duration:2});
    this.bolts.push({position:start,velocity:direction.clone().multiplyScalar(balance.projectileSpeed),life:balance.projectileLifetime,damage});
    this.sound('shot');return true;
  }
  step(dt:number,player:Vector3,facing=new Vector3(0,0,-1)){
    if(this.blocked)return;
    for(let i=this.remains.length-1;i>=0;i--){this.remains[i].life-=dt;if(this.remains[i].life<=0)this.remains.splice(i,1);}
    for(let i=this.staffEffects.length-1;i>=0;i--){this.staffEffects[i].life-=dt;if(this.staffEffects[i].life<=0)this.staffEffects.splice(i,1);}
    this.state.elapsed+=dt;this.hurtClock=Math.max(0,this.hurtClock-dt);
    // Credit director (docs/REA_RUNTIME_SYSTEMS.md): stage timeline + credits decide which enemies spawn and when.
    this.director??=this.newDirector();
    const minutes=this.state.elapsed/60;
    for(const request of this.director.update(dt,this.state.elapsed,this.swarm.enemies.length))
      this.swarm.spawn(player,this.ground,this.visible,this.random,enemySpec(request.enemy,minutes,request.elite));
    this.swarm.step(dt,player,this.ground);
    // Every owned weapon fires on its own clock with its own numbers (weapon stats x player Tome bonuses).
    this.attackClock=Math.max(0,this.attackClock-dt);this.swordClock=Math.max(0,this.swordClock-dt);
    const sword=this.weaponNumbers('sword');
    if(sword){
      if(this.swordPending===0&&this.swordClock===0){
        this.swordPending=sword.projectiles;this.swordBurstClock=0;
        this.swordBurstInterval=burstInterval(balance.swordBurstTime,balance.swordMinBurstInterval,this.swordPending,weaponCooldown('sword')/sword.attackInterval,dt);
      }
      this.swordBurstClock=Math.max(0,this.swordBurstClock-dt);
      if(this.swordPending>0&&this.swordBurstClock===0&&this.swing(player,facing,sword.damage)){
        this.swordPending--;this.swordBurstClock=this.swordBurstInterval;
        if(this.swordPending===0)this.swordClock=sword.attackInterval;
      }
    }
    const staff=this.weaponNumbers('bolt');
    if(staff){
      const speed=balance.staffEndCooldown/staff.attackInterval;
      if(this.staffPending===0&&this.attackClock===0){this.staffPending=staff.projectiles;this.staffClock=0;this.staffInterval=burstInterval(balance.staffBurstTime,balance.staffMinBurstInterval,this.staffPending,speed,dt);}
      this.staffClock=Math.max(0,this.staffClock-dt);
      if(this.staffPending>0&&this.staffClock===0){
        // Failed native TryInit means no projectile/muzzle/sound without a target.
        const fired=this.fire(player,staff.damage);this.staffPending--;this.staffClock=this.staffInterval;
        if(this.staffPending===0)this.attackClock=fired?balance.staffEndCooldown/speed:0;
      }
    }
    for(let i=this.slashes.length-1;i>=0;i--){
      const slash=this.slashes[i];
      for(const enemy of [...this.swarm.enemies]){
        if(slash.hits.has(enemy.id))continue;
        const offset=enemy.position.clone().add(new Vector3(0,.7,0)).sub(slash.position);
        if(Math.abs(offset.y)>balance.swordHeightTolerance)continue;
        offset.y=0;
        if(offset.length()<=balance.swordRange&&(offset.lengthSq()<.0001||offset.normalize().dot(slash.direction)>=Math.cos(balance.swordHalfAngle))){
          slash.hits.add(enemy.id);this.hitEffect(enemy,slash.direction,!slash.hitAudioPlayed);slash.hitAudioPlayed=true;this.applyHit(enemy,slash.damage,slash.direction);
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
        if(center.distanceToSquared(previous.clone().addScaledVector(segment,fraction))<balance.staffCollisionRadius**2&&fraction<first){target=enemy;first=fraction;}
      }
      if(target){
        const impact=previous.clone().addScaledVector(segment,first),direction=bolt.velocity.clone().normalize();
        this.staffEffects.push({kind:'impact',position:impact.clone(),direction,life:2,duration:2});
        this.sound('staffImpact');let hitAudioPlayed=false;
        // Compact web hit area requested by the user; native serialized radius is 5.
        for(const enemy of [...this.swarm.enemies]){
          const center=enemy.position.clone().add(new Vector3(0,.7,0));
          if(center.distanceToSquared(impact)<=balance.staffExplosionRadius**2){this.hitEffect(enemy,direction,!hitAudioPlayed);hitAudioPlayed=true;this.applyHit(enemy,bolt.damage,center.sub(impact),balance.staffKnockback);}
        }
        bolt.life=0;
      }
      if(bolt.life<=0)this.bolts.splice(i,1);
    }
    if(this.staffEffects.length>128)this.staffEffects.splice(0,this.staffEffects.length-128);
    for(let i=this.gems.length-1;i>=0;i--){
      const gem=this.gems[i];
      if(movePickup(gem,player.clone().add(new Vector3(0,.35,0)),dt,this.liveStats().PickupRange)){
        this.gems.splice(i,1);const kind=gem.kind??'xp';
        if(kind==='xp')this.gainXp(gem.value??1,player);
        else{this.state[kind]+=gem.value??1;this.sound(kind);
          this.currencyReceipts.push({kind,value:gem.value??1,time:this.state.elapsed,position:player.clone()});if(this.currencyReceipts.length>48)this.currencyReceipts.shift();}
      }
    }
    for(let i=this.hits.length-1;i>=0;i--){const hit=this.hits[i];hit.life-=dt;hit.position.y+=dt;if(hit.life<=0)this.hits.splice(i,1);}
    if(this.hits.length>60)this.hits.splice(0,this.hits.length-60);
    const touching=this.hurtClock===0?this.swarm.enemies.find(enemy=>enemy.position.distanceTo(player)<1.1):undefined;
    if(touching){
      // Evasion (e/(e+1)*0.999) dodges the whole hit; Armor (a/(a+0.75)*0.999) reduces it. CheckFinalValue is verified, the points where
      // DamagePlayerExternal applies them are inferred (I). Fox is the only playable character.
      const stats=playerStats(balance.character,{damage:this.state.damageBonus,haste:this.state.attackSpeedBonus,projectiles:this.state.projectileBonus});
      this.hurtClock=balance.contactInterval;
      if(this.random()<stats.Evasion){this.evaded++;}
      else{
        const damage=Math.max(1,Math.round((touching.spec?.damage??balance.contactDamage)*(1-stats.Armor)));
        this.sound('hurt');this.state.health=Math.max(0,this.state.health-damage);
        if(this.state.health===0){this.state.dead=true;this.sound('death');}
      }
    }
    // HealthRegen is per minute (PlayerHealth.healingPerMinute 10, damage source "HealthRegen"); the exact tick cadence is unread (I), so it accrues smoothly.
    if(!this.state.dead&&this.state.health<this.state.maxHealth){
      // Accrue fractionally but apply whole HP only, so the HP readout and damage numbers stay integers.
      this.regenCarry+=this.liveStats().HealthRegen/60*dt;
      if(this.regenCarry>=1){const whole=Math.floor(this.regenCarry);this.regenCarry-=whole;this.state.health=Math.min(this.state.maxHealth,this.state.health+whole);}
    }else this.regenCarry=0;
    this.dangerState=stepDanger(this.dangerState,this.state.health,this.state.maxHealth,dt);this.state.danger=this.dangerState.value;
  }
}
