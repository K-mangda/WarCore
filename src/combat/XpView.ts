import * as T from 'three';
import {assetUrl} from '../core/assetUrl';
import {balance} from './Balance';
import type {Gem,Run} from './Run';
import {xpColors} from './XpAppearance';

/** Native XP billboard frames; movement remains owned by Run. */
export class XpView {
 private mesh?:T.InstancedMesh<T.PlaneGeometry,T.ShaderMaterial>;private texture?:T.Texture;
 private born=new WeakMap<Gem,number>();private previous=0;private disposed=false;
 constructor(private scene:T.Scene){}
 async load(){
  const response=await fetch(assetUrl('pickups/xp/manifest.json'));if(!response.ok)throw new Error('XP manifest failed to load');
  const data=await response.json() as {frames:number;duration:number;size:number};
  const texture=await new T.TextureLoader().loadAsync(assetUrl('pickups/xp/frames.png'));
  if(this.disposed){texture.dispose();return;}this.texture=texture;texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
  const geometry=new T.PlaneGeometry(data.size,data.size);geometry.setAttribute('frame',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems),1));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:texture},frames:{value:data.frames},tint:{value:new T.Color().setRGB(...xpColors.low,T.SRGBColorSpace)}},
   vertexShader:`attribute float frame;varying vec2 vUv;uniform float frames;
   void main(){vUv=vec2((uv.x+frame)/frames,uv.y);vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);center.xy+=position.xy;gl_Position=projectionMatrix*center;}`,
   fragmentShader:`uniform sampler2D map;uniform vec3 tint;varying vec2 vUv;
   void main(){vec4 tex=texture2D(map,vUv);if(tex.a<0.01)discard;gl_FragColor=vec4(tex.rgb*tint,tex.a);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`});
  this.mesh=new T.InstancedMesh(geometry,material,balance.maxGems);this.mesh.count=0;this.mesh.frustumCulled=false;this.scene.add(this.mesh);this.duration=data.duration;this.frames=data.frames;
 }
 private duration=.5;private frames=7;
 update(run:Run){
  const elapsed=run.snapshot().elapsed;if(elapsed<this.previous)this.born=new WeakMap();this.previous=elapsed;
  if(!this.mesh)return;const attr=this.mesh.geometry.getAttribute('frame') as T.InstancedBufferAttribute,matrix=new T.Matrix4();
  this.mesh.count=Math.min(run.gems.length,balance.maxGems);
  for(let i=0;i<this.mesh.count;i++){const gem=run.gems[i];if(!this.born.has(gem))this.born.set(gem,elapsed);const age=elapsed-this.born.get(gem)!;
   attr.setX(i,Math.min(this.frames-1,Math.floor(age/this.duration*this.frames)));this.mesh.setMatrixAt(i,matrix.makeTranslation(gem.position.x,gem.position.y,gem.position.z));}
  attr.needsUpdate=true;this.mesh.instanceMatrix.needsUpdate=true;
 }
 dispose(){this.disposed=true;if(this.mesh){this.scene.remove(this.mesh);this.mesh.geometry.dispose();this.mesh.material.dispose();}this.texture?.dispose();}
}
