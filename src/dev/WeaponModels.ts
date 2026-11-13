export const weaponModels=[
 ['axe','Axe'],['bow','Bow · Arrow'],['dice','Dice'],['mine','Mine'],
 ['rockets','Rockets'],['bluetooth_dagger','Bluetooth Dagger'],['aegis','Aegis'],
] as const;
export function modelId(room:string){return room.startsWith('model-')&&weaponModels.some(([id])=>room==='model-'+id)?room.slice(6):undefined;}
