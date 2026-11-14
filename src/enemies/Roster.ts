import type {NativeEnemy} from '../data/NativeData';
import type {EnemyKind} from './Swarm';
/**
 * Runtime enemy description built from a serialized EnemyData row (docs/rea/enemies.json).
 * Only Skeleton and Bandit have baked web models, so every other species renders with a stand-in model
 * (`placeholderVisual`): regular enemies as Skeleton, miniboss-class (creditCost >= 40) as Bandit. Stats are the real ones.
 */
export interface EnemySpec {name:string;enemy:string;maxHealth:number;damage:number;speedScale:number;xp:number;visual:EnemyKind;placeholderVisual:boolean;creditCost:number;}
/** Per-minute growth from CombatScaling (RVA 0x4700F0): hpPerMinute 0.1, damagePerMinute ~0.028. Swarm/stage terms are not applied (I). */
export const hpPerMinute=.1,damagePerMinute=.028;
/** Web enemy speed is tuned for Skeleton (native 5.5); other species scale relative to it. */
export const referenceSpeed=5.5;
export function enemySpec(native:NativeEnemy,minutes:number):EnemySpec{
  const visual:EnemyKind=native.enemy==='Skeleton'?'skeleton':native.creditCost>=40?'bandit':'skeleton';
  return {
    name:native.name,enemy:native.enemy,
    maxHealth:Math.max(1,Math.round(native.hp*(1+hpPerMinute*minutes))),
    damage:Math.round(native.damage*(1+damagePerMinute*minutes)),
    speedScale:native.speed/referenceSpeed,xp:native.xp,visual,
    placeholderVisual:native.enemy!=='Skeleton'&&native.enemy!=='Bandit',creditCost:native.creditCost,
  };
}
