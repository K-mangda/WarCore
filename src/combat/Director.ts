import {nativeEnemies,nativeStages,type MapFlag,type NativeEnemy,type NativeStage} from '../data/NativeData';
/**
 * Credit-based enemy director modelled on Assets.Scripts.Game.Spawning.New (docs/REA_RUNTIME_SYSTEMS.md section 1).
 *
 * Verified (V): per-enemy creditCost / canSpawnAfterTime / map flags, stage timelines (startEnemies, MiniBoss/Swarm events),
 *   StageSummoner credits/second = EnemyAmount * (1 + 0.5 * minutes), summon interval = 2 * clamp(1 - 0.5 * Difficulty, 0.1, 2),
 *   credit multiplier = 1 + 0.7 * Difficulty + 0.4 * stage, SwarmSummoner interval 0.5 s, 60 s pool checks, no credits at max enemies,
 *   target population round((clamp01(t / stageDuration) * 200 + 5) * multiplier * EnemyAmount) (Ghidra decompile), elite cards.
 * Provisional (P, not decoded yet): initial credits, how the pool is extended every check interval, swarm spawn rate/target,
 *   boss encounter. Each is marked below so it can be replaced when the native method is decoded.
 */
export interface SpawnRequest {enemy:NativeEnemy;source:'stage'|'swarm'|'miniboss';elite:boolean;}
interface Card {enemy:NativeEnemy;elite:boolean;cost:number;weight:number;}
export interface DirectorOptions {stage:string;difficulty?:number;enemyAmount?:number;eliteSpawnIncrease?:number;stageDuration?:number;maxEnemies:number;random?:()=>number;}
const mapOf=(stage:string):MapFlag=>stage.startsWith('StageDesert')?'Desert':stage.startsWith('StageGraveyard')?'Graveyard':stage.startsWith('StageHell')?'Hell':'Forest';
const byEnemy=new Map(nativeEnemies.map(e=>[e.enemy,e]));
export const enemyByName=(name:string)=>byEnemy.get(name);
export const minutesOf=(seconds:number)=>seconds/60;
/** StageSummoner.GetSummonInterval (RVA 0x4864B0). */
export const summonInterval=(difficulty:number)=>2*Math.min(2,Math.max(.1,1-.5*difficulty));
/** BaseSummoner.GetMultiplier (RVA 0x46CD20) with the stage counter. */
export const creditMultiplier=(difficulty:number,stageNumber:number)=>1+.7*difficulty+.4*stageNumber;
/** StageSummoner.GetBaseCreditsPerSecondUncapped (RVA 0x486180). */
export const creditsPerSecond=(enemyAmount:number,minutes:number)=>enemyAmount*(1+.5*minutes);
/** StageSummoner.GetNumTargetEnemies (RVA 0x4862E0, Ghidra pseudocode): round((clamp01(time / stageDuration) * 200 + 5) * multiplier * EnemyAmount). */
export const targetEnemies=(elapsed:number,stageDuration:number,enemyAmount:number,multiplier:number)=>Math.round((Math.min(1,Math.max(0,elapsed/stageDuration))*200+5)*multiplier*enemyAmount);
/** EnemyCard.RefreshWeightAndCost (RVA 0x470B20): elite cards cost twice as much and weigh 0.04 x EliteSpawnIncrease. */
export const eliteWeight=(eliteSpawnIncrease:number)=>.04*eliteSpawnIncrease;
const SWARM_INTERVAL=.5,SWARM_TARGET=50,SWARM_BATCH=3,INITIAL_CREDITS=4,MAX_PER_CYCLE=200;

