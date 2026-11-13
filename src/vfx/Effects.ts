import * as T from 'three';
import {getEffectsPreferences} from '../core/EffectsPreferences';
export class Effects {
  private positions=new Float32Array(96*3); private life=new Float32Array(96); private points:T.Points<T.BufferGeometry,T.PointsMaterial>; private cursor=0;
  constructor(scene:T.Scene) { const geometry=new T.BufferGeometry(); geometry.setAttribute('position',new T.BufferAttribute(this.positions,3)); this.points=new T.Points(geometry,new T.PointsMaterial({color:0xd7c9a1,size:.18,transparent:true,opacity:.48,depthWrite:false})); this.points.frustumCulled=false; scene.add(this.points); }
  update(dt:number,position:T.Vector3,sliding:boolean,speed:number) {
    this.points.material.opacity=.48*getEffectsPreferences().particlesOpacity;this.points.visible=this.points.material.opacity>0;
    if(sliding && speed>2)for(let n=0;n<2;n++){const i=this.cursor++%96; this.life[i]=.6; this.positions[i*3]=position.x+(Math.random()-.5)*.7;this.positions[i*3+1]=position.y+.1;this.positions[i*3+2]=position.z+(Math.random()-.5)*.7;}
    for(let i=0;i<96;i++){this.life[i]-=dt;this.positions[i*3+1]+=dt*.65;if(this.life[i]<=0)this.positions[i*3+1]=-100;}
    this.points.geometry.attributes.position.needsUpdate=true;
  }
}
