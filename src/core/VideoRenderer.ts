import * as T from 'three';
import type {VideoPreferences} from './VideoPreferences';
type Renderer=Pick<T.WebGLRenderer,'setPixelRatio'|'setSize'>;
const applied=new WeakMap<Renderer,{ratio:number;width:number;height:number}>();
export function videoPixelRatio(deviceRatio:number,scale:number,cap=1.75){return Math.min(Number.isFinite(deviceRatio)&&deviceRatio>0?deviceRatio:1,cap)*scale;}
export function applyVideoPreferences(renderer:Renderer,camera:T.PerspectiveCamera,scene:T.Scene,settings:Readonly<VideoPreferences>,width:number,height:number,deviceRatio:number,profile:'game'|'lab'='game'){
 const w=Math.max(1,width),h=Math.max(1,height),ratio=videoPixelRatio(deviceRatio,settings.renderScale,profile==='game'?1.75:1.5),previous=applied.get(renderer);
 if(!previous||previous.ratio!==ratio)renderer.setPixelRatio(ratio);
 if(!previous||previous.width!==w||previous.height!==h)renderer.setSize(w,h);
 applied.set(renderer,{ratio,width:w,height:h});camera.aspect=w/h;
 if(profile==='game'){
  camera.fov=settings.fov;camera.far=settings.viewDistance;
  if(scene.fog instanceof T.Fog){scene.fog.far=Math.min(135,settings.viewDistance*.9);scene.fog.near=Math.min(45,scene.fog.far/3);}
 }
 camera.updateProjectionMatrix();
}
