import {balance} from './Balance';
import {getEffectsPreferences} from '../core/EffectsPreferences';
import {physics} from '../player/Physics';
import {assetUrl} from '../core/assetUrl';
import * as T from 'three';
import type {Run} from './Run';

// Serialized Unity modules are retained verbatim by the exporter. The browser
// implements their common billboard subset, not Unity's particle/shader engine.
type Data=Record<string,any>;
interface Layer extends Data {pathId:number;name:string;initial:Data;emission:Data;uv:Data;transform:Data;renderer:Data;}
interface Phase {particles:Layer[];}
interface Manifest {phases:Record<'projectile'|'muzzle'|'impact'|'hit',Phase>;materials:Record<string,Data>;}
interface Batch {layer:Layer;mesh:T.Mesh<T.BufferGeometry,T.ShaderMaterial>;positions:Float32Array;velocities:Float32Array;corners:Float32Array;uvs:Float32Array;colors:Float32Array;particles:Particle[];}
interface Particle {position:T.Vector3;velocity:T.Vector3;age:number;life:number;size:number;rotation:number;random:number;color:T.Vector4;emitter:Emitter;}
interface Emitter {batch:Batch;origin:T.Vector3;direction:T.Quaternion;offset:T.Vector3;rotation:T.Quaternion;scale:number;age:number;credit:number;lastPosition:T.Vector3;distance:number;alive:boolean;local:boolean;bursts:Set<string>;}
interface Source {position:T.Vector3;direction:T.Vector3;emitters:Emitter[];transient:boolean;age:number;}
const MAX_PER_LAYER=192,MAX_PARTICLES=2400;
const white={r:1,g:1,b:1,a:1};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
function keys(curve:Data|undefined,t:number){
  const values=curve?.m_Curve as Data[]|undefined;if(!values?.length)return 1;
  if(t<=values[0].time)return values[0].value;
  for(let i=1;i<values.length;i++)if(t<=values[i].time){
    const a=values[i-1],b=values[i],span=b.time-a.time,u=(t-a.time)/span;
    if(!Number.isFinite(a.outSlope)||!Number.isFinite(b.inSlope))return a.value;
    const u2=u*u,u3=u2*u;
    // Hermite tangents are source-backed. Weighted tangent handles are not yet ported.
    return (2*u3-3*u2+1)*a.value+(u3-2*u2+u)*span*(a.outSlope??0)+(-2*u3+3*u2)*b.value+(u3-u2)*span*(b.inSlope??0);
  }return values[values.length-1].value;
}
function value(curve:Data|number|undefined,t:number,r:number,fallback=0):number{
  if(typeof curve==='number')return curve;if(!curve)return fallback;
  const scalar=curve.scalar??fallback;
  switch(curve.minMaxState){
    case 1:return scalar*keys(curve.maxCurve,t);
    case 2:return lerp((curve.minScalar??scalar)*keys(curve.minCurve,t),scalar*keys(curve.maxCurve,t),r);
    case 3:return lerp(curve.minScalar??scalar,scalar,r);
    default:return scalar;
  }
}
function gradient(g:Data|undefined,t:number):T.Vector4{
  if(!g)return new T.Vector4(1,1,1,1);
  const sample=(prefix:string,count:number,channel:string)=>{
    if(count<=0)return 1;
    for(let i=1;i<count;i++){
      const end=(g[`${prefix}${i}`]??65535)/65535;
      if(t<=end){const start=(g[`${prefix}${i-1}`]??0)/65535;return lerp(g[`key${i-1}`]?.[channel]??1,g[`key${i}`]?.[channel]??1,end>start?T.MathUtils.clamp((t-start)/(end-start),0,1):1);}
    }return g[`key${count-1}`]?.[channel]??1;
  };
  return new T.Vector4(sample('ctime',g.m_NumColorKeys??0,'r'),sample('ctime',g.m_NumColorKeys??0,'g'),sample('ctime',g.m_NumColorKeys??0,'b'),sample('atime',g.m_NumAlphaKeys??0,'a'));
}
function color(module:Data|undefined,t:number,r:number):T.Vector4{
  if(!module)return new T.Vector4(1,1,1,1);
  const a=module.minColor??white,b=module.maxColor??white;
  if(module.minMaxState===1)return gradient(module.maxGradient,t);
  if(module.minMaxState===2)return gradient(module.minGradient,t).lerp(gradient(module.maxGradient,t),r);
  if(module.minMaxState===3)return new T.Vector4(lerp(a.r,b.r,r),lerp(a.g,b.g,r),lerp(a.b,b.b,r),lerp(a.a,b.a,r));
  return new T.Vector4(b.r,b.g,b.b,b.a);
}
function position(v:Data|undefined){return new T.Vector3(-(v?.x??0),v?.y??0,v?.z??0);}
function rotation(v:Data|undefined){return new T.Quaternion(v?.x??0,-(v?.y??0),-(v?.z??0),v?.w??1);}

