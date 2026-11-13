export interface EffectsPreferences {damageNumbers:boolean;damageFlash:boolean;particlesOpacity:number;}
export const effectsDefaults:Readonly<EffectsPreferences>=Object.freeze({damageNumbers:true,damageFlash:true,particlesOpacity:1});
export const effectsStorageKey='warcore.effects.v1';
function sanitize(value:unknown):Readonly<EffectsPreferences>{
 const next={...effectsDefaults};if(value&&typeof value==='object'){
  const data=value as Record<string,unknown>;
  for(const key of ['damageNumbers','damageFlash'] as const)if(typeof data[key]==='boolean')next[key]=data[key];
  if(typeof data.particlesOpacity==='number'&&Number.isFinite(data.particlesOpacity))next.particlesOpacity=Math.max(0,Math.min(1,data.particlesOpacity));
 }return Object.freeze(next);
}
function read(){try{return sanitize(JSON.parse(localStorage.getItem(effectsStorageKey)??'null'));}catch{return effectsDefaults;}}
let current=read();const listeners=new Set<()=>void>();
function publish(next:Readonly<EffectsPreferences>){if(Object.keys(effectsDefaults).every(key=>current[key as keyof EffectsPreferences]===next[key as keyof EffectsPreferences]))return;current=next;for(const listener of listeners)listener();}
const storageChanged=(event:StorageEvent)=>{if(event.key!==effectsStorageKey&&event.key!==null)return;try{publish(sanitize(JSON.parse(event.newValue??'null')));}catch{publish(effectsDefaults);}};
export const getEffectsPreferences=()=>current;
export function setEffectsPreferences(patch:Partial<EffectsPreferences>){const next=sanitize({...current,...patch});try{localStorage.setItem(effectsStorageKey,JSON.stringify(next));}catch{/* Keep settings usable in memory. */}publish(next);}
export const resetEffectsPreferences=()=>setEffectsPreferences({...effectsDefaults});
export function subscribeEffectsPreferences(listener:()=>void){if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',storageChanged);listeners.add(listener);return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',storageChanged);};}
