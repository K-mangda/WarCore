import {damageMaterial} from '../enemies/DamageMaterial';
import {PickupNumbers} from './PickupNumbers';
import {ProgressionView} from './ProgressionView';
import {StaffView} from './StaffView';
import {assetUrl} from '../core/assetUrl';
import {DamageNumbers} from './DamageNumbers';
import {SwordView} from './SwordView';
import * as T from 'three';
import type {Run} from './Run';
import {balance} from './Balance';
import {XpView} from './XpView';
interface MeshData {pos:number[];uv:number[];idx:number[];tex:string;}
export class CombatView {
  private enemies:T.InstancedMesh|null=null;
  private staff:StaffView;private previousElapsed=0;
  private gems:XpView;private progression:ProgressionView;private pickupNumbers:PickupNumbers;
  private labels:T.Sprite[]=[];private numbers=new DamageNumbers();
  private disposed=false;
  private sword:SwordView;
  constructor(private scene:T.Scene,camera:T.PerspectiveCamera,viewport:()=>{width:number;height:number}){this.sword=new SwordView(scene);this.staff=new StaffView(scene);this.gems=new XpView(scene);this.progression=new ProgressionView(scene);this.pickupNumbers=new PickupNumbers(scene,camera,viewport);}
  async load(){
    await Promise.all([this.sword.load(),this.staff.load(),this.numbers.load(),this.gems.load(),this.progression.load(),this.pickupNumbers.load()]);
    const response=await fetch(assetUrl('combat/skeleton.json'));if(!response.ok)throw new Error('Skeleton visual failed to load');
    const data=await response.json() as MeshData;
    const texture=await new T.TextureLoader().loadAsync(assetUrl('combat/'+encodeURIComponent(data.tex)));
    if(this.disposed){texture.dispose();return;}
    texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data.pos,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(data.uv,2));geometry.setIndex(data.idx);geometry.computeVertexNormals();geometry.computeBoundingBox();
    const box=geometry.boundingBox!,size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    geometry.translate(-center.x,-box.min.y,-center.z);geometry.scale(1.6/size.y,1.6/size.y,1.6/size.y);
    geometry.setAttribute('damageFlash',new T.InstancedBufferAttribute(new Float32Array(balance.maxEnemies*2),1));geometry.setAttribute('dissolve',new T.InstancedBufferAttribute(new Float32Array(balance.maxEnemies*2),1));
    this.enemies=new T.InstancedMesh(geometry,damageMaterial(texture),balance.maxEnemies*2);this.enemies.count=0;this.enemies.frustumCulled=false;this.scene.add(this.enemies);
  }
  update(run:Run,player:T.Vector3,dt=0){
    this.progression.update(run,player,dt);this.pickupNumbers.update(run,dt,player);
    this.sword.update(run);
    const elapsed=run.snapshot().elapsed;this.staff.update(run,Math.max(0,elapsed-this.previousElapsed));this.previousElapsed=elapsed;
    const matrix=new T.Matrix4(),rotation=new T.Quaternion(),up=new T.Vector3(0,1,0),scale=new T.Vector3(1,1,1);
    if(this.enemies){
      const flash=this.enemies.geometry.getAttribute('damageFlash') as T.InstancedBufferAttribute,dissolve=this.enemies.geometry.getAttribute('dissolve') as T.InstancedBufferAttribute;
      this.enemies.count=run.swarm.enemies.length+run.remains.length;
      run.swarm.enemies.forEach((enemy,i)=>{
        rotation.setFromAxisAngle(up,Math.atan2(player.x-enemy.position.x,player.z-enemy.position.z));matrix.compose(enemy.position,rotation,scale);this.enemies!.setMatrixAt(i,matrix);flash.setX(i,enemy.flash>0?1:0);dissolve.setX(i,0);
      });
      run.remains.forEach((enemy,index)=>{
        const i=run.swarm.enemies.length+index;rotation.setFromAxisAngle(up,enemy.heading);matrix.compose(enemy.position,rotation,scale);this.enemies!.setMatrixAt(i,matrix);flash.setX(i,enemy.duration-enemy.life<.08?1:0);dissolve.setX(i,1-enemy.life/enemy.duration);
      });
      flash.needsUpdate=true;dissolve.needsUpdate=true;this.enemies.instanceMatrix.needsUpdate=true;
    }
    this.gems.update(run);
    while(this.labels.length<run.hits.length){const label=new T.Sprite(this.numbers.material(0));label.scale.set(1.2,.6,1);this.labels.push(label);this.scene.add(label);}
    this.labels.forEach((label,i)=>{const hit=run.hits[i];label.visible=!!hit;if(hit){label.material=this.numbers.material(hit.damage);label.scale.set((label.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);label.position.copy(hit.position);}});
  }
  dispose(){this.pickupNumbers.dispose();this.progression.dispose();this.staff.dispose();this.sword.dispose();this.gems.dispose();this.disposed=true;for(const mesh of [this.enemies])if(mesh){this.scene.remove(mesh);mesh.geometry.dispose();const material=mesh.material as T.MeshLambertMaterial;material.map?.dispose();material.dispose();}for(const label of this.labels){this.scene.remove(label);}this.numbers.dispose();}
}
