import {EnemyPreview} from './EnemyPreview';
import {LabAssets,roomAssets} from './LabAssets';
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
const enemyPreview=new EnemyPreview(scene);
let audible=false;
const xpView=new XpView(scene),progression=new ProgressionView(scene),pickupNumbers=new PickupNumbers(scene,camera,()=>({width:host.clientWidth,height:host.clientHeight}));
const enemyRoom=()=>weapon.value.startsWith('skeleton-')||weapon.value.startsWith('bandit-');
const pickupRoom=()=>['xp','gold','silver','level'].includes(weapon.value);
const run=new Run(()=>0,()=>true,random,event=>{if(audible)audio.play(event);});
const origin=new T.Vector3(),facing=()=>{const yaw=Number(rotate.value)*Math.PI/180;return new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));};
const frame=document.getElementById('frame') as HTMLInputElement,rotate=document.getElementById('rotate') as HTMLInputElement,weapon=document.getElementById('weapon') as HTMLSelectElement;
const play=document.getElementById('play') as HTMLButtonElement,stop=document.getElementById('stop') as HTMLButtonElement;
let animation=0,ticket=0,disposed=false,roomReady=false,loadTicket=0;const hitLabels:T.Sprite[]=[];
const assets=new LabAssets();
const loaders:Record<string,()=>Promise<unknown>>={fox:()=>fox.load(),sword:()=>sword.load(),staff:()=>staff.load(),damage:()=>numbers.load(),xp:()=>xpView.load(),progression:()=>progression.load(),pickup:()=>pickupNumbers.load(),skeleton:()=>enemyPreview.load('skeleton'),bandit:()=>enemyPreview.load('bandit')};
const target=()=>facing().multiplyScalar(weapon.value==='sword'?2.5:6);
function resetStaff(){seed=1;pickupNumbers.clear();run.reset();run.setWeapon(weapon.value==='sword'?'sword':'bolt');staff.reset();run.swarm.enemies.push({id:-1,position:target(),velocity:new T.Vector3(),health:1e6,flash:0});}
function resetXp(){
 seed=1;run.reset();staff.reset();progression.clear();pickupNumbers.clear();
 const kind=weapon.value==='gold'?'gold':weapon.value==='silver'?'silver':'xp';
 for(let i=0;i<(weapon.value==='level'?5:3);i++)run.gems.push({kind,position:weapon.value==='level'?origin.clone():new T.Vector3((i-1)*.6,kind==='gold'?balance.goldSpawnHeight:balance.xpHoverHeight,-3-i*.5),value:kind==='xp'&&weapon.value!=='level'?[1,10,50][i]:1});
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
 if(!roomReady){renderer.clear();return;}
 fox.root.visible=!enemyRoom();enemyPreview.update(weapon.value,Number(frame.value),facing());
 fox.update(origin,Number(rotate.value)*Math.PI/180,0,true,0,0);sword.update(run);
 xpView.update(run);progression.update(run,origin,0);dummy.visible=!pickupRoom()&&!enemyRoom();dummy.position.copy(target()).y=.8;
 if(weapon.value!=='sword'){camera.position.set(4,3,5);camera.lookAt(0,.8,-2);}else{camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);}
 pickupNumbers.update(run,0,origin);
 while(hitLabels.length<run.hits.length){const sprite=new T.Sprite(numbers.material(0).clone());hitLabels.push(sprite);scene.add(sprite);}
 hitLabels.forEach((sprite,i)=>{
  const hit=run.hits[i];sprite.visible=!!hit&&!pickupRoom();if(!hit)return;
  if(sprite.userData.damage!==hit.damage){sprite.material.dispose();sprite.material=numbers.material(hit.damage).clone();sprite.userData.damage=hit.damage;}
  sprite.material.opacity=Math.min(1,hit.life/.15);sprite.position.copy(hit.position);
  sprite.scale.set((sprite.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);
 });
 renderer.render(scene,camera);document.getElementById('time')!.textContent=Number(frame.value).toFixed(3)+' seconds';
}
function inspect(){
 if(disposed||!roomReady)return;audible=false;const age=Number(frame.value);
 if(enemyRoom()){run.reset();staff.reset();progression.clear();pickupNumbers.clear();}
 else if(weapon.value==='sword'){resetStaff();advanceWeapon(age);}
 else if(pickupRoom()){resetXp();advanceXp(age);progression.update(run,origin,0);if(weapon.value==='level')progression.update(run,origin,age);}else{resetStaff();advanceWeapon(age);}
 paint();
}
function halt(){ticket++;cancelAnimationFrame(animation);audible=false;audio.stopProgression();audio.stopGameplay();}
frame.addEventListener('input',()=>{halt();inspect();});rotate.addEventListener('input',()=>{halt();inspect();});
async function selectRoom(){
 const request=++loadTicket;roomReady=false;play.disabled=true;stop.disabled=true;frame.disabled=true;rotate.disabled=true;
 const status=document.getElementById('ready')!;status.textContent='Loading room…';renderer.clear();
 frame.max=enemyRoom()?'1.5':weapon.value==='sword'?'.8':pickupRoom()?'2':'1.5';frame.value=weapon.value==='sword'?'.01':'.08';
 document.getElementById('room-title')!.textContent=`WARCORE LAB · ${enemyRoom()?enemySelect.options[enemySelect.selectedIndex].text+' - '+weapon.options[weapon.selectedIndex].text:weapon.value==='sword'?'SWORD':pickupRoom()?weapon.value.toUpperCase():'FIRESTAFF'}`;
 try{
  await Promise.all(roomAssets(weapon.value).map(key=>assets.load(key,loaders[key])));
  if(disposed||request!==loadTicket)return;
  roomReady=true;play.disabled=false;stop.disabled=false;frame.disabled=false;rotate.disabled=false;status.textContent='Ready';inspect();
 }catch(error){if(disposed||request!==loadTicket)return;status.textContent=`Could not load room: ${String(error)}. Select the room again to retry.`;}
}
const categories={
 weapons:[['sword','Sword'],['bolt','Firestaff']],
 pickups:[['xp','EXP tiers'],['gold','Gold'],['silver','Silver']],
 effects:[['level','Level up']],
 enemies:[['skeleton-walk','Skeleton - Walk'],['skeleton-hit','Skeleton - Hit'],['skeleton-death','Skeleton - Death'],['bandit-walk','Bandit - Walk'],['bandit-hit','Bandit - Hit'],['bandit-death','Bandit - Death']],
} as const;
type Category=keyof typeof categories;
// Derive the species list from registered rooms so future enemies get one entry.
const enemySelect=document.createElement('select'),enemyLabel=document.createElement('label');
enemySelect.setAttribute('aria-label','Enemy');enemyLabel.append('Enemy',enemySelect);
const enemyNames=new Map(categories.enemies.map(([value,text])=>[value.split('-')[0],text.split(' - ')[0]]));
enemySelect.replaceChildren(...Array.from(enemyNames,([value,text])=>new Option(text,value)));
weapon.parentElement!.before(enemyLabel);
enemySelect.addEventListener('change',()=>{
 const action=weapon.value.split('-').slice(1).join('-');
 openCategory('enemies',`${enemySelect.value}-${action}`);
});
const tabs=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-category]'));
const lastRoom:Record<Category,string>={weapons:'sword',pickups:'xp',effects:'level',enemies:'skeleton-walk'};
let currentCategory:Category='weapons';
function openCategory(category:Category,room=lastRoom[category],preview=true){
 currentCategory=category;
 enemyLabel.style.display=category==='enemies'?'':'none';
 if(category==='enemies')enemySelect.value=enemyNames.has(room.split('-')[0])?room.split('-')[0]:enemySelect.options[0].value;
 const rooms=categories[category].filter(([value])=>category!=='enemies'||value.startsWith(enemySelect.value+'-'));
 weapon.replaceChildren(...rooms.map(([value,text])=>new Option(category==='enemies'?text.split(' - ')[1]:text,value)));
 weapon.value=rooms.some(([value])=>value===room)?room:rooms[0][0];lastRoom[category]=weapon.value;
 for(const tab of tabs){const active=tab.dataset.category===category;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
 document.getElementById('lab-room-panel')!.setAttribute('aria-labelledby','tab-'+category);
 if(preview){halt();selectRoom();}
}
for(const [index,tab] of tabs.entries()){
 tab.addEventListener('click',()=>openCategory(tab.dataset.category as Category));
 tab.addEventListener('keydown',event=>{
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
  else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
  event.preventDefault();tabs[next].focus();openCategory(tabs[next].dataset.category as Category);
 });
}
const requestedRoom=new URLSearchParams(location.search).get('weapon');
const initialCategory=(Object.keys(categories) as Category[]).find(key=>categories[key].some(([room])=>room===requestedRoom))??'weapons';
openCategory(initialCategory,requestedRoom??lastRoom[initialCategory],false);
weapon.addEventListener('change',()=>{lastRoom[currentCategory]=weapon.value;halt();selectRoom();});
const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();paint();});resize.observe(host);
play.addEventListener('click',async()=>{
 if(!roomReady)return;
 halt();const request=ticket;play.disabled=true;await audio.prepare();if(disposed||request!==ticket||!roomReady)return;play.disabled=false;
 const kind=weapon.value;if(enemyRoom()){run.reset();staff.reset();progression.clear();pickupNumbers.clear();}else if(pickupRoom())resetXp();else resetStaff();audible=true;let lastAge=0;const start=performance.now(),limit=Number(frame.max);
 const tick=(time:number)=>{
  if(disposed||request!==ticket)return;
  const age=Math.min(limit,(time-start)/1000);frame.value=String(age);
  if(enemyRoom()){if(lastAge<.2&&age>=.2&&!kind.endsWith('-walk'))audio.play('staffHit');paint();}else if(kind==='bolt'||kind==='sword'){advanceWeapon(age);paint();}else if(pickupRoom()){advanceXp(age);progression.update(run,origin,age-lastAge);if(kind==='level')audio.setLevelModal(run.blocked);paint();}else{inspect();}lastAge=age;
  if(age<limit)animation=requestAnimationFrame(tick);else{audible=false;audio.setLevelModal(false);}
 };
 frame.value='0';animation=requestAnimationFrame(tick);
});
stop.addEventListener('click',halt);
document.getElementById('mute')!.addEventListener('click',()=>{const muted=audio.toggle(),button=document.getElementById('mute')!;button.textContent=muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(muted));});
window.addEventListener('pagehide',()=>{disposed=true;halt();resize.disconnect();audio.dispose();enemyPreview.dispose();sword.dispose();staff.dispose();xpView.dispose();progression.dispose();pickupNumbers.dispose();fox.dispose();for(const sprite of hitLabels){scene.remove(sprite);sprite.material.dispose();}numbers.dispose();dummy.geometry.dispose();dummy.material.dispose();renderer.dispose();});
for(const tab of tabs)tab.disabled=false;
void selectRoom();
