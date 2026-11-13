import {useSyncExternalStore,type CSSProperties} from 'react';
import {getEffectsPreferences,setEffectsPreferences,resetEffectsPreferences,subscribeEffectsPreferences} from '../core/EffectsPreferences';
export function EffectsSettings({onInteract}:{onInteract:()=>void}){
 const settings=useSyncExternalStore(subscribeEffectsPreferences,getEffectsPreferences,getEffectsPreferences);
 return <div className="settings-content"><h3>VISUALS</h3><div className="audio-rows">
  {([['damageNumbers','Damage Numbers'],['damageFlash','Damage Flash']] as const).map(([key,label])=>{
   const toggle=()=>{onInteract();setEffectsPreferences({[key]:!settings[key]});};
   return <div className="controls-option" key={key}><span id={'effects-label-'+key}>{label}</span><div className="controls-switch"><button onClick={toggle} aria-label={'Previous value for '+label}>‹</button><button className="controls-switch-value" aria-labelledby={'effects-label-'+key} aria-pressed={settings[key]} onClick={toggle}>{settings[key]?'On':'Off'}<small aria-hidden="true">{settings[key]?'○ ●':'● ○'}</small></button><button onClick={toggle} aria-label={'Next value for '+label}>›</button></div></div>;
  })}
  <div className="audio-setting-row"><label htmlFor="effects-opacity">Particles Opacity</label><input id="effects-opacity" type="range" min="0" max="1" step="0.01" value={settings.particlesOpacity} style={{'--audio-level':`${settings.particlesOpacity*100}%`} as CSSProperties} onChange={event=>{onInteract();setEffectsPreferences({particlesOpacity:Number(event.currentTarget.value)});}}/><output htmlFor="effects-opacity">{settings.particlesOpacity.toFixed(2)}</output></div>
 </div><button className="controls-reset" onClick={()=>{onInteract();resetEffectsPreferences();}}>Reset Effects</button></div>;
}
