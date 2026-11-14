import {BakedEnemyView} from '../enemies/BakedEnemyView';
import {PickupNumbers} from './PickupNumbers';
import {ProgressionView} from './ProgressionView';
import {StaffView} from './StaffView';
import {DamageNumbers} from './DamageNumbers';
import {SwordView} from './SwordView';
import * as T from 'three';
import type {Run} from './Run';
import {XpView} from './XpView';
import {getGamePreferences,hpColors} from '../core/GamePreferences';
import {getEffectsPreferences} from '../core/EffectsPreferences';
export class CombatView {
  private enemies:BakedEnemyView[];
  private staff:StaffView;private previousElapsed=0;
  private gems:XpView;private progression:ProgressionView;private pickupNumbers:PickupNumbers;
  private labels:T.Sprite[]=[];private numbers=new DamageNumbers();
  private sword:SwordView;private camera:T.PerspectiveCamera;
  private healthBack=new T.Sprite(new T.SpriteMaterial({color:0x080808,depthTest:false,depthWrite:false}));
  private healthFill=new T.Sprite(new T.SpriteMaterial({color:0xff0000,depthTest:false,depthWrite:false}));
  private playerHits:{sprite:T.Sprite;age:number}[]=[];
  constructor(private scene:T.Scene,camera:T.PerspectiveCamera,viewport:()=>{width:number;height:number}){this.camera=camera;this.healthBack.renderOrder=10;this.healthFill.renderOrder=11;scene.add(this.healthBack,this.healthFill);this.enemies=[new BakedEnemyView(scene,camera,'skeleton'),new BakedEnemyView(scene,camera,'bandit')];this.sword=new SwordView(scene);this.staff=new StaffView(scene);this.gems=new XpView(scene);this.progression=new ProgressionView(scene);this.pickupNumbers=new PickupNumbers(scene,camera,viewport);}
  async load(){
    await Promise.all([...this.enemies.map(view=>view.load()),this.sword.load(),this.staff.load(),this.numbers.load(),this.gems.load(),this.progression.load(),this.pickupNumbers.load()]);
  }
  clearPlayerHits(){for(const hit of this.playerHits)this.scene.remove(hit.sprite);this.playerHits=[];}
  playerHit(amount:number,player:T.Vector3){
    if(!getEffectsPreferences().damageNumbers)return;
    const material=this.numbers.material(`-${amount}`,'#ff0000');const sprite=new T.Sprite(material);sprite.position.copy(player).y+=2.2;sprite.scale.set((material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);this.scene.add(sprite);this.playerHits.push({sprite,age:0});
  }
  /** `realDt` keeps the level-up burst/sign animating while the game is paused for the selection screen (otherwise they freeze behind the menu). */
  update(run:Run,player:T.Vector3,dt=0,realDt=dt){
    const state=run.snapshot(),ratio=T.MathUtils.clamp(state.health/state.maxHealth,0,1),right=new T.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);
    this.healthBack.visible=this.healthFill.visible=state.elapsed>0&&!state.dead;
    this.healthBack.position.copy(player).add(new T.Vector3(0,.05,0));this.healthBack.scale.set(1,.1,1);
    this.healthFill.position.copy(this.healthBack.position).addScaledVector(right,-(1-ratio)*.5);this.healthFill.scale.set(ratio,.075,1);this.healthFill.material.color.set(hpColors[getGamePreferences().hpColor]);
    for(let i=this.playerHits.length-1;i>=0;i--){const hit=this.playerHits[i];hit.age+=dt;hit.sprite.position.y+=dt;hit.sprite.visible=getEffectsPreferences().damageNumbers;if(hit.age>=.6){this.scene.remove(hit.sprite);this.playerHits.splice(i,1);}}

    this.progression.update(run,player,realDt);this.pickupNumbers.update(run,dt,player);
    this.sword.update(run);
    const elapsed=run.snapshot().elapsed;this.staff.update(run,Math.max(0,elapsed-this.previousElapsed));this.previousElapsed=elapsed;
    for(const view of this.enemies)view.update(run,player);
    this.gems.update(run);
    const showNumbers=getEffectsPreferences().damageNumbers;
    while(showNumbers&&this.labels.length<run.hits.length){const label=new T.Sprite(this.numbers.material(0));label.scale.set(1.2,.6,1);this.labels.push(label);this.scene.add(label);}
    this.labels.forEach((label,i)=>{const hit=run.hits[i];label.visible=!!hit&&showNumbers;if(hit&&showNumbers){label.material=this.numbers.material(hit.damage);label.scale.set((label.material.map!.image as HTMLCanvasElement).width/128*1.2,.75,1);label.position.copy(hit.position);}});
  }
  dispose(){for(const hit of this.playerHits)this.scene.remove(hit.sprite);this.scene.remove(this.healthBack,this.healthFill);this.healthBack.material.dispose();this.healthFill.material.dispose();this.pickupNumbers.dispose();this.progression.dispose();this.staff.dispose();this.sword.dispose();this.gems.dispose();for(const view of this.enemies)view.dispose();for(const label of this.labels){this.scene.remove(label);}this.numbers.dispose();}
}
