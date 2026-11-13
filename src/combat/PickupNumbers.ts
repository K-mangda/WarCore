import * as T from 'three';
import {DamageNumbers} from './DamageNumbers';
import type {Run,XpReceipt} from './Run';
import type {PickupKind} from './Pickups';
interface Counter {total:number;idle:number;pulse:number;sprite?:T.Sprite;}
const colors={xp:'#26dfff',gold:'#ffe52b',silver:'#e5efff'};
const prefixes={xp:'+',gold:'$',silver:'S '};
/** Camera-plane collection feedback; tuning follows user screenshots. */
export class PickupNumbers {
 private font=new DamageNumbers();private seen=new WeakSet<XpReceipt>();private root=new T.Group();
 private counters=new Map<PickupKind,Counter>();private previous=0;private disposed=false;
 constructor(scene:T.Scene,private camera:T.PerspectiveCamera,private viewport:()=>{width:number;height:number}){
  if(!camera.parent)scene.add(camera);camera.add(this.root);
 }
 async load(){await this.font.load();if(this.disposed)this.font.dispose();}
 update(run:Run,dt:number,player=new T.Vector3()){
  const elapsed=run.snapshot().elapsed;
  if(elapsed<this.previous)this.clear();this.previous=elapsed;
  for(const counter of this.counters.values()){counter.idle+=dt;counter.pulse=Math.max(0,counter.pulse-dt);}
  const changed=new Set<PickupKind>();
  for(const receipt of [...run.xpReceipts,...run.currencyReceipts]){
   if(this.seen.has(receipt))continue;this.seen.add(receipt);
   const kind=receipt.kind??'xp';let counter=this.counters.get(kind);
   if(!counter){counter={total:0,idle:Infinity,pulse:0};this.counters.set(kind,counter);}
   if(counter.idle>=1.4){counter.total=0;}
   counter.total+=receipt.value;counter.idle=0;counter.pulse=.22;changed.add(kind);
  }
  for(const kind of changed){
   const counter=this.counters.get(kind)!;if(counter.sprite)this.remove(counter.sprite);
   const material=this.font.material(prefixes[kind]+counter.total,colors[kind],false,false);
   material.depthTest=false;material.toneMapped=false;
   const sprite=counter.sprite=new T.Sprite(material);sprite.renderOrder=100;this.root.add(sprite);
  }
  const {width,height}=this.viewport();if(width<=0||height<=0){this.root.visible=false;return;}
  this.camera.updateMatrixWorld();const anchor=player.clone().add(new T.Vector3(0,1.5,0)).project(this.camera);
  this.root.visible=anchor.z>=-1&&anchor.z<=1;
  const halfHeight=Math.tan(T.MathUtils.degToRad(this.camera.fov/2)),pixel=2*halfHeight/height;
  this.root.position.set(T.MathUtils.clamp(anchor.x+210/width,-.7,.7)*halfHeight*this.camera.aspect,T.MathUtils.clamp(anchor.y+24/height,-.7,.7)*halfHeight,-1);
  for(const [kind,counter] of this.counters){
   const sprite=counter.sprite;if(!sprite)continue;sprite.visible=counter.idle<1.4;
   sprite.material.opacity=T.MathUtils.clamp((1.4-counter.idle)/.3,0,1);
   // Each collection punches immediately to1.5x, then settles back to1x.
   const scale=1+.5*(counter.pulse/.22)**2;
   const image=sprite.material.map!.image as HTMLCanvasElement;
   sprite.scale.set(image.width/80*42*pixel*scale,42*pixel*scale,1);
   sprite.position.set(0,-(kind==='xp'?0:kind==='gold'?28:56)*pixel,0);
  }
 }
 private remove(sprite:T.Sprite){this.root.remove(sprite);sprite.material.map?.dispose();sprite.material.dispose();}
 clear(){for(const counter of this.counters.values())if(counter.sprite)this.remove(counter.sprite);this.counters.clear();this.seen=new WeakSet();this.previous=0;}
 dispose(){this.disposed=true;this.clear();this.root.removeFromParent();this.font.dispose();}
}
