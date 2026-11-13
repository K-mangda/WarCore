import * as T from 'three';
export class Orbit {
  yaw=0; pitch=.27;
  private ray=new T.Raycaster();
  private dragging=false;
  private lastPosition=new T.Vector3(NaN,NaN,NaN);private lastYaw=NaN;private lastPitch=NaN;private lastTerrain?:T.Mesh;
  constructor(readonly camera:T.PerspectiveCamera,private canvas:HTMLCanvasElement,private isActive:()=>boolean) { document.addEventListener('mousemove',this.move); canvas.addEventListener('mousedown',this.down); window.addEventListener('mouseup',this.up); window.addEventListener('blur',this.up); }
  private down=()=>{if(this.isActive())this.dragging=true;};
  private up=()=>{this.dragging=false;};
  private move=(e:MouseEvent)=> { if(!this.isActive() || (document.pointerLockElement!==this.canvas && !this.dragging))return; this.yaw-=e.movementX*.002; this.pitch=T.MathUtils.clamp(this.pitch+e.movementY*.002,-.3,1.1); };
  update(position:T.Vector3,terrain:T.Mesh) {
    if(this.lastTerrain===terrain&&this.lastPosition.equals(position)&&this.lastYaw===this.yaw&&this.lastPitch===this.pitch)return;
    this.lastPosition.copy(position);this.lastYaw=this.yaw;this.lastPitch=this.pitch;this.lastTerrain=terrain;
    const target=position.clone().add(new T.Vector3(0,1.3,0));
    const offset=new T.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch));
    this.ray.set(target,offset); this.ray.far=3.6; const hit=this.ray.intersectObject(terrain)[0]; const distance=hit?Math.max(.15,hit.distance-.2):3.6;
    this.camera.position.copy(target).addScaledVector(offset,distance); this.camera.lookAt(target);
  }
  dispose(){document.removeEventListener('mousemove',this.move);this.canvas.removeEventListener('mousedown',this.down);window.removeEventListener('mouseup',this.up);window.removeEventListener('blur',this.up);}
}
