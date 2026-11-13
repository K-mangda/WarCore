import * as T from 'three';
export const heightAt = (x: number, z: number): number => {
  if (Math.abs(x) <= 9 && z >= -42 && z <= -10) return Math.min((-z-10)*Math.tan(T.MathUtils.degToRad(40)), 16);
  return 0;
};
export function makeSandbox(scene: T.Scene): T.Mesh {
  const geometry = new T.PlaneGeometry(200,200,200,200); geometry.rotateX(-Math.PI/2);
  const p = geometry.attributes.position;
  const colors: number[] = [];
  for(let i=0;i<p.count;i++) { const h=heightAt(p.getX(i),p.getZ(i)); p.setY(i,h); const c=new T.Color(h>0?'#9eaa63':'#607a4b'); c.multiplyScalar(0.91+0.09*Math.sin(p.getX(i)*7+p.getZ(i)*3)); colors.push(c.r,c.g,c.b); }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3)); geometry.computeVertexNormals();
  const terrain=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1})); terrain.receiveShadow=true; scene.add(terrain);
  const trunkMat=new T.MeshStandardMaterial({color:0x63543d}); const leafMat=new T.MeshStandardMaterial({color:0x294c3e,flatShading:true});
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.2,.4,3,5),trunkMat,100),crowns=new T.InstancedMesh(new T.ConeGeometry(2,7,6),leafMat,100),matrix=new T.Matrix4();
  let trees=0;
  for(let i=0;i<100;i++) {const a=i*2.39996,r=26+(i%11)*4,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<13&&z<0)continue;trunks.setMatrixAt(trees,matrix.makeTranslation(x,1.5,z));crowns.setMatrixAt(trees,matrix.makeTranslation(x,5,z));trees++;}
  trunks.count=trees;crowns.count=trees;trunks.instanceMatrix.needsUpdate=true;crowns.instanceMatrix.needsUpdate=true;trunks.computeBoundingSphere();crowns.computeBoundingSphere();scene.add(trunks,crowns);
  const grid=new T.GridHelper(40,20,0xb9cf91,0x829563); grid.position.set(0,.025,8); scene.add(grid);
  for(const x of [-10,10])for(let z=-10;z>=-42;z-=4) { const m=new T.Mesh(new T.BoxGeometry(.15,.5,.7),new T.MeshStandardMaterial({color:0xe9bd67})); m.position.set(x,heightAt(x<0?x+2:x-2,z)+.25,z); scene.add(m); }
  return terrain;
}
