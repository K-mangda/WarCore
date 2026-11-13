export const audioChannels=['music','game','ambience','ui','pickups'] as const;
export type AudioChannel=typeof audioChannels[number];
export type AudioVolume='master'|AudioChannel;
export interface AudioPreferences {master:number;music:number;game:number;ambience:number;ui:number;pickups:number;muted:boolean;}
export const audioDefaults:Readonly<AudioPreferences>=Object.freeze({master:1,music:1,game:1,ambience:1,ui:1,pickups:1,muted:false});
export const audioStorageKey='warcore.audio.v1';
function sanitize(value:unknown):Readonly<AudioPreferences>{
 const next={...audioDefaults};
 if(value&&typeof value==='object'){
  const data=value as Record<string,unknown>;
  for(const key of ['master',...audioChannels] as AudioVolume[]){const n=data[key];if(typeof n==='number'&&Number.isFinite(n))next[key]=Math.max(0,Math.min(1,n));}
  if(typeof data.muted==='boolean')next.muted=data.muted;
 }
 return Object.freeze(next);
}
function readStored(){try{return sanitize(JSON.parse(localStorage.getItem(audioStorageKey)??'null'));}catch{return audioDefaults;}}
let current=readStored();const listeners=new Set<()=>void>();
function publish(next:Readonly<AudioPreferences>){
 if(Object.keys(audioDefaults).every(key=>current[key as keyof AudioPreferences]===next[key as keyof AudioPreferences]))return;
 current=next;for(const listener of listeners)listener();
}
const storageChanged=(event:StorageEvent)=>{
 if(event.key!==audioStorageKey&&event.key!==null)return;
 try{publish(sanitize(JSON.parse(event.newValue??'null')));}catch{publish(audioDefaults);}
};
export const getAudioPreferences=()=>current;
export function setAudioPreferences(patch:Partial<AudioPreferences>){
 const next=sanitize({...current,...patch});
 try{localStorage.setItem(audioStorageKey,JSON.stringify(next));}catch{/* Keep working in memory if storage is blocked. */}
 publish(next);
}
export const resetAudioPreferences=()=>setAudioPreferences({...audioDefaults});
export function subscribeAudioPreferences(listener:()=>void){
 if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',storageChanged);
 listeners.add(listener);
 return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',storageChanged);};
}
