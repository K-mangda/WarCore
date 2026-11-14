import {nativeTomes} from '../data/NativeData';
export type Upgrade='damage'|'haste'|'projectiles';
export type UpgradeLevels=Record<Upgrade,number>;
export interface UpgradeStats {damage:number;attackInterval:number;projectiles:number;upgradeLevels?:UpgradeLevels;}
const tomeValue=(name:string)=>{const tome=nativeTomes.find(t=>t.tome===name);if(!tome)throw new Error(`Missing native tome ${name}`);return tome;};
/**
 * Native TomeData modifiers (docs/rea/tomes.json): Damage = DamageMultiplier Multiplication 0.08, Cooldown = AttackSpeed Addition 0.075,
 * Quantity = Projectiles Flat 1. How PlayerStatsNew.GetStat combines several levels (and the rarity multiplier from
 * Rarity.GetMultiplier) is not decoded yet: Multiplication compounds per level, Addition sums into an attack-speed multiplier (I).
 * Tome rarity rolls are not wired into the offer screen yet.
 */
const damageGain=tomeValue('Damage').value,attackSpeedGain=tomeValue('Cooldown').value,projectileGain=tomeValue('Quantity').value;
const round=(value:number)=>Math.round(value*1e4)/1e4;
export const upgrades=[
 {id:'damage',tome:'tomedamage',sourcePathId:8559,icon:'DamageTome',name:'Damage Tome',description:`+${Math.round(damageGain*100)}% damage`},
 {id:'haste',tome:'tomecooldown',sourcePathId:8557,icon:'CooldownTome',name:'Cooldown Tome',description:`+${round(attackSpeedGain*100)}% attack speed`},
 {id:'projectiles',tome:'tomequantity',sourcePathId:8570,icon:'QuantityTome',name:'Quantity Tome',description:`+${projectileGain} projectile quantity`},
] as const;
export const emptyUpgradeLevels=():UpgradeLevels=>({damage:0,haste:0,projectiles:0});
export function nextUpgrade(id:Upgrade,stats:UpgradeStats):UpgradeStats|undefined {
 const next={damage:stats.damage,attackInterval:stats.attackInterval,projectiles:stats.projectiles};
 switch(id){
  case 'damage':next.damage=round(next.damage*(1+damageGain));break;
  case 'haste':{const n=stats.upgradeLevels?.haste??0;next.attackInterval=Math.max(.15,round(next.attackInterval*(1+attackSpeedGain*n)/(1+attackSpeedGain*(n+1))));break;}
  case 'projectiles':next.projectiles=Math.min(8,next.projectiles+projectileGain);break;
  default:return;
 }
 if(!Object.values(next).every(Number.isFinite)||next.damage===stats.damage&&next.attackInterval===stats.attackInterval&&next.projectiles===stats.projectiles)return;
 return next;
}
export function availableUpgrades(stats:UpgradeStats):Upgrade[]{return upgrades.filter(upgrade=>nextUpgrade(upgrade.id,stats)).map(upgrade=>upgrade.id);}
export function upgradeValues(id:Upgrade,stats:UpgradeStats){
 const next=nextUpgrade(id,stats);if(!next)return 'MAX';
 if(id==='damage')return `${stats.damage} → ${next.damage} DMG`;
 if(id==='haste')return `${stats.attackInterval.toFixed(3)}s → ${next.attackInterval.toFixed(3)}s`;
 return `${stats.projectiles} → ${next.projectiles} attacks / cycle`;
}