export class Director {
  readonly stage:NativeStage;readonly map:MapFlag;
  private readonly difficulty:number;private readonly enemyAmount:number;private readonly maxEnemies:number;private readonly random:()=>number;
  private pool:NativeEnemy[]=[];private readonly stageDuration:number;private readonly eliteSpawnIncrease:number;private credits=INITIAL_CREDITS;private summonClock=0;private poolClock=0;
  private fired=new Set<number>();private swarm?:{enemies:NativeEnemy[];endsAt:number;clock:number};
  constructor(options:DirectorOptions){
    const stage=nativeStages.find(s=>s.name===options.stage);if(!stage)throw new Error(`Unknown stage ${options.stage}`);
    this.stage=stage;this.map=mapOf(stage.name);this.difficulty=options.difficulty??0;this.enemyAmount=options.enemyAmount??1;
    this.stageDuration=options.stageDuration??600;this.eliteSpawnIncrease=options.eliteSpawnIncrease??1;this.maxEnemies=options.maxEnemies;this.random=options.random??Math.random;
    // First summon cycle fires immediately: 4 initial + 2 earned credits = about the 6 opening enemies of the previous sandbox (P).
    this.summonClock=summonInterval(this.difficulty);
    this.pool=stage.startEnemies.map(name=>byEnemy.get(name)).filter((e):e is NativeEnemy=>!!e);
  }
  get cards():readonly NativeEnemy[]{return this.pool;}
  /** Advance by dt seconds; `elapsed` is run time in seconds, `population` the current live enemy count. */
  update(dt:number,elapsed:number,population:number):SpawnRequest[]{
    const out:SpawnRequest[]=[];
    this.fireEvents(elapsed,out);
    this.poolClock+=dt;
    while(this.poolClock>=this.stage.checkNewEnemyInterval){this.poolClock-=this.stage.checkNewEnemyInterval;this.extendPool(elapsed);}
    const interval=summonInterval(this.difficulty);this.summonClock+=dt;
    while(this.summonClock>=interval){
      this.summonClock-=interval;
      // BaseSummoner.AddCredits skips earning while EnemyManager.HasMaxEnemies().
      if(population+out.length<this.maxEnemies)this.credits+=creditsPerSecond(this.enemyAmount,minutesOf(elapsed))*creditMultiplier(this.difficulty,0)*interval;
      this.spend(population,elapsed,out);
    }
    this.runSwarm(dt,elapsed,population,out);
    return out;
  }
  private cardsFor(pool:NativeEnemy[]):Card[]{
    const cards:Card[]=[];
    for(const enemy of pool){
      cards.push({enemy,elite:false,cost:enemy.creditCost,weight:1});
      if(enemy.canBeElite)cards.push({enemy,elite:true,cost:enemy.creditCost*2,weight:eliteWeight(this.eliteSpawnIncrease)});
    }
    return cards;
  }
  private spend(population:number,elapsed:number,out:SpawnRequest[]){
    let spawned=0;
    const target=Math.min(this.maxEnemies,targetEnemies(elapsed,this.stageDuration,this.enemyAmount,creditMultiplier(this.difficulty,0)));
    while(spawned<MAX_PER_CYCLE&&population+out.length<target){
      const affordable=this.cardsFor(this.pool).filter(card=>card.cost<=this.credits);
      if(!affordable.length)break;
      let roll=this.random()*affordable.reduce((sum,card)=>sum+card.weight,0),card=affordable[affordable.length-1];
      for(const candidate of affordable){roll-=candidate.weight;if(roll<=0){card=candidate;break;}}
      this.credits-=card.cost;out.push({enemy:card.enemy,source:'stage',elite:card.elite});spawned++;
    }
  }
  /** P: native StageSummoner.AddEnemyToPoolAndPickNewCard is not decoded; add the cheapest eligible regular enemy of this map. */
  private extendPool(elapsed:number){
    const candidates=nativeEnemies.filter(e=>e.maps.includes(this.map)&&e.minStage<=0&&e.canSpawnAfterTime<=elapsed&&e.creditCost<=4&&!this.pool.includes(e)&&!this.stage.minibosses.includes(e.enemy))
      .sort((a,b)=>a.creditCost-b.creditCost||a.enemy.localeCompare(b.enemy));
    if(candidates.length)this.pool.push(candidates[0]);
  }
  private fireEvents(elapsed:number,out:SpawnRequest[]){
    this.stage.events.forEach((event,index)=>{
      if(this.fired.has(index)||elapsed<event.timeMinutes*60)return;
      this.fired.add(index);
      const enemies=event.enemies.map(name=>byEnemy.get(name)).filter((e):e is NativeEnemy=>!!e);
      if(event.event==='MiniBoss')for(const enemy of enemies)out.push({enemy,source:'miniboss',elite:false});
      else if(event.event==='Swarm'&&enemies.length)this.swarm={enemies,endsAt:elapsed+event.duration,clock:0};
    });
  }
  /** P: swarm target/rate are placeholders (native SwarmSummoner.GetNumTargetEnemies/GetBaseCreditsPerSecond only partly decoded). */
  private runSwarm(dt:number,elapsed:number,population:number,out:SpawnRequest[]){
    const swarm=this.swarm;if(!swarm)return;
    if(elapsed>=swarm.endsAt){this.swarm=undefined;return;}
    swarm.clock+=dt;
    while(swarm.clock>=SWARM_INTERVAL){
      swarm.clock-=SWARM_INTERVAL;
      for(let i=0;i<SWARM_BATCH&&population+out.length<Math.min(this.maxEnemies,Math.max(SWARM_TARGET,population));i++){
        if(population+out.length>=this.maxEnemies)break;
        out.push({enemy:swarm.enemies[Math.floor(this.random()*swarm.enemies.length)%swarm.enemies.length],source:'swarm',elite:false});
      }
    }
  }
}
