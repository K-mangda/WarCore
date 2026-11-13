import ts from 'typescript';
import * as T from 'three';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
for(const name of ['camera/Orbit','core/ControlPreferences','environment/forest/Sandbox']){
 const out=resolve('.local-evidence/render-check',name+'.js');mkdirSync(dirname(out),{recursive:true});
 writeFileSync(out,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const {makeSandbox}=await import(pathToFileURL(resolve('.local-evidence/render-check/environment/forest/Sandbox.js')));
const scene=new T.Scene(),terrain=makeSandbox(scene),trees=scene.children.filter(o=>o.isInstancedMesh);
assert.equal(trees.length,2,'Trees use one trunk batch and one crown batch');
let expected=0;const matrix=new T.Matrix4(),position=new T.Vector3();
for(let i=0;i<100;i++){
 const a=i*2.39996,r=26+(i%11)*4,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<13&&z<0)continue;
 trees[0].getMatrixAt(expected,matrix);position.setFromMatrixPosition(matrix);assert.ok(position.distanceTo(new T.Vector3(x,1.5,z))<.00001);
 trees[1].getMatrixAt(expected,matrix);position.setFromMatrixPosition(matrix);assert.ok(position.distanceTo(new T.Vector3(x,5,z))<.00001);expected++;
}
assert.equal(trees[0].count,expected);assert.equal(trees[1].count,expected);
globalThis.document={addEventListener(){},removeEventListener(){}};globalThis.window={addEventListener(){},removeEventListener(){}};
const {Orbit}=await import(pathToFileURL(resolve('.local-evidence/render-check/camera/Orbit.js')));
const orbit=new Orbit(new T.PerspectiveCamera(),{addEventListener(){},removeEventListener(){}},()=>true);let casts=0;
orbit.ray.intersectObject=()=>{casts++;return [];};const player=new T.Vector3(0,0,8);
orbit.update(player,terrain);for(let i=0;i<60;i++)orbit.update(player,terrain);assert.equal(casts,1,'Stationary camera must reuse collision result');
player.x+=1;orbit.update(player,terrain);assert.equal(casts,2);orbit.yaw+=.1;orbit.update(player,terrain);assert.equal(casts,3);orbit.dispose();
const engine=readFileSync('src/core/Engine.ts','utf8');assert.equal((engine.match(/this\.orbit\.update\(/g)??[]).length,1,'Only one camera collision update per frame');
console.log(`Render-cost checks passed: ${expected*2} tree mesh draws ->2 batches with identical transforms; one camera cast per changed pose. No measured FPS claim.`);
