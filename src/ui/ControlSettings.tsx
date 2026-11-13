import {useEffect,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {getControlPreferences,setControlPreferences,resetControlPreferences,subscribeControlPreferences,bindingActions,bindingLabel,bindControl,type BindingAction,type ControlPreferences} from '../core/ControlPreferences';
const toggles:[keyof Pick<ControlPreferences,'invertHorizontal'|'invertVertical'|'arrowLook'|'numberUpgrades'>,string][]=[['invertHorizontal','Inverted Horizontal Axis'],['invertVertical','Inverted Vertical Axis'],['arrowLook','Rotate camera with arrow keys'],['numberUpgrades','Select upgrades with number keys']];
export function ControlSettings({onInteract}:{onInteract:()=>void}){
 const [capture,setCapture]=useState<BindingAction|null>(null),[message,setMessage]=useState('');
 useEffect(()=>{if(!capture)return;const key=(event:KeyboardEvent)=>{event.preventDefault();event.stopPropagation();if(event.code==='Escape'){setCapture(null);return;}if(event.repeat)return;const error=event.altKey||event.metaKey||event.ctrlKey&&!event.code.startsWith('Control')?'Key combinations are unsupported.':bindControl(capture,event.code);setMessage(error??'Binding saved.');if(!error)setCapture(null);};document.addEventListener('keydown',key,true);return ()=>document.removeEventListener('keydown',key,true);},[capture]);
 const settings=useSyncExternalStore(subscribeControlPreferences,getControlPreferences,getControlPreferences);
 const bindings:[string,string[]][]=[['Pause',['ESC']],['Look',['MOUSE']]];
 if(settings.arrowLook)bindings.push(['Rotate camera',['←','↑','↓','→']]);
 if(settings.numberUpgrades)bindings.push(['Select upgrade',['1','2','3']]);
 return <div className="settings-content controls-content"><h3>GENERAL</h3><div className="audio-rows">
  {([['sensitivity','Sensitivity',.1,8],['lookSmoothing','Look Smoothing',0,1]] as const).map(([key,label,min,max])=><div className="audio-setting-row" key={key}>
   <label htmlFor={'control-'+key}>{label}</label><input id={'control-'+key} type="range" min={min} max={max} step="0.01" value={settings[key]} style={{'--audio-level':`${(settings[key]-min)/(max-min)*100}%`} as CSSProperties} aria-valuetext={settings[key].toFixed(2)} onChange={event=>{onInteract();setControlPreferences({[key]:Number(event.currentTarget.value)});}}/><output htmlFor={'control-'+key}>{settings[key].toFixed(2)}</output>
  </div>)}
  {toggles.map(([key,label])=>{
   const toggle=()=>{onInteract();setControlPreferences({[key]:!settings[key]});};
   return <div className="controls-option" key={key}><span id={'control-label-'+key}>{label}</span><div className="controls-switch">
    <button onClick={toggle} aria-label={'Previous value for '+label}>‹</button>
    <button className="controls-switch-value" aria-labelledby={'control-label-'+key} aria-pressed={settings[key]} onClick={toggle}>{settings[key]?'On':'Off'}<small aria-hidden="true">{settings[key]?'○ ●':'● ○'}</small></button>
    <button onClick={toggle} aria-label={'Next value for '+label}>›</button>
   </div></div>;
  })}
 </div><h3 className="controls-keyboard-title">KEYBOARD INPUT</h3>
 <div className="controls-bindings" data-rebinding={capture?"true":undefined} aria-label="Current keyboard and mouse controls">{bindingActions.map(action=><div className="controls-key-row" key={action}><span>{action[0].toUpperCase()+action.slice(1)}</span><button onClick={()=>{onInteract();setMessage('Press a key; Esc cancels.');setCapture(action);}} aria-label={'Change '+action+' key'}>{capture===action?'Press key…':bindingLabel(settings.bindings[action])}</button></div>)}{bindings.map(([label,keys])=><div className="controls-key-row" key={label}><span>{label}</span><div>{keys.map(key=><kbd className={'controls-keycap'+(key.length>1?' controls-keycap-wide':'')} key={key}>{key}</kbd>)}</div></div>)}</div>
 <p className="audio-music-note">Click a movement or jump key to change it. Esc, arrows and 1–3 remain reserved. Drag to look when pointer lock is unavailable.</p>
 <p role="status">{message}</p><button className="controls-reset" onClick={()=>{onInteract();setCapture(null);setMessage('Controls reset.');resetControlPreferences();}}>Reset Controls</button>
 </div>;
}