/** Real Firestaff textures and source particle layers, with bounded web simulation. */
export class StaffView {
  private manifest?:Manifest;
  private batches=new Map<number,Batch>();
  private textures=new Map<string,T.Texture>();
  private sources=new Map<object,Source>();
  private seen=new WeakSet<object>();
  private disposed=false;
  private lastElapsed=0;
  constructor(private scene:T.Scene,private random:()=>number=Math.random,private assetBase='weapons/staff/'){}
  async load(){
    const base=assetUrl(this.assetBase);const response=await fetch(base+'manifest.json');if(!response.ok)throw Error('Particle manifest failed to load');
    const manifest=await response.json() as Manifest;
    const paths=new Set<string>();for(const material of Object.values(manifest.materials))if(material.texture?.file)paths.add(material.texture.file);
    await Promise.all([...paths].map(async path=>{const texture=await new T.TextureLoader().loadAsync(base+path);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;if(this.disposed)texture.dispose();else this.textures.set(path,texture);}));
    if(this.disposed)return;this.manifest=manifest;
    for(const phase of Object.values(manifest.phases))for(const layer of phase.particles)this.makeBatch(layer);
  }
  private makeBatch(layer:Layer){
    if(this.batches.has(layer.pathId))return;
    const native=this.manifest!.materials[String(layer.renderer.materialIds?.[0])];
    const texture=this.textures.get(native?.texture?.file);if(!texture)return;
    const positions=new Float32Array(MAX_PER_LAYER*18),velocities=new Float32Array(MAX_PER_LAYER*18),corners=new Float32Array(MAX_PER_LAYER*12),uvs=new Float32Array(MAX_PER_LAYER*12),colors=new Float32Array(MAX_PER_LAYER*24);
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('particleVelocity',new T.BufferAttribute(velocities,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('corner',new T.BufferAttribute(corners,2).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('uv',new T.BufferAttribute(uvs,2).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('particleColor',new T.BufferAttribute(colors,4).setUsage(T.DynamicDrawUsage));geometry.setDrawRange(0,0);
    const tint=native.colors?._TintColor??native.colors?._Color??white;
    // Actual shader pass state is not known. Only an explicit saved One/One pair
    // selects additive here; One/Zero is never mislabeled as additive.
    const additive=native.floats?._SrcBlend===1&&native.floats?._DstBlend===1;
    const material=new T.ShaderMaterial({uniforms:{effectOpacity:{value:1},stretch:{value:layer.renderer.mode===1?layer.renderer.lengthScale??1:0},map:{value:texture},tint:{value:new T.Vector4(tint.r,tint.g,tint.b,tint.a??1)}},transparent:true,depthWrite:false,side:T.DoubleSide,blending:additive?T.AdditiveBlending:T.NormalBlending,
      vertexShader:`attribute vec2 corner;attribute vec3 particleVelocity;attribute vec4 particleColor;uniform float stretch;varying vec2 vUv;varying vec4 vColor;void main(){vUv=uv;vColor=particleColor;vec4 p=modelViewMatrix*vec4(position,1.0);if(stretch>0.0){vec2 v=(modelViewMatrix*vec4(particleVelocity,0.0)).xy;vec2 d=length(v)>0.0001?normalize(v):vec2(0.0,1.0);p.xy+=vec2(d.y,-d.x)*corner.x+d*corner.y*stretch;}else{p.xy+=corner;}gl_Position=projectionMatrix*p;}`,
      fragmentShader:`uniform sampler2D map;uniform vec4 tint;uniform float effectOpacity;varying vec2 vUv;varying vec4 vColor;void main(){gl_FragColor=texture2D(map,vUv)*vColor*tint;gl_FragColor.a*=effectOpacity;if(gl_FragColor.a<0.005)discard;#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`.replace(';#include',';\n#include')});
    const mesh=new T.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=2;this.scene.add(mesh);
    this.batches.set(layer.pathId,{layer,mesh,positions,velocities,corners,uvs,colors,particles:[]});
  }
  private start(key:object,kind:'projectile'|'muzzle'|'impact'|'hit',origin:T.Vector3,direction:T.Vector3){
    const phase=this.manifest!.phases[kind];if(!phase)return;
    const visualScale=kind==='impact'||kind==='hit'?balance.staffImpactVisualScale:balance.staffProjectileVisualScale;
    const source:Source={position:origin.clone(),direction:direction.clone(),emitters:[],transient:kind!=='projectile',age:0};
    const facing=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),direction.clone().normalize());
    for(const layer of phase.particles){const batch=this.batches.get(layer.pathId);if(!batch)continue;
      const transform=layer.composedTransform??layer.transform;
      const emitter:Emitter={batch,origin:origin.clone(),direction:facing.clone(),offset:position(transform?.position),rotation:rotation(transform?.rotation),scale:Math.max(.001,Math.abs(transform?.scale?.x??1)*visualScale),age:0,credit:0,lastPosition:origin.clone(),distance:0,alive:true,local:layer.simulationSpace===0||layer.moveWithTransform===0,bursts:new Set()};
      source.emitters.push(emitter);
    }this.sources.set(key,source);this.seen.add(key);
  }
  private spawn(emitter:Emitter,count:number){
    const batch=emitter.batch,layer=batch.layer,initial=layer.initial??{};
    let total=0;for(const b of this.batches.values())total+=b.particles.length;
    const n=Math.min(MAX_PER_LAYER-batch.particles.length,MAX_PARTICLES-total,Math.max(0,Math.floor(count)));
    const localRotation=emitter.direction.clone().multiply(emitter.rotation),origin=emitter.offset.clone().multiplyScalar(emitter.scale).applyQuaternion(emitter.direction).add(emitter.origin);
    for(let i=0;i<n;i++){
      const random=this.random(),life=Math.max(.015,value(initial.startLifetime,0,random,.3));
      const shape=layer.shape??{},offset=new T.Vector3(),direction=new T.Vector3(0,0,1);
      if(shape.enabled){
        // Sphere/cone sampling approximates Unity's random distribution; dimensions
        // and speed come from the serialized shape/main modules.
        const radius=value(shape.radius?.value??shape.radius,0,random,0),theta=this.random()*Math.PI*2;
        const u=this.random()*2-1;direction.set(Math.sqrt(1-u*u)*Math.cos(theta),u,Math.sqrt(1-u*u)*Math.sin(theta));
        if(shape.type===4||shape.type===8){const angle=(shape.angle??25)*Math.PI/180;direction.set(Math.sin(angle)*Math.cos(theta),Math.sin(angle)*Math.sin(theta),Math.cos(angle));}
        offset.copy(direction).multiplyScalar(radius*Math.cbrt(this.random()));offset.add(position(shape.m_Position));
      }
      offset.multiplyScalar(emitter.scale).applyQuaternion(localRotation);
      const speed=value(initial.startSpeed,0,random,0)*emitter.scale;
      const particle:Particle={position:origin.clone().add(offset),velocity:direction.applyQuaternion(localRotation).multiplyScalar(speed),age:0,life,size:Math.max(.001,value(initial.startSize,0,random,1)*emitter.scale),rotation:value(initial.startRotation,0,random,0),random,color:color(initial.startColor,0,random),emitter};
      if(emitter.local)particle.position.sub(emitter.origin);
      batch.particles.push(particle);
    }
  }
  update(run:Run,delta:number){
    if(!this.manifest)return;
    const opacity=getEffectsPreferences().particlesOpacity;
    for(const batch of this.batches.values()){batch.mesh.material.uniforms.effectOpacity.value=opacity;batch.mesh.visible=opacity>0;}
    const elapsed=run.snapshot().elapsed;
    if(elapsed<this.lastElapsed||elapsed===0&&this.lastElapsed>0)this.clear();this.lastElapsed=elapsed;
    const dt=Math.max(0,Math.min(delta,.1));
    const active=new Set<object>();
    for(const bolt of run.bolts){active.add(bolt);if(!this.seen.has(bolt))this.start(bolt,'projectile',bolt.position,bolt.velocity);const source=this.sources.get(bolt);if(source){source.position.copy(bolt.position);source.direction.copy(bolt.velocity).normalize();}}
    for(const effect of run.staffEffects){active.add(effect);if(!this.seen.has(effect))this.start(effect,effect.kind,effect.position,effect.direction);}
    for(const [key,source] of this.sources){
      source.age+=dt;
      const facing=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),source.direction.clone().normalize());
      for(const emitter of source.emitters){
        const layer=emitter.batch.layer,emission=layer.emission??{},duration=Math.max(.01,layer.duration??.5),oldAge=emitter.age;
        emitter.origin.copy(source.position);emitter.direction.copy(facing);
        emitter.distance=emitter.lastPosition.distanceTo(source.position);emitter.lastPosition.copy(source.position);
        emitter.alive=source.transient?emitter.age<duration:active.has(key);
        if(emitter.alive&&(dt>0||emitter.age===0)&&emission.enabled!==false){
          const t=(emitter.age%duration)/duration;
          const rate=value(emission.rateOverTime,t,.5,0),distanceRate=value(emission.rateOverDistance,t,.5,0);
          emitter.credit+=rate*dt+distanceRate*emitter.distance;
          const count=Math.floor(emitter.credit);emitter.credit-=count;this.spawn(emitter,count);
          const firstCycle=layer.loop?Math.floor(oldAge/duration):0;
          const lastCycle=layer.loop?Math.floor((oldAge+dt)/duration):0;
          for(let cycle=firstCycle;cycle<=lastCycle;cycle++)for(const [burstIndex,burst] of (emission.m_Bursts??[]).entries()){
            const repeat=Math.max(.001,burst.repeatInterval??duration);
            const repeats=burst.cycleCount>0?Math.min(64,burst.cycleCount):Math.min(64,Math.ceil(duration/repeat));
            for(let j=0;j<repeats;j++){
              const burstTime=cycle*duration+(burst.time??0)+j*repeat,key=`${cycle}:${burstIndex}:${j}`;
              if(burstTime>=(cycle+1)*duration)break;
              if(oldAge<=burstTime&&oldAge+dt>=burstTime&&!emitter.bursts.has(key)){
                emitter.bursts.add(key);if(this.random()<=(burst.probability??1))this.spawn(emitter,value(burst.countCurve,0,this.random(),1));
              }
            }
          }
        }
        emitter.age+=dt;
      }
      if(!source.emitters.some(e=>e.alive||e.batch.particles.some(p=>p.emitter===e)))this.sources.delete(key);
    }
    for(const batch of this.batches.values()){
      for(let i=batch.particles.length-1;i>=0;i--){const p=batch.particles[i];p.age+=dt;if(p.age>=p.life){batch.particles.splice(i,1);continue;}p.position.addScaledVector(p.velocity,dt);const gravity=value(batch.layer.initial?.gravityModifier,p.age/p.life,p.random,0);p.velocity.y+=physics.gravity*gravity*dt;}
      this.draw(batch);
    }
  }
  private draw(batch:Batch){
    const layer=batch.layer,uv=layer.uv??{},tilesX=Math.max(1,uv.enabled?uv.tilesX??1:1),tilesY=Math.max(1,uv.enabled?uv.tilesY??1:1);
    const texture=batch.mesh.material.uniforms.map.value as T.Texture;
    const image=texture.image as {width?:number;height?:number}|undefined;
    const insetX=.5/Math.max(1,image?.width??1),insetY=.5/Math.max(1,image?.height??1);
    const quad=[[-.5,-.5,0,0],[.5,-.5,1,0],[.5,.5,1,1],[-.5,-.5,0,0],[.5,.5,1,1],[-.5,.5,0,1]];
    batch.particles.forEach((p,index)=>{
      const t=p.age/p.life,sizeModule=layer.sizeOverLifetime??{},size=p.size*(sizeModule.enabled?value(sizeModule.curve,t,p.random,1):1);
      const c=p.color.clone();if(layer.colorOverLifetime?.enabled){const g=color(layer.colorOverLifetime.gradient,t,p.random);c.multiply(g);}
      let frame=0;if(uv.enabled){const start=value(uv.startFrame,0,p.random,0),progress=value(uv.frameOverTime,t,p.random,t)*(uv.cycles??1);const count=uv.animationType===1?tilesX:tilesX*tilesY;frame=Math.min(count-1,Math.max(0,Math.floor(((start+progress)%1)*count)));}
      const row=uv.animationType===1?T.MathUtils.clamp(uv.rowIndex??0,0,tilesY-1):Math.floor(frame/tilesX),column=frame%tilesX;
      const world=p.position.clone();if(p.emitter.local)world.add(p.emitter.origin);
      const cos=Math.cos(p.rotation),sin=Math.sin(p.rotation);
      for(let j=0;j<6;j++){const q=quad[j],v=index*6+j;batch.positions.set([world.x,world.y,world.z],v*3);batch.velocities.set([p.velocity.x,p.velocity.y,p.velocity.z],v*3);batch.corners.set([(q[0]*cos-q[1]*sin)*size,(q[0]*sin+q[1]*cos)*size],v*2);batch.uvs.set([(column+q[2])/tilesX+(q[2]===0?insetX:-insetX),1-(row+1-q[3])/tilesY+(q[3]===0?insetY:-insetY)],v*2);batch.colors.set([c.x,c.y,c.z,c.w],v*4);}
    });
    const geometry=batch.mesh.geometry;geometry.setDrawRange(0,batch.particles.length*6);for(const name of ['position','particleVelocity','corner','uv','particleColor'])geometry.getAttribute(name).needsUpdate=true;
  }
  reset(){this.clear();this.lastElapsed=0;}
  private clear(){this.sources.clear();this.seen=new WeakSet();for(const batch of this.batches.values()){batch.particles.length=0;batch.mesh.geometry.setDrawRange(0,0);}}
  dispose(){this.disposed=true;this.clear();for(const batch of this.batches.values()){this.scene.remove(batch.mesh);batch.mesh.geometry.dispose();batch.mesh.material.dispose();}for(const texture of this.textures.values())texture.dispose();this.batches.clear();this.textures.clear();}
}
