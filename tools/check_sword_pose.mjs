import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {Object3D,Vector3} from 'three';
const folder=resolve('.local-evidence/sword-pose');mkdirSync(folder,{recursive:true});
const file=resolve(folder,'SwordPose.mjs');writeFileSync(file,ts.transpileModule(readFileSync('src/combat/SwordPose.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {placeSwordSlash,centerSwordFrame}=await import(pathToFileURL(file));
const origin=new Vector3(10,2,-7);
for(const direction of [new Vector3(0,0,-1),new Vector3(1,0,0),new Vector3(0,0,1),new Vector3(-1,0,0),new Vector3(1,0,-1).normalize()]){
 const mesh=new Object3D();placeSwordSlash(mesh,origin,direction);
 assert.ok(Math.abs(mesh.position.distanceTo(origin)-2.5)<1e-6,'Native forward spawn offset must be preserved');
 assert.ok(Math.abs(new Vector3(1,0,0).applyQuaternion(mesh.quaternion).dot(direction)-Math.cos(Math.PI/12))<1e-6,'Source local rotation must compose with weapon facing consistently');
 assert.ok(Math.abs(new Vector3(0,0,1).applyQuaternion(mesh.quaternion).y)>.999999,'Quad must stay horizontal');
 assert.ok(mesh.position.clone().sub(origin).normalize().dot(direction)>.999999,'Effect anchor must remain ahead of attack origin');
}
console.log('Sword pose checks passed: source-local orientation, handedness, horizontal plane and forward anchor.');

const alignment=JSON.parse(readFileSync('public/weapons/knight-sword/frame-alignment.json','utf8'));
for(const direction of [new Vector3(0,0,-1),new Vector3(1,0,0),new Vector3(1,0,-1).normalize()]){
 for(const frame of alignment.frames.filter(f=>f.visible)){
  const mesh=new Object3D();placeSwordSlash(mesh,origin,direction);mesh.scale.setScalar(10.7*.55);
  const intended=mesh.position.clone();centerSwordFrame(mesh,frame.center);
  const visibleCenter=new Vector3(...frame.center).multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position);
  assert.ok(visibleCenter.distanceTo(intended)<1e-6,'Every visible atlas frame must stay centered ahead, rather than drift sideways');
 }
}
console.log('Full-frame Sword checks passed: alpha-weighted visible center stays forward through the animation.');
