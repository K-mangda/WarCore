import {useSyncExternalStore,type CSSProperties} from 'react';
import {getGamePreferences,hpColors,setGamePreferences,resetGamePreferences,subscribeGamePreferences,type HpColor} from '../core/GamePreferences';
export function GameSettings({onInteract}:{onInteract:()=>void}){
 const settings=useSyncExternalStore(subscribeGamePreferences,getGamePreferences,getGamePreferences),colors=Object.keys(hpColors) as HpColor[];
 const changeColor=(direction:number)=>{onInteract();setGamePreferences({hpColor:colors[(colors.indexOf(settings.hpColor)+direction+colors.length)%colors.length]});};
 return <div className="settings-content"><h3>UI</h3><div className="audio-rows">
  <div className="controls-option"><span>HP Bar Color</span><div className="controls-switch"><button onClick={()=>changeColor(-1)} aria-label="Previous HP bar color">‹</button><span className="game-hp-color"><i aria-hidden="true" style={{backgroundColor:hpColors[settings.hpColor]}}/>{settings.hpColor}</span><button onClick={()=>changeColor(1)} aria-label="Next HP bar color">›</button></div></div>
  {([['crosshairHeight','Crosshair Height',.1,.9],['crosshairSize','Crosshair Size',.5,2],['crosshairAlpha','Crosshair Alpha',0,1]] as const).map(([key,label,min,max])=><div className="audio-setting-row" key={key}>
   <label htmlFor={'game-'+key}>{label}</label><input id={'game-'+key} type="range" min={min} max={max} step="0.01" value={settings[key]} style={{'--audio-level':`${(settings[key]-min)/(max-min)*100}%`} as CSSProperties} onChange={event=>{onInteract();setGamePreferences({[key]:Number(event.currentTarget.value)});}}/><output htmlFor={'game-'+key}>{settings[key].toFixed(2)}</output>
  </div>)}
  {([['debugFps','Debug FPS'],['debugSpeed','Debug Speed']] as const).map(([key,label])=>{
   const toggle=()=>{onInteract();setGamePreferences({[key]:!settings[key]});};
   return <div className="controls-option" key={key}><span id={'game-label-'+key}>{label}</span><div className="controls-switch"><button onClick={toggle} aria-label={'Previous value for '+label}>‹</button><button className="controls-switch-value" aria-labelledby={'game-label-'+key} aria-pressed={settings[key]} onClick={toggle}>{settings[key]?'On':'Off'}<small aria-hidden="true">{settings[key]?'○ ●':'● ○'}</small></button><button onClick={toggle} aria-label={'Next value for '+label}>›</button></div></div>;
  })}
 </div><button className="controls-reset" onClick={()=>{onInteract();resetGamePreferences();}}>Reset Game UI</button></div>;
}
