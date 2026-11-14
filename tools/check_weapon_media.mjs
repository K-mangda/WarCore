import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import * as T from 'three';
const folder=resolve('.local-evidence/media-check');
for(const name of ['audio/AudioPreferences','core/EffectsPreferences','dev/WeaponSoundPreview','dev/SharedHitPreview','dev/WeaponModels','combat/Run','combat/XpCurve','combat/Director','enemies/Roster','data/NativeData','player/Danger','combat/Upgrades','combat/Pickups','combat/Balance','combat/AttackTiming','combat/StaffView','core/assetUrl','enemies/Swarm','player/Physics']){
 const file=resolve(folder,name+'.js');mkdirSync(dirname(file),{recursive:true});
 writeFileSync(file,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const {weaponModels,weaponModelRooms}=await import(pathToFileURL(resolve(folder,'dev/WeaponModels.js')));
let audioFiles=new Set();
for(const [id] of weaponModels){
 const base=`public/weapons/models/${id}/`,media=json(base+'media.json'),hierarchy=json(base+'hierarchy.json');
 assert.equal(media.sharedHit,hierarchy.hit?.name==='GeneralProjectileHit'&&hierarchy.hit?.pathId===3790);
 assert.equal(weaponModelRooms.some(([room])=>room==='hit-'+id),media.sharedHit);
 assert.ok(media.samples.length>0);
 for(const sample of media.samples){
  const bytes=readFileSync('public/'+sample.file);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WAVE');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),sample.sha256);assert.ok(existsSync('dist/'+sample.file));
  assert.ok(Number.isFinite(sample.volume)&&sample.volume>=0);assert.ok(Number.isFinite(sample.pitch)&&sample.pitch>0);audioFiles.add(sample.file);
 }
}
const hit=json('public/weapons/preview-hit/manifest.json'),original=json('public/weapons/staff/manifest.json');
assert.deepEqual(hit.phases.hit,original.phases.hit);assert.equal(Object.values(hit.phases).reduce((sum,p)=>sum+p.particles.length,0),2);
const proof=json('public/weapons/preview-hit/provenance.json');assert.equal(createHash('sha256').update(readFileSync('public/'+proof.source,'utf8').replaceAll('\r\n','\n')).digest('hex'),proof.sourceLfNormalizedSha256);
for(const material of Object.values(hit.materials)){assert.ok(existsSync(resolve('public/weapons/preview-hit',material.texture.file)));assert.ok(existsSync(resolve('dist/weapons/preview-hit',material.texture.file)));}
const fileFor=url=>resolve('public',String(url).replace(/^\//,''));let fetches=0;
globalThis.fetch=async url=>{fetches++;return {ok:true,json:async()=>json(fileFor(url)),arrayBuffer:async()=>{const b=readFileSync(fileFor(url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}};};
let context,defer,complete;const started=[];
globalThis.AudioContext=class{
 destination={};constructor(){context=this;}
 async resume(){} async close(){this.closed=true;}
 createGain(){return {gain:{value:1},connect(){},disconnect(){}};}
 createBufferSource(){return {playbackRate:{value:1},connect(gain){this.output=gain;},disconnect(){},start(){started.push(this);},stop(){this.stopped=true;}};}
 async decodeAudioData(){if(defer){defer=false;return new Promise(resolve=>{complete=()=>resolve({duration:2});});}return {duration:2};}
};
const {WeaponSoundPreview}=await import(pathToFileURL(resolve(folder,'dev/WeaponSoundPreview.js')));
const sounds=new WeaponSoundPreview();await sounds.load('axe');assert.equal(started.length,0,'Loading does not play clips');
const [sample,second]=sounds.samples('axe');await sounds.play(sample);assert.equal(started.length,1);assert.equal(started[0].output.gain.value,sample.volume*.35);
const loaded=fetches;await sounds.play(sample);assert.equal(fetches,loaded,'Decoded sample is reused');assert.equal(started[0].stopped,true,'Only one sample plays at a time');
const preferences=await import(pathToFileURL(resolve(folder,'audio/AudioPreferences.js')));
preferences.setAudioPreferences({master:.5,game:.4});assert.equal(started.at(-1).output.gain.value,sample.volume*.35*.5*.4,'Lab samples follow live shared master/Game Sounds settings');preferences.resetAudioPreferences();
sounds.setMuted(true);assert.equal(started.at(-1).stopped,true);await sounds.play(sample);assert.equal(started.length,2,'Mute blocks audition');sounds.setMuted(false);
defer=true;const pending=sounds.play(second);await new Promise(setImmediate);sounds.stop();complete();await pending;assert.equal(started.length,2,'Stop cancels pending decode playback');
await sounds.play(second);sounds.dispose();assert.equal(started.at(-1).stopped,true);assert.equal(context.closed,true);
const oldLoad=T.TextureLoader.prototype.loadAsync;T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
const {SharedHitPreview}=await import(pathToFileURL(resolve(folder,'dev/SharedHitPreview.js')));
const scene=new T.Scene(),preview=new SharedHitPreview(scene);await preview.load();assert.equal(scene.children.length,2,'No projectile/muzzle/explosion layers loaded');
preview.advance(.1,new T.Vector3(0,0,-1));const count=()=>[...preview.view.batches.values()].reduce((sum,b)=>sum+b.particles.length,0);assert.ok(count()>0);
const before=count();preview.advance(.1,new T.Vector3(0,0,-1));assert.equal(count(),before,'Stationary timeline freezes effects');assert.equal(preview.run.swarm.enemies.length,0);assert.equal(preview.run.hits.length,0,'Fixture invents no combat hits/damage');
preview.advance(.8,new T.Vector3(0,0,-1));preview.advance(.1,new T.Vector3(0,0,-1));assert.equal(count(),before,'Backward scrub replays deterministically');
preview.reset();assert.equal(count(),0);preview.dispose();assert.equal(scene.children.length,0);T.TextureLoader.prototype.loadAsync=oldLoad;
console.log(`Weapon media checks passed: ${audioFiles.size} WAVs, explicit shared-hit references, two-layer fixture, silent scrub/pause/reset and audition cache/mute/cancellation/disposal.`);
