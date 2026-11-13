/** Cache in-flight and completed loads; failed loads can be retried. */
export class LabAssets {
 private pending=new Map<string,Promise<unknown>>();
 load(key:string,loader:()=>Promise<unknown>){
  let result=this.pending.get(key);
  if(!result){result=Promise.resolve().then(loader).catch(error=>{this.pending.delete(key);throw error;});this.pending.set(key,result);}
  return result;
 }
}
export function roomAssets(room:string){
 if(room.startsWith('skeleton-')||room.startsWith('bandit-'))return [room.split('-')[0]];
 if(room==='sword')return ['fox','sword','staff','damage']; // Shared weapon-hit effects.
 if(room==='bolt')return ['fox','staff','damage'];
 return ['fox','xp','progression','pickup'];
}
