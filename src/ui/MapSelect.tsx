import {useState} from 'react';
import {assetUrl} from '../core/assetUrl';
import {usePanelFocus} from './usePanelFocus';
/**
 * Map selection after CONFIRM on character selection, laid out from the real screen (user screenshot 2026-11-14, V):
 * left window lists maps (icon + description; locked maps show the lock and the unlock requirement),
 * right panel shows the map (top texture), tiers with Silver multipliers (1x / 1.1x / 1.2x), stage count and Silver gain.
 * Descriptions and the Graveyard requirement are copied from the screenshot (localisation not exported yet).
 * Icons: <Map>IconBig, Lock, psd_checkmark, ForestTopTexture (sharedassets1). Only Forest Tier 1 is playable on the web.
 * Highscore/speedrun, Challenges and the music picker are not built. The LAB button lives here at the user's request.
 */
interface MapRow {id:string;name:string;icon:string;top?:string;text:string;locked?:boolean;stages:number}
const maps:MapRow[]=[
  {id:'MapForest',name:'Forest',icon:'ui/maps/ForestIconBig.png',top:'ui/maps/ForestTop.png',stages:1,text:'A green place full of trees, birds, and great vibes. Also everything will try to kill you.'},
  {id:'MapDesert',name:'Desert',icon:'ui/maps/DesertIconBig.png',stages:1,text:'A hot, dry and dusty place.'},
  {id:'MapGraveyard',name:'Graveyard',icon:'ui/maps/GraveyardIconBig.png',locked:true,stages:1,text:'As Calcium on Desert Tier 2, summon and defeat the undead boss.'},
];
const tiers=[{name:'Tier 1',colour:'#4dff97',silver:1},{name:'Tier 2',colour:'#3fc7ff',silver:1.1},{name:'Tier 3',colour:'#ff9a2e',silver:1.2}];
export function MapSelect({onBack,onStart,onLab}:{onBack:()=>void;onStart:(map:string,tier:number)=>void;onLab:()=>void}){
  const panel=usePanelFocus(onBack);
  const [map,setMap]=useState('MapForest'),[tier,setTier]=useState(0);
  const current=maps.find(m=>m.id===map)!,playable=map==='MapForest'&&tier===0;
  return <section ref={panel} className="map-screen" role="dialog" aria-label="Map selection">
    <div className="map-list-window">
      <header><h2>MAP SELECTION</h2><button className="title-close" onClick={onBack} aria-label="Back">✕</button></header>
      <div className="map-list">{maps.map(m=><button key={m.id} className={'map-row'+(m.locked?' locked':'')} aria-pressed={m.id===map} onClick={()=>!m.locked&&setMap(m.id)}>
        <span className="map-thumb">{m.locked?<img className="map-lock" src={assetUrl('ui/maps/Lock.png')} alt="Locked"/>:<img src={assetUrl(m.icon)} alt=""/>}<b>{m.locked?'??':m.name}</b></span>
        <span className="map-text">{m.locked&&<strong>Unlock requirement:</strong>}{m.text}</span>
      </button>)}</div>
    </div>
    <aside className="map-detail">
      <div className="map-detail-head">{current.top?<img src={assetUrl(current.top)} alt=""/>:<img src={assetUrl(current.icon)} alt=""/>}
        <div><h3>{current.name}</h3><p style={{color:tiers[tier].colour}}>{tiers[tier].name}</p></div></div>
      <div className="map-tier-list">{tiers.map((t,i)=><button key={t.name} aria-pressed={i===tier} onClick={()=>setTier(i)}>
        <span className="map-box">{i===tier&&<i/>}</span><span style={{color:t.colour}}>{t.name}</span>
        <span><img src={assetUrl('ui/hud/silver.png')} alt=""/>{t.silver}x</span><img className="map-check" src={assetUrl('ui/maps/Check.png')} alt=""/></button>)}</div>
      <p className="map-stats">Stages: {current.stages}<br/><img src={assetUrl('ui/hud/silver.png')} alt=""/> {tiers[tier].silver}x Silver Gain</p>
      <button className="map-lab" onClick={onLab}>LAB</button>
      <button className="map-confirm" onClick={()=>playable&&onStart(map,tier)} disabled={!playable}>{playable?'CONFIRM':'NOT IN WEB YET'}</button>
    </aside>
  </section>;
}
