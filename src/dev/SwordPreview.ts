import {balance} from '../combat/Balance';
import {PickupNumbers} from '../combat/PickupNumbers';
import {ProgressionView} from '../combat/ProgressionView';
import './lab.css';
import {assetUrl} from '../core/assetUrl';
import * as T from 'three';
import {SwordView} from '../combat/SwordView';
import {StaffView} from '../combat/StaffView';
import {XpView} from '../combat/XpView';
import {Run} from '../combat/Run';
import {Fox} from '../player/Fox';
import {GameAudio} from '../audio/GameAudio';
import {DamageNumbers} from '../combat/DamageNumbers';
const host=document.getElementById('view')!;
(document.getElementById('back') as HTMLAnchorElement).href=assetUrl('');
if(new URLSearchParams(location.search).has('embedded'))document.getElementById('back')!.hidden=true;
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x27392c);host.append(renderer.domElement);
const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x444444,3));
const camera=new T.PerspectiveCamera(75,1,.05,100);camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);
scene.add(new T.GridHelper(30,30,0xaaaacc,0x526454));scene.add(new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.06,0),6,0xff4444));
const dummy=new T.Mesh(new T.CapsuleGeometry(.4,1,4,8),new T.MeshBasicMaterial({color:0xc8c5a8,wireframe:true}));scene.add(dummy);
let seed=1;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const fox=new Fox();scene.add(fox.root);const sword=new SwordView(scene),staff=new StaffView(scene,random),audio=new GameAudio(),numbers=new DamageNumbers();
let audible=false;
const xpView=new XpView(scene),progression=new ProgressionView(scene),pickupNumbers=new PickupNumbers(scene,camera,()=>({width:host.clientWidth,height:host.clientHeight}));
const pickupRoom=()=>['xp','gold','silver','level'].includes(weapon.value);
const run=new Run(()=>0,()=>true,random,event=>{if(audible)audio.play(event);});
const origin=new T.Vector3(),facing=()=>{const yaw=Number(rotate.value)*Math.PI/180;return new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));};
const frame=document.getElementById('frame') as HTMLInputElement,rotate=document.getElementById('rotate') as HTMLInputElement,weapon=document.getElementById('weapon') as HTMLSelectElement;
const play=document.getElementById('play') as HTMLButtonElement,stop=document.getElementById('stop') as HTMLButtonElement,damage=document.getElementById('damage') as HTMLButtonElement;
let animation=0,ticket=0,disposed=false;let label:T.Sprite|undefined;const hitLabels:T.Sprite[]=[];
const target=()=>facing().multiplyScalar(weapon.value==='sword'?2.5:6);
function resetStaff(){seed=1;pickupNumbers.clear();run.reset();run.setWeapon(weapon.value==='sword'?'sword':'bolt');staff.reset();run.swarm.enemies.push({id:-1,position:target(),velocity:new T.Vector3(),health:1e6,flash:0});}
function resetXp(){
 seed=1;run.reset();staff.reset();progression.clear();pickupNumbers.clear();
 const kind=weapon.value==='gold'?'gold':weapon.value==='silver'?'silver':'xp';
 for(let i=0;i<(weapon.value==='level'?5:3);i++)run.gems.push({kind,position:weapon.value==='level'?origin.clone():new T.Vector3((i-1)*.6,balance.xpHoverHeight,-3-i*.5),value:kind==='xp'&&weapon.value!=='level'?[1,10,50][i]:1});
}

