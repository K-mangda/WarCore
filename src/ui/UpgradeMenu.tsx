import {assetUrl} from '../core/assetUrl';
import type {RunSnapshot,Upgrade} from '../combat/Run';
import {upgrades,upgradeValues} from '../combat/Upgrades';
export function UpgradeMenu({run,choose,hover}:{run:RunSnapshot;choose:(id:Upgrade)=>void;hover:()=>void}){
 return <section className="upgrade-screen" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
  <span className="eyebrow">LEVEL {run.level} · GAME PAUSED</span><h2 id="upgrade-title">Level up!</h2>
  <p>Pick one to continue{run.pendingUpgrades>1?` · ${run.pendingUpgrades} choices remaining`:''}</p>
  <div className="upgrade-cards">{run.upgradeChoices.map(id=>{
   const upgrade=upgrades.find(upgrade=>upgrade.id===id)!;
   return <button key={id} onPointerEnter={hover} onClick={()=>choose(id)}>
    <img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt=""/><h3>{upgrade.name}</h3>
    <span className="tome-level">Lv. {run.upgradeLevels[id]} → {run.upgradeLevels[id]+1}</span>
    <p>{upgrade.description}</p><strong className="upgrade-values">{upgradeValues(id,run)}</strong><small>SELECT →</small>
   </button>;
  })}</div>
 </section>;
}
export function TomeLoadout({run}:{run:RunSnapshot}){
 const owned=upgrades.filter(upgrade=>run.upgradeLevels[upgrade.id]>0);if(!owned.length)return null;
 return <div className="tome-loadout" aria-label="Chosen Tomes">{owned.map(upgrade=><span key={upgrade.id} title={`${upgrade.name} · Level ${run.upgradeLevels[upgrade.id]}`}>
  <img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt={upgrade.name}/><small>Lv. {run.upgradeLevels[upgrade.id]}</small>
 </span>)}</div>;
}
