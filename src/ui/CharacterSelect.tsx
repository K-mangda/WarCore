import {CharacterPreview} from './CharacterPreview';
import {useState} from 'react';
import {characters,canPlayCharacter} from '../characters/Catalog';
import type {Weapon} from '../combat/Run';
import {assetUrl} from '../core/assetUrl';
import {usePanelFocus} from './usePanelFocus';
import './character-select.css';
import {useSyncExternalStore} from 'react';
import {gameIcons} from '../data/Icons';
import {characterRank,getProfile,subscribeProfile} from '../core/Profile';
import {xpForLevel} from '../combat/XpCurve';
/** Skins of a character from SkinData (icons exported by tools/export_icons.py); Default first. Only the default skin is usable on the web. */
const skinsOf=(name:string)=>Object.entries(gameIcons.skins as Record<string,string>).filter(([k])=>k.toLowerCase().startsWith(name.toLowerCase().slice(0,4))).sort(([a],[b])=>Number(b.includes('Default'))-Number(a.includes('Default')));
export function CharacterSelect({ready,error,onWeapon,onStart,onBack,onRetry,onHover}:{weapon:Weapon;ready:boolean;error:string;onWeapon:(weapon:Weapon)=>void;onStart:(id:string)=>void;onBack:()=>void;onRetry:()=>void;onHover:()=>void}){
 const panel=usePanelFocus(onBack),[selected,setSelected]=useState('fox'),[search,setSearch]=useState('');
 const progress=useSyncExternalStore(subscribeProfile,getProfile,getProfile);
 const character=characters.find(entry=>entry.id===selected)!;
 const filtered=characters.filter(entry=>entry.name.toLowerCase().includes(search.trim().toLowerCase()));
 const playable=canPlayCharacter(selected);
 return <section ref={panel} className="character-shade" role="dialog" aria-modal="true" aria-labelledby="character-title"><div className="character-content"><div className="character-window"><div className="character-heading"><h2 id="character-title">CHARACTER SELECTION</h2><button aria-label="Back" onClick={onBack}>×</button></div><div className="character-roster"><label htmlFor="character-search">Characters <small>1 playable / {characters.length} listed</small></label><input id="character-search" type="search" value={search} onChange={event=>setSearch(event.currentTarget.value)} placeholder="Search characters…"/>
   <div className="character-grid" aria-label="Character roster">{filtered.map(entry=><button className={'character-card'+(entry.playable?'':' character-unavailable')} key={entry.id} aria-pressed={selected===entry.id} onPointerEnter={onHover} onClick={()=>setSelected(entry.id)}>
    {entry.portrait?<img src={assetUrl(entry.portrait)} alt="" loading="lazy"/>:<span className="missing-portrait">Portrait unavailable</span>}
    <strong>{entry.name}</strong><small>{entry.playable?'PLAYABLE':'NOT READY'}</small>
   </button>)}</div>{!filtered.length&&<p role="status">No characters found.</p>}
  </div></div><div className="character-center">{playable?<CharacterPreview/>:<p className="character-model-unavailable">Model not ready</p>}</div><aside className="character-detail" aria-label="Selected character"><div className="character-identity">{character.portrait?<img className={'character-portrait'+(playable?'':' character-silhouette')} src={assetUrl(character.portrait)} alt={character.name}/>:<p>Portrait not available yet.</p>}<div><h3>{character.name}</h3>{(()=>{const c=progress.characters?.[character.id]??{xp:0,runs:0},r=characterRank(c.xp,xpForLevel);return <><p className="character-rank"><img src={assetUrl('ui/icons/rank-frame.png')} alt=""/>Rank {r.rank}</p><span className="rank-bar"><i style={{width:`${Math.round(r.progress*100)}%`}}/></span><p className="character-runs">{c.runs} Runs</p></>;})()}</div></div>
   <p>{playable?'Quick on his feet and unnaturally lucky.':'Not playable in the web game yet.'}</p>
   {playable&&<div className="character-reference">
     <div className="character-reference-weapon"><img src={assetUrl('game-ui/Firestaff.png')} alt=""/><div><h4>Firestaff</h4><p>Shoots fireballs that explode on impact</p></div></div>
     <div className="character-reference-weapon"><img src={assetUrl((gameIcons.passives as Record<string,string>)['Rng Blessing'])} alt=""/><div><h4>RNG Blessing</h4><p>Gain 1.5% Luck per level.</p></div></div>
     <h4>Skin</h4><div className="skin-row">{skinsOf(character.name).map(([k,url],i)=><span key={k} className={'skin'+(i===0?' on':'')} title={k}>{i===0?<img src={assetUrl(url)} alt=""/>:<img className="skin-lock" src={assetUrl('ui/maps/Lock.png')} alt="Locked"/>}</span>)}</div>
    </div>}
   {error&&<div role="alert"><p>Could not load game: {error}</p><button onClick={onRetry}>RETRY LOADING</button></div>}
   <button className="character-start" disabled={!playable||!ready||!!error} onClick={()=>{if(canPlayCharacter(selected)&&ready&&!error){onWeapon('bolt');onStart(selected);}}}>{!playable?'NOT READY':!ready?'LOADING…':'CONFIRM'}</button>
  </aside></div></section>;
}
