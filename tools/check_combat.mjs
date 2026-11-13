import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
for(const name of ['combat/Run','combat/Pickups','combat/Balance','combat/AttackTiming','enemies/Swarm']){
  const destination=resolve('.local-evidence/combat-check',name+'.js');mkdirSync(dirname(destination),{recursive:true});
  const code=ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'");writeFileSync(destination,code);
}
const {Run}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/Run.js')));
const player=new Vector3();let seed=1;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const create=()=>new Run(()=>0,()=>false,random);
const run=create();
run.swarm.enemies.push({id:999,position:new Vector3(0,0,-5),velocity:new Vector3(),health:10,flash:0});
run.step(.5,player);assert.equal(run.snapshot().kills,1,'Automatic attack must hit a target crossed between frames');assert.equal(run.gems.filter(p=>(p.kind??'xp')==='xp').reduce((n,p)=>n+(p.value??1),0)+run.snapshot().xp,1,'A killed enemy must preserve its XP, including immediate attraction');
run.gems.push({position:player.clone()});
run.gems[0].position.copy(player);run.step(.02,player);assert.equal(run.snapshot().xp,2,'Near XP must be collected');
const upgradeRun=create();for(let i=0;i<13;i++)upgradeRun.gems.push({position:player.clone()});upgradeRun.step(.02,player);
assert.equal(upgradeRun.snapshot().level,3);assert.equal(upgradeRun.snapshot().pendingUpgrades,2,'Multiple earned levels must preserve both choices');
const time=upgradeRun.snapshot().elapsed;const before=upgradeRun.swarm.enemies[0].position.clone();upgradeRun.step(10,player);
assert.equal(upgradeRun.snapshot().elapsed,time);assert.ok(before.equals(upgradeRun.swarm.enemies[0].position),'Level choices must freeze the simulation');
assert.equal(upgradeRun.choose('damage'),true);assert.equal(upgradeRun.blocked,true);assert.equal(upgradeRun.choose('projectiles'),true);assert.equal(upgradeRun.blocked,false);assert.equal(upgradeRun.choose('haste'),false,'Cannot grant a free upgrade');
const death=create();death.swarm.enemies.push({id:998,position:player.clone(),velocity:new Vector3(),health:Infinity,flash:0});
death.step(.02,player);const health=death.snapshot().health;for(let i=0;i<20;i++)death.step(.02,player);assert.equal(death.snapshot().health,health,'Contact damage must respect invulnerability interval');
for(let i=0;i<1000&&!death.blocked;i++)death.step(.02,player);assert.equal(death.snapshot().dead,true);assert.equal(death.snapshot().health,0);
death.reset();assert.equal(death.snapshot().health,100);assert.equal(death.snapshot().dead,false);assert.equal(death.swarm.enemies.length,0);assert.equal(death.bolts.length,0);assert.equal(death.snapshot().pendingUpgrades,0);
const hidden=new Run(()=>0,()=>true,random);hidden.step(.02,player);assert.equal(hidden.swarm.enemies.length,0,'Spawn must reject positions visible to camera');
console.log('Combat checks passed: auto-hit, drops, collection, queued upgrades, freeze, damage interval, death, reset and offscreen spawn.');

