import * as T from 'three';
import {getControlPreferences,subscribeControlPreferences} from '../core/ControlPreferences';
export class Orbit {
  yaw=0; pitch=.27;
  private ray=new T.Raycaster();
  private dragging=false;
  private pendingX=0;private pendingY=0;
  private unsubscribe=subscribeControlPreferences(()=>{this.pendingX=0;this.pendingY=0;});
  private lastPosition=new T.Vector3(NaN,NaN,NaN);private lastYaw=NaN;private lastPitch=NaN;private lastTerrain?:T.Mesh;
  constructor(readonly camera:T.PerspectiveCamera,private canvas:HTMLCanvasElement,private isActive:()=>boolean) { document.addEventListener('mousemove',this.move); canvas.addEventListener('mousedown',this.down); window.addEventListener('mouseup',this.up); window.addEventListener('blur',this.up); }
  private down=()=>{if(this.isActive())this.dragging=true;};
  private up=()=>{this.dragging=false;this.pendingX=0;this.pendingY=0;};
  private applyLook(x:number,y:number){this.yaw+=x;this.pitch=T.MathUtils.clamp(this.pitch+y,-.3,1.1);}
  private move=(e:MouseEvent)=>{
    if(!this.isActive()||(document.pointerLockElement!==this.canvas&&!this.dragging))return;
    const settings=getControlPreferences(),scale=.002*settings.sensitivity;
    const x=-e.movementX*scale*(settings.invertHorizontal?-1:1),y=e.movementY*scale*(settings.invertVertical?-1:1);
    if(settings.lookSmoothing===0)this.applyLook(x,y);else{this.pendingX+=x;this.pendingY+=y;}
  };
  advanceLook(delta:number,keys:ReadonlySet<string>){
    if(!this.isActive()){this.up();return;}
    const dt=Math.max(0,Math.min(.1,delta)),settings=getControlPreferences();
    if(settings.arrowLook){const speed=1.6*dt*settings.sensitivity;this.pendingX+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*speed*(settings.invertHorizontal?-1:1);this.pendingY+=(Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp')))*speed*(settings.invertVertical?-1:1);}
    const amount=settings.lookSmoothing===0?1:1-Math.exp(-dt/(settings.lookSmoothing*.18));
    const x=this.pendingX*amount,y=this.pendingY*amount;this.pendingX-=x;this.pendingY-=y;
    if(Math.abs(this.pendingX)<1e-7)this.pendingX=0;if(Math.abs(this.pendingY)<1e-7)this.pendingY=0;this.applyLook(x,y);
  }
  update(position:T.Vector3,terrain:T.Mesh) {
    if(this.lastTerrain===terrain&&this.lastPosition.equals(position)&&this.lastYaw===this.yaw&&this.lastPitch===this.pitch)return;
    this.lastPosition.copy(position);this.lastYaw=this.yaw;this.lastPitch=this.pitch;this.lastTerrain=terrain;
    const target=position.clone().add(new T.Vector3(0,1.3,0));
    const offset=new T.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch));
    this.ray.set(target,offset); this.ray.far=3.6; const hit=this.ray.intersectObject(terrain)[0]; const distance=hit?Math.max(.15,hit.distance-.2):3.6;
    this.camera.position.copy(target).addScaledVector(offset,distance); this.camera.lookAt(target);
  }
  dispose(){this.unsubscribe();document.removeEventListener('mousemove',this.move);this.canvas.removeEventListener('mousedown',this.down);window.removeEventListener('mouseup',this.up);window.removeEventListener('blur',this.up);}
}
