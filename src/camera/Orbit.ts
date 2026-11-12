import * as T from 'three';
export class Orbit {
  yaw=0; pitch=.27;
  private ray=new T.Raycaster();
  constructor(readonly camera:T.PerspectiveCamera,private canvas:HTMLCanvasElement) { document.addEventListener('mousemove',this.move); }
  private move=(e:MouseEvent)=> { if(document.pointerLockElement!==this.canvas)return; this.yaw-=e.movementX*.002; this.pitch=T.MathUtils.clamp(this.pitch+e.movementY*.002,-.3,1.1); };
  update(position:T.Vector3,terrain:T.Mesh) {
    const target=position.clone().add(new T.Vector3(0,1.3,0));
    const offset=new T.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch));
    this.ray.set(target,offset); this.ray.far=3.6; const hit=this.ray.intersectObject(terrain)[0]; const distance=hit?Math.max(.15,hit.distance-.2):3.6;
    this.camera.position.copy(target).addScaledVector(offset,distance); this.camera.lookAt(target);
  }
  dispose(){document.removeEventListener('mousemove',this.move);}
}
