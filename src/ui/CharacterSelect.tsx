import {CharacterPreview} from './CharacterPreview';
import {useState} from 'react';
import {characters,canPlayCharacter} from '../characters/Catalog';
import type {Weapon} from '../combat/Run';
import {assetUrl} from '../core/assetUrl';
import {usePanelFocus} from './usePanelFocus';
import './character-select.css';
export function CharacterSelect({weapon,ready,error,onWeapon,onStart,onBack,onRetry,onHover}:{weapon:Weapon;ready:boolean;error:string;onWeapon:(weapon:Weapon)=>void;onStart:(id:string)=>void;onBack:()=>void;onRetry:()=>void;onHover:()=>void}){
 const panel=usePanelFocus(onBack),[selected,setSelected]=useState('fox'),[search,setSearch]=useState('');
 const character=characters.find(entry=>entry.id===selected)!;
 const filtered=characters.filter(entry=>entry.name.toLowerCase().includes(search.trim().toLowerCase()));
 const playable=canPlayCharacter(selected);
 return <section ref={panel} className="character-shade" role="dialog" aria-modal="true" aria-labelledby="character-title"><div className="character-content"><div className="character-window"><div className="character-heading"><h2 id="character-title">CHARACTER SELECTION</h2><button aria-label="Back" onClick={onBack}>×</button></div><div className="character-roster"><label htmlFor="character-search">Characters <small>1 playable / {characters.length} listed</small></label><input id="character-search" type="search" value={search} onChange={event=>setSearch(event.currentTarget.value)} placeholder="Search characters…"/>
   <div className="character-grid" aria-label="Character roster">{filtered.map(entry=><button className={'character-card'+(entry.playable?'':' character-unavailable')} key={entry.id} aria-pressed={selected===entry.id} onPointerEnter={onHover} onClick={()=>setSelected(entry.id)}>
    {entry.portrait?<img src={assetUrl(entry.portrait)} alt="" loading="lazy"/>:<span className="missing-portrait">Portrait unavailable</span>}
    <strong>{entry.name}</strong><small>{entry.playable?'PLAYABLE':'NOT READY'}</small>
   </button>)}</div>{!filtered.length&&<p role="status">No characters found.</p>}
  </div></div><div className="character-center">{playable?<CharacterPreview/>:<p className="character-model-unavailable">Model not ready</p>}</div><aside className="character-detail" aria-label="Selected character"><div className="character-identity">{character.portrait?<img className={'character-portrait'+(playable?'':' character-silhouette')} src={assetUrl(character.portrait)} alt={character.name}/>:<p>Portrait not available yet.</p>}<div><h3>{character.name}</h3><span className={playable?'character-ready':'character-pending'}>{playable?'PLAYABLE':'NOT READY'}</span></div></div>
   <p className={playable?'character-ready':'character-pending'}>{playable?'Ready for this playtest':'Not playable in this build'}</p>
   <p>{playable?'Quick on his feet and unnaturally lucky.':'Model and animation integration is pending.'}</p>
   {playable?<div className="character-reference"><div className="character-reference-weapon"><img src={assetUrl('game-ui/Firestaff.png')} alt=""/><div><h4>Firestaff</h4><p>Shoots fireballs that explode on impact.</p></div></div><h4>RNG Blessing</h4><p>Gain 1.5% luck per level.</p><p className="character-note">Reference description. Passive bonus is not enabled in this playtest.</p></div>:<p className="character-note">Passive and native stats are not verified here yet.</p>}
   {playable&&<><h4>PLAYTEST WEAPON</h4><div className="weapon-select" aria-label="Playtest starting weapon"><button aria-pressed={weapon==='bolt'} onClick={()=>onWeapon('bolt')}>Firestaff</button><button aria-pressed={weapon==='sword'} onClick={()=>onWeapon('sword')}>Sword</button></div></>}
   {error&&<div role="alert"><p>Could not load game: {error}</p><button onClick={onRetry}>RETRY LOADING</button></div>}
   <button className="character-start" disabled={!playable||!ready||!!error} onClick={()=>{if(canPlayCharacter(selected)&&ready&&!error)onStart(selected);}}>{!playable?'NOT READY':!ready?'LOADING…':'CONFIRM'}</button>
  </aside></div></section>;
}
