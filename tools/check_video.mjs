import assert from 'node:assert/strict';
import ts from 'typescript';
import * as T from 'three';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const folder=resolve('.local-evidence/video-check');
for(const [name,extension] of [['core/VideoPreferences','ts'],['core/RenderCadence','ts'],['core/VideoRenderer','ts'],['core/ControlPreferences','ts'],['camera/Orbit','ts'],['ui/VideoSettings','tsx']]){
 const file=resolve(folder,name+'.js');mkdirSync(dirname(file),{recursive:true});writeFileSync(file,ts.transpileModule(readFileSync(`src/${name}.${extension}`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const stored=new Map(),events=new Set();globalThis.localStorage={getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)};
globalThis.window={addEventListener(type,fn){if(type==='storage')events.add(fn);},removeEventListener(type,fn){if(type==='storage')events.delete(fn);}};
globalThis.document={addEventListener(){},removeEventListener(){},fullscreenEnabled:false,fullscreenElement:null,documentElement:{}};
const url=pathToFileURL(resolve(folder,'core/VideoPreferences.js'));
const {videoDefaults,videoStorageKey,getVideoPreferences,setVideoPreferences,resetVideoPreferences,applyVideoPreset,currentVideoPreset,subscribeVideoPreferences}=await import(url);
assert.deepEqual(getVideoPreferences(),{renderScale:1,viewDistance:250,fpsLimit:0,fov:75,cameraDistance:0});
setVideoPreferences({renderScale:5,viewDistance:-1,fov:1000,cameraDistance:-1,fpsLimit:59});assert.equal(getVideoPreferences().renderScale,1.25);assert.equal(getVideoPreferences().viewDistance,50);assert.equal(getVideoPreferences().fov,110);assert.equal(getVideoPreferences().cameraDistance,0);assert.equal(getVideoPreferences().fpsLimit,0);
setVideoPreferences({renderScale:.5,fpsLimit:60});assert.equal((await import(url+'?reload')).getVideoPreferences().renderScale,.5);stored.set(videoStorageKey,'broken');assert.deepEqual((await import(url+'?corrupt')).getVideoPreferences(),videoDefaults);
const setItem=localStorage.setItem;localStorage.setItem=()=>{throw Error('blocked');};assert.doesNotThrow(()=>setVideoPreferences({fov:90}));localStorage.setItem=setItem;
const unsubscribe=subscribeVideoPreferences(()=>{});for(const fn of events)fn({key:videoStorageKey,newValue:JSON.stringify({...videoDefaults,renderScale:.75})});assert.equal(getVideoPreferences().renderScale,.75);resetVideoPreferences();
const {videoPixelRatio,applyVideoPreferences}=await import(pathToFileURL(resolve(folder,'core/VideoRenderer.js')));
assert.equal(videoPixelRatio(2,1),1.75);assert.equal(videoPixelRatio(.8,1),.8,'Preserve zoomed-out device ratios');
let resizeCalls=0;const renderer={setPixelRatio(ratio){this.ratio=ratio;resizeCalls++;},setSize(w,h){this.width=w;this.height=h;resizeCalls++;}},camera=new T.PerspectiveCamera(75,1,.05,250),scene=new T.Scene();scene.fog=new T.Fog(0xb5c9ba,45,135);
applyVideoPreferences(renderer,camera,scene,videoDefaults,1920,1080,2);assert.equal(renderer.ratio,1.75);assert.equal(camera.fov,75);assert.equal(camera.far,250);assert.equal(scene.fog.near,45);assert.equal(scene.fog.far,135);
const normalPixels=renderer.width*renderer.height*renderer.ratio**2;
const initialResizes=resizeCalls;applyVideoPreferences(renderer,camera,scene,{...videoDefaults,fpsLimit:60,fov:80},1920,1080,2);assert.equal(resizeCalls,initialResizes,'FPS/FOV changes do not reallocate canvas buffers');
applyVideoPreferences(renderer,camera,scene,{...videoDefaults,renderScale:.5,viewDistance:60,fov:90},1920,1080,2);assert.equal(renderer.width*renderer.height*renderer.ratio**2,normalPixels/4,'Half render scale draws a quarter of the pixels');assert.equal(camera.fov,90);assert.equal(camera.far,60);assert.equal(scene.fog.far,54);assert.ok(scene.fog.near<scene.fog.far);
const labCamera=new T.PerspectiveCamera(75,1,.05,100);applyVideoPreferences(renderer,labCamera,new T.Scene(),{...videoDefaults,fov:110,renderScale:.5},800,600,2,'lab');assert.equal(renderer.ratio,.75);assert.equal(labCamera.fov,75);assert.equal(labCamera.far,100,'Lab fixture framing is retained');
applyVideoPreferences(renderer,camera,scene,videoDefaults,0,0,1);assert.equal(camera.aspect,1,'Zero-sized hidden surface cannot corrupt the projection');
setVideoPreferences({fov:93,cameraDistance:1.25});applyVideoPreset('Low');assert.equal(currentVideoPreset(getVideoPreferences()),'Low');assert.equal(getVideoPreferences().fov,93);assert.equal(getVideoPreferences().cameraDistance,1.25);assert.equal(getVideoPreferences().fpsLimit,60);
applyVideoPreset('Balanced');assert.equal(getVideoPreferences().viewDistance,150);setVideoPreferences({renderScale:.7});assert.equal(currentVideoPreset(getVideoPreferences()),'Custom');applyVideoPreset('High');assert.equal(getVideoPreferences().renderScale,1);resetVideoPreferences();
const {RenderCadence}=await import(pathToFileURL(resolve(folder,'core/RenderCadence.js')));
for(const [refresh,limit,expected] of [[120,60,60],[144,60,60],[60,144,60],[60,30,30],[144,0,144]]){
 const cadence=new RenderCadence();let frames=0;for(let i=0;i<refresh;i++)if(cadence.ready(i*1000/refresh,limit))frames++;assert.ok(Math.abs(frames-expected)<=1,`${refresh}Hz / cap${limit}: ${frames}`);
}
const cadence=new RenderCadence();assert.equal(cadence.ready(0,30),true);assert.equal(cadence.ready(1,30),false);assert.equal(cadence.ready(10000,30),true);assert.equal(cadence.ready(10001,30),false,'No catch-up render burst');assert.equal(cadence.ready(10002,60),true,'New cap applies immediately');
const {Orbit}=await import(pathToFileURL(resolve(folder,'camera/Orbit.js')));const orbitCamera=new T.PerspectiveCamera(),orbit=new Orbit(orbitCamera,{addEventListener(){},removeEventListener(){}},()=>false),terrain=new T.Mesh();let casts=0;
orbit.ray.intersectObject=()=>{casts++;return [];};orbit.update(new T.Vector3(),terrain,3.6);orbit.update(new T.Vector3(),terrain,3.6);assert.equal(casts,1);orbit.update(new T.Vector3(),terrain,6.6);assert.equal(casts,2);assert.equal(orbit.ray.far,6.6);
orbit.ray.intersectObject=()=>[{distance:2}];orbit.update(new T.Vector3(1,0,0),terrain,6.6);assert.ok(Math.abs(orbitCamera.position.distanceTo(new T.Vector3(1,1.3,0))-1.8)<1e-6,'Farther requested camera still stops at terrain');orbit.dispose();
const {VideoSettings,toggleBrowserFullscreen}=await import(pathToFileURL(resolve(folder,'ui/VideoSettings.js')));
let html=renderToStaticMarkup(React.createElement(VideoSettings,{onInteract(){},resolution:{width:1920,height:1080}}));assert.equal((html.match(/type="range"/g)??[]).length,5);assert.ok(html.includes('1920×1080'));assert.ok(!/Target Monitor|VSync|Bloom|Grass Quality|Shadow Quality/.test(html));assert.ok(!html.includes('Fullscreen Mode'),'Unsupported fullscreen control is omitted');
let requests=0,exits=0;document.fullscreenEnabled=true;document.documentElement.requestFullscreen=async()=>{requests++;document.fullscreenElement={};};document.exitFullscreen=async()=>{exits++;document.fullscreenElement=null;};await toggleBrowserFullscreen();assert.equal(requests,1);await toggleBrowserFullscreen();assert.equal(exits,1);
document.documentElement.requestFullscreen=async()=>{throw Error('denied');};await assert.rejects(toggleBrowserFullscreen(),/denied/);assert.equal(document.fullscreenElement,null,'Denied fullscreen never fabricates enabled state');
unsubscribe();assert.equal(events.size,0);resetVideoPreferences();
console.log('Video checks passed: persistence/validation, preserved defaults, resolution scaling, projection/fog/camera collision, cadence across refresh rates, real browser controls/fullscreen rejection and cleanup. No GPU/FPS benchmark claim.');