const sword=new Run(()=>0,()=>true,random);
assert.equal(sword.setWeapon('sword'),true);
const enemy=(id,x,z)=>({id,position:new Vector3(x,0,z),velocity:new Vector3(),health:100,flash:0});
const front=enemy(1001,0,-2),behind=enemy(1002,0,2),far=enemy(1003,0,-10);
sword.swarm.enemies.push(front,behind,far);sword.step(.02,player);
assert.equal(front.health,90,'Sword must hit its forward sector');assert.equal(behind.health,100,'Sword must not hit behind a single sector');assert.equal(far.health,100,'Sword range must be bounded');assert.equal(sword.bolts.length,0,'Sword must not fire bolts');assert.equal(sword.slashes.length,1);
assert.equal(sword.setWeapon('bolt'),false,'Weapon changes are restricted to a fresh run');
for(let i=0;i<5;i++)sword.step(.02,player);assert.equal(front.health,90,'A persistent swing must hit each enemy once');
for(let i=0;i<5;i++)sword.gems.push({position:player.clone()});sword.step(.02,player);
const slashLife=sword.slashes[0].life;sword.step(.1,player);assert.equal(sword.slashes[0].life,slashLife,'Upgrade pause must freeze slash age');
sword.reset();assert.equal(sword.snapshot().weapon,'sword');assert.equal(sword.slashes.length,0);assert.equal(sword.snapshot().elapsed,0);assert.equal(sword.setWeapon('bolt'),true);
const multi=new Run(()=>0,()=>true,random);multi.setWeapon('sword');for(let i=0;i<5;i++)multi.gems.push({position:player.clone()});multi.step(.02,player);multi.choose('projectiles');
for(let i=0;i<44;i++)multi.step(.02,player);
const shared=enemy(1004,0,-2);multi.swarm.enemies.push(shared);multi.step(.02,player);assert.equal(multi.slashes.length,1,'Quantity must not create a simultaneous side fan');assert.equal(shared.health,90);
for(let i=0;i<14;i++)multi.step(.02,player);
assert.equal(shared.health,80,'A later slash in the burst must be able to hit the same enemy again');
assert.ok(multi.slashes.every(slash=>slash.direction.equals(new Vector3(0,0,-1))),'Extra quantity must preserve forward direction');
console.log('Sword checks passed: sector, range, single-hit window, bolt isolation, selection, pause, reset and sequential repeat hits.');

const emptySword=new Run(()=>0,()=>true,random);emptySword.setWeapon('sword');
emptySword.step(.02,player,new Vector3(1,0,0));
assert.equal(emptySword.swarm.enemies.length,0);assert.equal(emptySword.slashes.length,1,'Sword must swing even without enemies');
assert.ok(emptySword.slashes[0].direction.equals(new Vector3(1,0,0)),'Sword must use facing rather than acquire a target');
const sideTarget=enemy(1100,0,-2);emptySword.swarm.enemies.push(sideTarget);
emptySword.step(.02,player,new Vector3(1,0,0));assert.equal(sideTarget.health,100,'A monster to the side must not redirect the swing');
emptySword.swarm.clear();for(let i=0;i<44;i++)emptySword.step(.02,player,new Vector3(1,0,0));
assert.ok(emptySword.slashes.length>0,'Sword must repeat on cooldown without a target');
console.log('Sword cadence checks passed: empty-space attacks, facing direction, no target steering and repeated swings.');

const {burstInterval}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/AttackTiming.js')));
assert.equal(burstInterval(.5,.1,2,1,.02),.25);
assert.equal(burstInterval(.5,.1,2,2,.02),.125,'Attack speed scales burst spacing');
assert.equal(burstInterval(.5,.1,100,20,.02),.02,'Native burst interval cannot be shorter than one fixed step');
assert.equal(burstInterval(0,.1,2,1,.02),0,'Nonpositive native burstTime uses immediate policy');
console.log('Recovered attack timing checks passed: quantity, attack speed, fixed-step floor and immediate policy.');

