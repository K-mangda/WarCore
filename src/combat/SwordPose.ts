import * as T from 'three';
const nativeForward=new T.Vector3(0,0,1);
/** Compose source-local particle rotation, handedness conversion and weapon facing. */
export function placeSwordSlash(mesh:T.Object3D,origin:T.Vector3,direction:T.Vector3,rotation={x:Math.PI/2,y:Math.PI/2,z:Math.PI/12}){
  const forward=new T.Vector3(direction.x,0,direction.z);
  if(forward.lengthSq()<1e-8)forward.set(0,0,-1);
  forward.normalize();
  const local=new T.Quaternion().setFromEuler(new T.Euler(rotation.x,rotation.y,rotation.z,'YXZ'));
  // The exported geometry negates X: F * R * F becomes (qx,-qy,-qz,qw).
  local.set(local.x,-local.y,-local.z,local.w);
  const facing=new T.Quaternion().setFromUnitVectors(nativeForward,forward);
  mesh.quaternion.copy(facing).multiply(local);
  // Sword WeaponData.spawnOffset=(0,.5,2.5); origin already includes the .5Y.
  mesh.position.copy(origin).addScaledVector(forward,2.5);
}

/** Calibrate once from the first atlas frame; never move/rotate per animation cell. */
export function orientSwordArc(mesh:T.Object3D,reference:readonly number[],direction:T.Vector3){
  const axis=new T.Vector3(reference[0],reference[1],reference[2]).applyQuaternion(mesh.quaternion);axis.y=0;
  const forward=new T.Vector3(direction.x,0,direction.z).normalize();
  if(axis.lengthSq()<1e-8||forward.lengthSq()<1e-8)return;
  mesh.quaternion.premultiply(new T.Quaternion().setFromUnitVectors(axis.normalize(),forward));
}
