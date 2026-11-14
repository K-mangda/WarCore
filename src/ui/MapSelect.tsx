import {useState,type CSSProperties} from 'react';
import {nativeMaps} from '../data/NativeData';
import {assetUrl} from '../core/assetUrl';
import {usePanelFocus} from './usePanelFocus';
/**
 * Map selection shown after CONFIRM on character selection (user screenshot 2026-11-14).
 * Maps and their order come from MapData (nativeMaps, unlockOrder; V). Icons: <Map>IconBig textures (sharedassets1; V).
 * Only Forest is playable on the web; other maps show as silhouettes. Tier background colours are approximated from the screenshot (P).
 * The LAB button lives here (moved from the title screen at the user's request).
 */
const icon:Record<string,string>={MapForest:'ui/maps/ForestIconBig.png',MapDesert:'ui/maps/DesertIconBig.png',MapGraveyard:'ui/maps/GraveyardIconBig.png'};
const tierColour=['#3c8f4a','#2f6fb8','#9a2fb8'];
export function MapSelect({onBack,onStart,onLab}:{onBack:()=>void;onStart:(map:string,tier:number)=>void;onLab:()=>void}){
  const panel=usePanelFocus(onBack);
  const maps=[...nativeMaps].sort((a,b)=>a.unlockOrder-b.unlockOrder||a.name.localeCompare(b.name));
  const [map,setMap]=useState('MapForest'),[tier,setTier]=useState(0);
  const playable=map==='MapForest'&&tier===0;
  const current=maps.find(m=>m.name===map)!;
  return <section ref={panel} className="title-window map-select" role="dialog" aria-label="Map selection">
    <header><h2>MAP SELECTION</h2><button className="title-close" onClick={onBack} aria-label="Back">✕</button></header>
    <div className="title-grid maps">{maps.map(m=><button key={m.name} className={`tile map-tile ${m.name==='MapForest'?'owned':'silhouette'}`} aria-pressed={m.name===map} onClick={()=>setMap(m.name)} title={m.name.slice(3)}>
      {icon[m.name]?<img className="tile-icon" src={assetUrl(icon[m.name])} alt=""/>:<span>{m.name.slice(3)}</span>}
    </button>)}</div>
    <div className="map-tiers">{[0,1,2].map(t=><button key={t} style={{'--tier':tierColour[t]} as CSSProperties} aria-pressed={t===tier} onClick={()=>setTier(t)}>
      <img src={assetUrl('ui/maps/Difficulty.png')} alt=""/>TIER {t+1}</button>)}</div>
    <footer><strong>{current.name.slice(3)}</strong><p>{current.stages.length} stage{current.stages.length>1?'s':''} · {current.stageDuration/60} min each</p>
      <button className="map-lab" onClick={onLab}>LAB</button>
      <button onClick={()=>playable&&onStart(map,tier)} disabled={!playable}>{playable?'START':'NOT IN WEB YET'}</button></footer>
  </section>;
}
