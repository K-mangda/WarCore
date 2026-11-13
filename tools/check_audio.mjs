import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const started=[];let context;
globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer});
globalThis.AudioContext=class{
 currentTime=1;state='running';destination={};constructor(){context=this;}
 createGain(){return {gain:{value:1},connect(){},disconnect(){}};}
 createBufferSource(){return {buffer:null,playbackRate:{value:1},onended:null,stopped:false,connect(node){this.output=node;},disconnect(){},start(){started.push(this);},stop(when){if(when===undefined)this.stopped=true;else this.stopAt=when;}};}
 async decodeAudioData(data){return {label:new TextDecoder().decode(data)};}
 async resume(){} async close(){this.state='closed';}
};
const folder=resolve('.local-evidence/audio-check');mkdirSync(folder,{recursive:true});const file=resolve(folder,'GameAudio.mjs');
writeFileSync(file,ts.transpileModule(readFileSync('src/audio/GameAudio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("from '../core/assetUrl'","from './assetUrl.mjs'"));
writeFileSync(resolve(folder,'assetUrl.mjs'),ts.transpileModule(readFileSync('src/core/assetUrl.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {GameAudio}=await import(pathToFileURL(file));const audio=new GameAudio();audio.unlock();await new Promise(setImmediate);
audio.play('sword');context.currentTime+=.02;audio.play('sword');
assert.equal(started.filter(v=>v.buffer.label.includes('SwordSwing')).length,2,'Fast consecutive swing events must not be silently discarded');
for(let i=0;i<20;i++){context.currentTime+=.09;audio.play('xp');}
audio.play('level');audio.play('death');
assert.ok(started.filter(v=>!v.stopped).length<=10,'Voice count must stay bounded');
const alerts=started.filter(v=>/DeathImpact|LevelupAfter/.test(v.buffer.label));assert.equal(alerts.length,2,'Important notifications must survive pickup crowding');
audio.play('shot');audio.play('staffImpact');audio.play('staffHit');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/retro_shoot_fireball3.wav')),'Firestaff shot must use verified media');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/retro_explosion_')),'Impact must have its own explosion clip');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/Hit2.wav')),'Hit feedback must use Hit2 rather than Bonk');
audio.stopGameplay();assert.ok(alerts.every(v=>!v.stopped),'Pause must preserve level/death notifications');
assert.ok(started.filter(v=>/SwordSwing|Xp2|retro_shoot|retro_explosion|Hit2/.test(v.buffer.label)).every(v=>v.stopped),'Pause must stop stale run sounds');
const count=started.length;audio.toggle();audio.play('sword');assert.equal(started.length,count,'Mute must prevent new audible voices');
audio.toggle();context.currentTime+=3;
for(let i=0;i<60;i++){context.currentTime+=.001;audio.play('xp');}
const xp=started.filter(v=>v.buffer.label.includes('Xp2')).at(-1);
assert.equal(xp.playbackRate.value,1.8,'Rapid collection raises pitch to the reported ceiling');assert.equal(xp.output.gain.value,.22);
context.currentTime+=3;audio.play('xp');assert.equal(started.at(-1).playbackRate.value,.8,'Pitch window must expire');
audio.play('gold');assert.equal(started.at(-1).playbackRate.value,.92);assert.equal(started.at(-1).output.gain.value,.26);
audio.setLevelModal(true);const loop=started.find(v=>v.loop&&!v.stopped);assert.ok(loop?.buffer.label.includes('LevelupAmbience'));
const voices=started.length;audio.setLevelModal(true);assert.equal(started.length,voices,'Modal reconciliation must not duplicate ambience');
audio.setLevelModal(false);assert.equal(loop.stopped,true,'Closing the modal stops ambience');
context.currentTime+=1;audio.play('xp');const preserved=started.at(-1);
audio.stopGameplay(true);assert.equal(preserved.stopped,false,'Level-up pause must preserve the collection sound');
audio.stopGameplay();assert.equal(preserved.stopped,true,'Ordinary stop/reset must still stop pickup audio');
context.currentTime+=1;audio.play('hurt');assert.equal(started.at(-1).output.gain.value,.17,'PlayerDamage uses native source gain');
audio.play('death');assert.equal(started.at(-1).output.gain.value,.5,'DeathImpact uses native source gain');
context.currentTime+=1;audio.play('click');assert.ok(started.at(-1).buffer.label.includes('Enter5.wav'),'Button press uses native uiClick clip');assert.equal(started.at(-1).output.gain.value,.75);assert.ok(started.at(-1).playbackRate.value>=.98&&started.at(-1).playbackRate.value<=1.02);
audio.dispose();assert.ok(started.every(v=>v.stopped),'Dispose must stop every remaining voice');
console.log('Audio event checks passed: consecutive swings, bounded priorities, pause notifications, mute and cleanup. Mock audio does not verify waveform or perceived loudness.');
