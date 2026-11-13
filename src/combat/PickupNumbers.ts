import * as T from 'three';
import {DamageNumbers} from './DamageNumbers';
import type {Run,XpReceipt} from './Run';

/** Cyan collection feedback from the actual amount awarded, shared by game/Lab. */
export class PickupNumbers {
 private font=new DamageNumbers();private seen=new WeakSet<XpReceipt>();
 private labels:{sprite:T.Sprite;age:number;origin:T.Vector3}[]=[];private previous=0;private disposed=false;
 constructor(private scene:T.Scene){}
 async load(){await this.font.load();if(this.disposed)this.font.dispose();}
 update(run:Run,dt:number){
  const elapsed=run.snapshot().elapsed;
  if(elapsed<this.previous)this.clear();this.previous=elapsed;
  for(let i=this.labels.length-1;i>=0;i--){
   const label=this.labels[i];label.age+=dt;
   if(label.age>=.85){this.remove(label.sprite);this.labels.splice(i,1);continue;}
   label.sprite.position.copy(label.origin);label.sprite.position.y+=.9*(1-Math.exp(-label.age*4));
   label.sprite.material.opacity=Math.min(1,(.85-label.age)/.25);
   const pop=1+.18*Math.sin(Math.min(1,label.age/.16)*Math.PI);
   label.sprite.scale.set(label.sprite.userData.width*pop,.5*pop,1);
  }
  for(const receipt of run.xpReceipts){
   if(this.seen.has(receipt))continue;this.seen.add(receipt);
   // Atlas glyphs include '+'. Each label owns opacity; font texture is shared.
   const material=this.font.material('+'+receipt.value,'#26dfff').clone();
   const sprite=new T.Sprite(material),width=(material.map!.image as HTMLCanvasElement).width/128*.8;
   sprite.userData.width=width;sprite.scale.set(width,.5,1);sprite.position.copy(receipt.position);
   this.scene.add(sprite);this.labels.push({sprite,age:0,origin:receipt.position.clone()});
   if(this.labels.length>24)this.remove(this.labels.shift()!.sprite);
  }
 }
 private remove(sprite:T.Sprite){this.scene.remove(sprite);sprite.material.dispose();}
 clear(){for(const label of this.labels)this.remove(label.sprite);this.labels=[];this.seen=new WeakSet();this.previous=0;}
 dispose(){this.disposed=true;this.clear();this.font.dispose();}
}
