/** Gate drawing only. Simulation/input must continue on every animation callback. */
export class RenderCadence {
 private next=0;private limit=-1;private last=-Infinity;
 ready(time:number,limit:number){
  if(limit!==this.limit||time<this.last){this.limit=limit;this.next=time;}this.last=time;
  if(limit===0)return true;
  if(time+1e-6<this.next)return false;
  const interval=1000/limit;this.next+=Math.max(1,Math.floor((time-this.next+1e-6)/interval)+1)*interval;return true;
 }
 reset(){this.limit=-1;this.last=-Infinity;}
}
