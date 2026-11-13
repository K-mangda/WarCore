import * as T from 'three';
import {assetUrl} from '../core/assetUrl';
import {balance} from '../combat/Balance';
import type {Run,EnemyRemains} from '../combat/Run';
import type {Enemy,EnemyKind} from './Swarm';
import {damageMaterial} from './DamageMaterial';
interface Frame {positions:number[];uv:number[];indices:number[];}
interface Animation {fps:number;frames:Frame[];texture:string;}
export function skeletonFrame(time:number,id:number,fps:number,count:number,moving=true){return moving?Math.floor(Math.max(0,time)*fps+(id%count))%count:0;}
/** Baked native meshes, one instanced batch per frame; no per-enemy skinning. */
export class BakedEnemyView {
 private batches:T.InstancedMesh<T.BufferGeometry,T.MeshLambertMaterial>[]=[];
 private frustum=new T.Frustum();private projection=new T.Matrix4();private sphere=new T.Sphere(new T.Vector3(),1.3);
 private matrix=new T.Matrix4();private rotation=new T.Quaternion();private up=new T.Vector3(0,1,0);private unitScale=new T.Vector3(1,1,1);
 private texture?:T.Texture;private fps=8;private disposed=false;
 constructor(private scene:T.Scene,private camera?:T.Camera,private species:EnemyKind='skeleton'){}
 async load(){
  const r=await fetch(assetUrl(`enemies/${this.species}/animation.json`));if(!r.ok)throw Error(`${this.species} animation unavailable`);const data=await r.json() as Animation;
  const texture=await new T.TextureLoader().loadAsync(assetUrl(`enemies/${this.species}/`+data.texture));
  if(this.disposed){texture.dispose();return;}this.texture=texture;this.fps=data.fps;
  texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;
  const material=damageMaterial(texture),capacity=balance.maxEnemies*2;
  for(const frame of data.frames){
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(frame.positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(frame.uv,2));geometry.setIndex(frame.indices);geometry.computeVertexNormals();
   geometry.setAttribute('damageFlash',new T.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage));geometry.setAttribute('dissolve',new T.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage));
   const mesh=new T.InstancedMesh(geometry,material,capacity);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.count=0;mesh.frustumCulled=false;this.batches.push(mesh);this.scene.add(mesh);
  }
 }
 update(run:Run,player:T.Vector3){this.render(run.swarm.enemies,run.remains,run.snapshot().elapsed,player);}
 render(enemies:readonly Enemy[],remains:readonly EnemyRemains[],elapsed:number,player:T.Vector3){
  if(!this.batches.length)return;for(const mesh of this.batches)mesh.count=0;
  const matrix=this.matrix,rotation=this.rotation,up=this.up,scale=this.unitScale;
  if(this.camera)this.frustum.setFromProjectionMatrix(this.projection.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse));
  const put=(frame:number,position:T.Vector3,heading:number,flash:number,dissolve:number)=>{
   if(this.camera){this.sphere.center.copy(position).y+=.8;if(!this.frustum.intersectsSphere(this.sphere))return;}
   const mesh=this.batches[frame],index=mesh.count++;rotation.setFromAxisAngle(up,heading);matrix.compose(position,rotation,scale);mesh.setMatrixAt(index,matrix);
   (mesh.geometry.getAttribute('damageFlash') as T.InstancedBufferAttribute).setX(index,flash);
   (mesh.geometry.getAttribute('dissolve') as T.InstancedBufferAttribute).setX(index,dissolve);
  };
  for(const enemy of enemies){
   if((enemy.kind??'skeleton')!==this.species)continue;
   const moving=(enemy.position.x-player.x)**2+(enemy.position.z-player.z)**2>.5;
   put(skeletonFrame(elapsed,enemy.id,this.fps,this.batches.length,moving),enemy.position,Math.atan2(player.x-enemy.position.x,player.z-enemy.position.z),enemy.flash>0?1:0,0);
  }
  for(const corpse of remains)if((corpse.kind??'skeleton')===this.species)put(skeletonFrame(corpse.animationTime??elapsed,corpse.id??0,this.fps,this.batches.length),corpse.position,corpse.heading,1,1-corpse.life/corpse.duration);
  for(const mesh of this.batches){
   mesh.visible=mesh.count>0;if(!mesh.count)continue;
   for(const [attribute,components] of [[mesh.instanceMatrix,16],[mesh.geometry.getAttribute('damageFlash'),1],[mesh.geometry.getAttribute('dissolve'),1]] as [T.BufferAttribute|T.InstancedBufferAttribute,number][]){
    attribute.clearUpdateRanges();attribute.addUpdateRange(0,mesh.count*components);attribute.needsUpdate=true;
   }
  }
 }
 dispose(){this.disposed=true;const material=this.batches[0]?.material;for(const mesh of this.batches){this.scene.remove(mesh);mesh.geometry.dispose();mesh.dispose();}material?.dispose();this.texture?.dispose();this.batches=[];}
}
