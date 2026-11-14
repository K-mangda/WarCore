import {nativeWeapons,type NativeWeapon} from '../data/NativeData';
import type {Weapon} from './Run';
/**
 * Base stats of the two playable weapons from serialized WeaponData (docs/rea/weapons.json).
 * Web weapon ids: 'bolt' = FireStaff (damage 10, endCooldown 0.5, burst 1.0 s / min interval 0.15), 'sword' = Sword
 * (damage 11, endCooldown 0.75, burst 0.5 s / min interval 0.1). Targeting, projectile motion and hit shapes stay web tuning.
 * Per-level upgrades (`upgradePerLevel`) are available in NativeData but not applied yet: the offer screen has no weapon cards.
 */
const nativeName:Record<Weapon,string>={bolt:'FireStaff',sword:'Sword'};
export function weaponData(weapon:Weapon):NativeWeapon{
  const data=nativeWeapons.find(w=>w.weapon===nativeName[weapon]);
  if(!data)throw new Error(`Missing native weapon ${nativeName[weapon]}`);
  return data;
}
export const weaponDamage=(weapon:Weapon)=>weaponData(weapon).damage;
export const weaponCooldown=(weapon:Weapon)=>weaponData(weapon).endCooldown;
