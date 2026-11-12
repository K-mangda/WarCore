import * as T from 'three';
const up=new T.Vector3(0,1,0);
/** Exported quad mirrors X: the atlas crescent's outer edge points along local +X. */
export function placeSwordSlash(mesh:T.Object3D,origin:T.Vector3,direction:T.Vector3){
  const forward=new T.Vector3(direction.x,0,direction.z);
  if(forward.lengthSq()<1e-8)forward.set(0,0,-1);
  forward.normalize();
  const across=new T.Vector3().crossVectors(up,forward);
  mesh.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(forward,across,up));
  mesh.position.copy(origin).addScaledVector(forward,1.8);
}
