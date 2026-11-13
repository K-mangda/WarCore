import * as T from 'three';
import {Run} from '../combat/Run';
import {StaffView} from '../combat/StaffView';
/** Shared effect fixture. Its timeline does not imply a weapon's native attack timing. */
export class SharedHitPreview {
 private view:StaffView;private run=new Run(()=>0,()=>true,()=>.5);private started=false;
 constructor(scene:T.Scene){this.view=new StaffView(scene,()=>.5,'weapons/preview-hit/');}
 load(){return this.view.load();}
 reset(){this.run.reset();this.view.reset();this.started=false;}
 advance(age:number,direction:T.Vector3){
  if(age<this.run.snapshot().elapsed)this.reset();
  if(!this.started){this.run.staffEffects.push({kind:'hit',position:new T.Vector3(0,1.25,0),direction:direction.clone(),life:2,duration:2});this.started=true;}
  while(this.run.snapshot().elapsed+1e-7<age){const dt=Math.min(.02,age-this.run.snapshot().elapsed);this.run.step(dt,new T.Vector3());this.view.update(this.run,dt);}
  this.view.update(this.run,0);
 }
 dispose(){this.view.dispose();}
}
