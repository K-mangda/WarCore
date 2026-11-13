export type BindingAction="forward"|"backward"|"left"|"right"|"jump";
export const defaultBindings=Object.freeze({forward:"KeyW",backward:"KeyS",left:"KeyA",right:"KeyD",jump:"Space"});
export const bindingActions=Object.keys(defaultBindings) as BindingAction[];
export function bindingLabel(code:string){return code.replace(/^Key/, "").replace(/^Digit/, "").replace("Space","SPACE").replace("Left"," L").replace("Right"," R");}
export function allowedBinding(code:string){return /^(Key[A-Z]|Digit[4-9]|Space|ShiftLeft|ShiftRight|ControlLeft|ControlRight)$/.test(code);}
export interface ControlPreferences {bindings:Readonly<Record<BindingAction,string>>;sensitivity:number;lookSmoothing:number;invertHorizontal:boolean;invertVertical:boolean;arrowLook:boolean;numberUpgrades:boolean;}
export const controlDefaults:Readonly<ControlPreferences>=Object.freeze({bindings:defaultBindings,sensitivity:1,lookSmoothing:0,invertHorizontal:false,invertVertical:false,arrowLook:false,numberUpgrades:true});
export const controlStorageKey='warcore.controls.v1';
function sanitize(value:unknown):Readonly<ControlPreferences>{
 const next={...controlDefaults};
 if(value&&typeof value==='object'){
  const data=value as Record<string,unknown>;
  const bindings=data.bindings as Record<string,unknown>|undefined;
  if(bindings&&bindingActions.every(key=>typeof bindings[key] === "string"&&allowedBinding(bindings[key] as string))&&new Set(bindingActions.map(key=>bindings[key])).size===bindingActions.length)next.bindings=Object.freeze(Object.fromEntries(bindingActions.map(key=>[key,bindings[key]]))) as typeof defaultBindings;
  for(const [key,min,max] of [['sensitivity',.1,8],['lookSmoothing',0,1]] as const){const n=data[key];if(typeof n==='number'&&Number.isFinite(n))next[key]=Math.min(max,Math.max(min,n));}
  for(const key of ['invertHorizontal','invertVertical','arrowLook','numberUpgrades'] as const)if(typeof data[key]==='boolean')next[key]=data[key];
 }
 return Object.freeze(next);
}
function read(){try{return sanitize(JSON.parse(localStorage.getItem(controlStorageKey)??'null'));}catch{return controlDefaults;}}
let current=read();const listeners=new Set<()=>void>();
function publish(next:Readonly<ControlPreferences>){if(Object.keys(controlDefaults).every(key=>key==='bindings'?bindingActions.every(action=>current.bindings[action]===next.bindings[action]):current[key as keyof ControlPreferences]===next[key as keyof ControlPreferences]))return;current=next;for(const listener of listeners)listener();}
const storageChanged=(event:StorageEvent)=>{if(event.key!==controlStorageKey&&event.key!==null)return;try{publish(sanitize(JSON.parse(event.newValue??'null')));}catch{publish(controlDefaults);}};
export const getControlPreferences=()=>current;
export function setControlPreferences(patch:Partial<ControlPreferences>){const next=sanitize({...current,...patch});try{localStorage.setItem(controlStorageKey,JSON.stringify(next));}catch{/* Keep preferences usable in memory. */}publish(next);}
export const resetControlPreferences=()=>setControlPreferences({...controlDefaults});
export function subscribeControlPreferences(listener:()=>void){
 if(!listeners.size&&typeof window!=='undefined')window.addEventListener('storage',storageChanged);listeners.add(listener);
 return ()=>{listeners.delete(listener);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',storageChanged);};
}

export function bindControl(action:BindingAction,code:string):string|undefined{
 if(!allowedBinding(code))return "This key is reserved or unsupported. Use a letter, Space, Shift, Ctrl or 4–9.";
 if(bindingActions.some(key=>key!==action&&current.bindings[key]===code))return "That key is already assigned. Choose another key.";
 setControlPreferences({bindings:{...current.bindings,[action]:code}});
}
