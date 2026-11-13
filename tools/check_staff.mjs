import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import * as T from 'three';
for(const name of ['combat/Run','combat/Pickups','combat/Balance','combat/AttackTiming','combat/StaffView','combat/ProgressionView','combat/XpAppearance','core/assetUrl','enemies/Swarm','player/Physics']){
 const path=resolve('.local-evidence/staff-check',name+'.js');mkdirSync(dirname(path),{recursive:true});
 writeFileSync(path,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const {StaffView}=await import(pathToFileURL(resolve('.local-evidence/staff-check/combat/StaffView.js')));
const {Run}=await import(pathToFileURL(resolve('.local-evidence/staff-check/combat/Run.js')));
const manifest=JSON.parse(readFileSync('public/weapons/staff/manifest.json','utf8'));
assert.equal(manifest.weapon.enumId,0);assert.equal(manifest.weapon.projectilePrefabPathId,4255);
assert.equal(manifest.audio.muzzle.audioSourceEnabled,0,'Disabled native muzzle audio must stay silent');
const scene=new T.Scene(),view=new StaffView(scene,()=>.4);view.manifest=manifest;
for(const material of Object.values(manifest.materials))view.textures.set(material.texture.file,new T.Texture());
for(const phase of Object.values(manifest.phases))for(const layer of phase.particles)view.makeBatch(layer);
assert.equal(view.batches.size,13,'All native projectile, muzzle, explosion and hit layers must be represented');
const run=new Run(()=>0,()=>true,()=>.4);run.swarm.enemies.push({id:1,position:new T.Vector3(0,0,-6),velocity:new T.Vector3(),health:100,flash:0});run.step(.02,new T.Vector3());view.update(run,.02);
const count=()=>[...view.batches.values()].reduce((n,b)=>n+b.particles.length,0);const initial=count();assert.ok(initial>0,'First firing tick must emit visual particles');
for(let i=0;i<30;i++)view.update(run,0);assert.equal(count(),initial,'Paused rendering must not repeat zero-time bursts');
for(let i=0;i<200;i++){run.step(.02,new T.Vector3());view.update(run,.02);assert.ok(count()<=2400,'Particle count must stay bounded');}
run.reset();view.update(run,0);assert.equal(count(),0,'Reset must remove old particles and trails');
run.swarm.enemies.push({id:2,position:new T.Vector3(0,0,-30),velocity:new T.Vector3(),health:100,flash:0});
for(let i=0;i<40;i++){run.step(.02,new T.Vector3());view.update(run,.02);}
const coreId=manifest.phases.projectile.particles.find(p=>p.name==='FireballProjectile').pathId;
assert.ok(view.batches.get(coreId).particles.length>0,'Native looping core must remain visible during long flight');
run.reset();view.update(run,0);

view.dispose();assert.equal(scene.children.length,0,'Disposal must remove every particle mesh');
for(const file of ['retro_shoot_fireball3','retro_explosion_fireball1','retro_explosion_fireball3','Hit2']){const wav=readFileSync(`public/weapons/staff/audio/${file}.wav`);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.ok(wav.length>44);}
console.log('Firestaff renderer checks passed: 13 source layers, valid media, pause, reset, bounded particles and disposal. No GPU/image/audio fidelity claim.');

const {ProgressionView}=await import(pathToFileURL(resolve('.local-evidence/staff-check/combat/ProgressionView.js')));
const progressionScene=new T.Scene(),progression=new ProgressionView(progressionScene);
progression.data=JSON.parse(readFileSync('public/progression/manifest.json','utf8'));
for(const name of ['text','burst','gold','silver'])progression.textures.set(name,new T.Texture());
const fixture={snapshot:()=>({level:2,elapsed:1}),gems:[]};progression.update(fixture,new T.Vector3(),0);
const text=progression.effects.find(e=>e.kind==='text');assert.ok(text);const startScale=text.sprite.scale.x;
const startPosition=text.sprite.position.clone();for(let i=0;i<10;i++)progression.update(fixture,new T.Vector3(),0);
assert.equal(text.age,0,'Paused rendering must not age the LEVEL UP effect');assert.ok(text.sprite.position.equals(startPosition));
progression.update(fixture,new T.Vector3(),.14);assert.ok(text.sprite.scale.x>startScale,'Text must grow from small');
const side=Math.sign(text.sprite.position.x);progression.update(fixture,new T.Vector3(),.2);assert.equal(Math.sign(text.sprite.position.x),side,'Sway must stay on its one chosen side');
const fullScale=text.sprite.scale.x;progression.update(fixture,new T.Vector3(),.4);assert.ok(text.sprite.scale.x<fullScale,'Text shrinks before expiry');
progression.update(fixture,new T.Vector3(),.1);assert.equal(progression.effects.length,0);progression.dispose();
console.log('Level-up effect checks passed: zero-delta pause, small start, single-sided sway, shrink and expiry.');
