import {Stats} from './PlayerStats';
import {usePanelFocus} from './usePanelFocus';
import {assetUrl} from '../core/assetUrl';
import type {RunSnapshot,Upgrade} from '../combat/Run';
import {upgradeDescription,upgrades,upgradeValues} from '../combat/Upgrades';
import {rarityColors,upgradeMultiplier} from '../combat/Rarity';
import {useEffect,useRef,useSyncExternalStore,type CSSProperties} from 'react';
import {getControlPreferences,subscribeControlPreferences} from '../core/ControlPreferences';
import {upgradeHotkey} from '../core/UpgradeHotkeys';
import {LevelUpBackdrop} from './LevelUpBackdrop';
export function UpgradeMenu({run,choose,hover}:{run:RunSnapshot;choose:(id:Upgrade)=>void;hover:()=>void}){
 const panel=usePanelFocus();
 const settings=useSyncExternalStore(subscribeControlPreferences,getControlPreferences,getControlPreferences);
 const latest=useRef({run,choose});latest.current={run,choose};
 useEffect(()=>{
  const keydown=(event:KeyboardEvent)=>{
   const id=upgradeHotkey(event,latest.current.run.upgradeChoices);if(!id)return;event.preventDefault();latest.current.choose(id);
  };
  window.addEventListener('keydown',keydown);return ()=>window.removeEventListener('keydown',keydown);
 },[]);
 return <section ref={panel} className="upgrade-screen" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
  <LevelUpBackdrop key={`${run.level}-${run.pendingUpgrades}`}/>
  <div className="upgrade-spectrum" aria-hidden="true"><div className="upgrade-spectrum-track">{Array.from({length:12},(_,index)=><i key={index}/>)}</div></div>
  <div className="upgrade-layout">
   <section className="upgrade-side upgrade-inventory" aria-labelledby="upgrade-inventory-title"><h2 id="upgrade-inventory-title">Inventory</h2><div className="upgrade-side-body">
    <h3>Weapons</h3><div className="upgrade-owned-weapon"><img src={assetUrl(run.weapon==='sword'?'weapons/knight-sword/vfx/textures/Sword_Icon.png':'game-ui/Firestaff.png')} alt=""/><span>{run.weapon==='sword'?'Sword':'Firestaff'}</span></div>
    <h3>Tomes</h3><TomeLoadout run={run}/>{!Object.values(run.upgradeLevels).some(level=>level>0)&&<p className="upgrade-muted">No Tomes selected yet.</p>}
    <h3>Items</h3><p className="upgrade-muted">Not available in this playtest.</p>
   </div></section>
   <section className="upgrade-offers"><h2 id="upgrade-title">UPGRADE OFFERS</h2><p className="upgrade-context">LEVEL {run.level} · GAME PAUSED{run.pendingUpgrades>1?` · ${run.pendingUpgrades} choices remaining`:''}</p>
    <div className="upgrade-cards">{run.upgradeChoices.map((id,index)=>{
     const upgrade=upgrades.find(upgrade=>upgrade.id===id)!,rarity=run.upgradeRarity[id]??'Common',multiplier=upgradeMultiplier[rarity];
     return <button key={id} className={`rarity-${rarity.toLowerCase()}`} style={{'--rarity':rarityColors[rarity]} as CSSProperties} onPointerEnter={hover} onClick={()=>choose(id)}>
      <span className="upgrade-offer-kind">{run.upgradeLevels[id]===0?'New Tome':'Tome upgrade'}</span><span className="upgrade-rarity">{rarity}</span>
      <img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt=""/><div className="upgrade-offer-description"><h3>{upgrade.name}</h3><strong className="upgrade-values">{upgradeValues(id,run,multiplier)}</strong><p>{upgradeDescription(id,multiplier)}</p></div>
      <span className="tome-level">{run.upgradeLevels[id]===0?'NEW':`LVL ${run.upgradeLevels[id]}`}</span><small>{settings.numberUpgrades?`[${index+1}] SELECT`:'SELECT'}</small>
     </button>;
    })}</div>
    <div className="upgrade-actions" aria-label="Additional upgrade actions"><button disabled title="Not available yet">BANISH</button><button disabled title="Not available yet">SKIP</button><button disabled title="Not available yet">REFRESH</button><p>These actions are not available in this playtest.</p></div>
   </section>
   <section className="upgrade-side upgrade-player-stats" aria-labelledby="upgrade-stats-title"><h2 id="upgrade-stats-title">Stats</h2><div className="upgrade-side-body"><Stats run={run}/><p className="upgrade-muted">Showing current playtest stats.</p></div></section>
  </div>
 </section>;
}

export function TomeLoadout({run}:{run:RunSnapshot}){
 const owned=upgrades.filter(upgrade=>run.upgradeLevels[upgrade.id]>0);if(!owned.length)return null;
 return <div className="tome-loadout" aria-label="Chosen Tomes">{owned.map(upgrade=><span key={upgrade.id} title={`${upgrade.name} · Level ${run.upgradeLevels[upgrade.id]}`}>
  <img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt={upgrade.name}/><small>Lv. {run.upgradeLevels[upgrade.id]}</small>
 </span>)}</div>;
}
