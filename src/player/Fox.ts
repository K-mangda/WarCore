import {assetUrl} from '../core/assetUrl';
import {playtestMovement} from './Physics';
import * as T from 'three';

interface RigNode {name:string;position:number[];rotation:number[];scale:number[];children:number[];}
interface RigTrack {node:number;property:'position'|'quaternion';times:number[];values:number[];}
interface RigClip {name:string;duration:number;loop:boolean;tracks:RigTrack[];}
interface FoxRig {nodes:RigNode[];root:number;meshNode:number;positions:number[];normals:number[];uv:number[];indices:number[];joints:number[];weights:number[];skinIndices:number[];inverseBindMatrices:number[][];clips:RigClip[];texture:string;}

export class Fox {
  readonly root=new T.Group();
  private model=new T.Group();
  private geometry:T.BufferGeometry|null=null;
  private material:T.MeshLambertMaterial|null=null;
  private texture:T.Texture|null=null;
  private skeleton:T.Skeleton|null=null;
  private mixer:T.AnimationMixer|null=null;
  private actions=new Map<string,T.AnimationAction>();
  private current:T.AnimationAction|null=null;
  private disposed=false;

  async load():Promise<void>{
    const response=await fetch(assetUrl('megabonk/fox-rig.json'));
    if(!response.ok)throw new Error(`Fox rig failed to load (${response.status})`);
    const rig=await response.json() as FoxRig;
    if(rig.weights.length!==rig.positions.length/3*4 || rig.joints.length!==rig.inverseBindMatrices.length)throw new Error('Incomplete Fox skin data');
    const texture=await new T.TextureLoader().loadAsync(assetUrl('megabonk/'+encodeURIComponent(rig.texture)));
    if(this.disposed){texture.dispose();return;}
    this.texture=texture;texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestMipmapLinearFilter;
    this.geometry=new T.BufferGeometry();
    this.geometry.setAttribute('position',new T.Float32BufferAttribute(rig.positions,3));
    this.geometry.setAttribute('normal',new T.Float32BufferAttribute(rig.normals,3));
    this.geometry.setAttribute('uv',new T.Float32BufferAttribute(rig.uv,2));
    this.geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(rig.skinIndices,4));
    this.geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(rig.weights,4));
    this.geometry.setIndex(rig.indices);
    this.material=new T.MeshLambertMaterial({map:texture});
    const nodes=rig.nodes.map(data=>{
      const bone=new T.Bone();bone.name=data.name;
      bone.position.fromArray(data.position);bone.quaternion.fromArray(data.rotation);bone.scale.fromArray(data.scale);return bone;
    });
    rig.nodes.forEach((data,i)=>data.children.forEach(child=>nodes[i].add(nodes[child])));
    this.model.add(nodes[rig.root]);this.root.add(this.model);
    const mesh=new T.SkinnedMesh(this.geometry,this.material);mesh.name='FoxDefault';mesh.frustumCulled=false;
    nodes[rig.meshNode].add(mesh);
    this.skeleton=new T.Skeleton(rig.joints.map(index=>nodes[index]),rig.inverseBindMatrices.map(matrix=>new T.Matrix4().fromArray(matrix)));
    this.model.updateMatrixWorld(true);mesh.bind(this.skeleton,new T.Matrix4());
    this.model.updateMatrixWorld(true);this.skeleton.update();
    const bounds=new T.Box3().setFromObject(this.model,true);
    const height=bounds.max.y-bounds.min.y;
    if(!Number.isFinite(height)||height<=0)throw new Error('Fox bind pose has invalid bounds');
    const fit=1.8/height;this.model.scale.setScalar(fit);this.model.position.y=-bounds.min.y*fit;
    this.mixer=new T.AnimationMixer(this.model);
    for(const clip of rig.clips){
      const tracks=clip.tracks.map(track=>track.property==='quaternion'
        ?new T.QuaternionKeyframeTrack(nodes[track.node].uuid+'.quaternion',track.times,track.values)
        :new T.VectorKeyframeTrack(nodes[track.node].uuid+'.position',track.times,track.values));
      const action=this.mixer.clipAction(new T.AnimationClip(clip.name,clip.duration,tracks));
      action.setLoop(clip.loop?T.LoopRepeat:T.LoopOnce,clip.loop?Infinity:1);action.clampWhenFinished=!clip.loop;
      this.actions.set(clip.name,action);
    }
    this.play('FoxIdle');this.mixer.update(0);
  }

  /** Deterministic raw-clip inspection for Lab; does not alter gameplay state selection. */
  preview(clip:string,time:number,yaw:number){
    const action=this.actions.get(clip);if(!action||!this.mixer)return;
    this.root.position.set(0,0,0);this.root.rotation.y=yaw+Math.PI;
    this.mixer.stopAllAction();action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
    this.current=action;this.mixer.setTime(Math.max(0,time));this.root.updateMatrixWorld(true);
  }
  clipDuration(clip:string){return this.actions.get(clip)?.getClip().duration??0;}

  private play(name:string){
    const action=this.actions.get(name);if(!action||action===this.current)return;
    action.reset().fadeIn(.12).play();this.current?.fadeOut(.12);this.current=action;
  }
  update(position:T.Vector3,yaw:number,speed:number,grounded:boolean,vertical:number,dt:number){
    this.root.position.copy(position);this.root.rotation.y=yaw+Math.PI;
    this.play(!grounded?(vertical>0?'FoxJump4':'FoxFalling'):speed>.1?'FoxRun':'FoxIdle');
    this.current?.setEffectiveTimeScale(grounded?1:playtestMovement.airTimeScale);
    this.mixer?.update(dt);
  }
  dispose(){this.disposed=true;this.mixer?.stopAllAction();this.mixer?.uncacheRoot(this.model);this.skeleton?.dispose();this.geometry?.dispose();this.material?.dispose();this.texture?.dispose();}
}
