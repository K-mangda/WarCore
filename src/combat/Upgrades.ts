export type Upgrade='damage'|'haste'|'projectiles';
export interface UpgradeStats {damage:number;attackInterval:number;projectiles:number;}
export type UpgradeLevels=Record<Upgrade,number>;
/** Existing sandbox effects. Native Tome modifier values/roll rules are not supplied. */
export const upgrades=[
 {id:'damage',tome:'tomedamage',sourcePathId:8559,icon:'DamageTome',name:'Damage Tome',description:'+5 attack damage'},
 {id:'haste',tome:'tomecooldown',sourcePathId:8557,icon:'CooldownTome',name:'Cooldown Tome',description:'15% shorter attack cooldown'},
 {id:'projectiles',tome:'tomequantity',sourcePathId:8570,icon:'QuantityTome',name:'Quantity Tome',description:'+1 attack per cycle'},
] as const;
export const emptyUpgradeLevels=():UpgradeLevels=>({damage:0,haste:0,projectiles:0});
export function nextUpgrade(id:Upgrade,stats:UpgradeStats):UpgradeStats|undefined {
 const next={damage:stats.damage,attackInterval:stats.attackInterval,projectiles:stats.projectiles};
 switch(id){
  case 'damage':next.damage+=5;break;
  case 'haste':next.attackInterval=Math.max(.15,next.attackInterval*.85);break;
  case 'projectiles':next.projectiles=Math.min(8,next.projectiles+1);break;
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
