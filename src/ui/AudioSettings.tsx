import {useEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {ControlSettings} from './ControlSettings';
import {VideoSettings} from './VideoSettings';
import {EffectsSettings} from './EffectsSettings';
import {GameSettings} from './GameSettings';
import {audioDefaults,getAudioPreferences,resetAudioPreferences,setAudioPreferences,subscribeAudioPreferences,type AudioVolume} from '../audio/AudioPreferences';
import './audio-settings.css';
const rows:[AudioVolume,string][]=[['master','Master Volume'],['music','Music Volume'],['game','Game Sounds'],['ambience','Ambience'],['ui','UI'],['pickups','XP and Gold']];
export function AudioSettings({onClose,onTestSound,onInteract,resolution}:{onClose:()=>void;onTestSound:()=>void;onInteract:()=>void;resolution?:{width:number;height:number}}){
 const preferences=useSyncExternalStore(subscribeAudioPreferences,getAudioPreferences,getAudioPreferences);
 const [section,setSection]=useState('AUDIO');
 const panel=useRef<HTMLDivElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLInputElement>('input')?.focus();
  const keydown=(event:KeyboardEvent)=>{
   if(panel.current?.querySelector('[data-rebinding=true]'))return;
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close.current();}
   if(event.key==='Tab'){
    const elements=Array.from(panel.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input'));
    const first=elements[0],last=elements.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',keydown,true);
  return ()=>{document.removeEventListener('keydown',keydown,true);if(previous?.isConnected)previous.focus();};
 },[]);
 return <section className="settings-shade" role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <div className="settings-window" ref={panel}>
   <div className="settings-heading"><h2 id="settings-title">SETTINGS</h2><button className="settings-close" aria-label="Close settings" onClick={onClose}>×</button></div>
   <nav className="settings-tabs" aria-label="Settings sections">{['GAME','VIDEO','CONTROLS','AUDIO','EFFECTS','OTHER'].map(tab=><button key={tab} disabled={tab==='OTHER'} aria-current={tab===section?'page':undefined} onClick={()=>{onInteract();setSection(tab);}} title={tab==='OTHER'?'Not available in this playtest':undefined}>{tab}</button>)}</nav>
   {section==='GAME'?<GameSettings onInteract={onInteract}/>:section==='EFFECTS'?<EffectsSettings onInteract={onInteract}/>:section==='VIDEO'?<VideoSettings onInteract={onInteract} resolution={resolution}/>:section==='CONTROLS'?<ControlSettings onInteract={onInteract}/>:<div className="settings-content"><h3>AUDIO</h3>
    <div className="audio-rows">{rows.map(([key,label])=><div className="audio-setting-row" key={key}>
     <label htmlFor={'audio-'+key}>{label}</label>
     <input id={'audio-'+key} type="range" min="0" max="1" step="0.01" value={preferences[key]} aria-valuetext={`${Math.round(preferences[key]*100)} percent`} style={{'--audio-level':`${preferences[key]*100}%`} as CSSProperties} onChange={event=>{onInteract();setAudioPreferences({[key]:Number(event.currentTarget.value)});}}/>
     <output htmlFor={'audio-'+key}>{preferences[key].toFixed(2)}</output>
    </div>)}</div>
    <p className="audio-music-note">No background music is playing in this test arena.</p>
    <div className="audio-settings-actions"><button onClick={onTestSound}>TEST UI SOUND</button><button onClick={()=>{onInteract();resetAudioPreferences();}} disabled={Object.keys(audioDefaults).every(key=>preferences[key as keyof typeof preferences]===audioDefaults[key as keyof typeof audioDefaults])}>RESET TO DEFAULT</button></div>
   </div>}
  </div>
 </section>;
}
