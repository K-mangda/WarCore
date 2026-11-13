import {RunRecorder} from './RunHistory';
import {buildVersion} from './BuildInfo';
import {PointerLockState} from './PointerLockState';
import {getVideoPreferences,subscribeVideoPreferences} from './VideoPreferences';
import {applyVideoPreferences} from './VideoRenderer';
import {RenderCadence} from './RenderCadence';
import {subscribeEffectsPreferences} from './EffectsPreferences';
import {GameAudio} from '../audio/GameAudio';
import * as T from 'three';
import { Motor } from '../player/Motor';
import { Orbit } from '../camera/Orbit';
import { Input } from './Input';
import { Effects } from '../vfx/Effects';
import { makeSandbox } from '../environment/forest/Sandbox';
import { EMovementState } from '../types/movement';
import { physics } from '../player/Physics';
import { Fox } from '../player/Fox';
import {Run,type RunSnapshot,type Upgrade,type Weapon} from '../combat/Run';
import {CombatView} from '../combat/View';
import {heightAt} from '../environment/forest/Sandbox';
export interface Telemetry extends RunSnapshot { speed:number; fps:number; state:string; jumps:number; locked:boolean;renderWidth:number;renderHeight:number; }
export class Engine {
  readonly ready:Promise<void>;
  readonly audio=new GameAudio();
  private fox=new Fox();
  private run=new Run(heightAt,point=>{const projected=point.project(this.camera);return projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<1.2&&Math.abs(projected.y)<1.2;},Math.random,event=>this.audio.play(event));
  private combatView:CombatView;
  private disposed=false;
  private recorder=new RunRecorder();
  private active=false;private inLab=false;
  private pointerLock=new PointerLockState();
  private cadence=new RenderCadence();private previousRender=0;private bufferSize=new T.Vector2();private unsubscribeVideo:()=>void;private unsubscribeEffects:()=>void;
  private renderer:T.WebGLRenderer; private scene=new T.Scene(); private camera=new T.PerspectiveCamera(75,1,.05,250); private motor=new Motor(); private input:Input; private orbit:Orbit; private terrain:T.Mesh; private effects:Effects; private frame=0; private previous=0; private accumulator=0; private frames=0; private fps=0; private sample=0;
  constructor(private host:HTMLElement,private report:(data:Telemetry)=>void) {
    this.renderer=new T.WebGLRenderer({antialias:true}); this.renderer.setClearColor(0xb5c9ba); this.renderer.outputColorSpace=T.SRGBColorSpace; host.append(this.renderer.domElement);
    this.scene.fog=new T.Fog(0xb5c9ba,45,135); this.scene.add(new T.HemisphereLight(0xe8f4dd,0x354938,2.5)); const sun=new T.DirectionalLight(0xffefc7,3);sun.position.set(15,30,8);this.scene.add(sun);
    this.terrain=makeSandbox(this.scene); this.effects=new Effects(this.scene); this.input=new Input(()=>this.active,this.pause);this.orbit=new Orbit(this.camera,this.renderer.domElement,()=>this.active);
    this.renderer.domElement.tabIndex=0;
    document.addEventListener('pointerlockchange',this.lockChanged);
    window.addEventListener('blur',this.pause);
    this.scene.add(this.fox.root);
    this.combatView=new CombatView(this.scene,this.camera,()=>({width:this.host.clientWidth,height:this.host.clientHeight}));
    window.addEventListener('resize',this.resize); this.resize();
    this.unsubscribeVideo=subscribeVideoPreferences(()=>{this.cadence.reset();this.resize();this.emit();});this.emit();
    this.unsubscribeEffects=subscribeEffectsPreferences(()=>this.cadence.reset());
    this.ready=Promise.all([this.fox.load(),this.combatView.load()]).then(()=>{if(!this.disposed)this.frame=requestAnimationFrame(this.tick);});
  }
  lock=(feedback=true)=>{
    if(this.run.blocked)return;
    this.audio.unlock();if(feedback)this.audio.play('click');
    this.active=true;
    this.renderer.domElement.focus();this.input.resume();
    // Embedded browsers may reject pointer lock. Gameplay remains available.
    try { const request=this.renderer.domElement.requestPointerLock?.(); void request?.catch(()=>{}); } catch { /* Drag-to-look fallback. */ }
  };
  private pause=()=>{this.audio.stopGameplay(this.run.snapshot().pendingUpgrades>0&&!this.inLab);this.active=false;this.input.clear();this.pointerLock.release();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();};
  private lockChanged=()=>{if(this.pointerLock.changed(document.pointerLockElement===this.renderer.domElement))this.pause();};
  pauseForLab=()=>{this.inLab=true;this.audio.stopProgression();this.pause();this.emit();};
  resumeFromLab=()=>{this.inLab=false;};
  pauseForSettings=()=>{this.pause();this.emit();};
  reset=(top=false)=>{this.recorder.reset(this.run.snapshot(),buildVersion);this.audio.stopProgression();this.audio.stopGameplay();this.motor.reset(top);this.run.reset();this.emit();};
  setWeapon=(weapon:Weapon)=>{if(this.active)return;this.run.setWeapon(weapon);this.emit();};
  restart=()=>{this.reset();this.lock();};
  chooseUpgrade=(upgrade:Upgrade)=>{if(!this.run.choose(upgrade))return;this.audio.unlock();this.audio.setLevelModal(this.run.blocked);this.audio.play('click');if(!this.run.blocked)this.lock(false);this.emit();};
  private emit=()=>{this.renderer.getDrawingBufferSize(this.bufferSize);this.report({...this.run.snapshot(),speed:this.motor.speed,fps:this.fps,state:EMovementState[this.motor.state],jumps:this.motor.jumps,locked:this.active,renderWidth:this.bufferSize.x,renderHeight:this.bufferSize.y});};
  private resize=()=>{applyVideoPreferences(this.renderer,this.camera,this.scene,getVideoPreferences(),this.host.clientWidth,this.host.clientHeight,devicePixelRatio);};
  private tick=(time:number)=>{
    const wallDelta=this.previous?(time-this.previous)/1000:0;
    const dt=Math.min(wallDelta,.1);this.previous=time;
    const locked=this.active;
    this.orbit.advanceLook(dt,this.input.keys);
    if(locked&&!this.run.blocked){this.accumulator+=dt;while(this.accumulator>=physics.fixedStep){const wasGrounded=this.motor.grounded,jumps=this.motor.jumps;this.motor.step(physics.fixedStep,this.input,this.orbit.yaw);if(this.motor.jumps>jumps)this.audio.play('jump');if(!wasGrounded&&this.motor.grounded)this.audio.play('land');this.run.step(physics.fixedStep,this.motor.position,new T.Vector3(-Math.sin(this.orbit.yaw),0,-Math.cos(this.orbit.yaw)));this.accumulator-=physics.fixedStep;if(this.run.blocked){this.recorder.death(this.run.snapshot(),buildVersion);this.pause();this.accumulator=0;this.emit();break;}}}
    else this.accumulator=0;
    this.audio.setLevelModal(!this.inLab&&this.run.snapshot().pendingUpgrades>0);
    if(this.cadence.ready(time,getVideoPreferences().fpsLimit)){
      const visualDelta=this.previousRender?Math.min(.1,(time-this.previousRender)/1000):0;this.previousRender=time;
      const animate=this.active&&!this.run.blocked,slide=this.motor.state===EMovementState.Sliding;
      this.fox.update(this.motor.position,this.orbit.yaw,this.motor.speed,this.motor.grounded,this.motor.velocity.y,animate?visualDelta:0);
      this.orbit.update(this.motor.position,this.terrain,3.6+getVideoPreferences().cameraDistance);this.camera.updateMatrixWorld();
      this.combatView.update(this.run,this.motor.position,animate?visualDelta:0);
      this.effects.update(animate?visualDelta:0,this.motor.position,animate&&slide,this.motor.speed);this.renderer.render(this.scene,this.camera);this.frames++;
    }
    this.sample+=wallDelta;if(this.sample>=.2){this.fps=Math.round(this.frames/this.sample);this.frames=0;this.sample=0;this.emit();}
    this.frame=requestAnimationFrame(this.tick);
  };
  dispose(){this.unsubscribeVideo();this.unsubscribeEffects();this.audio.dispose();this.disposed=true;cancelAnimationFrame(this.frame);document.removeEventListener('pointerlockchange',this.lockChanged);window.removeEventListener('blur',this.pause);window.removeEventListener('resize',this.resize);this.input.dispose();this.orbit.dispose();this.fox.dispose();this.combatView.dispose();this.scene.traverse(o=>{if(o instanceof T.Mesh || o instanceof T.Points){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();if(o instanceof T.InstancedMesh)o.dispose();}});this.renderer.dispose();this.renderer.domElement.remove();}
}