const staffEvents=[];const staff=new Run(()=>0,()=>true,random,event=>staffEvents.push(event));
const primary=enemy(2001,0,-5),nearby=enemy(2002,1,-5),outside=enemy(2003,2,-5);staff.swarm.enemies.push(primary,nearby,outside);
staff.step(.25,player);
assert.equal(primary.health,90);assert.equal(nearby.health,90,'Firestaff explosion must damage nearby enemies');assert.equal(outside.health,100,'Explosion range must be bounded');
assert.ok(staff.staffEffects.some(effect=>effect.kind==='muzzle'));assert.ok(staff.staffEffects.some(effect=>effect.kind==='impact'));assert.ok(staff.staffEffects.some(effect=>effect.kind==='hit'));
assert.equal(staffEvents.filter(e=>e==='shot').length,1);assert.equal(staffEvents.filter(e=>e==='staffImpact').length,1);assert.equal(staffEvents.filter(e=>e==='staffHit').length,1);
staff.reset();assert.equal(staff.staffEffects.length,0,'Reset must clear all Firestaff phases');
const emptyStaff=new Run(()=>0,()=>true,random,event=>staffEvents.push(event));const eventCount=staffEvents.length;emptyStaff.step(.02,player);assert.equal(emptyStaff.bolts.length,0);assert.equal(staffEvents.length,eventCount,'No-target TryInit must not make a phantom shot sound');
for(let i=0;i<5;i++)emptyStaff.gems.push({position:player.clone()});emptyStaff.step(.02,player);emptyStaff.choose('projectiles');
emptyStaff.swarm.enemies.push(enemy(2100,0,-12));emptyStaff.step(.02,player);assert.equal(emptyStaff.bolts.length,1,'Quantity must not create a simultaneous spread');
for(let i=0;i<25;i++)emptyStaff.step(.02,player);assert.equal(staffEvents.filter(e=>e==='shot').length,3,'Quantity2 must produce two timed shots');
console.log('Firestaff checks passed: targeted burst, source phase events, bounded explosion damage, no-target silence and reset.');

const pickups=new Run(()=>0,()=>true,()=>.5);
for(let i=0;i<350;i++)pickups.spawnPickup('xp',new Vector3(i*20,0,0));
assert.equal(pickups.gems.length,300,'XP cap must combine rather than grant XP early');
assert.equal(pickups.gems.reduce((sum,p)=>sum+(p.value??1),0),350,'Combining must conserve value');
assert.equal(pickups.snapshot().xp,0,'Uncollected XP must remain in world');
pickups.reset();pickups.spawnPickup('xp',new Vector3(0,0,-3),9);pickups.spawnPickup('xp',new Vector3(0,0,-3),1);
assert.equal(pickups.gems.length,1);assert.equal(pickups.gems[0].value,10);
pickups.reset();pickups.gems.push({kind:'gold',position:player.clone(),value:3},{kind:'silver',position:player.clone(),value:2});pickups.step(.02,player);
for(let i=0;i<50;i++)pickups.step(.02,player);
assert.equal(pickups.snapshot().gold,3);assert.equal(pickups.snapshot().silver,2);assert.equal(pickups.snapshot().xp,0);
pickups.reset();assert.equal(pickups.snapshot().gold,0);assert.equal(pickups.snapshot().silver,0);
const {movePickup,xpAppearance}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/Pickups.js')));
assert.equal(xpAppearance(9).tier,'low');assert.equal(xpAppearance(10).scale,1.25);assert.equal(xpAppearance(50).scale,1.5);assert.equal(xpAppearance(100,true).tier,'echo');
const magnet={position:new Vector3(0,0,-4)};movePickup(magnet,player,.02,5);assert.ok(magnet.speed>0);magnet.position.z=-20;movePickup(magnet,player,.02,5);assert.equal(magnet.following,true,'Attraction remains latched after leaving radius');
assert.equal(movePickup({position:new Vector3(0,0,-1),following:true,speed:150},player,.1,5),true,'Fast pickups must not overshoot the player');
console.log('Progression checks passed: stacking, conservation, tiers, attraction, money and reset.');

const collected=[];const feedback=new Run(()=>0,()=>true,()=>.5,event=>collected.push(event));
feedback.gems.push({position:player.clone(),value:2},{position:player.clone(),value:1});feedback.step(.02,player);
assert.equal(feedback.xpReceipts.length,1,'Same-tick collection must produce one readable total');assert.equal(feedback.xpReceipts[0].value,3);assert.equal(feedback.xpReceipts[0].pickups,2,'Aggregated XP tracks pickup count separately from awarded value');assert.equal(collected.filter(e=>e==='xp').length,2,'Each collected entity must dispatch collection audio');
assert.equal(feedback.xpReceipts[0].position.y,1.8,'XP feedback must appear above the player');
feedback.step(.02,player);assert.equal(feedback.xpReceipts.length,1,'Empty steps must not repeat feedback');feedback.reset();assert.equal(feedback.xpReceipts.length,0,'New run must clear collection feedback');
console.log('XP feedback checks passed: actual total, collection sound dispatch, no duplicates and reset.');

