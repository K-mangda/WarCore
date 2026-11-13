import type {RunSnapshot} from '../combat/Run';
export interface RunRecord {id:string;endedAt:string;outcome:'death'|'reset';build:string;weapon:'bolt'|'sword';elapsed:number;kills:number;level:number;gold:number;silver:number;damage:number;attackInterval:number;projectiles:number;upgradeLevels:{damage:number;haste:number;projectiles:number};}
export const historyKey='warcore.runs.v1';export const historyLimit=30;
function valid(value:unknown):value is RunRecord{if(!value||typeof value!=='object')return false;const r=value as RunRecord;return typeof r.id==='string'&&typeof r.endedAt==='string'&&Number.isFinite(Date.parse(r.endedAt))&&typeof r.build==='string'&&['death','reset'].includes(r.outcome)&&['bolt','sword'].includes(r.weapon)&&['elapsed','kills','level','gold','silver','damage','attackInterval','projectiles'].every(key=>typeof r[key as keyof RunRecord]==='number'&&Number.isFinite(r[key as keyof RunRecord])&&(r[key as keyof RunRecord] as number)>=0)&&!!r.upgradeLevels&&['damage','haste','projectiles'].every(key=>Number.isInteger(r.upgradeLevels[key as keyof typeof r.upgradeLevels])&&r.upgradeLevels[key as keyof typeof r.upgradeLevels]>=0);}
function read(){try{const data:unknown=JSON.parse(localStorage.getItem(historyKey)??'[]');return Array.isArray(data)?data.filter(valid).slice(0,historyLimit):[];}catch{return [];}}
let current:readonly RunRecord[]=read();const listeners=new Set<()=>void>();
export const getRunHistory=()=>current;
export function recordRun(run:RunSnapshot,outcome:RunRecord['outcome'],build:string){if(run.elapsed<=0)return;const record:RunRecord={id:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`,endedAt:new Date().toISOString(),outcome,build,weapon:run.weapon,elapsed:run.elapsed,kills:run.kills,level:run.level,gold:run.gold,silver:run.silver,damage:run.damage,attackInterval:run.attackInterval,projectiles:run.projectiles,upgradeLevels:{...run.upgradeLevels}};current=[record,...current].slice(0,historyLimit);try{localStorage.setItem(historyKey,JSON.stringify(current));}catch{/* History remains available for this session. */}for(const listener of listeners)listener();}
const changed=(event:StorageEvent)=>{if(event.key===historyKey||event.key===null){current=read();for(const listener of listeners)listener();}};
export function subscribeRunHistory(listener:()=>void){if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',changed);listeners.add(listener);return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',changed);};}

/** A run is finalized once, even when restart follows a death. Reload is not an ending. */
export class RunRecorder {
 private recorded=false;
 constructor(private save:typeof recordRun=recordRun){}
 death(run:RunSnapshot,build:string){if(run.dead&&!this.recorded){this.save(run,'death',build);this.recorded=true;}}
 reset(run:RunSnapshot,build:string){if(!this.recorded)this.save(run,'reset',build);this.recorded=false;}
}
