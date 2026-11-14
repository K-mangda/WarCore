import {nativeTomes} from '../data/NativeData';
export type Upgrade='damage'|'haste'|'projectiles';
export type UpgradeLevels=Record<Upgrade,number>;
export interface UpgradeBonuses {damageBonus?:number;attackSpeedBonus?:number;projectileBonus?:number;}
export interface UpgradeStats extends UpgradeBonuses {damage:number;attackInterval:number;projectiles:number;upgradeLevels?:UpgradeLevels;}
const tomeValue=(name:string)=>{const tome=nativeTomes.find(t=>t.tome===name);if(!tome)throw new Error(`Missing native tome ${name}`);return tome;};
/**
 * Native TomeData modifiers (docs/rea/tomes.json): Damage = DamageMultiplier Multiplication 0.08, Cooldown = AttackSpeed Addition 0.075,
 * Quantity = Projectiles Flat 1. Verified from TomeInventory.AddUpgrade (RVA 0x42F950) and PlayerStatsNew.UpdateStat (RVA 0x446290):
 * each Tome keeps ONE accumulated modifier (a Multiplication Tome starts at 1.0, others at 0) and every level adds its value to it;
 * the stat is (base + flat) x (1 + additions) x product of Multiplication accumulators. So Damage = 1 + 0.08 n (linear, not compounding),
 * attack speed = 1 + 0.075 n, extra projectiles = n. A level's value is Round(value x Rarity.GetMultiplier(rarity), 2)
 * (TomeData.GetUpgradeOffer / FUN_18044DDD0). Rounding mode (banker's vs away from zero) is not confirmed; half-even is used.
 */
const damageGain=tomeValue('Damage').value,attackSpeedGain=tomeValue('Cooldown').value,projectileGain=tomeValue('Quantity').value;
const round4=(value:number)=>Math.round(value*1e4)/1e4;
/** Round to 2 decimals, ties to even (Math.Round default). */
export function roundHalfEven2(value:number){const scaled=value*100,floor=Math.floor(scaled+1e-9),diff=scaled-floor;if(Math.abs(diff-.5)<1e-6)return (floor%2===0?floor:floor+1)/100;return Math.round(scaled)/100;}
export const tomeLevelValue=(id:Upgrade,multiplier=1)=>roundHalfEven2((id==='damage'?damageGain:id==='haste'?attackSpeedGain:projectileGain)*multiplier);
export const upgrades=[
 {id:'damage',tome:'tomedamage',sourcePathId:8559,icon:'DamageTome',name:'Damage Tome',description:`+${Math.round(damageGain*100)}% damage`},
 {id:'haste',tome:'tomecooldown',sourcePathId:8557,icon:'CooldownTome',name:'Cooldown Tome',description:`+${round4(attackSpeedGain*100)}% attack speed`},
 {id:'projectiles',tome:'tomequantity',sourcePathId:8570,icon:'QuantityTome',name:'Quantity Tome',description:`+${projectileGain} projectile quantity`},
] as const;
/** Card text for one level at the rolled rarity. */
export function upgradeDescription(id:Upgrade,multiplier=1){const v=tomeLevelValue(id,multiplier);return id==='damage'?`+${round4(v*100)}% damage`:id==='haste'?`+${round4(v*100)}% attack speed`:`+${v} projectile quantity`;}
export const emptyUpgradeLevels=():UpgradeLevels=>({damage:0,haste:0,projectiles:0});
export function nextUpgrade(id:Upgrade,stats:UpgradeStats,multiplier=1):(UpgradeStats&Required<UpgradeBonuses>)|undefined {
 const gain=tomeLevelValue(id,multiplier);
 const damageBonus=stats.damageBonus??0,attackSpeedBonus=stats.attackSpeedBonus??0,projectileBonus=stats.projectileBonus??0;
 const next={damage:stats.damage,attackInterval:stats.attackInterval,projectiles:stats.projectiles,damageBonus,attackSpeedBonus,projectileBonus};
 switch(id){
  case 'damage':{const base=stats.damage/(1+damageBonus);next.damageBonus=round4(damageBonus+gain);next.damage=round4(base*(1+next.damageBonus));break;}
  case 'haste':{const base=stats.attackInterval*(1+attackSpeedBonus);next.attackSpeedBonus=round4(attackSpeedBonus+gain);next.attackInterval=Math.max(.15,round4(base/(1+next.attackSpeedBonus)));break;}
  case 'projectiles':next.projectileBonus=round4(projectileBonus+gain);next.projectiles=Math.min(8,Math.floor(1+next.projectileBonus+1e-9));break;
  default:return;
 }
 if(!Object.values(next).every(Number.isFinite)||next.damage===stats.damage&&next.attackInterval===stats.attackInterval&&next.projectiles===stats.projectiles)return;
 return next;
}
export function availableUpgrades(stats:UpgradeStats):Upgrade[]{return upgrades.filter(upgrade=>nextUpgrade(upgrade.id,stats)).map(upgrade=>upgrade.id);}
export function upgradeValues(id:Upgrade,stats:UpgradeStats,multiplier=1){
 const next=nextUpgrade(id,stats,multiplier);if(!next)return 'MAX';
 if(id==='damage')return `${stats.damage} → ${next.damage} DMG`;
 if(id==='haste')return `${stats.attackInterval.toFixed(3)}s → ${next.attackInterval.toFixed(3)}s`;
 return `${stats.projectiles} → ${next.projectiles} attacks / cycle`;
}
