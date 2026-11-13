import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as T from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
for(const name of ['dev/WeaponModelPreview','dev/WeaponModels','core/assetUrl']){
 const file=resolve('.local-evidence/model-check',name+'.js');mkdirSync(dirname(file),{recursive:true});
 writeFileSync(file,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const {weaponModels}=await import(pathToFileURL(resolve('.local-evidence/model-check/dev/WeaponModels.js')));
const {WeaponModelPreview}=await import(pathToFileURL(resolve('.local-evidence/model-check/dev/WeaponModelPreview.js')));
const fileFor=url=>'public/'+String(url).replace(/^\//,'');
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(readFileSync(fileFor(url),'utf8'))});
const oldObj=OBJLoader.prototype.loadAsync,oldTexture=T.TextureLoader.prototype.loadAsync;
OBJLoader.prototype.loadAsync=async function(url){return this.parse(readFileSync(fileFor(url),'utf8'));};
T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
const scene=new T.Scene(),view=new WeaponModelPreview(scene);
for(const [id] of weaponModels){
 const base=`public/weapons/models/${id}/`,manifest=JSON.parse(readFileSync(base+'manifest.json','utf8'));
 assert.equal(manifest.id,id);assert.equal(manifest.previewOnly,true);
 for(const file of JSON.parse(readFileSync(base+'provenance.json','utf8')).files){
  assert.equal(createHash('sha256').update(readFileSync(base+file.output)).digest('hex'),file.sha256,'Existing exported files copied unchanged');
  assert.ok(existsSync(`dist/weapons/models/${id}/${file.output}`),'Asset is packaged for deployment');
 }
 await view.load(id);const root=scene.children.at(-1);assert.equal(root.visible,false);
 const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
 assert.ok(Math.abs(Math.max(size.x,size.y,size.z)-2)<1e-5,`${id} fits gallery`);
 assert.ok(center.distanceTo(new T.Vector3(0,1.25,0))<1e-5,`${id} centered`);
 root.traverse(node=>{if(node instanceof T.Mesh){const positions=node.geometry.getAttribute('position');assert.ok(positions.count>0);assert.ok(Array.from(positions.array).every(Number.isFinite));if(manifest.texture)assert.ok(node.geometry.getAttribute('uv'));}});
 view.update(id,.4);assert.equal(scene.children.filter(root=>root.visible).length,1);
}
view.update(undefined,0);assert.equal(scene.children.filter(root=>root.visible).length,0,'Leaving model rooms hides cached models');
let geometryDisposals=0;scene.traverse(node=>{if(node instanceof T.Mesh)node.geometry.addEventListener('dispose',()=>geometryDisposals++);});
view.dispose();assert.equal(scene.children.length,0);assert.ok(geometryDisposals>=weaponModels.length);
const closedScene=new T.Scene(),closed=new WeaponModelPreview(closedScene),pending=closed.load('axe');closed.dispose();await pending;assert.equal(closedScene.children.length,0,'Late load after closing cannot attach a model');
OBJLoader.prototype.loadAsync=oldObj;T.TextureLoader.prototype.loadAsync=oldTexture;
console.log('Seven model exports: hashes, deploy assets, geometry/UV, fit, switching and disposal passed.');
