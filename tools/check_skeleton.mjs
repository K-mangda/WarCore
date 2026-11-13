import ts from 'typescript';
import * as T from 'three';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
for(const name of ['enemies/SkeletonView','enemies/BakedEnemyView','enemies/DamageMaterial','combat/Balance','core/assetUrl','dev/EnemyPreview']){
 const out=resolve('.local-evidence/skeleton-check',name+'.js');mkdirSync(dirname(out),{recursive:true});
 writeFileSync(out,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const data=JSON.parse(readFileSync('public/enemies/skeleton/animation.json','utf8'));
assert.equal(data.frames.length,8);assert.equal(data.fps,8);
for(const frame of data.frames){assert.equal(frame.positions.length/3,frame.uv.length/2);assert.ok(frame.indices.every(i=>i>=0&&i<frame.positions.length/3));assert.ok(frame.positions.every(Number.isFinite));}
const banditData=JSON.parse(readFileSync('public/enemies/bandit/animation.json','utf8'));assert.equal(banditData.frames.length,8);assert.equal(banditData.fps,7);
for(const frame of banditData.frames){assert.equal(frame.positions.length/3,frame.uv.length/2);assert.ok(frame.indices.every(i=>i>=0&&i<frame.positions.length/3));assert.ok(frame.positions.every(Number.isFinite));}
globalThis.fetch=async url=>({ok:true,json:async()=>String(url).includes('/bandit/')?banditData:data});
const load=T.TextureLoader.prototype.loadAsync;T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
const {SkeletonView,skeletonFrame}=await import(pathToFileURL(resolve('.local-evidence/skeleton-check/enemies/SkeletonView.js')));
const scene=new T.Scene(),view=new SkeletonView(scene);await view.load();assert.equal(scene.children.length,8);
const enemies=Array.from({length:120},(_,i)=>({id:i,position:new T.Vector3(i%10,0,-4-Math.floor(i/10)),velocity:new T.Vector3(),health:20,flash:i===0?.15:0}));
view.render(enemies,[],.1,new T.Vector3());assert.equal(scene.children.reduce((sum,m)=>sum+m.count,0),120);
assert.equal(scene.children.filter(m=>m.count>0).length,8,'Moving enemies share eight baked frame batches');
const transferred=scene.children.reduce((sum,m)=>sum+m.instanceMatrix.updateRanges.reduce((n,r)=>n+r.count,0),0);
assert.equal(transferred,120*16,'Only occupied instance matrices are uploaded, not eight full capacities');
const before=scene.children.map(m=>m.count);view.render(enemies,[],.1,new T.Vector3());assert.deepEqual(scene.children.map(m=>m.count),before,'Pause must not advance frames');
assert.notEqual(skeletonFrame(.1,1,8,8),skeletonFrame(.3,1,8,8));assert.equal(skeletonFrame(100,1,8,8,false),0);
const corpse={id:1,animationTime:.3,position:new T.Vector3(0,0,-2),heading:0,life:.3,duration:.45};
view.render([], [corpse],1,new T.Vector3());const pose=scene.children.findIndex(m=>m.count===1);view.render([], [corpse],4,new T.Vector3());assert.equal(scene.children.findIndex(m=>m.count===1),pose,'Death freezes its baked pose');
assert.ok(scene.children[pose].geometry.getAttribute('dissolve').getX(0)>0);
view.render([],[],0,new T.Vector3());assert.equal(scene.children.reduce((s,m)=>s+m.count,0),0);view.dispose();assert.equal(scene.children.length,0);
const cullScene=new T.Scene(),cullCamera=new T.PerspectiveCamera(75,1,.05,100);cullCamera.updateMatrixWorld();
const culled=new SkeletonView(cullScene,cullCamera);await culled.load();
culled.render([{...enemies[0],position:new T.Vector3(0,0,-5)},{...enemies[1],position:new T.Vector3(0,0,15)}],[],0,new T.Vector3());
assert.equal(cullScene.children.reduce((sum,m)=>sum+m.count,0),1,'Offscreen enemies do not enter draw batches');culled.dispose();
const {EnemyPreview}=await import(pathToFileURL(resolve('.local-evidence/skeleton-check/dev/EnemyPreview.js')));
const labScene=new T.Scene(),preview=new EnemyPreview(labScene);await preview.load('skeleton');assert.equal(labScene.children.length,8,'Skeleton Lab does not load Bandit');preview.update('skeleton-hit',.25,new T.Vector3(0,0,-1));
const hit=labScene.children.find(m=>m.count>0);assert.equal(hit.geometry.getAttribute('damageFlash').getX(0),1);
preview.update('skeleton-death',1,new T.Vector3(0,0,-1));assert.equal(labScene.children.reduce((s,m)=>s+m.count,0),0);
await preview.load('bandit');preview.update('bandit-walk',.3,new T.Vector3(0,0,-1));assert.equal(labScene.children.reduce((s,m)=>s+m.count,0),1);
assert.equal(preview.views.skeleton.batches.reduce((s,m)=>s+m.count,0),0,'Switching species removes old preview instances');assert.equal(preview.views.bandit.fps,7,'Bandit uses its own baked FPS');
preview.update('bandit-death',.3,new T.Vector3(0,0,-1));assert.equal(preview.views.bandit.batches.reduce((s,m)=>s+m.count,0),1);
preview.update('bandit-death',1,new T.Vector3(0,0,-1));assert.equal(labScene.children.reduce((s,m)=>s+m.count,0),0);
preview.dispose();T.TextureLoader.prototype.loadAsync=load;
console.log('Baked enemy checks passed: Skeleton/Bandit source frames and FPS, batching, frozen pause/death pose, species switching and cleanup. No GPU/FPS claim.');
