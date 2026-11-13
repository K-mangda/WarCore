import {assetUrl} from '../core/assetUrl';
import * as T from 'three';
interface Glyph {imageRect:{x:number;y:number;width:number;height:number};metrics:{horizontalBearingX:number;horizontalBearingY:number;horizontalAdvance:number};scale:number;}
interface FontData {faceInfo:{m_PointSize:number;m_AscentLine:number};atlas:{padding:number};characters:Record<string,Glyph>;}
/** Native Press Start 2P SDF glyphs. CPU threshold/underlay rasterization is a web approximation. */
export class DamageNumbers {
  private data?:FontData;
  private image?:HTMLImageElement;
  private glyphs=new Map<string,HTMLCanvasElement>();
  private materials=new Map<string,T.SpriteMaterial>();
  async load(){
    const [response,image]=await Promise.all([fetch(assetUrl('game-ui/damage/glyphs.json')),new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Damage font atlas unavailable'));image.src=assetUrl('game-ui/damage/atlas.png');})]);
    if(!response.ok)throw Error('Damage font metadata unavailable');
    this.data=await response.json() as FontData;this.image=image;
  }
  private glyph(char:string,outline=true){
    const glyphKey=char+(outline?'outlined':'plain');
    let canvas=this.glyphs.get(glyphKey);if(canvas)return canvas;
    const glyph=this.data!.characters[char];if(!glyph)throw Error(`Damage glyph unavailable: ${char}`);
    const rect=glyph.imageRect,padding=this.data!.atlas.padding;canvas=document.createElement('canvas');canvas.width=rect.width+padding*2;canvas.height=rect.height+padding*2;
    const context=canvas.getContext('2d')!;context.drawImage(this.image!,rect.x-padding,rect.y-padding,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<pixels.data.length;i+=4){const distance=pixels.data[i+3]/255;const foreground=distance>=.5;const underlay=outline?distance>=.3:foreground;pixels.data[i]=foreground?255:0;pixels.data[i+1]=foreground?240:0;pixels.data[i+2]=foreground?189:0;pixels.data[i+3]=underlay?255:0;}
    context.putImageData(pixels,0,0);this.glyphs.set(glyphKey,canvas);return canvas;
  }
  material(damage:number|string,color='#fff0bd',cache=true,outline=true){
    const key=String(damage)+color+outline;
    let material=cache?this.materials.get(key):undefined;if(material)return material;
    if(!this.data||!this.image)throw Error('Damage font must load before rendering');
    const text=String(damage),size=28,scale=size/this.data.faceInfo.m_PointSize;
    const advance=[...text].reduce((sum,char)=>sum+this.data!.characters[char].metrics.horizontalAdvance*scale,0);
    const canvas=document.createElement('canvas');canvas.width=2**Math.ceil(Math.log2(Math.max(64,advance+24)));canvas.height=80;
    const context=canvas.getContext('2d')!;context.imageSmoothingEnabled=false;let x=(canvas.width-advance)/2;
    const baseline=12+size;
    for(const char of text){const glyph=this.data.characters[char],bitmap=this.glyph(char,outline);context.drawImage(bitmap,x+(glyph.metrics.horizontalBearingX-this.data.atlas.padding)*scale,baseline-(glyph.metrics.horizontalBearingY+this.data.atlas.padding)*scale,bitmap.width*scale,bitmap.height*scale);x+=glyph.metrics.horizontalAdvance*scale;}
    if(color!=='#fff0bd'){
      const tint=new T.Color(color).convertLinearToSRGB(),pixels=context.getImageData(0,0,canvas.width,canvas.height);
      for(let i=0;i<pixels.data.length;i+=4)if(pixels.data[i]>0){pixels.data[i]=Math.round(tint.r*255);pixels.data[i+1]=Math.round(tint.g*255);pixels.data[i+2]=Math.round(tint.b*255);}
      context.putImageData(pixels,0,0);
    }
    const map=new T.CanvasTexture(canvas);if(color!=='#fff0bd')map.colorSpace=T.SRGBColorSpace;map.magFilter=T.NearestFilter;map.minFilter=T.LinearFilter;
    material=new T.SpriteMaterial({map,transparent:true,depthWrite:false});if(cache)this.materials.set(key,material);return material;
  }
  dispose(){for(const material of this.materials.values()){material.map?.dispose();material.dispose();}this.materials.clear();this.glyphs.clear();}
}
