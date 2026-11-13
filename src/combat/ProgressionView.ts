import * as T from 'three';
import {assetUrl} from '../core/assetUrl';
import type {Run,Gem} from './Run';
type Data=Record<string,any>;
/** Native atlas art; bounded billboard subset of serialized Unity particles. */
export class ProgressionView {
 private data?:Data;private textures=new Map<string,T.Texture>();private coins=new Map<Gem,T.Sprite>();
 private effects:{sprite:T.Sprite;age:number;life:number;velocity:T.Vector3;kind:string}[]=[];
 private level=1;private previous=0;private disposed=false;
 constructor(private scene:T.Scene){}
 async load(){
  const r=await fetch(assetUrl('progression/manifest.json'));if(!r.ok)throw Error('Progression manifest unavailable');this.data=await r.json();
  await Promise.all(['gold','silver','burst','text'].map(async kind=>{const texture=await new T.TextureLoader().loadAsync(assetUrl(`progression/${kind}.png`));if(this.disposed){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;this.textures.set(kind,texture);}));
 }
 private sprite(kind:string){
  const texture=this.textures.get(kind)?.clone();if(!texture)return;
  texture.needsUpdate=true;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));this.scene.add(sprite);return sprite;
 }
 private frame(sprite:T.Sprite,kind:string,age:number){
  const source=this.data!.sprites[kind],p=source.particle,uv=p.UVModule,initial=p.InitialModule;
  const count=source.frames,start=Math.floor(uv.startFrame.scalar*count),frame=Math.min(count-1,start+Math.floor(Math.min(1,age/initial.startLifetime.scalar)*uv.frameOverTime.scalar*count));
  sprite.material.map!.repeat.set(1/count,1);sprite.material.map!.offset.set(frame/count,0);
  sprite.scale.setScalar(initial.startSize.scalar);
 }
 burst(player:T.Vector3){
  if(!this.data)return;
  for(const kind of ['burst','text']){
   const initial=this.data.sprites[kind].particle.InitialModule;
   const count=kind==='text'?1:Math.min(32,this.data.sprites[kind].particle.EmissionModule.m_Bursts[0].countCurve.scalar);
   for(let i=0;i<count;i++){
    const sprite=this.sprite(kind);if(!sprite)continue;sprite.position.copy(player).y+=kind==='text'?2.5:1;
    const life=initial.startLifetime.minMaxState===3?T.MathUtils.lerp(initial.startLifetime.minScalar,initial.startLifetime.scalar,Math.random()):initial.startLifetime.scalar;
    const angle=i/count*Math.PI*2,speed=kind==='text'?0:T.MathUtils.lerp(7,12,Math.random());
    this.effects.push({sprite,age:0,life,velocity:new T.Vector3(Math.cos(angle)*speed,.5*speed,Math.sin(angle)*speed),kind});this.frame(sprite,kind,0);
   }
  }
 }
 private remove(sprite:T.Sprite){this.scene.remove(sprite);sprite.material.map?.dispose();sprite.material.dispose();}
 update(run:Run,player:T.Vector3,dt:number){
  if(!this.data)return;const snapshot=run.snapshot();
  if(snapshot.elapsed<this.previous){this.clear();this.level=1;}this.previous=snapshot.elapsed;
  if(snapshot.level>this.level){this.burst(player);this.level=snapshot.level;}
  const present=new Set(run.gems);
  for(const [gem,sprite] of this.coins)if(!present.has(gem)){this.remove(sprite);this.coins.delete(gem);}
  for(const gem of run.gems){const kind=gem.kind;if(!kind||kind==='xp')continue;let sprite=this.coins.get(gem);if(!sprite){sprite=this.sprite(kind);if(!sprite)continue;this.coins.set(gem,sprite);sprite.userData.born=snapshot.elapsed;}sprite.position.copy(gem.position);this.frame(sprite,kind,snapshot.elapsed-sprite.userData.born);}
  for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.age+=dt;if(e.age>=e.life){this.remove(e.sprite);this.effects.splice(i,1);continue;}e.sprite.position.addScaledVector(e.velocity,dt);this.frame(e.sprite,e.kind,e.age);}
 }
 clear(){this.level=1;this.previous=0;for(const sprite of this.coins.values())this.remove(sprite);this.coins.clear();for(const e of this.effects)this.remove(e.sprite);this.effects=[];}
 dispose(){this.disposed=true;this.clear();for(const texture of this.textures.values())texture.dispose();this.textures.clear();}
}
