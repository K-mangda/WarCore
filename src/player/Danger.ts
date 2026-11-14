// Native low-HP danger value (PlayerEffects.Update, GameAssembly RVA 0x3384B0; LowHpUi.Update RVA 0x53BF90).
// Constants: threshold 0.25, increase 4, decay 0.02 after 15 s of sustained low HP, lerp 1.5/s. The vignette alpha is
// danger * maxOpacity (1.0). The target only rises when HP is lost while below the threshold.
export const dangerThreshold=.25,dangerIncreaseSpeed=4,dangerDecaySpeed=.02,sustainedLowSeconds=15,dangerLerpSpeed=1.5;
export interface DangerState {value:number;target:number;lastHp:number;timeLow:number;}
export const initialDanger=():DangerState=>({value:0,target:0,lastHp:0,timeLow:0});
const clamp01=(x:number)=>Math.min(1,Math.max(0,x));
export function stepDanger(s:DangerState,hp:number,maxHp:number,dt:number):DangerState{
  let {target,timeLow}=s;
  if(maxHp>0&&hp/maxHp<dangerThreshold){
    timeLow+=dt;
    if(s.lastHp>0&&s.lastHp-hp>0)target+=(s.lastHp-hp)/maxHp*dangerIncreaseSpeed;
    if(timeLow>sustainedLowSeconds)target-=dt*dangerDecaySpeed;
    target=clamp01(target);
  }else{timeLow=0;target=0;}
  const value=s.value+(target-s.value)*clamp01(dt*dangerLerpSpeed);
  return {value,target,lastHp:hp,timeLow};
}
