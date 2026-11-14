import * as T from 'three';
import {assetUrl} from '../core/assetUrl';
import {balance} from './Balance';
import type {Gem,Run} from './Run';
import {xpAppearance} from './Pickups';
import {xpColors,xpVisual} from './XpAppearance';

/** Native XP billboard frames; movement remains owned by Run. */
export class XpView {
 private mesh?:T.InstancedMesh<T.PlaneGeometry,T.ShaderMaterial>;private halo?:T.InstancedMesh<T.PlaneGeometry,T.ShaderMaterial>;private texture?:T.Texture;
 private born=new WeakMap<Gem,number>();private previous=0;private disposed=false;
 constructor(private scene:T.Scene){}
 async load(){
  const response=await fetch(assetUrl('pickups/xp/manifest.json'));if(!response.ok)throw new Error('XP manifest failed to load');
  const data=await response.json() as {frames:number;duration:number;size:number};
  const texture=await new T.TextureLoader().loadAsync(assetUrl('pickups/xp/frames.png'));
  if(this.disposed){texture.dispose();return;}this.texture=texture;texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;texture.generateMipmaps=false;
  const geometry=new T.PlaneGeometry(data.size*xpVisual.scale,data.size*xpVisual.scale);geometry.setAttribute('pickupTint',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems*3),3));geometry.setAttribute('pickupScale',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems),1));geometry.setAttribute('frame',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems),1));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{map:{value:texture},frames:{value:data.frames},brightness:{value:xpVisual.brightness},texel:{value:1/texture.image.width},tint:{value:new T.Color().setRGB(...xpColors.low,T.SRGBColorSpace)}},
   vertexShader:`attribute float frame;attribute vec3 pickupTint;attribute float pickupScale;varying vec3 vTint;varying vec2 vUv;uniform float frames;uniform float texel;
   void main(){vTint=pickupTint;vUv=vec2((frame+mix(.5*texel*frames,1.-.5*texel*frames,uv.x))/frames,uv.y);vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);center.xy+=position.xy*pickupScale;gl_Position=projectionMatrix*center;}`,
   fragmentShader:`uniform sampler2D map;uniform float brightness;varying vec3 vTint;varying vec2 vUv;
   void main(){vec4 tex=texture2D(map,vUv);if(tex.a<0.01)discard;gl_FragColor=vec4(tex.rgb*vTint*brightness,tex.a);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`});
  const haloGeometry=new T.PlaneGeometry(data.size*xpVisual.scale*1.7,data.size*xpVisual.scale*1.7);
  haloGeometry.setAttribute('pickupTint',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems*3),3));haloGeometry.setAttribute('pickupScale',new T.InstancedBufferAttribute(new Float32Array(balance.maxGems),1));
  const haloMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,
   vertexShader:`attribute vec3 pickupTint;attribute float pickupScale;varying vec3 vTint;varying vec2 vUv;void main(){vTint=pickupTint;vUv=uv;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);center.xy+=position.xy*pickupScale;gl_Position=projectionMatrix*center;}`,
   fragmentShader:`varying vec3 vTint;varying vec2 vUv;void main(){float glow=pow(max(0.,1.-length(vUv-.5)*2.),2.);gl_FragColor=vec4(vTint,glow*.28);
   #include <colorspace_fragment>
}`});
  this.halo=new T.InstancedMesh(haloGeometry,haloMaterial,balance.maxGems);this.halo.count=0;this.halo.renderOrder=1;this.halo.frustumCulled=false;this.scene.add(this.halo);
  this.mesh=new T.InstancedMesh(geometry,material,balance.maxGems);this.mesh.count=0;
  this.mesh.renderOrder=2;this.mesh.frustumCulled=false;this.scene.add(this.mesh);this.duration=data.duration;this.frames=data.frames;
 }
 private duration=.5;private frames=7;
 update(run:Run){
  const elapsed=run.snapshot().elapsed;if(elapsed<this.previous)this.born=new WeakMap();this.previous=elapsed;
  if(!this.mesh)return;const attr=this.mesh.geometry.getAttribute('frame') as T.InstancedBufferAttribute,matrix=new T.Matrix4();
  const gems=run.gems.filter(p=>(p.kind??'xp')==='xp');this.mesh.count=Math.min(gems.length,balance.maxGems);
  const halo=this.halo!,haloTint=halo.geometry.getAttribute('pickupTint') as T.InstancedBufferAttribute,haloScale=halo.geometry.getAttribute('pickupScale') as T.InstancedBufferAttribute;halo.count=this.mesh.count;
  const tint=this.mesh.geometry.getAttribute('pickupTint') as T.InstancedBufferAttribute,scale=this.mesh.geometry.getAttribute('pickupScale') as T.InstancedBufferAttribute;
  for(let i=0;i<this.mesh.count;i++){const gem=gems[i];const appearance=xpAppearance(gem.value,gem.echo),rgb=xpColors[appearance.tier],color=new T.Color().setRGB(rgb[0],rgb[1],rgb[2],T.SRGBColorSpace);tint.setXYZ(i,color.r,color.g,color.b);scale.setX(i,appearance.scale);haloTint.setXYZ(i,color.r,color.g,color.b);haloScale.setX(i,appearance.scale);halo.setMatrixAt(i,matrix.makeTranslation(gem.position.x,gem.position.y,gem.position.z));if(!this.born.has(gem))this.born.set(gem,elapsed);const age=elapsed-this.born.get(gem)!;
   attr.setX(i,Math.floor(age/this.duration*this.frames)%this.frames);this.mesh.setMatrixAt(i,matrix.makeTranslation(gem.position.x,gem.position.y,gem.position.z));}
  haloTint.needsUpdate=true;haloScale.needsUpdate=true;halo.instanceMatrix.needsUpdate=true;tint.needsUpdate=true;scale.needsUpdate=true;attr.needsUpdate=true;this.mesh.instanceMatrix.needsUpdate=true;
 }
 dispose(){this.disposed=true;if(this.halo){this.scene.remove(this.halo);this.halo.geometry.dispose();this.halo.material.dispose();}if(this.mesh){this.scene.remove(this.mesh);this.mesh.geometry.dispose();this.mesh.material.dispose();}this.texture?.dispose();}
}
