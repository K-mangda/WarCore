import * as T from 'three';
import {BakedEnemyView} from '../enemies/BakedEnemyView';
import type {EnemyKind} from '../enemies/Swarm';
import {balance} from '../combat/Balance';
/** Timeline fixture for the shared enemy renderer, not a second combat simulation. */
export class EnemyPreview {
 private views:Record<EnemyKind,BakedEnemyView>;
 constructor(scene:T.Scene){this.views={skeleton:new BakedEnemyView(scene,undefined,'skeleton'),bandit:new BakedEnemyView(scene,undefined,'bandit')};}
 load(kind:EnemyKind){return this.views[kind].load();}
 update(room:string,age:number,facing:T.Vector3){
  const player=new T.Vector3(),position=facing.clone().multiplyScalar(2.5);
  const kind=room.startsWith('bandit-')?'bandit':room.startsWith('skeleton-')?'skeleton':undefined;
  for(const [species,view] of Object.entries(this.views))if(species!==kind)view.render([],[],0,player);
  if(!kind)return;const view=this.views[kind];
  if(room.endsWith('-death')&&age>=.2){
   const life=balance.enemyDissolveDuration-(age-.2);
   view.render([],life>0?[{kind,id:1,animationTime:.2,position,heading:Math.atan2(-facing.x,-facing.z),life,duration:balance.enemyDissolveDuration}]:[],age,player);return;
  }
  view.render([{kind,id:1,position,velocity:new T.Vector3(),health:20,flash:room.endsWith('-hit')&&age>=.2&&age<.35?.15:0}],[],age,player);
 }
 dispose(){for(const view of Object.values(this.views))view.dispose();}
}
