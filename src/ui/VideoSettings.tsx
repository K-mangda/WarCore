import {useEffect,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {videoPresets,applyVideoPreset,currentVideoPreset,type VideoPreset,fpsLimits,getVideoPreferences,setVideoPreferences,resetVideoPreferences,subscribeVideoPreferences} from '../core/VideoPreferences';
export async function toggleBrowserFullscreen(){if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
export function VideoSettings({onInteract,resolution}:{onInteract:()=>void;resolution?:{width:number;height:number}}){
 const settings=useSyncExternalStore(subscribeVideoPreferences,getVideoPreferences,getVideoPreferences);
 const [fullscreen,setFullscreen]=useState(typeof document!=='undefined'&&!!document.fullscreenElement),[pending,setPending]=useState(false),[error,setError]=useState('');
 const available=typeof document!=='undefined'&&document.fullscreenEnabled&&!!document.documentElement?.requestFullscreen;
 useEffect(()=>{const changed=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',changed);return ()=>document.removeEventListener('fullscreenchange',changed);},[]);
 const toggleFullscreen=async()=>{
  if(!available||pending)return;onInteract();setError('');setPending(true);
  try{await toggleBrowserFullscreen();}catch{setError('Fullscreen is unavailable in this browser or window.');}finally{setPending(false);}
 };
 return <div className="settings-content video-content"><h3>SCREEN</h3><div className="audio-rows">
  <div className="controls-option"><span>Resolution</span><output className="video-resolution">{resolution&&resolution.width>0?`${resolution.width}×${resolution.height}`:'—'}</output></div>
  {available&&<div className="controls-option"><span>Fullscreen Mode</span><div className="controls-switch"><button disabled={pending} onClick={()=>void toggleFullscreen()} aria-label="Previous fullscreen mode">‹</button><button disabled={pending} className="controls-switch-value video-mode-value" onClick={()=>void toggleFullscreen()}>{fullscreen?'Fullscreen':'Browser Window'}</button><button disabled={pending} onClick={()=>void toggleFullscreen()} aria-label="Next fullscreen mode">›</button></div></div>}
  <div className="audio-setting-row"><label htmlFor="video-fps">FPS Limit</label><input id="video-fps" type="range" min="0" max={fpsLimits.length-1} step="1" value={fpsLimits.findIndex(value=>value===settings.fpsLimit)} aria-valuetext={settings.fpsLimit?String(settings.fpsLimit):'Display refresh'} style={{'--audio-level':`${fpsLimits.findIndex(value=>value===settings.fpsLimit)/(fpsLimits.length-1)*100}%`} as CSSProperties} onChange={event=>{onInteract();setVideoPreferences({fpsLimit:fpsLimits[Number(event.currentTarget.value)]});}}/><output className="video-fps-output" htmlFor="video-fps">{settings.fpsLimit||'Auto'}</output></div>
  {([['fov','FOV',60,110,1,0],['cameraDistance','Camera Distance',0,3,.05,2]] as const).map(([key,label,min,max,step,digits])=><div className="audio-setting-row" key={key}>
   <label htmlFor={'video-'+key}>{label}</label><input id={'video-'+key} type="range" min={min} max={max} step={step} value={settings[key]} style={{'--audio-level':`${(settings[key]-min)/(max-min)*100}%`} as CSSProperties} onChange={event=>{onInteract();setVideoPreferences({[key]:Number(event.currentTarget.value)});}}/><output htmlFor={'video-'+key}>{settings[key].toFixed(digits)}</output>
  </div>)}
 </div><h3 className="controls-keyboard-title">GRAPHICS</h3><div className="audio-rows"><div className="controls-option"><label htmlFor="video-preset">Graphics Preset</label><select id="video-preset" value={currentVideoPreset(settings)} onChange={event=>{onInteract();applyVideoPreset(event.currentTarget.value as VideoPreset);}}><option value="Custom" disabled>Custom</option>{Object.keys(videoPresets).map(name=><option key={name}>{name}</option>)}</select></div>
  {([['renderScale','Render Scale',.5,1.25,.05],['viewDistance','View Distance',50,250,10]] as const).map(([key,label,min,max,step])=><div className="audio-setting-row" key={key}>
   <label htmlFor={'video-'+key}>{label}</label><input id={'video-'+key} type="range" min={min} max={max} step={step} value={settings[key]} style={{'--audio-level':`${(settings[key]-min)/(max-min)*100}%`} as CSSProperties} onChange={event=>{onInteract();setVideoPreferences({[key]:Number(event.currentTarget.value)});}}/><output htmlFor={'video-'+key}>{key==='renderScale'?`${Math.round(settings[key]*100)}%`:settings[key].toFixed(0)}</output>
  </div>)}
 </div><p className="audio-music-note">Lower Render Scale or View Distance for a lighter image. FPS is also limited by your browser and display.</p>
 {error&&<p className="video-error" role="status">{error}</p>}
 <button className="controls-reset" onClick={()=>{onInteract();resetVideoPreferences();}}>Reset Video</button>
 </div>;
}
