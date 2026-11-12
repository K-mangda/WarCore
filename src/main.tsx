import { useEffect,useRef,useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Engine,type Telemetry } from './core/Engine';
import './ui/style.css';
function App(){
  const host=useRef<HTMLDivElement>(null);const engine=useRef<Engine|null>(null);const [error,setError]=useState('');const [data,setData]=useState<Telemetry>({speed:0,fps:0,state:'Idle',jumps:0,locked:false});
  useEffect(()=>{if(!host.current)return;try{engine.current=new Engine(host.current,setData);}catch(e){setError(String(e));}return()=>engine.current?.dispose();},[]);
  return <main><div ref={host} className="world"/><div className="vignette"/><header><a className="brand" href="#">M<span>◆</span>B<span className="brand-sub">MOVEMENT LAB</span></a><div className="phase"><i/> PHASE 01 <span>/</span> FOREST SANDBOX</div><span className="build">EXPERIMENTAL BUILD · 0.1</span></header>
    <aside className="location"><span className="eyebrow">TEST ENVIRONMENT / 001</span><h1>The proving<br/>grounds<span>.</span></h1><p>Find your momentum.</p><div className="tags"><span>40° SLOPE</span><span>OPEN TERRAIN</span></div></aside>
    <div className="crosshair">+</div>{data.locked&&<div className="look-hint">WASD MOVE · SPACE JUMP · C SLIDE · DRAG TO LOOK · ESC PAUSE</div>}<div className="speedlines" style={{opacity:data.locked?Math.min(1,Math.max(0,(data.speed-12)/18)):0}}>{Array.from({length:18},(_,i)=><i key={i} style={{transform:`rotate(${i*20}deg)`}}/>)}</div>
    <aside className="telemetry"><div className="eyebrow">LIVE TELEMETRY <i/></div><div className="velocity">{data.speed.toFixed(1)}<small>m/s</small></div><div className="meter"><b style={{width:`${Math.min(data.speed/50,1)*100}%`}}/></div><dl><dt>MOVEMENT</dt><dd>{data.state.toUpperCase()}</dd><dt>RENDER</dt><dd>{data.fps} FPS</dd><dt>JUMPS</dt><dd>{String(data.jumps).padStart(3,'0')}</dd></dl></aside>
    {!data.locked&&<section className="start"><span className="eyebrow">KINEMATIC MOTOR / PLAYTEST</span><h2>Keep it moving.</h2><p>Run the flat. Drop the slope. Carry your speed.</p><button disabled={!!error} onClick={()=>engine.current?.lock()}>ENTER SANDBOX <span>↗</span></button><small>{error||'Click to play · Drag to look if mouse capture is unavailable'}</small><div className="reset"><button onClick={()=>engine.current?.reset()}>RESET FLAT</button><button onClick={()=>engine.current?.reset(true)}>START AT SUMMIT</button></div></section>}
    <footer><div className="controls"><span><kbd>W A S D</kbd> MOVE</span><span><kbd>SPACE</kbd> JUMP / BHOP</span><span><kbd>C / CTRL</kbd> SLIDE</span><span><kbd>MOUSE</kbd> LOOK</span><span><kbd>ESC</kbd> PAUSE</span></div><div className="notice">PROTOTYPE GEOMETRY · PARITY UNDER REVIEW</div></footer></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
