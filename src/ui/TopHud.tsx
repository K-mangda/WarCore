import {assetUrl} from '../core/assetUrl';
import {defaultStageDuration} from '../combat/Director';
import type {RunSnapshot} from '../combat/Run';
/**
 * Top status bar modelled on the real HUD (screenshot comparison + KillsAndGoldCounter / GameTimer / XpBarUI fields):
 * EXP bar (cyan on black), run clock, Silver, Gold, kills, stage countdown in the centre, chest price and level on the right.
 * Stage countdown and chest price are web placeholders: stage length 600 s is inferred, chest price 30 is the value seen in the real HUD at run start.
 */
export const chestBasePrice=30;
const clock=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
const Clock=()=><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#f2f2f2" stroke="#222" strokeWidth="1.5"/><path d="M8 3.5V8l3 2" stroke="#222" strokeWidth="1.6" fill="none" strokeLinecap="square"/></svg>;
const Chest=()=><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="5" width="13" height="9" fill="#c9852b" stroke="#3a2410" strokeWidth="1.5"/><rect x="1.5" y="3" width="13" height="4" fill="#e3a03b" stroke="#3a2410" strokeWidth="1.5"/><rect x="6.5" y="6.5" width="3" height="3.5" fill="#ffe35a" stroke="#3a2410"/></svg>;
export function TopHud({run}:{run:RunSnapshot}){
  const remaining=Math.max(0,defaultStageDuration-run.elapsed);
  return <section className="top-hud" aria-label="Run status">
    <div className="top-hud-left">
      <span title="Run time"><Clock/>{clock(run.elapsed)}</span>
      <span title="Silver"><img src={assetUrl('ui/hud/silver.png')} alt="" className="top-hud-coin"/>{run.silver}</span>
      <span title="Gold"><img src={assetUrl('ui/hud/gold.png')} alt="" className="top-hud-coin"/>{run.gold}</span>
      <span title="Kills"><img src={assetUrl('ui/hud/skull.png')} alt="" className="top-hud-skull"/>{run.kills}</span>
    </div>
    <div className={remaining<=30?'top-hud-stage low':'top-hud-stage'} title="Stage time remaining">{clock(remaining)}</div>
    <div className="top-hud-right">
      <span title="Chest price"><Chest/><img src={assetUrl('ui/hud/gold.png')} alt="" className="top-hud-coin"/>{chestBasePrice}</span>
      <strong title="Level">LVL {run.level}</strong>
    </div>
  </section>;
}
