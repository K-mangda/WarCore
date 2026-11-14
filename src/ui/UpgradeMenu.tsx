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
 return <section ref={panel} className="upgrade-screen" onKeyDown={event=>{if(event.key==='Tab'||event.key.startsWith('Arrow'))event.currentTarget.dataset.keys='1';}} onPointerMove={event=>{delete event.currentTarget.dataset.keys;}} role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
  <LevelUpBackdrop key={`${run.level}-${run.pendingUpgrades}`}/>
  <div className="upgrade-spectrum" aria-hidden="true"/>
  <div className="upgrade-layout">
   <section className="upgrade-side upgrade-inventory" aria-labelledby="upgrade-inventory-title"><h2 id="upgrade-inventory-title">Inventory</h2><div className="upgrade-side-body">
    <h3>Weapons</h3><SlotRow slots={4} entries={[{key:run.weapon,icon:run.weapon==='sword'?'weapons/knight-sword/vfx/textures/Sword_Icon.png':'game-ui/Firestaff.png',label:run.weapon==='sword'?'Sword':'Firestaff',level:'LVL 1'}]}/>
    <h3>Tomes</h3><SlotRow slots={4} entries={upgrades.filter(upgrade=>run.upgradeLevels[upgrade.id]>0).map(upgrade=>({key:upgrade.id,icon:`game-ui/${upgrade.icon}.png`,label:upgrade.name,level:`LVL ${run.upgradeLevels[upgrade.id]}`}))}/>
    <h3>Items</h3><SlotRow slots={4} entries={[]} open/><p className="upgrade-muted">Items are not available in this playtest.</p>
   </div></section>
   <section className="upgrade-offers"><h2 id="upgrade-title">UPGRADE OFFERS</h2><p className="sr-only">Level {run.level}, game paused{run.pendingUpgrades>1?`, ${run.pendingUpgrades} choices remaining`:''}</p>
    <div className="upgrade-cards">{run.upgradeChoices.map((id,index)=>{
     const upgrade=upgrades.find(upgrade=>upgrade.id===id)!,rarity=run.upgradeRarity[id]??(run.upgradeLevels[id]===0?'New':'Common'),multiplier=upgradeMultiplier[rarity];
     return <button key={id} className={`rarity-${rarity.toLowerCase()}`} style={{'--rarity':rarityColors[rarity]} as CSSProperties} onPointerEnter={hover} onClick={()=>choose(id)}>
      <span className="upgrade-offer-kind">{rarity}</span>
      <span className="upgrade-icon"><img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt=""/></span><div className="upgrade-offer-description"><h3>{upgrade.name}</h3><strong className="upgrade-values">{upgradeValues(id,run,multiplier)}</strong><p>{upgradeDescription(id,multiplier)}</p></div>
      <span className="tome-level">{run.upgradeLevels[id]===0?'NEW':`LVL ${run.upgradeLevels[id]}`}</span><small>{settings.numberUpgrades?`[${index+1}] SELECT`:'SELECT'}</small>
     </button>;
    })}</div>
    <div className="upgrade-actions" aria-label="Additional upgrade actions"><button disabled title="Not available yet">BANISH</button><button disabled title="Not available yet">SKIP</button><button disabled title="Not available yet">REFRESH</button><p>These actions are not available in this playtest.</p></div>
   </section>
   <section className="upgrade-side upgrade-player-stats" aria-labelledby="upgrade-stats-title"><h2 id="upgrade-stats-title">Stats</h2><div className="upgrade-side-body"><Stats run={run} compact/></div></section>
  </div>
 </section>;
}

export function TomeLoadout({run}:{run:RunSnapshot}){
 const owned=upgrades.filter(upgrade=>run.upgradeLevels[upgrade.id]>0);if(!owned.length)return null;
 return <div className="tome-loadout" aria-label="Chosen Tomes">{owned.map(upgrade=><span key={upgrade.id} title={`${upgrade.name} · Level ${run.upgradeLevels[upgrade.id]}`}>
  <img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt={upgrade.name}/><small>Lv. {run.upgradeLevels[upgrade.id]}</small>
 </span>)}</div>;
}

interface SlotEntry {key:string;icon:string;label:string;level:string;}
/** Fixed-size slot row like the original inventory (4 slots for Weapons/Tomes; `open` = no cap, Items). */
function SlotRow({slots,entries,open=false}:{slots:number;entries:SlotEntry[];open?:boolean}){
 const empty=Math.max(0,slots-entries.length);
 return <div className={open?'upgrade-slots open':'upgrade-slots'}>{entries.map(entry=><span key={entry.key} className="slot filled" title={`${entry.label} · ${entry.level}`}><img src={assetUrl(entry.icon)} alt={entry.label}/><small>{entry.level}</small></span>)}{Array.from({length:empty},(_,index)=><span key={`e${index}`} className="slot" aria-hidden="true"/>)}</div>;
}
