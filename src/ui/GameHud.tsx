import type {GamePreferences} from '../core/GamePreferences';
export function Crosshair({settings}:{settings:Readonly<GamePreferences>}){
 return <div className="crosshair" aria-hidden="true" style={{top:`${settings.crosshairHeight*100}%`,transform:`scale(${settings.crosshairSize})`,transformOrigin:'center',opacity:settings.crosshairAlpha}}>+</div>;
}
export function PerformanceHud({settings,speed,fps,state}:{settings:Readonly<GamePreferences>;speed:number;fps:number;state:string}){
 if(!settings.debugFps&&!settings.debugSpeed)return null;
 const parts=[...(settings.debugSpeed?[`${speed.toFixed(1)} m/s`]:[]),...(settings.debugFps?[`${fps} FPS`]:[]),state];
 return <aside className="performance">{parts.join(' · ')}</aside>;
}
