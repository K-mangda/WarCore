import * as T from 'three';
import {SkeletonView} from '../enemies/SkeletonView';
import {balance} from '../combat/Balance';
/** Timeline fixture for the shared enemy renderer, not a second combat simulation. */
export class EnemyPreview {
 private view:SkeletonView;
 constructor(scene:T.Scene){this.view=new SkeletonView(scene);}
 load(){return this.view.load();}
 update(room:string,age:number,facing:T.Vector3){
  const player=new T.Vector3(),position=facing.clone().multiplyScalar(2.5);
  if(!room.startsWith('skeleton-')){this.view.render([],[],0,player);return;}
  if(room==='skeleton-death'&&age>=.2){
   const life=balance.enemyDissolveDuration-(age-.2);
   this.view.render([],life>0?[{id:1,animationTime:.2,position,heading:Math.atan2(-facing.x,-facing.z),life,duration:balance.enemyDissolveDuration}]:[],age,player);return;
  }
  this.view.render([{id:1,position,velocity:new T.Vector3(),health:20,flash:room==='skeleton-hit'&&age>=.2&&age<.35?.15:0}],[],age,player);
 }
 dispose(){this.view.dispose();}
}
