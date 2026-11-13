/** Names match the clips present in public/megabonk/fox-rig.json. */
export const characterRooms=[['fox-idle','Fox - Idle','FoxIdle'],['fox-run','Fox - Run','FoxRun'],['fox-jump','Fox - Jump','FoxJump4'],['fox-falling','Fox - Falling','FoxFalling'],['fox-grind','Fox - Grind clip','FoxGrind2']] as const;
export function characterClip(room:string){return characterRooms.find(([id])=>id===room)?.[2];}
