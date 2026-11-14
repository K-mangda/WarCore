// Native XP table (XpUtility.Init, GameAssembly RVA 0x3D3920; constants from XpUtility..cctor):
// baseXp=5, increaseRate=1.065, exponent=1.065. Term(L)=L^exponent*increaseRate*baseXp (+baseXp for L>1; 7 for L=1),
// accumulated per level. Rounding of the stored entries is unresolved (docs/REA_GAME_DATA_FINDINGS.md section 8): Math.round used.
const baseXp=5,increaseRate=1.065,exponent=1.065;
const cumulative:number[]=[0];
let sum=0;
for(let level=1;level<=9999;level++){
  const term=level===1?7:Math.pow(level,exponent)*increaseRate*baseXp+baseXp;
  sum+=term;cumulative.push(Math.round(sum));
}
/** XP needed to go from web level `level` (1-based) to the next one. Native level n requires cumulative[n]. */
export function xpForLevel(level:number):number{
  const n=Math.max(1,Math.min(9999,Math.floor(level)));
  return Math.max(1,cumulative[n]-cumulative[n-1]);
}
