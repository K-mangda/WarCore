export const hpColors={Red:'#c83234',Green:'#54c567',Blue:'#70c4ff',Yellow:'#f4d35e',White:'#eeeeeb'} as const;
export type HpColor=keyof typeof hpColors;
export interface GamePreferences {crosshairHeight:number;crosshairSize:number;crosshairAlpha:number;hpColor:HpColor;debugFps:boolean;debugSpeed:boolean;}
export const gameDefaults:Readonly<GamePreferences>=Object.freeze({crosshairHeight:.5,crosshairSize:1,crosshairAlpha:1,hpColor:'Red',debugFps:true,debugSpeed:true});
export const gameStorageKey='warcore.game.v1';
function sanitize(value:unknown):Readonly<GamePreferences>{
 const next={...gameDefaults};if(value&&typeof value==='object'){
  const data=value as Record<string,unknown>;
  for(const [key,min,max] of [['crosshairHeight',.1,.9],['crosshairSize',.5,2],['crosshairAlpha',0,1]] as const){const n=data[key];if(typeof n==='number'&&Number.isFinite(n))next[key]=Math.max(min,Math.min(max,n));}
  if(typeof data.hpColor==='string'&&Object.hasOwn(hpColors,data.hpColor))next.hpColor=data.hpColor as HpColor;
  for(const key of ['debugFps','debugSpeed'] as const)if(typeof data[key]==='boolean')next[key]=data[key];
 }return Object.freeze(next);
}
function read(){try{return sanitize(JSON.parse(localStorage.getItem(gameStorageKey)??'null'));}catch{return gameDefaults;}}
let current=read();const listeners=new Set<()=>void>();
function publish(next:Readonly<GamePreferences>){if(Object.keys(gameDefaults).every(key=>current[key as keyof GamePreferences]===next[key as keyof GamePreferences]))return;current=next;for(const listener of listeners)listener();}
const storageChanged=(event:StorageEvent)=>{if(event.key!==gameStorageKey&&event.key!==null)return;try{publish(sanitize(JSON.parse(event.newValue??'null')));}catch{publish(gameDefaults);}};
export const getGamePreferences=()=>current;
export function setGamePreferences(patch:Partial<GamePreferences>){const next=sanitize({...current,...patch});try{localStorage.setItem(gameStorageKey,JSON.stringify(next));}catch{/* Retain usable preferences in memory. */}publish(next);}
export const resetGamePreferences=()=>setGamePreferences({...gameDefaults});
export function subscribeGamePreferences(listener:()=>void){if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',storageChanged);listeners.add(listener);return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',storageChanged);};}
