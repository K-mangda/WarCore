import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const folder=resolve('.local-evidence/audio-settings-check');
for(const [name,extension] of [['audio/AudioPreferences','ts'],['audio/GameAudio','ts'],['core/assetUrl','ts'],['ui/AudioSettings','tsx'],['ui/ControlSettings','tsx'],['core/ControlPreferences','ts'],['ui/VideoSettings','tsx'],['core/VideoPreferences','ts'],['core/EffectsPreferences','ts'],['ui/EffectsSettings','tsx']]){
 const path=resolve(folder,name+'.js');mkdirSync(dirname(path),{recursive:true});
 const code=ts.transpileModule(readFileSync(`src/${name}.${extension}`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'").replace(/import ['"]\.\/audio-settings\.css['"];?/,'');writeFileSync(path,code);
}
const stored=new Map([['warcore.audio.v1',JSON.stringify({master:.6,music:.7,game:.4,ambience:.2,ui:.3,pickups:.8,muted:false})]]),events=new Map();
globalThis.localStorage={getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)};
globalThis.window={addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)};
const prefUrl=pathToFileURL(resolve(folder,'audio/AudioPreferences.js'));
const {getAudioPreferences,setAudioPreferences,resetAudioPreferences,subscribeAudioPreferences,audioStorageKey,audioDefaults}=await import(prefUrl);
assert.equal(getAudioPreferences().master,.6,'Stored preferences load before AudioContext exists');
let changed=0;const unsubscribe=subscribeAudioPreferences(()=>changed++);
setAudioPreferences({master:2,game:-1,music:NaN});assert.equal(getAudioPreferences().master,1);assert.equal(getAudioPreferences().game,0);assert.equal(getAudioPreferences().music,1);
const stable=getAudioPreferences();setAudioPreferences({master:1});assert.equal(getAudioPreferences(),stable,'Unchanged settings keep the React snapshot stable');
setAudioPreferences({master:.6,game:.4,music:.7});assert.ok(changed>0);
let context;const sources=[];
globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer});
globalThis.AudioContext=class{
 currentTime=1;state='running';destination={};constructor(){context=this;}
 createGain(){return {gain:{value:1},connect(node){this.output=node;},disconnect(){this.disconnected=true;}};}
 createBufferSource(){return {playbackRate:{value:1},connect(node){this.output=node;},disconnect(){},start(){sources.push(this);},stop(){this.stopped=true;}};}
 async decodeAudioData(data){return {label:new TextDecoder().decode(data)};}async resume(){}async close(){this.state='closed';}
};
const {GameAudio,soundChannel}=await import(pathToFileURL(resolve(folder,'audio/GameAudio.js')));
const audio=new GameAudio();await audio.prepare();assert.equal(audio.gain.gain.value,.35*.6);assert.equal(audio.channels.get('game').gain.value,.4);
for(const [key,channel] of [['shot','game'],['click','ui'],['levelOpen','ui'],['levelAmbience','ambience'],['xp','pickups'],['gold','pickups'],['silver','pickups']]){
 context.currentTime+=1;audio.play(key);assert.equal(soundChannel(key),channel);assert.equal(sources.at(-1).output.output,audio.channels.get(channel),'Voices route through the expected independent bus');
}
const gameBus=audio.channels.get('game'),uiBus=audio.channels.get('ui'),ambientBus=audio.channels.get('ambience');
setAudioPreferences({ui:0,ambience:.1,master:.5});assert.equal(uiBus.gain.value,0);assert.equal(ambientBus.gain.value,.1);assert.equal(gameBus.gain.value,.4);assert.equal(audio.gain.gain.value,.175,'Live master updates existing voices');
audio.toggle();assert.equal(audio.gain.gain.value,0);assert.equal(JSON.parse(stored.get(audioStorageKey)).muted,true,'Mute is persisted');audio.toggle();
const reloaded=await import(prefUrl+'?reload');assert.equal(reloaded.getAudioPreferences().master,.5);assert.equal(reloaded.getAudioPreferences().ui,0);
events.get('storage')({key:audioStorageKey,newValue:JSON.stringify({...audioDefaults,master:.8,pickups:.25})});assert.equal(audio.gain.gain.value,.35*.8);assert.equal(audio.channels.get('pickups').gain.value,.25,'Other windows/iframes synchronize live');
stored.set(audioStorageKey,'broken JSON');assert.deepEqual((await import(prefUrl+'?corrupt')).getAudioPreferences(),audioDefaults);
const setItem=localStorage.setItem;localStorage.setItem=()=>{throw Error('blocked');};assert.doesNotThrow(()=>setAudioPreferences({master:.69}));assert.equal(getAudioPreferences().master,.69);localStorage.setItem=setItem;
const {AudioSettings}=await import(pathToFileURL(resolve(folder,'ui/AudioSettings.js')));
const html=renderToStaticMarkup(React.createElement(AudioSettings,{onClose(){},onTestSound(){},onInteract(){}}));
assert.equal((html.match(/type="range"/g)??[]).length,6);assert.ok(html.includes('0.69'));assert.ok(html.includes('XP and Gold'));assert.ok(html.includes('Music Volume'));assert.ok(html.includes('aria-modal="true"'));assert.ok(html.includes('Close settings'));
resetAudioPreferences();assert.deepEqual(getAudioPreferences(),audioDefaults);assert.equal(audio.gain.gain.value,.35,'Default mix preserves prior loudness');
audio.dispose();unsubscribe();assert.equal(events.size,0,'All preference listeners detach on cleanup');
console.log('Audio settings checks passed: six controls, storage/reload/corruption/clamping, independent routing, live mix, shared-window sync, mute/reset and cleanup. No rendered/listening parity claim.');
