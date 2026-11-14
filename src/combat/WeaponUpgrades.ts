import type {Upgrade,Weapon} from './Run';
import {upgradeMultiplier,type UpgradeRarity} from './Rarity';
import {roundHalfEven2} from './Upgrades';
import {weaponData} from './Weapons';
/**
 * Weapon level-ups, from the decompile (docs/rea/weapon_upgrades.json, docs/REA_PROGRESSION_FINDINGS.md):
 * - UpgradeData.GetUpgradeOffer (RVA 0x44FB40, V): pick n modifiers from the weapon's pool without replacement; n = 1 or 2 for Common (50/50),
 *   otherwise 2 when the pool holds 2 or more; each value = Round(modification x Rarity.GetMultiplier(rarity), 2).
 *   A player stat can raise n further (loop on stat id 41); not modelled (I).
 * - WeaponBase.Upgrade (RVA 0x431F60, V): appends the offered modifiers to the weapon and raises its level by 1.
 * - WeaponBase.UpdateStat (RVA 0x431840, V): weapon stat = (base + flat) x (1 + additions) x product(multiplications), same fold as the player.
 * - WeaponUtility.GetWeaponDamage (RVA 0x435C50, V): damage = weapon stat DamageMultiplier (base = WeaponData.damage), so
 *   "DamageMultiplier Flat 2" means +2 base damage per pick; the player's damage multiplier applies on top when the hit is built.
 * - WeaponUtility.GetWeaponCooldown (RVA 0x435A20, V): endCooldown / (max(0.01, weapon AttackSpeed) x player AttackSpeed) + burst time.
 * - WeaponUtility.GetAttackQuantity (RVA 0x4346F0, V): weapon Projectiles + (int) player Projectiles, at least 1.
 * Size, projectile speed and knockback modifiers are stored and shown but the web attacks do not use them yet (P).
 */
export type WeaponStat='DamageMultiplier'|'Projectiles'|'SizeMultiplier'|'ProjectileSpeedMultiplier'|'KnockbackMultiplier'|'AttackSpeed';
export type ModifierOp='Addition'|'Multiplication'|'Flat';
export interface WeaponModifier {stat:WeaponStat;op:ModifierOp;value:number;}
export interface WeaponSlot {id:Weapon;level:number;mods:WeaponModifier[];}
export const maxWeapons=4,maxWeaponLevel=40;
export const weaponOfferId=(weapon:Weapon):Upgrade=>`weapon:${weapon}`;
export const offerWeapon=(id:Upgrade):Weapon|undefined=>id.startsWith('weapon:')?id.slice(7) as Weapon:undefined;
/** UpgradeData.upgradeModifiers for the two weapons the web can fire (serialized, V). */
export const weaponUpgradePools:Record<Weapon,WeaponModifier[]>={
  bolt:[{stat:'ProjectileSpeedMultiplier',op:'Addition',value:.2},{stat:'DamageMultiplier',op:'Flat',value:2.5},{stat:'Projectiles',op:'Flat',value:1},{stat:'SizeMultiplier',op:'Addition',value:.16}],
  sword:[{stat:'SizeMultiplier',op:'Addition',value:.2},{stat:'DamageMultiplier',op:'Flat',value:2},{stat:'Projectiles',op:'Flat',value:1},{stat:'KnockbackMultiplier',op:'Addition',value:.25}],
};
export const weaponNames:Record<Weapon,string>={bolt:'Firestaff',sword:'Sword'};
export const weaponIcons:Record<Weapon,string>={bolt:'game-ui/Firestaff.png',sword:'weapons/knight-sword/vfx/textures/Sword_Icon.png'};
export const weaponDescriptions:Record<Weapon,string>={bolt:'Shoots fireballs at nearby enemies',sword:'Slashes through multiple enemies'};
export function rollWeaponOffer(weapon:Weapon,rarity:UpgradeRarity,random:()=>number):WeaponModifier[]{
  const pool=[...weaponUpgradePools[weapon]],multiplier=upgradeMultiplier[rarity];
  let count=rarity==='Common'&&Math.floor(random()*2)!==1?1:Math.min(2,pool.length);
  count=Math.min(count,pool.length);
  const picked:WeaponModifier[]=[];
  for(let i=0;i<count;i++){const index=Math.min(pool.length-1,Math.floor(random()*pool.length));const mod=pool.splice(index,1)[0];picked.push({...mod,value:roundHalfEven2(mod.value*multiplier)});}
  return picked;
}
/** WeaponBase.UpdateStat fold over the weapon's own modifiers. */
export function weaponStat(base:number,mods:readonly WeaponModifier[],stat:WeaponStat){
  let flat=0,add=0,mult=1;
  for(const m of mods)if(m.stat===stat){if(m.op==='Flat')flat+=m.value;else if(m.op==='Addition')add+=m.value;else mult*=m.value;}
  return (base+flat)*(1+add)*mult;
}
export interface PlayerBonuses {damageBonus:number;attackSpeedBonus:number;projectileBonus:number;}
const round4=(v:number)=>Math.round(v*1e4)/1e4;
/** Final numbers a weapon fires with, combining its own stats and the player's Tome bonuses. */
export function weaponNumbers(slot:WeaponSlot,player:PlayerBonuses){
  const data=weaponData(slot.id);
  const damage=round4(weaponStat(data.damage,slot.mods,'DamageMultiplier')*(1+player.damageBonus));
  const attackSpeed=Math.max(.01,weaponStat(1,slot.mods,'AttackSpeed'))*(1+player.attackSpeedBonus);
  const attackInterval=Math.max(.15,round4(data.endCooldown/attackSpeed));
  const projectiles=Math.min(8,Math.max(1,Math.floor(weaponStat(data.projectiles||1,slot.mods,'Projectiles')+Math.floor(player.projectileBonus+1e-9)+1e-9)));
  return {damage,attackInterval,projectiles,attackSpeed,size:weaponStat(1,slot.mods,'SizeMultiplier'),knockback:weaponStat(1,slot.mods,'KnockbackMultiplier'),projectileSpeed:weaponStat(1,slot.mods,'ProjectileSpeedMultiplier')};
}
const statLabel:Record<WeaponStat,string>={DamageMultiplier:'Damage',Projectiles:'Projectiles',SizeMultiplier:'Size',ProjectileSpeedMultiplier:'Projectile speed',KnockbackMultiplier:'Knockback',AttackSpeed:'Attack speed'};
export function describeModifier(m:WeaponModifier){
  if(m.op==='Flat')return `+${round4(m.value)} ${statLabel[m.stat]}`;
  if(m.op==='Addition')return `+${round4(m.value*100)}% ${statLabel[m.stat]}`;
  return `x${round4(m.value)} ${statLabel[m.stat]}`;
}
