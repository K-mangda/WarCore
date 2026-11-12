import * as T from 'three';
import { Motor } from '../player/Motor';
import { Orbit } from '../camera/Orbit';
import { Input } from './Input';
import { Effects } from '../vfx/Effects';
import { makeSandbox } from '../environment/forest/Sandbox';
import { EMovementState } from '../types/movement';
export interface Telemetry { speed:number; fps:number; state:string; jumps:number; locked:boolean; }
export class Engine {
  private active=false;
  private hadLock=false;
  private renderer:T.WebGLRenderer; private scene=new T.Scene(); private camera=new T.PerspectiveCamera(75,1,.05,250); private motor=new Motor(); private input:Input; private orbit:Orbit; private terrain:T.Mesh; private effects:Effects; private avatar=new T.Group(); private frame=0; private previous=0; private accumulator=0; private frames=0; private fps=0; private sample=0;
  constructor(private host:HTMLElement,private report:(data:Telemetry)=>void) {
    this.renderer=new T.WebGLRenderer({antialias:true}); this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); this.renderer.setClearColor(0xb5c9ba); this.renderer.outputColorSpace=T.SRGBColorSpace; host.append(this.renderer.domElement);
    this.scene.fog=new T.Fog(0xb5c9ba,45,135); this.scene.add(new T.HemisphereLight(0xe8f4dd,0x354938,2.5)); const sun=new T.DirectionalLight(0xffefc7,3);sun.position.set(15,30,8);this.scene.add(sun);
    this.terrain=makeSandbox(this.scene); this.effects=new Effects(this.scene); this.input=new Input(()=>this.active,this.pause);this.orbit=new Orbit(this.camera,this.renderer.domElement,()=>this.active);
    this.renderer.domElement.tabIndex=0;
    document.addEventListener('pointerlockchange',this.lockChanged);
    window.addEventListener('blur',this.pause);
    const body=new T.Mesh(new T.CapsuleGeometry(.27,.65,4,8),new T.MeshStandardMaterial({color:0xe7a24c,flatShading:true}));body.position.y=.7;
    const head=new T.Mesh(new T.IcosahedronGeometry(.32,0),new T.MeshStandardMaterial({color:0xeee6ce}));head.position.y=1.4;this.avatar.add(body,head);this.scene.add(this.avatar);
    window.addEventListener('resize',this.resize); this.resize();this.frame=requestAnimationFrame(this.tick);
  }
  lock=()=>{
    this.active=true;
    this.renderer.domElement.focus();
    // Embedded browsers may reject pointer lock. Gameplay remains available.
    try { const request=this.renderer.domElement.requestPointerLock?.(); void request?.catch(()=>{}); } catch { /* Drag-to-look fallback. */ }
  };
  private pause=()=>{this.active=false;this.input.clear();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();};
  private lockChanged=()=>{const locked=document.pointerLockElement===this.renderer.domElement;if(this.hadLock&&!locked)this.pause();this.hadLock=locked;};
  reset=(top=false)=>{this.motor.reset(top);};
  private resize=()=>{const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();};
  private tick=(time:number)=>{
    const dt=this.previous?Math.min((time-this.previous)/1000,.1):0;this.previous=time;
    const locked=this.active;
    if(locked){this.accumulator+=dt;while(this.accumulator>=1/120){this.motor.step(1/120,this.input,this.orbit.yaw);this.accumulator-=1/120;}}
    else this.accumulator=0;
    const slide=this.motor.state===EMovementState.Sliding; this.avatar.position.copy(this.motor.position);this.avatar.scale.y=slide?.5:1;
    this.orbit.update(this.motor.position,this.terrain);this.effects.update(locked?dt:0,this.motor.position,locked&&slide,this.motor.speed);this.renderer.render(this.scene,this.camera);
    this.frames++;this.sample+=dt;if(this.sample>=.2){this.fps=Math.round(this.frames/this.sample);this.frames=0;this.sample=0;this.report({speed:this.motor.speed,fps:this.fps,state:EMovementState[this.motor.state],jumps:this.motor.jumps,locked});}
    this.frame=requestAnimationFrame(this.tick);
  };
  dispose(){cancelAnimationFrame(this.frame);document.removeEventListener('pointerlockchange',this.lockChanged);window.removeEventListener('blur',this.pause);window.removeEventListener('resize',this.resize);this.input.dispose();this.orbit.dispose();this.scene.traverse(o=>{if(o instanceof T.Mesh || o instanceof T.Points){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.renderer.dispose();this.renderer.domElement.remove();}
}
