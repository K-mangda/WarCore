import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {Fox} from '../player/Fox';
/** Shares the game's Fox rig. Only mounted for the playable Fox selection. */
export function CharacterPreview(){
 const host=useRef<HTMLDivElement>(null),[error,setError]=useState(''),[ready,setReady]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!host.current)return;const element=host.current,fox=new Fox(),scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.05,30);let renderer:T.WebGLRenderer|undefined,observer:ResizeObserver|undefined,frame=0,disposed=false,last=0;
  setReady(false);setError('');scene.add(fox.root,new T.HemisphereLight(0xffffff,0x394938,3));const light=new T.DirectionalLight(0xffefcf,2.5);light.position.set(3,5,4);scene.add(light);camera.position.set(0,1.1,3.8);camera.lookAt(0,.9,0);
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;element.append(renderer.domElement);
   const resize=()=>{const width=Math.max(1,element.clientWidth),height=Math.max(1,element.clientHeight);renderer!.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(element);resize();
   void fox.load().then(()=>{if(disposed)return;setReady(true);const origin=new T.Vector3();const tick=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(tick);if(document.hidden||time-last<1000/30)return;const dt=last?Math.min(.1,(time-last)/1000):0;last=time;fox.update(origin,.2,0,true,0,dt);renderer!.render(scene,camera);};frame=requestAnimationFrame(tick);}).catch(reason=>{if(!disposed)setError(String(reason));});
  }catch(reason){setError(String(reason));}
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();fox.dispose();renderer?.dispose();renderer?.domElement.remove();};
 },[attempt]);
 return <div className="character-model" aria-label="Fox model preview"><div ref={host} className="character-model-canvas"/>{!ready&&!error&&<p role="status">Loading model…</p>}{error&&<div role="alert"><p>Model preview unavailable.</p><button onClick={()=>setAttempt(value=>value+1)}>RETRY MODEL</button></div>}</div>;
}
