import {assetUrl} from './core/assetUrl';
import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Engine,type Telemetry} from './core/Engine';
import {initialRun,type Upgrade} from './combat/Run';
import './ui/style.css';
import './ui/combat.css';
const upgrades:{id:Upgrade;icon:string;name:string;description:string}[]=[
  {id:'damage',icon:'DamageTome',name:'POWER',description:'+5 attack damage'},
  {id:'haste',icon:'CooldownTome',name:'HASTE',description:'15% shorter attack cooldown'},
  {id:'projectiles',icon:'QuantityTome',name:'QUANTITY',description:'+1 attack per cycle (up to 8)'},
];
function App(){
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
  const [error,setError]=useState(''),[ready,setReady]=useState(false),[muted,setMuted]=useState(false),[labOpen,setLabOpen]=useState(false);
  const [data,setData]=useState<Telemetry>({...initialRun,speed:0,fps:0,state:'Idle',jumps:0,locked:false});
  useEffect(()=>{
    if(!host.current)return;let mounted=true;
    try{engine.current=new Engine(host.current,setData);void engine.current.ready.then(()=>{if(mounted)setReady(true);}).catch(e=>{if(mounted)setError(String(e));});}catch(e){setError(String(e));}
    return()=>{mounted=false;engine.current?.dispose();};
  },[]);
  const time=`${Math.floor(data.elapsed/60).toString().padStart(2,'0')}:${Math.floor(data.elapsed%60).toString().padStart(2,'0')}`;
  return <main>
    <div ref={host} className="world"/><div className="vignette"/>
    <header><img className="game-logo" src={assetUrl('game-ui/MegabonkLogo.png')} alt="Megabonk"/><span className="build">WEB PLAYTEST · PROVISIONAL BALANCE</span></header>
    <button className="audio-toggle" aria-pressed={muted} onClick={()=>{engine.current?.audio.unlock();setMuted(engine.current?.audio.toggle()??false);}}>{muted?'SOUND OFF':'SOUND ON'}</button>
    <button className="lab-toggle" onClick={()=>{engine.current?.pauseForLab();setLabOpen(true);}}>LAB</button>
    <section className="run-hud" aria-label="Run status">
      <div className="run-time">{time}<small>{data.kills} KILLS · {data.enemyCount} ENEMIES</small></div>
      <div className="health"><span>HP {data.health} / {data.maxHealth}</span><div role="progressbar" aria-label="Health" aria-valuenow={data.health} aria-valuemax={data.maxHealth} aria-valuemin={0}><b style={{width:`${data.health/data.maxHealth*100}%`}}/></div></div>
      <div className="experience"><span>LEVEL {data.level} <small>{data.xp} / {data.xpNeeded} XP</small></span><div role="progressbar" aria-label="Experience" aria-valuenow={data.xp} aria-valuemax={data.xpNeeded} aria-valuemin={0}><b style={{width:`${data.xp/data.xpNeeded*100}%`}}/></div></div>
    </section>
    <div className="crosshair">+</div>
    <aside className="weapon-status"><img src={assetUrl(data.weapon==='sword'?'weapons/knight-sword/vfx/textures/Sword_Icon.png':'game-ui/Firestaff.png')} alt=""/><span>{data.weapon==='sword'?'SWORD · KNIGHT ASSETS':'AUTO MAGIC BOLT'}</span><strong>{data.damage} DMG · {data.attackInterval.toFixed(2)}s · ×{data.projectiles}</strong><small>{data.weapon==='sword'?'Swings automatically in your facing direction':'Targets nearby enemies automatically'}</small></aside>
    <aside className="performance">{data.speed.toFixed(1)} m/s · {data.fps} FPS · {data.state}</aside>
    {data.pendingUpgrades>0&&!data.dead&&<section className="upgrade-screen" role="dialog" aria-label="Choose an upgrade"><span className="eyebrow">LEVEL {data.level} · GAME PAUSED</span><h2>Level up!</h2><p>Pick one to continue{data.pendingUpgrades>1?` · ${data.pendingUpgrades} choices remaining`:''}</p><div className="upgrade-cards">{upgrades.map(upgrade=><button key={upgrade.id} disabled={upgrade.id==='projectiles'&&data.projectiles>=8} onPointerEnter={()=>engine.current?.audio.play('hover')} onClick={()=>engine.current?.chooseUpgrade(upgrade.id)}><img src={assetUrl(`game-ui/${upgrade.icon}.png`)} alt=""/><h3>{upgrade.name}</h3><p>{upgrade.description}</p><small>SELECT →</small></button>)}</div></section>}
    {data.dead&&<section className="start death" role="dialog" aria-label="Run ended"><span className="eyebrow">RUN ENDED</span><h2>One more run?</h2><p>{time} survived · {data.kills} kills · Level {data.level}</p><button onClick={()=>engine.current?.restart()}>PLAY AGAIN <span>↗</span></button></section>}
    {!data.locked&&!data.dead&&data.pendingUpgrades===0&&<section className="start"><span className="eyebrow">FOX / COMBAT PLAYTEST</span><h2>{data.elapsed>0?'Paused':'Ready?'}</h2><p>Move, survive and collect blue XP.<br/>Attacks fire automatically. No clicking to shoot.</p>{data.elapsed===0&&<div className="weapon-select" aria-label="Starting weapon"><button aria-pressed={data.weapon==='bolt'} onClick={()=>engine.current?.setWeapon('bolt')}>Magic bolt</button><button aria-pressed={data.weapon==='sword'} onClick={()=>engine.current?.setWeapon('sword')}>Sword</button></div>}<button disabled={!!error||!ready} onClick={()=>engine.current?.lock()}>{!ready?'LOADING…':data.elapsed>0?'RESUME RUN':'START RUN'} <span>↗</span></button><small>{error||'WASD move · Space jump · Drag to look · Esc pause'}</small><div className="reset"><button onClick={()=>engine.current?.reset()}>NEW RUN</button></div></section>}
    {labOpen&&<section className="lab-overlay" role="dialog" aria-modal="true" aria-label="Weapon Lab"><div className="lab-toolbar"><strong>WARCORE LAB</strong><button onClick={()=>setLabOpen(false)}>BACK TO GAME</button></div><iframe title="Weapon Lab" src={assetUrl('lab.html?embedded=1')}/></section>}
    <footer><div className="controls"><span><kbd>W A S D</kbd> MOVE</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>MOUSE</kbd> LOOK</span><span><kbd>ESC</kbd> PAUSE</span></div><div className="notice">TEST ARENA · ORIGINAL MAP DEFERRED</div></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
