import * as T from 'three';
import {SwordView} from '../combat/SwordView';
import {Run} from '../combat/Run';
import {Fox} from '../player/Fox';
import {GameAudio} from '../audio/GameAudio';
import {DamageNumbers} from '../combat/DamageNumbers';
const host=document.getElementById('view')!;
if(new URLSearchParams(location.search).has('embedded'))document.getElementById('back')!.hidden=true;
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x27392c);host.append(renderer.domElement);
const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x444444,3));
const camera=new T.PerspectiveCamera(75,1,.05,100);camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);
scene.add(new T.GridHelper(30,30,0xaaaacc,0x526454));scene.add(new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.06,0),6,0xff4444));
const fox=new Fox();scene.add(fox.root);const sword=new SwordView(scene);const audio=new GameAudio();const numbers=new DamageNumbers();const run=new Run(()=>0,()=>true);const origin=new T.Vector3(0,.5,0);
const frame=document.getElementById('frame') as HTMLInputElement,rotate=document.getElementById('rotate') as HTMLInputElement;
const play=document.getElementById('play') as HTMLButtonElement,stop=document.getElementById('stop') as HTMLButtonElement,damage=document.getElementById('damage') as HTMLButtonElement;
let animation=0,ticket=0,disposed=false;let label:T.Sprite|undefined;
function draw(){
 if(disposed)return;
 const age=Number(frame.value),yaw=Number(rotate.value)*Math.PI/180,direction=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 run.slashes.length=0;run.slashes.push({position:origin.clone(),direction,life:.3-age,duration:.3,damage:10,hits:new Set()});
 fox.update(new T.Vector3(),yaw,0,true,0,0);sword.update(run);renderer.render(scene,camera);document.getElementById('time')!.textContent=age.toFixed(3)+' seconds';
}
function halt(){ticket++;cancelAnimationFrame(animation);audio.stopGameplay();}
frame.addEventListener('input',()=>{halt();draw();});rotate.addEventListener('input',()=>{halt();draw();});
const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw();});resize.observe(host);
play.addEventListener('click',async()=>{
 halt();const request=ticket;play.disabled=true;await audio.prepare();play.disabled=false;if(disposed||request!==ticket)return;
 audio.play('sword');const start=performance.now();
 const tick=(time:number)=>{if(disposed||request!==ticket)return;frame.value=String(Math.min(.149,(time-start)/1000));draw();if(time-start<150)animation=requestAnimationFrame(tick);};
 frame.value='0';draw();animation=requestAnimationFrame(tick);
});
stop.addEventListener('click',halt);
document.getElementById('mute')!.addEventListener('click',()=>{const muted=audio.toggle();const button=document.getElementById('mute')!;button.textContent=muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(muted));});
damage.addEventListener('click',()=>{if(label)label.visible=!label.visible;draw();});
window.addEventListener('pagehide',()=>{disposed=true;halt();resize.disconnect();audio.dispose();sword.dispose();fox.dispose();numbers.dispose();renderer.dispose();});
try{
 await Promise.all([fox.load(),sword.load(),numbers.load()]);
 label=new T.Sprite(numbers.material(10));label.position.set(0,2.15,-1.5);label.scale.set(1.2,.75,1);label.visible=false;scene.add(label);
 play.disabled=false;stop.disabled=false;damage.disabled=false;draw();document.getElementById('ready')!.textContent='Ready';
}catch(error){document.getElementById('ready')!.textContent=`Could not load Lab: ${String(error)}`;}
