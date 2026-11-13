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
 createBufferSource(){return {buffer:null,playbackRate:{value:1},onended:null,stopped:false,connect(){},disconnect(){},start(){started.push(this);},stop(){this.stopped=true;}};}
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
const alerts=started.filter(v=>/DeathImpact|Levelup3/.test(v.buffer.label));assert.equal(alerts.length,2,'Important notifications must survive pickup crowding');
audio.play('shot');audio.play('staffImpact');audio.play('staffHit');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/retro_shoot_fireball3.wav')),'Firestaff shot must use verified media');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/retro_explosion_')),'Impact must have its own explosion clip');
assert.ok(started.some(v=>v.buffer.label.includes('weapons/staff/audio/Hit2.wav')),'Hit feedback must use Hit2 rather than Bonk');
audio.stopGameplay();assert.ok(alerts.every(v=>!v.stopped),'Pause must preserve level/death notifications');
assert.ok(started.filter(v=>/SwordSwing|Xp2|retro_shoot|retro_explosion|Hit2/.test(v.buffer.label)).every(v=>v.stopped),'Pause must stop stale run sounds');
const count=started.length;audio.toggle();audio.play('sword');assert.equal(started.length,count,'Mute must prevent new audible voices');
audio.dispose();assert.ok(started.every(v=>v.stopped),'Dispose must stop every remaining voice');
console.log('Audio event checks passed: consecutive swings, bounded priorities, pause notifications, mute and cleanup. Mock audio does not verify waveform or perceived loudness.');
