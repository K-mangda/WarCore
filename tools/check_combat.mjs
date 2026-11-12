import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
for(const name of ['combat/Run','combat/Balance','enemies/Swarm']){
  const destination=resolve('.local-evidence/combat-check',name+'.js');mkdirSync(dirname(destination),{recursive:true});
  const code=ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'");writeFileSync(destination,code);
}
const {Run}=await import(pathToFileURL(resolve('.local-evidence/combat-check/combat/Run.js')));
const player=new Vector3();let seed=1;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const create=()=>new Run(()=>0,()=>false,random);
const run=create();
run.swarm.enemies.push({id:999,position:new Vector3(0,0,-5),velocity:new Vector3(),health:10,flash:0});
run.step(.5,player);assert.equal(run.snapshot().kills,1,'Automatic attack must hit a target crossed between frames');assert.equal(run.gems.length,1,'A killed enemy must drop XP');
run.gems[0].position.copy(player);run.step(.02,player);assert.equal(run.snapshot().xp,1,'Near XP must be collected');
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
