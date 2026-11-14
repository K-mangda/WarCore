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
import {TopHud} from './ui/TopHud';
import {TitleScreen} from './ui/TitleScreen';
import {MapSelect} from './ui/MapSelect';
import {addSilver} from './core/Profile';
import './ui/title.css';
import './ui/style.css';
import './ui/combat.css';
import './ui/buttons.css';
import {installMenuKeys} from './ui/menuKeys';
function App(){
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
  const [error,setError]=useState(''),[ready,setReady]=useState(false),[labOpen,setLabOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false),[attempt,setAttempt]=useState(0),[characterOpen,setCharacterOpen]=useState(false),[mapOpen,setMapOpen]=useState(false);
  const controls=useSyncExternalStore(subscribeControlPreferences,getControlPreferences,getControlPreferences);
  const audioPreferences=useSyncExternalStore(subscribeAudioPreferences,getAudioPreferences,getAudioPreferences);
  const gamePreferences=useSyncExternalStore(subscribeGamePreferences,getGamePreferences,getGamePreferences);
  const [data,setData]=useState<Telemetry>({...initialRun,speed:0,fps:0,state:'Idle',jumps:0,locked:false,renderWidth:0,renderHeight:0});
  useEffect(()=>{
    if(!host.current)return;let mounted=true;setError('');setReady(false);let instance:Engine|null=null;
    try{instance=new Engine(host.current,setData);engine.current=instance;void instance.ready.then(()=>{if(mounted)setReady(true);}).catch(e=>{if(mounted)setError(String(e));});}catch(e){setError(String(e));}
    return()=>{mounted=false;instance?.dispose();if(engine.current===instance)engine.current=null;};
  },[attempt]);
  // Silver collected in a run is banked into the profile when the run ends in death (ProgressionSaveFile, web: localStorage).
  const banked=useRef(false);
  useEffect(()=>{if(data.dead&&!banked.current){banked.current=true;addSilver(data.silver);}if(!data.dead&&data.elapsed===0)banked.current=false;},[data.dead,data.elapsed,data.silver]);
  return <main>
    <div ref={host} className="world"/><div className="vignette"/>{data.elapsed>0&&!data.dead&&data.danger>.001&&<div className="low-health-vignette" style={{opacity:Math.min(1,data.danger),maskImage:`url(${assetUrl('ui/hud/low-hp-vignette.png')})`,WebkitMaskImage:`url(${assetUrl('ui/hud/low-hp-vignette.png')})`}} aria-hidden="true"/>}
    <header><img className="game-logo" src={assetUrl('branding/warcore-logo-transparent.png')} alt="WARCORE"/><span className="build">WEB PLAYTEST · PROVISIONAL BALANCE</span></header>
    <button className="audio-toggle" aria-pressed={audioPreferences.muted} onClick={()=>{engine.current?.audio.unlock();engine.current?.audio.toggle();}}>{audioPreferences.muted?'SOUND OFF':'SOUND ON'}</button>
    <button className="settings-toggle" onClick={()=>{engine.current?.audio.unlock();engine.current?.audio.play('click');engine.current?.pauseForSettings();setSettingsOpen(true);}}>SETTINGS</button>
    <button className="lab-toggle" onClick={()=>{engine.current?.pauseForLab();setLabOpen(true);}}>LAB</button>
    <section className="run-hud" aria-label="Run status">
      <TopHud run={data}/>
      <div className="health"><span>HP {data.health} / {data.maxHealth}</span><div role="progressbar" aria-label="Health" aria-valuenow={data.health} aria-valuemax={data.maxHealth} aria-valuemin={0}><b style={{width:`${data.health/data.maxHealth*100}%`,backgroundColor:hpColors[gamePreferences.hpColor]}}/></div></div>
      <div className="experience"><span className="sr-only">Level {data.level}, {data.xp} of {data.xpNeeded} XP</span><div role="progressbar" aria-label="Experience" aria-valuenow={data.xp} aria-valuemax={data.xpNeeded} aria-valuemin={0}><b style={{width:`${Math.min(1,data.xp/data.xpNeeded)*100}%`,backgroundSize:`${100/Math.max(.001,Math.min(1,data.xp/data.xpNeeded))}% 100%`}}/></div></div>
    </section>
    <Crosshair settings={gamePreferences}/>
    <aside className="weapon-status"><img src={assetUrl(data.weapon==='sword'?'weapons/knight-sword/vfx/textures/Sword_Icon.png':'game-ui/Firestaff.png')} alt=""/><span>{data.weapon==='sword'?'SWORD · KNIGHT ASSETS':'FIRESTAFF'}</span><strong>{data.damage} DMG · {data.attackInterval.toFixed(2)}s · ×{data.projectiles}</strong><small>{data.weapon==='sword'?'Swings automatically in your facing direction':'Targets nearby enemies automatically'}</small><TomeLoadout run={data}/></aside>
    <PerformanceHud settings={gamePreferences} speed={data.speed} fps={data.fps} state={data.state}/>
    {data.pendingUpgrades>0&&!data.dead&&!settingsOpen&&!labOpen&&!historyOpen&&<UpgradeMenu run={data} choose={id=>engine.current?.chooseUpgrade(id)} hover={()=>engine.current?.audio.play('hover')}/>}
    {data.dead&&!settingsOpen&&!labOpen&&!historyOpen&&<EndPanel run={data} again={()=>{engine.current?.reset();setCharacterOpen(true);}} history={()=>setHistoryOpen(true)}/>}
    {!data.locked&&!data.dead&&data.pendingUpgrades===0&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed>0&&<PausePanel run={data} resume={()=>engine.current?.lock()} settings={()=>setSettingsOpen(true)} lab={()=>{engine.current?.pauseForLab();setLabOpen(true);}} newRun={()=>{engine.current?.reset();setCharacterOpen(true);}} history={()=>setHistoryOpen(true)}/>}
    {!data.locked&&!data.dead&&data.pendingUpgrades===0&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed===0&&!characterOpen&&!mapOpen&&<TitleScreen play={()=>setCharacterOpen(true)} settings={()=>setSettingsOpen(true)} history={()=>setHistoryOpen(true)}/>}
    {characterOpen&&!data.locked&&!settingsOpen&&!labOpen&&!historyOpen&&data.elapsed===0&&<CharacterSelect weapon={data.weapon} ready={ready} error={error} onBack={()=>setCharacterOpen(false)} onRetry={()=>setAttempt(value=>value+1)} onHover={()=>engine.current?.audio.play('hover')} onWeapon={weapon=>engine.current?.setWeapon(weapon)} onStart={id=>{if(!canPlayCharacter(id)||!ready||error)return;setCharacterOpen(false);setMapOpen(true);}}/>}
    {mapOpen&&!data.locked&&!settingsOpen&&!labOpen&&data.elapsed===0&&<MapSelect onBack={()=>{setMapOpen(false);setCharacterOpen(true);}} onLab={()=>{setMapOpen(false);engine.current?.pauseForLab();setLabOpen(true);}} onStart={()=>{setMapOpen(false);engine.current?.lock();}}/>}
    {historyOpen&&<HistoryPanel close={()=>setHistoryOpen(false)}/>}
    {labOpen&&<section className="lab-overlay" role="dialog" aria-modal="true" aria-label="Weapon Lab"><div className="lab-toolbar"><strong>WARCORE LAB</strong><button onClick={()=>{engine.current?.resumeFromLab();setLabOpen(false);}}>BACK TO GAME</button></div><iframe title="Weapon Lab" src={assetUrl(`lab.html?embedded=1&build=${import.meta.env.VITE_BUILD_ID}`)}/></section>}
    {settingsOpen&&<AudioSettings onClose={()=>{engine.current?.audio.play('click');setSettingsOpen(false);}} onTestSound={()=>{void engine.current?.audio.prepare().then(()=>engine.current?.audio.play('click'));}} onInteract={()=>engine.current?.audio.unlock()} resolution={{width:data.renderWidth,height:data.renderHeight}}/>}
    <small className="build-version" title={buildTime}>BUILD {buildVersion}</small>
    <footer><div className="controls"><span><kbd>{['forward','left','backward','right'].map(key=>bindingLabel(controls.bindings[key as keyof typeof controls.bindings])).join(' ')}</kbd> MOVE</span><span><kbd>{bindingLabel(controls.bindings.jump)}</kbd> JUMP</span><span><kbd>MOUSE</kbd> LOOK</span><span><kbd>ESC</kbd> PAUSE</span></div><div className="notice">TEST ARENA · ORIGINAL MAP DEFERRED</div></footer>
  </main>;
}
installMenuKeys();
createRoot(document.getElementById('root')!).render(<App/>);