const currencies=new Run(()=>0,()=>true,()=>.5);
currencies.gems.push({kind:'gold',position:player.clone(),value:4},{kind:'silver',position:player.clone(),value:7});currencies.step(.02,player);
for(let i=0;i<50;i++)currencies.step(.02,player);
assert.equal(currencies.snapshot().gold,4);assert.equal(currencies.snapshot().silver,7);assert.equal(currencies.currencyReceipts.length,2);
assert.deepEqual(currencies.currencyReceipts.map(r=>r.kind).sort(),['gold','silver']);
currencies.reset();assert.equal(currencies.currencyReceipts.length,0);
currencies.spawnPickup('gold',new Vector3(0,5,0));assert.equal(currencies.gems[0].position.y,.35,'Gold starts near ground like EXP');
for(const name of ['combat/PickupNumbers','combat/DamageNumbers','core/assetUrl']){
 const dest=resolve('.local-evidence/combat-check',name+'.js');mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const T=await import('three');
const {DamageNumbers}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/DamageNumbers.js')));
DamageNumbers.prototype.material=function(){return new T.SpriteMaterial({map:new T.Texture({width:128,height:80})});};
const {PickupNumbers}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/PickupNumbers.js')));
const scene=new T.Scene(),camera=new T.PerspectiveCamera(75,16/9,.05,100);camera.position.set(0,2,5);camera.lookAt(0,1,0);
const overlay=new PickupNumbers(scene,camera,()=>({width:1280,height:720}));
const mock={snapshot:()=>({elapsed:1}),xpReceipts:[{value:3}],currencyReceipts:[{kind:'gold',value:4},{kind:'silver',value:7}]};
overlay.update(mock,.02,player);const root=camera.children[0];assert.equal(root.children.length,3,'Three currencies require distinct screen rows');
const baseHeight=overlay.counters.get('xp').sprite.scale.y;mock.xpReceipts=[{value:1}];overlay.update(mock,0,player);assert.ok(Math.abs(overlay.counters.get('xp').sprite.scale.y/baseHeight-1.1)<.00001,'Second pickup adds ten percent');
for(let i=0;i<50;i++){mock.xpReceipts=[{value:1}];overlay.update(mock,.02,player);}
assert.equal(root.children.length,3,'Rapid pickups must replace counters, not leak sprites');assert.ok(overlay.counters.get('xp').sprite.scale.y<=baseHeight*1.8);
const height=overlay.counters.get('xp').sprite.scale.y;camera.position.z=12;camera.lookAt(0,1,0);overlay.update(mock,0,player);assert.equal(overlay.counters.get('xp').sprite.scale.y,height,'Counter size must stay constant as camera distance changes');
overlay.update(mock,2,player);assert.ok(root.children.every(s=>!s.visible),'Idle counters fade away');overlay.dispose();assert.equal(camera.children.length,0);
console.log('Currency feedback checks passed: separate balances, bounded screen counters, distance-independent size, idle fade and disposal.');

const meleeSounds=[];const meleeFx=new Run(()=>0,()=>true,()=>.5,event=>meleeSounds.push(event));meleeFx.setWeapon('sword');
meleeFx.swarm.enemies.push({...enemy(3001,0,-2),health:1},{...enemy(3002,.3,-2),health:1});meleeFx.step(.02,player);
assert.equal(meleeSounds.filter(e=>e==='staffHit').length,1,'Sword multi-target hit must emit Hit2 only once');
assert.equal(meleeFx.staffEffects.filter(e=>e.kind==='hit').length,2,'Each damaged target gets its own hit visual');
assert.equal(meleeFx.swarm.enemies.length,0,'Dead enemies must leave collision/target selection immediately');
assert.equal(meleeFx.remains.length,2,'Dead enemies must remain visible for dissolution');assert.equal(meleeFx.snapshot().kills,2);
const remainingLife=meleeFx.remains[0].life;for(let i=0;i<30;i++)meleeFx.step(.02,new Vector3(50,0,50));
assert.equal(meleeFx.remains.length,0,'Dissolved corpses must expire');assert.ok(remainingLife>0);
meleeFx.reset();assert.equal(meleeFx.remains.length,0);
const aoeSounds=[];const aoe=new Run(()=>0,()=>true,()=>.5,event=>aoeSounds.push(event));aoe.setWeapon('sword');
aoe.swarm.enemies.push(enemy(4001,0,-6),enemy(4002,.2,-6.2));aoe.bolts.push({position:new Vector3(0,.7,-5),velocity:new Vector3(0,0,-50),life:1,damage:1});aoe.step(.02,player);
assert.equal(aoeSounds.filter(e=>e==='staffImpact').length,1);assert.equal(aoeSounds.filter(e=>e==='staffHit').length,1,'AoE emits one Hit2 for all targets');assert.equal(aoe.staffEffects.filter(e=>e.kind==='hit').length,2);
console.log('Damage feedback checks passed: Sword/AoE single-hit audio, per-enemy VFX, immediate death removal and corpse expiry.');

const goldDrop=new Run(()=>0,()=>true,()=>.5);goldDrop.setWeapon('sword');goldDrop.swarm.enemies.push({...enemy(5001,0,-2),health:1});goldDrop.step(.02,player);
const droppedGold=goldDrop.gems.find(p=>p.kind==='gold');assert.ok(droppedGold,'Every killed enemy drops a gold pickup in gameplay');assert.equal(goldDrop.snapshot().gold,0,'Gold is not awarded before pickup');
assert.ok(droppedGold.collectDelay>0,'Dropped gold remains visible briefly');const droppedXp=goldDrop.gems.find(p=>(p.kind??'xp')==='xp');if(droppedXp)assert.ok(droppedGold.position.distanceTo(droppedXp.position)>.3,'Gold does not overlap EXP');
for(let i=0;i<40;i++)goldDrop.step(.02,player);assert.equal(goldDrop.snapshot().gold,1,'Visible gold is eventually collected exactly once');
console.log('Gameplay gold drop checks passed: death spawn, visible separation/delay and collection.');

const curvedGold={kind:'gold',position:new Vector3(4,1.8,0),following:true,speed:50};
movePickup(curvedGold,new Vector3(0,.35,0),.02,5);const linearY=1.8+(.35-1.8)*curvedGold.pullProgress;
assert.ok(curvedGold.position.y>linearY,'Gold attraction arches above the direct line');

const remoteGold={kind:'gold',position:new Vector3(30,.35,0)};let remoteCollected=false;
for(let i=0;i<100&&!remoteCollected;i++)remoteCollected=movePickup(remoteGold,new Vector3(0,.35,0),.02,5);
assert.equal(remoteGold.following,true,'Gold automatically follows outside the magnet radius');assert.equal(remoteCollected,true);
const remoteXp={kind:'xp',position:new Vector3(30,.35,0)};movePickup(remoteXp,new Vector3(0,.35,0),.02,5);assert.ok(!remoteXp.following,'EXP still requires magnet range');
const nearGold={kind:'gold',position:new Vector3(.3,.35,0)};assert.equal(movePickup(nearGold,new Vector3(0,.35,0),.02,5),false,'Nearby Gold still performs its arc before collection');assert.ok(nearGold.position.y>.35);
console.log('Gold automatic arc checks passed: distant collection, close-range launch and unchanged EXP magnet behavior.');
