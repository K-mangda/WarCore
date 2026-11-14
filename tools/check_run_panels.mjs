import assert from 'node:assert/strict';
import ts from 'typescript';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {pathToFileURL} from 'node:url';
const folder=resolve('.local-evidence/run-panels-check');
for(const [name,extension] of [['core/RunHistory','ts'],['core/ControlPreferences','ts'],['core/UpgradeHotkeys','ts'],['core/assetUrl','ts'],['core/EffectsPreferences','ts'],['combat/Balance','ts'],['combat/Upgrades','ts'],['data/NativeData','ts'],['combat/Weapons','ts'],['player/StatSheet','ts'],['combat/XpCurve','ts'],['combat/Rarity','ts'],['ui/UpgradeMenu','tsx'],['ui/LevelUpBackdrop','tsx'],['ui/LevelUpEmitters','ts'],['ui/PlayerStats','tsx'],['ui/RunPanels','tsx'],['ui/usePanelFocus','ts']]){
 const file=resolve(folder,name+'.js');mkdirSync(dirname(file),{recursive:true});writeFileSync(file,ts.transpileModule(readFileSync(`src/${name}.${extension}`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};const events=new Set();globalThis.window={addEventListener(type,fn){events.add(fn);},removeEventListener(type,fn){events.delete(fn);}};
const url=pathToFileURL(resolve(folder,'core/RunHistory.js'));
const {getRunHistory,recordRun,RunRecorder,historyKey,subscribeRunHistory}=await import(url);
const run={weapon:'bolt',elapsed:25,kills:15,level:3,gold:9,silver:2,damage:20,attackInterval:.4,projectiles:2,upgradeLevels:{damage:2,haste:1,projectiles:1},health:0,maxHealth:100,dead:true};
const recorder=new RunRecorder();recorder.death({...run,dead:false},'abc1234');assert.equal(getRunHistory().length,0);recorder.death(run,'abc1234');recorder.death(run,'abc1234');recorder.reset(run,'abc1234');assert.equal(getRunHistory().length,1,'Restart after death cannot duplicate the run');
recorder.reset({...run,elapsed:0},'abc1234');assert.equal(getRunHistory().length,1,'Empty runs are not recorded');recorder.reset({...run,dead:false},'abc1234');assert.equal(getRunHistory()[0].outcome,'reset');
run.upgradeLevels.damage=99;assert.equal(getRunHistory()[0].upgradeLevels.damage,2,'Saved Tomes are a snapshot');run.upgradeLevels.damage=2;
for(let i=0;i<35;i++)recordRun({...run,kills:i},'death','abc1234');assert.equal(getRunHistory().length,30);assert.equal(getRunHistory()[0].kills,34);assert.equal(new Set(getRunHistory().map(r=>r.id)).size,30);
const setItem=localStorage.setItem;localStorage.setItem=()=>{throw Error('blocked');};assert.doesNotThrow(()=>recordRun(run,'death','abc1234'));assert.equal(getRunHistory()[0].kills,15);localStorage.setItem=setItem;
const {PausePanel,EndPanel,HistoryPanel}=await import(pathToFileURL(resolve(folder,'ui/RunPanels.js')));const render=(component,props)=>renderToStaticMarkup(React.createElement(component,props));
const pause=render(PausePanel,{run,resume(){},settings(){},lab(){},newRun(){},history(){}});for(const text of ['PAUSED','Inventory','Stats','RESUME','SETTINGS','LAB','NEW RUN','Attack interval','+10 damage'])assert.ok(pause.includes(text),text);
const end=render(EndPanel,{run,again(){},history(){}});for(const text of ['SUMMARY','DAMAGE','QUESTS','00:25','15','9 Gold collected','2 Silver collected','not implemented','Fox.png'])assert.ok(end.includes(text),text);assert.ok(!end.includes('+1 Silver'),'No invented death reward');
assert.ok(render(HistoryPanel,{close(){}}).includes('No server sync'));
const unsubscribe=subscribeRunHistory(()=>{});storage.set(historyKey,'broken');for(const fn of events)fn({key:historyKey});assert.equal(getRunHistory().length,0);storage.set(historyKey,JSON.stringify([{...getRunHistory()[0],id:'bad'}]));for(const fn of events)fn({key:historyKey});assert.equal(getRunHistory().length,0);unsubscribe();assert.equal(events.size,0);
console.log('Run panels/history checks passed: death/reset once, empty-run suppression, bounded snapshots, blocked/corrupt storage, real stats and explicit missing-data states.');
