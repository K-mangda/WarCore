import {BakedEnemyView} from '../enemies/BakedEnemyView';
import {PickupNumbers} from './PickupNumbers';
import {ProgressionView} from './ProgressionView';
import {StaffView} from './StaffView';
import {DamageNumbers} from './DamageNumbers';
import {SwordView} from './SwordView';
import * as T from 'three';
import type {Run} from './Run';
import {XpView} from './XpView';
export class CombatView {
  private enemies:BakedEnemyView[];
  private staff:StaffView;private previousElapsed=0;
  private gems:XpView;private progression:ProgressionView;private pickupNumbers:PickupNumbers;
  private labels:T.Sprite[]=[];private numbers=new DamageNumbers();
  private sword:SwordView;
  constructor(private scene:T.Scene,camera:T.PerspectiveCamera,viewport:()=>{width:number;height:number}){this.enemies=[new BakedEnemyView(scene,camera,'skeleton'),new BakedEnemyView(scene,camera,'bandit')];this.sword=new SwordView(scene);this.staff=new StaffView(scene);this.gems=new XpView(scene);this.progression=new ProgressionView(scene);this.pickupNumbers=new PickupNumbers(scene,camera,viewport);}
  async load(){
    await Promise.all([...this.enemies.map(view=>view.load()),this.sword.load(),this.staff.load(),this.numbers.load(),this.gems.load(),this.progression.load(),this.pickupNumbers.load()]);
  }
  update(run:Run,player:T.Vector3,dt=0){
    this.progression.update(run,player,dt);this.pickupNumbers.update(run,dt,player);
    this.sword.update(run);
    const elapsed=run.snapshot().elapsed;this.staff.update(run,Math.max(0,elapsed-this.previousElapsed));this.previousElapsed=elapsed;
    for(const view of this.enemies)view.update(run,player);
    this.gems.update(run);
    while(this.labels.length<run.hits.length){const label=new T.Sprite(this.numbers.material(0));label.scale.set(1.2,.6,1);this.labels.push(label);this.scene.add(label);}
    this.labels.forEach((label,i)=>{const hit=run.hits[i];label.visible=!!hit;if(hit){label.material=this.numbers.material(hit.damage);label.scale.set((label.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);label.position.copy(hit.position);}});
  }
  dispose(){this.pickupNumbers.dispose();this.progression.dispose();this.staff.dispose();this.sword.dispose();this.gems.dispose();for(const view of this.enemies)view.dispose();for(const label of this.labels){this.scene.remove(label);}this.numbers.dispose();}
}
