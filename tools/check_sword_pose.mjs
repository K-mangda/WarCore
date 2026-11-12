import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {Object3D,Vector3} from 'three';
const folder=resolve('.local-evidence/sword-pose');mkdirSync(folder,{recursive:true});
const file=resolve(folder,'SwordPose.mjs');writeFileSync(file,ts.transpileModule(readFileSync('src/combat/SwordPose.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {placeSwordSlash}=await import(pathToFileURL(file));
const origin=new Vector3(10,2,-7);
for(const direction of [new Vector3(0,0,-1),new Vector3(1,0,0),new Vector3(0,0,1),new Vector3(-1,0,0),new Vector3(1,0,-1).normalize()]){
 const mesh=new Object3D();placeSwordSlash(mesh,origin,direction);
 assert.ok(new Vector3(1,0,0).applyQuaternion(mesh.quaternion).dot(direction)>.999999,'Visible crescent edge must face the attack rather than its side');
 assert.ok(new Vector3(0,0,1).applyQuaternion(mesh.quaternion).y>.999999,'Quad must stay horizontal');
 assert.ok(mesh.position.clone().sub(origin).normalize().dot(direction)>.999999,'Effect anchor must remain ahead of attack origin');
}
console.log('Sword pose checks passed: crescent faces attack direction, horizontal plane and forward anchor.');
