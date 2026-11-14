import {characterRooms,characterClip} from './CharacterRooms';
import {buildVersion} from '../core/BuildInfo';
import {EnemyPreview} from './EnemyPreview';
import {WeaponModelPreview} from './WeaponModelPreview';
import {weaponModels,weaponModelRooms,modelId,hitRoom,soundRoom} from './WeaponModels';
import {WeaponSoundPreview} from './WeaponSoundPreview';
import {SharedHitPreview} from './SharedHitPreview';
import {LabAssets,roomAssets} from './LabAssets';
import {balance} from '../combat/Balance';
import {xpForLevel} from '../combat/XpCurve';
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
import {subscribeAudioPreferences} from '../audio/AudioPreferences';
import {getVideoPreferences,subscribeVideoPreferences} from '../core/VideoPreferences';
import {applyVideoPreferences} from '../core/VideoRenderer';
import {RenderCadence} from '../core/RenderCadence';
import {getEffectsPreferences,subscribeEffectsPreferences} from '../core/EffectsPreferences';
import {DamageNumbers} from '../combat/DamageNumbers';
const host=document.getElementById('view')!;
(document.getElementById('back') as HTMLAnchorElement).href=assetUrl('');
if(new URLSearchParams(location.search).has('embedded'))document.getElementById('back')!.hidden=true;
const renderer=new T.WebGLRenderer({antialias:true});renderer.setClearColor(0x27392c);host.append(renderer.domElement);
const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x444444,3));
const camera=new T.PerspectiveCamera(75,1,.05,100);camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);
scene.add(new T.GridHelper(30,30,0xaaaacc,0x526454));scene.add(new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.06,0),6,0xff4444));
const dummy=new T.Mesh(new T.CapsuleGeometry(.4,1,4,8),new T.MeshBasicMaterial({color:0xc8c5a8,wireframe:true}));scene.add(dummy);
let seed=1;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
let fox=new Fox(),sword=new SwordView(scene),staff=new StaffView(scene,random);scene.add(fox.root);const audio=new GameAudio(),numbers=new DamageNumbers();
const enemyPreview=new EnemyPreview(scene);
const modelPreview=new WeaponModelPreview(scene);
const soundPreview=new WeaponSoundPreview(),sharedHit=new SharedHitPreview(scene);
const soundPanel=document.createElement('div');soundPanel.className='sound-samples';soundPanel.style.display='none';host.before(soundPanel);
let audible=false;
let xpView=new XpView(scene),progression=new ProgressionView(scene);const pickupNumbers=new PickupNumbers(scene,camera,()=>({width:host.clientWidth,height:host.clientHeight}));
const characterRoom=()=>!!characterClip(weapon.value);
const enemyRoom=()=>weapon.value.startsWith('skeleton-')||weapon.value.startsWith('bandit-');
const pickupRoom=()=>['xp','gold','silver','level'].includes(weapon.value);
const run=new Run(()=>0,()=>true,random,event=>{if(audible)audio.play(event);});
const origin=new T.Vector3(),facing=()=>{const yaw=Number(rotate.value)*Math.PI/180;return new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));};
const frame=document.getElementById('frame') as HTMLInputElement,rotate=document.getElementById('rotate') as HTMLInputElement,weapon=document.getElementById('weapon') as HTMLSelectElement;
const play=document.getElementById('play') as HTMLButtonElement,stop=document.getElementById('stop') as HTMLButtonElement;
let animation=0,ticket=0,disposed=false,roomReady=false,loadTicket=0;const hitLabels:T.Sprite[]=[];
const playbackCadence=new RenderCadence();
const assets=new LabAssets();
const loaders:Record<string,()=>Promise<unknown>>={fox:async()=>{try{await fox.load();}catch(error){fox.dispose();scene.remove(fox.root);fox=new Fox();scene.add(fox.root);throw error;}},sword:async()=>{try{await sword.load();}catch(error){sword.dispose();sword=new SwordView(scene);throw error;}},staff:async()=>{try{await staff.load();}catch(error){staff.dispose();staff=new StaffView(scene,random);throw error;}},damage:()=>numbers.load(),xp:async()=>{try{await xpView.load();}catch(error){xpView.dispose();xpView=new XpView(scene);throw error;}},progression:async()=>{try{await progression.load();}catch(error){progression.dispose();progression=new ProgressionView(scene);throw error;}},pickup:()=>pickupNumbers.load(),skeleton:()=>enemyPreview.load('skeleton'),bandit:()=>enemyPreview.load('bandit')};
for(const [id] of weaponModels){loaders['model-'+id]=()=>modelPreview.load(id);loaders['media-'+id]=()=>soundPreview.load(id);}
loaders.hitFx=()=>sharedHit.load();
const target=()=>facing().multiplyScalar(weapon.value==='sword'?2.5:6);
function resetStaff(){seed=1;pickupNumbers.clear();run.reset();run.setWeapon(weapon.value==='sword'?'sword':'bolt');staff.reset();run.swarm.enemies.push({id:-1,position:target(),velocity:new T.Vector3(),health:1e6,flash:0});}
function resetXp(){
 seed=1;run.reset();staff.reset();progression.clear();pickupNumbers.clear();
 const kind=weapon.value==='gold'?'gold':weapon.value==='silver'?'silver':'xp';
 for(let i=0;i<(weapon.value==='level'?xpForLevel(1):3);i++)run.gems.push({kind,position:weapon.value==='level'?origin.clone():new T.Vector3((i-1)*.6,kind==='gold'?balance.goldSpawnHeight:balance.xpHoverHeight,-3-i*.5),value:kind==='xp'&&weapon.value!=='level'?[1,10,50][i]:1});
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
 const model=modelId(weapon.value);modelPreview.update(model,Number(rotate.value)*Math.PI/180+(weapon.value.startsWith('model-')?Number(frame.value)*Math.PI:0));
 if(hitRoom(weapon.value))sharedHit.advance(Number(frame.value),facing());
 fox.root.visible=!enemyRoom()&&!model;enemyPreview.update(weapon.value,Number(frame.value),facing());
 if(characterRoom())fox.preview(characterClip(weapon.value)!,Number(frame.value),Number(rotate.value)*Math.PI/180);else fox.update(origin,Number(rotate.value)*Math.PI/180,0,true,0,0);sword.update(run);staff.update(run,0);
 xpView.update(run);progression.update(run,origin,0);dummy.visible=!characterRoom()&&!pickupRoom()&&!enemyRoom()&&!model;dummy.position.copy(target()).y=.8;
 if(characterRoom()){camera.position.set(0,1.7,3.5);camera.lookAt(0,1,0);}else if(model){camera.position.set(3,2.3,3.8);camera.lookAt(0,1.25,0);}else if(weapon.value!=='sword'){camera.position.set(4,3,5);camera.lookAt(0,.8,-2);}else{camera.position.set(0,2.25,3.5);camera.lookAt(0,1.3,0);}
 pickupNumbers.update(run,0,origin);
 const showNumbers=getEffectsPreferences().damageNumbers;
 while(showNumbers&&hitLabels.length<run.hits.length){const sprite=new T.Sprite(numbers.material(0).clone());hitLabels.push(sprite);scene.add(sprite);}
 hitLabels.forEach((sprite,i)=>{
  const hit=run.hits[i];sprite.visible=!!hit&&!pickupRoom()&&showNumbers;if(!hit||!showNumbers)return;
  if(sprite.userData.damage!==hit.damage){sprite.material.dispose();sprite.material=numbers.material(hit.damage).clone();sprite.userData.damage=hit.damage;}
  sprite.material.opacity=Math.min(1,hit.life/.15);sprite.position.copy(hit.position);
  sprite.scale.set((sprite.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);
 });
 renderer.render(scene,camera);document.getElementById('time')!.textContent=Number(frame.value).toFixed(3)+' seconds';
}
function inspect(){
 if(disposed||!roomReady)return;audible=false;const age=Number(frame.value);sharedHit.reset();
 if(characterRoom()||enemyRoom()||modelId(weapon.value)){run.reset();staff.reset();progression.clear();pickupNumbers.clear();}
 else if(weapon.value==='sword'){resetStaff();advanceWeapon(age);}
 else if(pickupRoom()){resetXp();advanceXp(age);progression.update(run,origin,0);if(weapon.value==='level')progression.update(run,origin,age);}else{resetStaff();advanceWeapon(age);}
 paint();
}
function halt(){ticket++;cancelAnimationFrame(animation);playbackCadence.reset();audible=false;soundPreview.stop();audio.stopProgression();audio.stopGameplay();}
frame.addEventListener('input',()=>{halt();inspect();});rotate.addEventListener('input',()=>{halt();inspect();});
/** Rooms that embed a page instead of the 3D view: the level-up selection screen (drives the real Run/UpgradeMenu) and the native data tables. */
const pageRooms:Record<string,{page:string;title:string;text:string;ready:string}>={
 'levelup-screen':{page:'levelup.html',title:'LEVEL-UP SCREEN',ready:'Ready · Selection screen',text:'Real selection screen driven by the real game Run: press "Give level-up" inside it, pick a card and read the log. Banish/Skip/Refresh stay disabled until their rules are known.'},
 'native-data':{page:'data.html',title:'NATIVE DATA',ready:'Ready · Native data',text:'Serialized game data (enemies, stages, weapons, Tomes, items, characters, maps) with notes on what the web already uses. Use the tabs and search inside.'},
};
const pageFrames=new Map<string,HTMLIFrameElement>();
function showPageRoom(room:string|undefined){
 host.style.display=room?'none':'';
 for(const [id,info] of Object.entries(pageRooms)){
  let frame=pageFrames.get(id);
  if(!frame&&id===room){frame=document.createElement('iframe');frame.title=info.title;frame.style.cssText='display:none;width:100%;height:78vh;min-height:560px;border:1px solid #605747;background:#121b20';frame.src=assetUrl(`${info.page}?embedded=1`);host.after(frame);pageFrames.set(id,frame);}
  if(frame)frame.style.display=id===room?'block':'none';
 }
}
async function selectRoom(){
 const pageRoom=pageRooms[weapon.value];
 if(pageRoom){
  halt();loadTicket++;roomReady=false;showPageRoom(weapon.value);renderer.clear();sharedHit.reset();soundPanel.style.display='none';soundPanel.replaceChildren();retry.hidden=true;
  play.disabled=true;stop.disabled=true;frame.disabled=true;rotate.disabled=true;readiness.textContent=pageRoom.text;
  document.getElementById('room-title')!.textContent=`WARCORE LAB · ${pageRoom.title}`;document.getElementById('ready')!.textContent=pageRoom.ready;return;
 }
 showPageRoom(undefined);
 retry.hidden=true;readiness.textContent=roomReadiness(weapon.value);
 const request=++loadTicket;roomReady=false;play.disabled=true;stop.disabled=true;frame.disabled=true;rotate.disabled=true;sharedHit.reset();soundPanel.style.display='none';soundPanel.replaceChildren();
 const status=document.getElementById('ready')!;status.textContent='Loading room…';renderer.clear();
 const model=modelId(weapon.value);
 frame.max=characterRoom()?String(fox.clipDuration(characterClip(weapon.value)!)||7):model?'2':enemyRoom()?'1.5':weapon.value==='sword'?'.8':pickupRoom()?'2':'1.5';frame.value=model?'0':weapon.value==='sword'?'.01':'.08';
 play.textContent=characterRoom()?'Play animation':soundRoom(weapon.value)?'Choose a sound below':hitRoom(weapon.value)?'Play effect + sound':model?'Rotate model':'Play test + sound';document.getElementById('mute')!.style.display=characterRoom()||model&&!soundRoom(weapon.value)&&!hitRoom(weapon.value)?'none':'';
 document.getElementById('room-title')!.textContent=`WARCORE LAB · ${characterRoom()||model||enemyRoom()?enemySelect.options[enemySelect.selectedIndex].text+' - '+weapon.options[weapon.selectedIndex].text:weapon.value==='sword'?'SWORD':pickupRoom()?weapon.value.toUpperCase():'FIRESTAFF'}`;
 try{
  await Promise.all(roomAssets(weapon.value).map(key=>assets.load(key,loaders[key])));
  if(disposed||request!==loadTicket)return;
  if(characterRoom()){frame.max=String(fox.clipDuration(characterClip(weapon.value)!));frame.value='0';}
  roomReady=true;play.disabled=soundRoom(weapon.value);stop.disabled=false;frame.disabled=soundRoom(weapon.value);rotate.disabled=false;status.textContent=soundRoom(weapon.value)?'Ready · Sound samples':hitRoom(weapon.value)?'Ready · Shared hit effect':model?'Ready · Model preview':'Ready';
  if(model&&soundRoom(weapon.value)){
   soundPanel.style.display='flex';soundPanel.setAttribute('role','group');soundPanel.setAttribute('aria-label','Weapon sound samples');
   for(const sample of soundPreview.samples(model)){
    const button=document.createElement('button');button.textContent=sample.name;button.addEventListener('click',()=>{halt();const soundRequest=ticket;status.textContent=`Sound sample · ${sample.name}`;void soundPreview.play(sample).catch(error=>{if(!disposed&&soundRequest===ticket)status.textContent=String(error);});});soundPanel.append(button);
   }
  }
  inspect();
 }catch(error){if(disposed||request!==loadTicket)return;status.textContent=`Could not load room: ${String(error)}. Use Retry to load this room again.`;retry.hidden=false;}
}
const categories={
 characters:characterRooms.map(([id,label])=>[id,label] as const),
 weapons:[['sword','Sword - Combat'],['bolt','Firestaff - Combat'],...weaponModelRooms],
 pickups:[['xp','EXP tiers'],['gold','Gold'],['silver','Silver']],
 effects:[['level','Level up'],['levelup-screen','Level-up selection screen']],
 data:[['native-data','Native data tables']],
 enemies:[['skeleton-walk','Skeleton - Walk'],['skeleton-hit','Skeleton - Hit'],['skeleton-death','Skeleton - Death'],['bandit-walk','Bandit - Walk'],['bandit-hit','Bandit - Hit'],['bandit-death','Bandit - Death']],
} as const;
type Category=keyof typeof categories;
// Group weapons and enemies by entity, with a separate room/action selector.
const enemySelect=document.createElement('select'),enemyLabel=document.createElement('label');
enemySelect.setAttribute('aria-label','Enemy');enemyLabel.append('Enemy',enemySelect);
const entityKey=(category:Category,room:string)=>(category==='enemies'||category==='characters')?room.split('-')[0]:modelId(room)??room;
const entityNames=(category:Category)=>new Map(categories[category].map(([value,text])=>[entityKey(category,value),text.split(' - ')[0]]));
weapon.parentElement!.before(enemyLabel);
enemySelect.addEventListener('change',()=>{
 if(currentCategory==='enemies'||currentCategory==='characters'){
  const action=weapon.value.split('-').slice(1).join('-');openCategory(currentCategory,`${enemySelect.value}-${action}`);
 }else{
  const room=categories.weapons.find(([value])=>entityKey('weapons',value)===enemySelect.value)![0];openCategory('weapons',room);
 }
});
const search=document.createElement('input');search.type='search';search.placeholder='Search this category…';search.setAttribute('aria-label','Search Lab');
const searchLabel=document.createElement('label');searchLabel.append('Search ',search);enemyLabel.before(searchLabel);
const readiness=document.createElement('p');readiness.className='lab-readiness';host.before(readiness);
function roomReadiness(room:string){if(characterClip(room))return 'Animation preview ready · original Fox clips at source speed. Grind is a clip preview, not an enabled gameplay skill. Character audio/event mapping is pending.';if(room==='sword'||room==='bolt')return 'Combat test ready · web tuning; native parity is not complete.';if(modelId(room))return 'Preview assets ready · native attack behavior still needs data. Model / sounds / shared hit rooms are separate previews.';if(room.startsWith('skeleton-')||room.startsWith('bandit-'))return 'Animation preview ready · native attacks, boss skills and stage spawning still need data.';return 'Pickup / effect test ready · unverified currency rules remain documented.';}
const retry=document.createElement('button');retry.textContent='Retry room';retry.hidden=true;retry.addEventListener('click',()=>{halt();void selectRoom();});document.getElementById('ready')!.after(retry);
const version=document.createElement('small');version.textContent=' · BUILD '+buildVersion;document.getElementById('room-title')!.after(version);
search.addEventListener('input',()=>openCategory(currentCategory));
const tabs=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-category]'));
const lastRoom:Record<Category,string>={characters:'fox-idle',weapons:'sword',pickups:'xp',effects:'level',data:'native-data',enemies:'skeleton-walk'};
let currentCategory:Category='weapons';
function openCategory(category:Category,room=lastRoom[category],preview=true){
 currentCategory=category;
 const grouped=category==='characters'||category==='enemies'||category==='weapons';enemyLabel.style.display=grouped?'':'none';
 if(grouped){
  const names=new Map(Array.from(entityNames(category)).filter(([key,text])=>`${key} ${text}`.toLowerCase().includes(search.value.trim().toLowerCase())));enemySelect.replaceChildren(...Array.from(names,([value,text])=>new Option(text,value)));
  enemyLabel.firstChild!.textContent=category==='characters'?'Character':category==='weapons'?'Weapon':'Enemy';enemySelect.setAttribute('aria-label',category==='characters'?'Character':category==='weapons'?'Weapon':'Enemy');
  const key=entityKey(category,room);enemySelect.value=names.has(key)?key:enemySelect.options[0]?.value??'';
 }
 const rooms=categories[category].filter(([value,text])=>grouped?entityKey(category,value)===enemySelect.value:`${value} ${text}`.toLowerCase().includes(search.value.trim().toLowerCase()));
 for(const tab of tabs){const active=tab.dataset.category===category;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
 document.getElementById('lab-room-panel')!.setAttribute('aria-labelledby','tab-'+category);
 if(!rooms.length){halt();loadTicket++;roomReady=false;renderer.clear();weapon.replaceChildren();play.disabled=true;stop.disabled=true;frame.disabled=true;rotate.disabled=true;retry.hidden=true;soundPanel.style.display='none';readiness.textContent='No matching previews in this category. Clear the search or choose another category.';document.getElementById('ready')!.textContent='No results';return;}
 weapon.replaceChildren(...rooms.map(([value,text])=>new Option(grouped?text.split(' - ')[1]:text,value)));
 weapon.value=rooms.some(([value])=>value===room)?room:rooms[0][0];lastRoom[category]=weapon.value;
 for(const tab of tabs){const active=tab.dataset.category===category;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
 document.getElementById('lab-room-panel')!.setAttribute('aria-labelledby','tab-'+category);
 if(preview){halt();selectRoom();}
}
for(const [index,tab] of tabs.entries()){
 tab.addEventListener('click',()=>{search.value='';openCategory(tab.dataset.category as Category);});
 tab.addEventListener('keydown',event=>{
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
  else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
  event.preventDefault();search.value='';tabs[next].focus();openCategory(tabs[next].dataset.category as Category);
 });
}
const requestedRoom=new URLSearchParams(location.search).get('weapon');
const initialCategory=(Object.keys(categories) as Category[]).find(key=>categories[key].some(([room])=>room===requestedRoom))??'weapons';
openCategory(initialCategory,requestedRoom??lastRoom[initialCategory],false);
weapon.addEventListener('change',()=>{lastRoom[currentCategory]=weapon.value;halt();selectRoom();});
const resizeLab=()=>{applyVideoPreferences(renderer,camera,scene,getVideoPreferences(),host.clientWidth,host.clientHeight,devicePixelRatio,'lab');paint();};
const resize=new ResizeObserver(resizeLab);resize.observe(host);
const unsubscribeVideo=subscribeVideoPreferences(()=>{playbackCadence.reset();resizeLab();});
const unsubscribeEffects=subscribeEffectsPreferences(paint);
play.addEventListener('click',async()=>{
 if(!roomReady||soundRoom(weapon.value))return;
 halt();sharedHit.reset();const request=ticket;play.disabled=true;if(!characterRoom()&&(!modelId(weapon.value)||hitRoom(weapon.value)))await audio.prepare();if(disposed||request!==ticket||!roomReady)return;play.disabled=false;
 const kind=weapon.value;if(characterRoom()||enemyRoom()||modelId(kind)){run.reset();staff.reset();progression.clear();pickupNumbers.clear();}else if(pickupRoom())resetXp();else resetStaff();audible=!characterRoom()&&!modelId(kind);let lastAge=0,hitSoundPlayed=false;const start=performance.now(),limit=Number(frame.max);
 const tick=(time:number)=>{
  if(disposed||request!==ticket)return;
  if(!playbackCadence.ready(time,getVideoPreferences().fpsLimit)){animation=requestAnimationFrame(tick);return;}
  const age=Math.min(limit,(time-start)/1000);frame.value=String(age);
  if(characterClip(kind)){paint();}else if(modelId(kind)){if(hitRoom(kind)&&!hitSoundPlayed){hitSoundPlayed=true;audio.play('staffHit');}paint();}else if(enemyRoom()){if(lastAge<.2&&age>=.2&&!kind.endsWith('-walk'))audio.play('staffHit');paint();}else if(kind==='bolt'||kind==='sword'){advanceWeapon(age);paint();}else if(pickupRoom()){advanceXp(age);progression.update(run,origin,age-lastAge);if(kind==='level')audio.setLevelModal(run.blocked);paint();}else{inspect();}lastAge=age;
  if(age<limit)animation=requestAnimationFrame(tick);else{audible=false;audio.setLevelModal(false);}
 };
 frame.value='0';animation=requestAnimationFrame(tick);
});
stop.addEventListener('click',halt);
document.getElementById('mute')!.addEventListener('click',()=>{const muted=audio.toggle(),button=document.getElementById('mute')!;soundPreview.setMuted(muted);button.textContent=muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(muted));});
const syncMute=()=>{const button=document.getElementById('mute')!;button.textContent=audio.muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(audio.muted));};
const unsubscribeMute=subscribeAudioPreferences(syncMute);syncMute();
window.addEventListener('pagehide',()=>{disposed=true;halt();unsubscribeMute();unsubscribeVideo();unsubscribeEffects();resize.disconnect();audio.dispose();soundPreview.dispose();sharedHit.dispose();modelPreview.dispose();enemyPreview.dispose();sword.dispose();staff.dispose();xpView.dispose();progression.dispose();pickupNumbers.dispose();fox.dispose();for(const sprite of hitLabels){scene.remove(sprite);sprite.material.dispose();}numbers.dispose();dummy.geometry.dispose();dummy.material.dispose();renderer.dispose();});
for(const tab of tabs)tab.disabled=false;
void selectRoom();