function advanceXp(age:number){while(!run.blocked&&run.snapshot().elapsed+1e-7<age){const dt=Math.min(.02,age-run.snapshot().elapsed);run.step(dt,origin,facing());xpView.update(run);pickupNumbers.update(run,dt);if(weapon.value!=='level')while(run.blocked&&!run.snapshot().dead)run.choose('damage');}}
function advanceWeapon(age:number){
 while(run.snapshot().elapsed+1e-7<age){
  const dt=Math.min(.02,age-run.snapshot().elapsed);const enemy=run.swarm.enemies[0];if(enemy){enemy.position.copy(target());enemy.velocity.set(0,0,0);}
  run.step(dt,origin,facing());staff.update(run,dt);
 }
}
function paint(){
 if(disposed)return;
 fox.update(origin,Number(rotate.value)*Math.PI/180,0,true,0,0);sword.update(run);
 xpView.update(run);progression.update(run,origin,0);dummy.visible=!pickupRoom();dummy.position.copy(target()).y=.8;
 if(weapon.value!=='sword'){camera.position.set(4,3,5);camera.lookAt(0,.8,-2);}else{camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);}
 pickupNumbers.update(run,0,origin);
 while(hitLabels.length<run.hits.length){const sprite=new T.Sprite(numbers.material(0).clone());hitLabels.push(sprite);scene.add(sprite);}
 hitLabels.forEach((sprite,i)=>{
  const hit=run.hits[i];sprite.visible=!!hit&&!pickupRoom();if(!hit)return;
  if(sprite.userData.damage!==hit.damage){sprite.material.dispose();sprite.material=numbers.material(hit.damage).clone();sprite.userData.damage=hit.damage;}
  sprite.material.opacity=Math.min(1,hit.life/.15);sprite.position.copy(hit.position);
  sprite.scale.set((sprite.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);
 });
 if(label)label.material.opacity=1;
 renderer.render(scene,camera);document.getElementById('time')!.textContent=Number(frame.value).toFixed(3)+' seconds';
}
function inspect(){
 if(disposed)return;audible=false;const age=Number(frame.value);
 if(weapon.value==='sword'){resetStaff();advanceWeapon(age);}
 else if(pickupRoom()){resetXp();advanceXp(age);progression.update(run,origin,0);if(weapon.value==='level')progression.update(run,origin,age);}else{resetStaff();advanceWeapon(age);}
 paint();
}
function halt(){ticket++;cancelAnimationFrame(animation);audible=false;audio.stopProgression();audio.stopGameplay();}
frame.addEventListener('input',()=>{halt();inspect();});rotate.addEventListener('input',()=>{halt();inspect();});
function selectRoom(){
 frame.max=weapon.value==='sword'?'.8':pickupRoom()?'2':'1.5';frame.value=weapon.value==='sword'?'.01':'.08';
 document.getElementById('room-title')!.textContent=`WEAPON LAB · ${weapon.value==='sword'?'SWORD':pickupRoom()?weapon.value.toUpperCase():'FIRESTAFF'}`;inspect();
}
const requestedRoom=new URLSearchParams(location.search).get('weapon');if(requestedRoom&&['bolt','xp','gold','silver','level'].includes(requestedRoom))weapon.value=requestedRoom;
weapon.addEventListener('change',()=>{halt();selectRoom();});
const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();paint();});resize.observe(host);
play.addEventListener('click',async()=>{
 halt();const request=ticket;play.disabled=true;await audio.prepare();play.disabled=false;if(disposed||request!==ticket)return;
 const kind=weapon.value;if(pickupRoom())resetXp();else resetStaff();audible=true;let lastAge=0;const start=performance.now(),limit=Number(frame.max);
 const tick=(time:number)=>{
  if(disposed||request!==ticket)return;
  const age=Math.min(limit,(time-start)/1000);frame.value=String(age);
  if(kind==='bolt'||kind==='sword'){advanceWeapon(age);paint();}else if(pickupRoom()){advanceXp(age);progression.update(run,origin,age-lastAge);if(kind==='level')audio.setLevelModal(run.blocked);paint();}else{inspect();}lastAge=age;
  if(age<limit)animation=requestAnimationFrame(tick);else{audible=false;audio.setLevelModal(false);}
 };
 frame.value='0';animation=requestAnimationFrame(tick);
});
stop.addEventListener('click',halt);
document.getElementById('mute')!.addEventListener('click',()=>{const muted=audio.toggle(),button=document.getElementById('mute')!;button.textContent=muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(muted));});
damage.addEventListener('click',()=>{if(label)label.visible=!label.visible;paint();});
window.addEventListener('pagehide',()=>{disposed=true;halt();resize.disconnect();audio.dispose();sword.dispose();staff.dispose();xpView.dispose();progression.dispose();pickupNumbers.dispose();fox.dispose();for(const sprite of hitLabels){scene.remove(sprite);sprite.material.dispose();}numbers.dispose();dummy.geometry.dispose();dummy.material.dispose();renderer.dispose();});
try{
 await Promise.all([fox.load(),sword.load(),staff.load(),xpView.load(),progression.load(),pickupNumbers.load(),numbers.load()]);
 label=new T.Sprite(numbers.material(10));label.position.set(0,2.15,-1.5);label.scale.set(1.2,.75,1);label.visible=false;scene.add(label);
 play.disabled=false;stop.disabled=false;damage.disabled=false;selectRoom();document.getElementById('ready')!.textContent='Ready';
}catch(error){document.getElementById('ready')!.textContent=`Could not load Lab: ${String(error)}`;}
