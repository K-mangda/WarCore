export const fpsLimits=[0,30,60,90,120,144,240] as const;
export interface VideoPreferences {renderScale:number;viewDistance:number;fpsLimit:number;fov:number;cameraDistance:number;}
export const videoDefaults:Readonly<VideoPreferences>=Object.freeze({renderScale:1,viewDistance:250,fpsLimit:0,fov:75,cameraDistance:0});
export const videoStorageKey='warcore.video.v1';
function sanitize(value:unknown):Readonly<VideoPreferences>{
 const next={...videoDefaults};
 if(value&&typeof value==='object'){
  const data=value as Record<string,unknown>;
  for(const [key,min,max] of [['renderScale',.5,1.25],['viewDistance',50,250],['fov',60,110],['cameraDistance',0,3]] as const){const n=data[key];if(typeof n==='number'&&Number.isFinite(n))next[key]=Math.min(max,Math.max(min,n));}
  if(fpsLimits.some(limit=>limit===data.fpsLimit))next.fpsLimit=data.fpsLimit as number;
 }
 return Object.freeze(next);
}
function read(){try{return sanitize(JSON.parse(localStorage.getItem(videoStorageKey)??'null'));}catch{return videoDefaults;}}
let current=read();const listeners=new Set<()=>void>();
function publish(next:Readonly<VideoPreferences>){if(Object.keys(videoDefaults).every(key=>current[key as keyof VideoPreferences]===next[key as keyof VideoPreferences]))return;current=next;for(const listener of listeners)listener();}
const storageChanged=(event:StorageEvent)=>{if(event.key!==videoStorageKey&&event.key!==null)return;try{publish(sanitize(JSON.parse(event.newValue??'null')));}catch{publish(videoDefaults);}};
export const getVideoPreferences=()=>current;
export function setVideoPreferences(patch:Partial<VideoPreferences>){const next=sanitize({...current,...patch});try{localStorage.setItem(videoStorageKey,JSON.stringify(next));}catch{/* Keep settings usable in memory. */}publish(next);}
export const resetVideoPreferences=()=>setVideoPreferences({...videoDefaults});
export function subscribeVideoPreferences(listener:()=>void){if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',storageChanged);listeners.add(listener);return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',storageChanged);};}
