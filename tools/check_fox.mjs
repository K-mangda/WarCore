import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as T from 'three';
const rig=JSON.parse(readFileSync('public/megabonk/fox-rig.json','utf8'));
const provenance=JSON.parse(readFileSync('public/megabonk/provenance.json','utf8'));
assert.equal(provenance.materialName,'m_fox_default');
assert.equal(provenance.textureSource.name,'Fox_Default');
assert.equal(rig.joints.length,23);
assert.equal(rig.weights.length,rig.positions.length/3*4);
assert.ok(rig.skinIndices.every(index=>index>=0&&index<23));
for(let i=0;i<rig.weights.length;i+=4)assert.ok(Math.abs(rig.weights.slice(i,i+4).reduce((a,b)=>a+b,0)-1)<1e-5);
const nodes=rig.nodes.map(data=>{
  const bone=new T.Bone();bone.position.fromArray(data.position);bone.quaternion.fromArray(data.rotation);bone.scale.fromArray(data.scale);return bone;
});
rig.nodes.forEach((data,i)=>data.children.forEach(child=>nodes[i].add(nodes[child])));
nodes[0].updateMatrixWorld(true);
const meshInverse=nodes[rig.meshNode].matrixWorld.clone().invert();let bindError=0;
let leftArmPose=null;
for(let i=0;i<rig.joints.length;i++){
  const matrix=meshInverse.clone().multiply(nodes[rig.joints[i]].matrixWorld).multiply(new T.Matrix4().fromArray(rig.inverseBindMatrices[i]));
  // The shipped prefab's left shoulder is posed away from the mesh bind pose.
  // Its entire arm must inherit the same rigid pose delta; other joints must
  // reconstruct the renderer bind transform directly.
  const name=rig.nodes[rig.joints[i]].name;
  if(name==='Shoulder.L')leftArmPose=matrix.clone();
  const posedLeftArm=['Shoulder.L','Forearm.L','Wirst.L','Fingers.L'].includes(name);
  matrix.elements.forEach((value,j)=>{const expected=posedLeftArm?leftArmPose.elements[j]:(j%5===0?1:0);bindError=Math.max(bindError,Math.abs(value-expected));});
}
assert.ok(bindError<1e-4,`Skeleton and mesh bind-space disagree: ${bindError}`);
for(const name of ['FoxIdle','FoxRun','FoxJump4','FoxFalling']){
  const clip=rig.clips.find(clip=>clip.name===name);assert.ok(clip&&clip.duration>0);
  for(const track of clip.tracks){
    const size=track.property==='quaternion'?4:3;
    assert.equal(track.values.length,track.times.length*size);
    assert.ok(track.values.every(Number.isFinite));
    assert.ok(track.times.every((time,i)=>i===0||time>track.times[i-1]));
    if(size===4)for(let i=0;i<track.values.length;i+=4){const length=Math.hypot(...track.values.slice(i,i+4));assert.ok(Math.abs(length-1)<1e-3);}
  }
}
console.log(JSON.stringify({bones:rig.joints.length,bindError,clips:rig.clips.map(clip=>clip.name),defaultTexture:provenance.textureSource.name}));
