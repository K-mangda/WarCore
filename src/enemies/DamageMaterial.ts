import * as T from 'three';

/** White damage flash and a bounded pixel dissolve; not the native Unity shader. */
export function damageMaterial(texture:T.Texture){
 const material=new T.MeshLambertMaterial({map:texture});
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   attribute float damageFlash;attribute float dissolve;
   varying float vDamageFlash;varying float vDissolve;varying vec3 vDissolvePosition;`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
   vDamageFlash=damageFlash;vDissolve=dissolve;vDissolvePosition=position;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying float vDamageFlash;varying float vDissolve;varying vec3 vDissolvePosition;`)
   .replace('#include <opaque_fragment>',`
   vec3 cell=floor(vDissolvePosition*24.);
   float noise=fract(sin(dot(cell,vec3(12.9898,78.233,45.164)))*43758.5453);
   if(vDissolve>0.&&noise<vDissolve)discard;
   outgoingLight=mix(outgoingLight,vec3(1.),vDamageFlash);
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'enemy-white-flash-dissolve-v1';
 return material;
}
