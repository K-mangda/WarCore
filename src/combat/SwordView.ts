import * as T from 'three';
import type {Run} from './Run';
interface Curve {scalar:number;maxCurve:{m_Curve:{time:number;value:number}[]};}
interface Particle {source:{pathId:number};initialModule:{startSize:Curve;startColor:{maxColor:{r:number;g:number;b:number;a:number}}};uvModule:{tilesX:number;tilesY:number;rowIndex:number;frameOverTime:Curve};}
/** Source quad/atlas/configuration; web placement, fade and shader mapping remain provisional. */
export class SwordView {
  private geometry?:T.BufferGeometry;
  private atlas?:T.Texture;
  private particle?:Particle;
  private meshes:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[];
  private disposed=false;
  constructor(private scene:T.Scene){}
  async load(){
    const base='/weapons/sword/';
    const json=async(path:string)=>{const r=await fetch(base+path);if(!r.ok)throw Error(`Sword asset unavailable: ${path}`);return r.json();};
    const [mesh,particles,atlas]=await Promise.all([json('slash-mesh.json'),json('metadata/particles.json'),new T.TextureLoader().loadAsync(base+'vfx/textures/atlas03_Custom.png')]);
    if(this.disposed){atlas.dispose();return;}
    this.atlas=atlas;atlas.colorSpace=T.SRGBColorSpace;atlas.magFilter=T.NearestFilter;
    this.particle=(particles as Particle[]).find(p=>p.source.pathId===7039);
    const geometry=this.geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(mesh.positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(mesh.uv,2));geometry.setIndex(mesh.indices);
  }
  update(run:Run){
    if(!this.geometry||!this.atlas||!this.particle)return;
    const p=this.particle,uv=p.uvModule,color=p.initialModule.startColor.maxColor;
    while(this.meshes.length<run.slashes.length){
      const map=this.atlas.clone();map.repeat.set(1/uv.tilesX,1/uv.tilesY);
      // Normal transparency is a web approximation; native shader behavior is not ported.
      const material=new T.MeshBasicMaterial({map,color:new T.Color(color.r,color.g,color.b),transparent:true,depthWrite:false,side:T.DoubleSide});
      const mesh=new T.Mesh(this.geometry,material);mesh.frustumCulled=false;this.meshes.push(mesh);this.scene.add(mesh);
    }
    this.meshes.forEach((mesh,i)=>{
      const slash=run.slashes[i];mesh.visible=!!slash;if(!slash)return;
      const age=1-slash.life/slash.duration;
      const curve=uv.frameOverTime.maxCurve.m_Curve,first=curve[0],last=curve[curve.length-1];
      const value=first&&last?(first.value+(last.value-first.value)*age)*uv.frameOverTime.scalar:age;
      const frame=Math.min(uv.tilesX-1,Math.max(0,Math.floor(value*uv.tilesX)));
      mesh.material.map!.offset.set(frame/uv.tilesX,1-(uv.rowIndex+1)/uv.tilesY);
      mesh.material.opacity=color.a*Math.min(1,slash.life/.08);
      mesh.position.copy(slash.position).addScaledVector(slash.direction,1.8);
      mesh.rotation.set(-Math.PI/2,0,Math.atan2(slash.direction.x,-slash.direction.z));
      mesh.scale.setScalar(p.initialModule.startSize.scalar);
    });
  }
  dispose(){this.disposed=true;for(const mesh of this.meshes){this.scene.remove(mesh);mesh.material.map?.dispose();mesh.material.dispose();}this.geometry?.dispose();this.atlas?.dispose();}
}
