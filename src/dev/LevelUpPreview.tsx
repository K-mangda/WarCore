import {StrictMode,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Vector3} from 'three';
import {Run,type Upgrade,type Weapon} from '../combat/Run';
import {xpForLevel} from '../combat/XpCurve';
import {upgrades} from '../combat/Upgrades';
import {offerWeapon,weaponNames} from '../combat/WeaponUpgrades';
import {UpgradeMenu} from '../ui/UpgradeMenu';
import '../ui/style.css';
import '../ui/combat.css';
import './levelup-preview.css';
/**
 * Lab page for the level-up flow. It drives the REAL Run class (XP table, offers, Tome effects), so what you see here is what the
 * game does: "Give level-up" feeds exactly the XP needed, the real UpgradeMenu opens, choosing applies the real upgrade.
 * Nothing here is a second simulation; the event log lists what was chosen and the resulting stats.
 */
const origin=new Vector3();
const makeRun=(weapon:Weapon)=>{const run=new Run(()=>0,()=>false,Math.random);run.setWeapon(weapon);return run;};
function App(){
  const run=useRef<Run>(makeRun('bolt'));
  const [snap,setSnap]=useState(run.current.snapshot()),[log,setLog]=useState<string[]>([]),[weapon,setWeapon]=useState<Weapon>('bolt');
  const refresh=()=>setSnap(run.current.snapshot());
  const note=(text:string)=>setLog(lines=>[text,...lines].slice(0,12));
  const give=(levels:number)=>{
    for(let i=0;i<levels;i++){
      const need=run.current.snapshot().xpNeeded-run.current.snapshot().xp;
      run.current.gems.push({position:origin.clone(),value:Math.max(1,need)});
      run.current.step(.02,origin);
    }
    const s=run.current.snapshot();note(`Gave ${levels} level-up(s): level ${s.level}, ${s.pendingUpgrades} pending, next level needs ${s.xpNeeded} XP`);refresh();
  };
  const choose=(id:Upgrade)=>{
    const before=run.current.snapshot();
    if(!run.current.choose(id))return;
    const after=run.current.snapshot(),weapon=offerWeapon(id),name=weapon?`${weaponNames[weapon]} (weapon)`:upgrades.find(u=>u.id===id)!.name;
    note(`Chose ${name}: weapons ${after.weapons.map(w=>`${weaponNames[w.id]} L${w.level}`).join(', ')}; damage ${before.damage} -> ${after.damage}, interval ${before.attackInterval.toFixed(3)}s -> ${after.attackInterval.toFixed(3)}s, attacks ${before.projectiles} -> ${after.projectiles}`);refresh();
  };
  const reset=(next:Weapon=weapon)=>{run.current=makeRun(next);setWeapon(next);setLog([]);refresh();};
  const need=xpForLevel(snap.level);
  return <main className="levelup-lab">
    <div className="levelup-controls" role="toolbar" aria-label="Level-up test controls">
      <strong>LEVEL-UP LAB</strong>
      <label>Weapon<select value={weapon} onChange={event=>reset(event.target.value as Weapon)}><option value="bolt">Firestaff</option><option value="sword">Sword</option></select></label>
      <button onClick={()=>give(1)}>Give level-up</button><button onClick={()=>give(3)}>Give 3 level-ups</button><button onClick={()=>reset()}>Reset run</button>
      <span>Level {snap.level} · {snap.xp} / {need} XP · {snap.pendingUpgrades} pending</span>
      {!new URLSearchParams(location.search).has('embedded')&&<a href="./lab.html">Back to Lab</a>}
    </div>
    <ol className="levelup-log" aria-label="Event log">{log.length?log.map((line,index)=><li key={index}>{line}</li>):<li>Press "Give level-up" to open the real selection screen.</li>}</ol>
    {snap.pendingUpgrades>0?<UpgradeMenu run={snap} choose={choose} hover={()=>undefined}/>:<p className="levelup-idle">No level-up pending. The screen opens when XP reaches {need}.</p>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
