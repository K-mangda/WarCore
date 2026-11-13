export const weaponModels=[
 ['axe','Axe'],['bow','Bow · Arrow'],['dice','Dice'],['mine','Mine'],
 ['rockets','Rockets'],['bluetooth_dagger','Bluetooth Dagger'],['aegis','Aegis'],
] as const;
export function modelId(room:string){const match=/^(model|sounds|hit)-(.+)$/.exec(room);return match&&weaponModels.some(([id])=>id===match[2])?match[2]:undefined;}
export const hitRoom=(room:string)=>room.startsWith('hit-')&&!!modelId(room);
export const soundRoom=(room:string)=>room.startsWith('sounds-')&&!!modelId(room);
export const weaponModelRooms=weaponModels.flatMap(([id,name])=>[
 ['model-'+id,name+' - Model'],['sounds-'+id,name+' - Sounds'],
 ...(id==='aegis'?[]:[['hit-'+id,name+' - Hit effect']]),
] as [string,string][]);
