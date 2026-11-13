import * as T from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {assetUrl} from '../core/assetUrl';
interface Manifest {mesh:string;texture:string|null;tint:[number,number,number];textureScale:[number,number];textureOffset:[number,number];}
/** Inspection gallery for existing exports. No combat simulation or inferred sound triggers. */
export class WeaponModelPreview {
 private models=new Map<string,T.Group>();private disposed=false;
 constructor(private scene:T.Scene){}
 async load(id:string){
  const base=assetUrl(`weapons/models/${id}/`),response=await fetch(base+'manifest.json');
  if(!response.ok)throw Error(`Model unavailable: ${id}`);
  const data=await response.json() as Manifest;
  const [meshResult,textureResult]=await Promise.allSettled([new OBJLoader().loadAsync(base+data.mesh),data.texture?new T.TextureLoader().loadAsync(base+data.texture):Promise.resolve(undefined)]);
  if(meshResult.status==='rejected'||textureResult.status==='rejected'){
   if(meshResult.status==='fulfilled')this.release(meshResult.value);
   if(textureResult.status==='fulfilled')textureResult.value?.dispose();
   throw Error(`Could not load model files: ${id}`);
  }
  const object=meshResult.value,texture=textureResult.value;
  if(texture){texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.fromArray(data.textureScale);texture.offset.fromArray(data.textureOffset);}
  const material=new T.MeshLambertMaterial({map:texture??null,color:new T.Color(...data.tint),side:T.DoubleSide});
  object.traverse(node=>{if(node instanceof T.Mesh){const old=Array.isArray(node.material)?node.material:[node.material];old.forEach(m=>m.dispose());node.material=material;}});
  const box=new T.Box3().setFromObject(object),size=box.getSize(new T.Vector3()),longest=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(longest)||longest<=0){this.release(object);throw Error(`Invalid model bounds: ${id}`);}
  object.position.sub(box.getCenter(new T.Vector3()));
  const normalized=new T.Group();normalized.add(object);normalized.scale.setScalar(2/longest);
  const root=new T.Group();root.add(normalized);root.position.y=1.25;root.visible=false;
  if(this.disposed){this.release(root);return;}
  this.models.set(id,root);this.scene.add(root);
 }
 update(id:string|undefined,yaw:number){for(const [key,root] of this.models){root.visible=key===id;if(root.visible)root.rotation.y=yaw;}}
 private release(root:T.Object3D){
  const materials=new Set<T.Material>();
  root.traverse(node=>{if(node instanceof T.Mesh){node.geometry.dispose();for(const material of Array.isArray(node.material)?node.material:[node.material])materials.add(material);}});
  for(const material of materials){if(material instanceof T.MeshLambertMaterial)material.map?.dispose();material.dispose();}
 }
 dispose(){this.disposed=true;for(const root of this.models.values()){this.scene.remove(root);this.release(root);}this.models.clear();}
}
