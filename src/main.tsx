import {CharacterSelect} from './ui/CharacterSelect';
import {canPlayCharacter} from './characters/Catalog';
import {buildVersion,buildTime} from './core/BuildInfo';
import {bindingLabel,getControlPreferences,subscribeControlPreferences} from './core/ControlPreferences';
import {PausePanel,EndPanel,HistoryPanel} from './ui/RunPanels';
import './ui/run-panels.css';
import {assetUrl} from './core/assetUrl';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {Engine,type Telemetry} from './core/Engine';
import {initialRun} from './combat/Run';
import {UpgradeMenu,TomeLoadout} from './ui/UpgradeMenu';
import {AudioSettings} from './ui/AudioSettings';
import {getAudioPreferences,subscribeAudioPreferences} from './audio/AudioPreferences';
import {getGamePreferences,hpColors,subscribeGamePreferences} from './core/GamePreferences';
import {Crosshair,PerformanceHud} from './ui/GameHud';
import './ui/style.css';
import './ui/combat.css';
function App(){
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
  const [error,setError]=useState(''),[ready,setReady]=useState(false),[labOpen,setLabOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false),[attempt,setAttempt]=useState(0),[characterOpen,setCharacterOpen]=useState(false);
  const controls=useSyncExternalStore(subscribeControlPreferences,getControlPreferences,getControlPreferences);
  const audioPreferences=useSyncExternalStore(subscribeAudioPreferences,getAudioPreferences,getAudioPreferences);
  const gamePreferences=useSyncExternalStore(subscribeGamePreferences,getGamePreferences,getGamePreferences);
  const [data,setData]=useState<Telemetry>({...initialRun,speed:0,fps:0,state:'Idle',jumps:0,locked:false,renderWidth:0,renderHeight:0});
  useEffect(()=>{
    if(!host.current)return;let mounted=true;setError('');setReady(false);let instance:Engine|null=null;
    try{instance=new Engine(host.current,setData);engine.current=instance;void instance.ready.then(()=>{if(mounted)setReady(true);}).catch(e=>{if(mounted)setError(String(e));});}catch(e){setError(String(e));}
    return()=>{mounted=false;instance?.dispose();if(engine.current===instance)engine.current=null;};
  },[attempt]);
  const time=`${Math.floor(data.elapsed/60).toString().padStart(2,'0')}:${Math.floor(data.elapsed%60).toString().padStart(2,'0')}`;
  return <main>
    <div ref={host} className="world"/><div className="vignette"/>{data.elapsed>0&&!data.dead&&data.danger>.001&&<div className="low-health-vignette" style={{opacity:data.danger}} aria-hidden="true"/>}
    <header><img className="game-logo" src={assetUrl('branding/warcore-logo-transparent.png')} alt="WARCORE"/><span className="build">WEB PLAYTEST · PROVISIONAL BALANCE</span></header>
    <button className="audio-toggle" aria-pressed={audioPreferences.muted} onClick={()=>{engine.current?.audio.unlock();engine.current?.audio.toggle();}}>{audioPreferences.muted?'SOUND OFF':'SOUND ON'}</button>
    <button className="settings-toggle" onClick={()=>{engine.current?.audio.unlock();engine.current?.audio.play('click');engine.current?.pauseForSettings();setSettingsOpen(true);}}>SETTINGS</button>
    <button className="lab-toggle" onClick={()=>{engine.current?.pauseForLab();setLabOpen(true);}}>LAB</button>
    <section className="run-hud" aria-label="Run status">
      <div className="run-time">{time}<small>{data.kills} KILLS · {data.enemyCount} ENEMIES · {data.gold} GOLD · {data.silver} SILVER</small></div>
      <div className="health"><span>HP {data.health} / {data.maxHealth}</span><div role="progressbar" aria-label="Health" aria-valuenow={data.health} aria-valuemax={data.maxHealth} aria-valuemin={0}><b style={{width:`${data.health/data.maxHealth*100}%`,backgroundColor:hpColors[gamePreferences.hpColor]}}/></div></div>
      <div className="experience"><span>LEVEL {data.level} <small>{data.xp} / {data.xpNeeded} XP</small></span><div role="progressbar" aria-label="Experience" aria-valuenow={data.xp} aria-valuemax={data.xpNeeded} aria-valuemin={0}><b style={{width:`${data.xp/data.xpNeeded*100}%`}}/></div></div>
    </section>
    <Crosshair settings={gamePreferences}/>
    <aside className="weapon-status"><img src={assetUrl(data.weapon==='sword'?'weapons/knight-sword/vfx/textures/Sword_Icon.png':'game-ui/Firestaff.png')} alt=""/><span>{data.weapon==='sword'?'SWORD · KNIGHT ASSETS':'FIRESTAFF'}</span><strong>{data.damage} DMG · {data.attackInterval.toFixed(2)}s · ×{data.projectiles}</strong><small>{data.weapon==='sword'?'Swings automatically in your facing direction':'Targets nearby enemies automatically'}</small><TomeLoadout run={data}/></aside>
    <PerformanceHud settings={gamePreferences} speed={data.speed} fps={data.fps} state={data.state}/>
    {data.pendingUpgrades>0&&!data.dead&&!settingsOpen&&!labOpen&&!historyOpen&&<UpgradeMenu run={data} choose={id=>engine.current?.chooseUpgrade(id)} hover={()=>engine.current?.audio.play('hover')}/>}
    {data.dead&&!settingsOpen&&!labOpen&&!historyOpen&&<EndPanel run={data} again={()=>{engine.current?.reset();setCharacterOpen(true);}} history={()=>setHistoryOpen(true)}/>}
    {!data.locked&&!data.dead&&data.pendingUpgrades===0&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed>0&&<PausePanel run={data} resume={()=>engine.current?.lock()} settings={()=>setSettingsOpen(true)} lab={()=>{engine.current?.pauseForLab();setLabOpen(true);}} newRun={()=>{engine.current?.reset();setCharacterOpen(true);}} history={()=>setHistoryOpen(true)}/>}
    {!data.locked&&!data.dead&&data.pendingUpgrades===0&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed===0&&!characterOpen&&<section className="start"><span className="eyebrow">FOX / COMBAT PLAYTEST</span><h2>Ready?</h2><p>Move, survive and collect blue XP.<br/>Attacks fire automatically.</p><button onClick={()=>setCharacterOpen(true)}>PLAY <span>↗</span></button>{error?<><p role="alert">Could not load game: {error}</p><button className="load-retry" onClick={()=>setAttempt(value=>value+1)}>RETRY LOADING</button></>:<small>Drag to look · Esc pause</small>}<div className="reset"><button onClick={()=>setHistoryOpen(true)}>RUN HISTORY</button></div></section>}
    {characterOpen&&!data.locked&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed===0&&<CharacterSelect weapon={data.weapon} ready={ready} error={error} onBack={()=>setCharacterOpen(false)} onRetry={()=>setAttempt(value=>value+1)} onHover={()=>engine.current?.audio.play('hover')} onWeapon={weapon=>engine.current?.setWeapon(weapon)} onStart={id=>{if(!canPlayCharacter(id)||!ready||error)return;engine.current?.lock();setCharacterOpen(false);}}/>}
    {historyOpen&&<HistoryPanel close={()=>setHistoryOpen(false)}/>}
    {labOpen&&<section className="lab-overlay" role="dialog" aria-modal="true" aria-label="Weapon Lab"><div className="lab-toolbar"><strong>WARCORE LAB</strong><button onClick={()=>{engine.current?.resumeFromLab();setLabOpen(false);}}>BACK TO GAME</button></div><iframe title="Weapon Lab" src={assetUrl(`lab.html?embedded=1&build=${import.meta.env.VITE_BUILD_ID}`)}/></section>}
    {settingsOpen&&<AudioSettings onClose={()=>{engine.current?.audio.play('click');setSettingsOpen(false);}} onTestSound={()=>{void engine.current?.audio.prepare().then(()=>engine.current?.audio.play('click'));}} onInteract={()=>engine.current?.audio.unlock()} resolution={{width:data.renderWidth,height:data.renderHeight}}/>}
    <small className="build-version" title={buildTime}>BUILD {buildVersion}</small>
    <footer><div className="controls"><span><kbd>{['forward','left','backward','right'].map(key=>bindingLabel(controls.bindings[key as keyof typeof controls.bindings])).join(' ')}</kbd> MOVE</span><span><kbd>{bindingLabel(controls.bindings.jump)}</kbd> JUMP</span><span><kbd>MOUSE</kbd> LOOK</span><span><kbd>ESC</kbd> PAUSE</span></div><div className="notice">TEST ARENA · ORIGINAL MAP DEFERRED</div></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
