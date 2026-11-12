import {assetUrl} from '../core/assetUrl';
import {balance} from './Balance';
import {placeSwordSlash,orientSwordArc} from './SwordPose';
import * as T from 'three';
import type {Run} from './Run';
interface Curve {scalar:number;maxCurve:{m_Curve:{time:number;value:number}[]};}
interface RGBA {r:number;g:number;b:number;a:number;}
interface Particle {source:{pathId:number};initialModule:{startRotationX:Curve;startRotationY:Curve;startRotation:Curve;startLifetime:Curve;startSpeed:Curve;startSize:Curve;startColor:{maxColor:RGBA}};colorModule:{enabled:boolean;gradient:{maxGradient:{key0:RGBA;key1:RGBA}}};material:{extraGlow:number};uvModule:{tilesX:number;tilesY:number;rowIndex:number;frameOverTime:Curve};}
/** Source quad/atlas/configuration; web placement, fade and shader mapping remain provisional. */
export class SwordView {
  private geometry?:T.BufferGeometry;
  private atlas?:T.Texture;
  private particle?:Particle;
  private frames:{visible:boolean;center:number[]}[]=[];
  private meshes:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[];
  private disposed=false;
  constructor(private scene:T.Scene){}
  async load(){
    const base=assetUrl('weapons/knight-sword/');
    const json=async(path:string)=>{const r=await fetch(base+path);if(!r.ok)throw Error(`Sword asset unavailable: ${path}`);return r.json();};
    const [mesh,particles,alignment,atlas]=await Promise.all([json('slash-mesh.json'),json('particle.json'),json('frame-alignment.json'),new T.TextureLoader().loadAsync(base+'vfx/textures/Atlas03.png')]);
    if(this.disposed){atlas.dispose();return;}
    this.atlas=atlas;atlas.colorSpace=T.SRGBColorSpace;atlas.magFilter=T.NearestFilter;atlas.minFilter=T.NearestFilter;atlas.generateMipmaps=false;
    this.particle=particles as Particle;this.frames=alignment.frames;
    if(this.particle.source.pathId!==7070)throw Error('Expected Knight Sword particle, not HeroSword');
    const geometry=this.geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(mesh.positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(mesh.uv,2));geometry.setIndex(mesh.indices);
  }
  update(run:Run){
    if(!this.geometry||!this.atlas||!this.particle)return;
    const p=this.particle,uv=p.uvModule,color=p.initialModule.startColor.maxColor;
    while(this.meshes.length<run.slashes.length){
      const map=this.atlas.clone();map.repeat.set(1/uv.tilesX,1/uv.tilesY);
      // Native BasicGlow forward pass uses alpha blending; glow equation remains approximate.
      const material=new T.MeshBasicMaterial({map,color:new T.Color(color.r,color.g,color.b),transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});
      const mesh=new T.Mesh(this.geometry,material);mesh.frustumCulled=false;this.meshes.push(mesh);this.scene.add(mesh);
    }
    this.meshes.forEach((mesh,i)=>{
      const slash=run.slashes[i];mesh.visible=!!slash;if(!slash)return;
      const elapsed=slash.duration-slash.life;
      const age=Math.min(1,elapsed/p.initialModule.startLifetime.scalar);
      mesh.visible=age<1;if(!mesh.visible)return;
      const curve=uv.frameOverTime.maxCurve.m_Curve,first=curve[0],last=curve[curve.length-1];
      const value=first&&last?(first.value+(last.value-first.value)*age)*uv.frameOverTime.scalar:age;
      const frame=Math.min(uv.tilesX-1,Math.max(0,Math.floor(value*uv.tilesX)));
      const pivot=this.frames[frame];if(!pivot?.visible){mesh.visible=false;return;}
      mesh.material.map!.offset.set(frame/uv.tilesX,1-(uv.rowIndex+1)/uv.tilesY);
      const gradient=p.colorModule.gradient.maxGradient;
      const start=p.colorModule.enabled?gradient.key0:color,end=p.colorModule.enabled?gradient.key1:color;
      // Preserve source gradient; native HDR glow/postprocessing is not reproduced.
      mesh.material.color.setRGB(start.r+(end.r-start.r)*age,start.g+(end.g-start.g)*age,start.b+(end.b-start.b)*age);
      mesh.material.opacity=start.a+(end.a-start.a)*age;
      placeSwordSlash(mesh,slash.position,slash.direction,{x:p.initialModule.startRotationX.scalar,y:p.initialModule.startRotationY.scalar,z:p.initialModule.startRotation.scalar});
      mesh.position.addScaledVector(slash.direction,p.initialModule.startSpeed.scalar*elapsed);
      mesh.scale.setScalar(p.initialModule.startSize.scalar*balance.swordVisualScale);
      orientSwordArc(mesh,this.frames[0].center,slash.direction);
    });
  }
  dispose(){this.disposed=true;for(const mesh of this.meshes){this.scene.remove(mesh);mesh.material.map?.dispose();mesh.material.dispose();}this.geometry?.dispose();this.atlas?.dispose();}
}
