/** Recovered from GameAssembly.dll GetBurstInterval RVA0x434840. */
export function burstInterval(burstTime:number,minInterval:number,quantity:number,attackSpeed:number,fixedStep:number){
  if(burstTime<=0)return 0;
  return Math.max(burstTime/quantity/attackSpeed,minInterval/attackSpeed,fixedStep);
}
