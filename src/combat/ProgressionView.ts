import {xpVisual} from './XpAppearance';
import * as T from 'three';
import {assetUrl} from '../core/assetUrl';
import type {Run,Gem} from './Run';
type Data=Record<string,any>;
/** Native atlas art; bounded billboard subset of serialized Unity particles. */
export class ProgressionView {
 private data?:Data;private textures=new Map<string,T.Texture>();private coins=new Map<Gem,T.Sprite>();
 private effects:{sprite:T.Sprite;age:number;life:number;velocity:T.Vector3;kind:string}[]=[];
 private cameraRotation=new T.Quaternion();
 private level=1;private previous=0;private disposed=false;
 constructor(private scene:T.Scene){
  // Sprite onBeforeRender supplies the actual rendering camera in game and Lab.
 }
 async load(){
  const r=await fetch(assetUrl('progression/manifest.json'));if(!r.ok)throw Error('Progression manifest unavailable');this.data=await r.json();
  await Promise.all(['gold','silver','burst','text'].map(async kind=>{const texture=await new T.TextureLoader().loadAsync(assetUrl(`progression/${kind}.png`));if(this.disposed){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;this.textures.set(kind,texture);}));
 }
 private sprite(kind:string){
  const texture=this.textures.get(kind)?.clone();if(!texture)return;
  texture.needsUpdate=true;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));if(kind==='text')sprite.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float ink=max(sampledDiffuseColor.r,max(sampledDiffuseColor.g,sampledDiffuseColor.b));
 diffuseColor.a*=smoothstep(.22,.45,ink);`);};sprite.onBeforeRender=(_renderer,_scene,camera)=>{this.cameraRotation.copy(camera.quaternion);};this.scene.add(sprite);return sprite;
 }
 private frame(sprite:T.Sprite,kind:string,age:number){
  const source=this.data!.sprites[kind],p=source.particle,uv=p.UVModule,initial=p.InitialModule;
  const count=source.frames,start=Math.floor(uv.startFrame.scalar*count),frame=Math.min(count-1,start+Math.floor(Math.min(1,age/initial.startLifetime.scalar)*uv.frameOverTime.scalar*count));
  const coin=kind==='gold'||kind==='silver',activeFrames=Math.max(1,Math.ceil(uv.frameOverTime.scalar*count));
  const selectedFrame=coin?start+Math.floor(age/initial.startLifetime.scalar*activeFrames)%activeFrames:frame;
  sprite.material.map!.repeat.set(1/count,1);sprite.material.map!.offset.set(selectedFrame/count,0);
  sprite.scale.setScalar(kind==='gold'||kind==='silver'?xpVisual.scale:initial.startSize.scalar*(kind==='text'?.45:1));
  if(kind==='text'){
   const g=p.ColorModule.gradient.maxGradient,a=g.key0,b=g.key1;
   const t=T.MathUtils.clamp(age/initial.startLifetime.scalar/(g.ctime1/65535),0,1);
   sprite.material.color.setRGB(a.r+(b.r-a.r)*t,a.g+(b.g-a.g)*t,a.b+(b.b-a.b)*t,T.SRGBColorSpace);
   sprite.material.toneMapped=false;
   const enter=1-Math.pow(1-T.MathUtils.clamp(age/.14,0,1),3);
   const exit=T.MathUtils.clamp((initial.startLifetime.scalar-age)/.16,0,1);
   sprite.scale.multiplyScalar(.2+.8*enter);
   // End by squeezing left/right into the center, not shrinking vertically.
   sprite.scale.x*=exit*exit;
   sprite.material.opacity=1;
  }
  if(kind==='gold'||kind==='silver'){const c=initial.startColor.maxColor;sprite.material.color.setRGB(c.r,c.g,c.b,T.SRGBColorSpace);sprite.material.opacity=c.a;sprite.material.toneMapped=false;}
 }
 burst(player:T.Vector3){
  if(!this.data)return;
  for(const kind of ['burst','text']){
   const initial=this.data.sprites[kind].particle.InitialModule;
   const count=kind==='text'?1:Math.min(32,this.data.sprites[kind].particle.EmissionModule.m_Bursts[0].countCurve.scalar);
   for(let i=0;i<count;i++){
    const sprite=this.sprite(kind);if(!sprite)continue;sprite.position.copy(player).y+=kind==='text'?1.85:1;
    const life=initial.startLifetime.minMaxState===3?T.MathUtils.lerp(initial.startLifetime.minScalar,initial.startLifetime.scalar,Math.random()):initial.startLifetime.scalar;
    const angle=i/count*Math.PI*2,speed=kind==='text'?0:T.MathUtils.lerp(7,12,Math.random());
    if(kind==='text'){sprite.userData.anchor=sprite.position.clone();sprite.userData.sway=Math.random()<.5?-1:1;}
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
  for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.age+=dt;if(e.age>=e.life){this.remove(e.sprite);this.effects.splice(i,1);continue;}e.sprite.position.addScaledVector(e.velocity,dt);
   if(e.kind==='text'){
    const anchor=e.sprite.userData.anchor as T.Vector3;
    e.sprite.position.copy(anchor);e.sprite.position.y+=e.age*.35;
    // Local camera-right sway stays sideways on screen at every viewing angle.
    const cameraRight=new T.Vector3(1,0,0).applyQuaternion(this.cameraRotation);
    e.sprite.position.addScaledVector(cameraRight,Math.sin(Math.PI*e.age/e.life)*.055*e.sprite.userData.sway);
    e.sprite.material.rotation=Math.sin(Math.PI*e.age/e.life)*.07*e.sprite.userData.sway;
   }
   this.frame(e.sprite,e.kind,e.age);}
 }
 clear(){this.level=1;this.previous=0;for(const sprite of this.coins.values())this.remove(sprite);this.coins.clear();for(const e of this.effects)this.remove(e.sprite);this.effects=[];}
 dispose(){this.disposed=true;this.clear();for(const texture of this.textures.values())texture.dispose();this.textures.clear();}
}
