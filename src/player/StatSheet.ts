import {nativeCharacters,nativeStatBase,type NativeStatModifier} from '../data/NativeData';
import {upgrades,type UpgradeLevels} from '../combat/Upgrades';
import {nativeTomes} from '../data/NativeData';
/**
 * Player stat sheet. Base values come from PlayerStatsNew.GetBaseValue (RVA 0x445920, switch decoded: MaxHealth 100, HealthRegen 10,
 * Evasion 0.01, CritChance 0.01, JumpHeight 7, PickupRange 5, most multipliers 1, the rest 0). Character modifiers come from CharacterData.
 * Folding follows ApplyStatModifier (Flat -> flat, Addition -> additive, Multiplication -> product of value x levels); how UpdateStat seeds and
 * combines the accumulators is not decoded yet, so value = (base + flat + addition) x multiplication is an inference (I).
 * CheckFinalValue (RVA 0x4458A0) is verified: Armor a/(a+0.75)*0.999 and Evasion e/(e+1)*0.999.
 */
export type StatName=string;
export type StatSheet=Record<StatName,number>;
const tomeByStat=(id:keyof UpgradeLevels)=>{
  const name={damage:'Damage',haste:'Cooldown',projectiles:'Quantity'}[id];
  return nativeTomes.find(t=>t.tome===name)!;
};
export function characterModifiers(character:string):NativeStatModifier[]{return nativeCharacters.find(c=>c.character===character)?.statModifiers??[];}
/** Raw stat values (before the Armor/Evasion final transform). */
export function rawStats(character:string,levels:UpgradeLevels):StatSheet{
  const flat:StatSheet={},add:StatSheet={},mult:StatSheet={};
  const apply=(m:NativeStatModifier,amount:number)=>{
    if(m.op==='Flat')flat[m.stat]=(flat[m.stat]??0)+m.value*amount;
    else if(m.op==='Addition')add[m.stat]=(add[m.stat]??0)+m.value*amount;
    else mult[m.stat]=(mult[m.stat]??1)*Math.pow(1+m.value,amount);
  };
  for(const modifier of characterModifiers(character))apply(modifier,1);
  for(const upgrade of upgrades){const tome=tomeByStat(upgrade.id);apply({stat:tome.stat,op:tome.op,value:tome.value},levels[upgrade.id]);}
  const sheet:StatSheet={};
  for(const [stat,base] of Object.entries(nativeStatBase))sheet[stat]=(base+(flat[stat]??0)+(add[stat]??0))*(mult[stat]??1);
  return sheet;
}
export const armorReduction=(armor:number)=>armor<=0?0:armor/(armor+.75)*.999;
export const evasionChance=(evasion:number)=>evasion<=0?0:evasion/(evasion+1)*.999;
export const playerStats=(character:string,levels:UpgradeLevels):StatSheet=>{
  const sheet=rawStats(character,levels);
  sheet.Armor=armorReduction(sheet.Armor);sheet.Evasion=evasionChance(sheet.Evasion);
  return sheet;
};
/** Groups follow the original stats panel (docs/UPGRADE_SCREEN_REFERENCE.md); labels are web wording. */
export const statGroups:{title:string;stats:[StatName,string,'number'|'multiplier'|'percent'][]}[]=[
  {title:'Defense',stats:[['MaxHealth','Max HP','number'],['HealthRegen','HP regen / min','number'],['Overheal','Overheal','number'],['Shield','Shield','number'],['Armor','Armor (damage reduction)','percent'],['Evasion','Evasion','percent'],['Lifesteal','Lifesteal','percent'],['Thorns','Thorns','number']]},
  {title:'Offense',stats:[['DamageMultiplier','Damage','multiplier'],['CritChance','Crit chance','percent'],['CritDamage','Crit damage','multiplier'],['AttackSpeed','Attack speed','multiplier'],['Projectiles','Extra projectiles','number'],['ProjectileBounces','Projectile bounces','number']]},
  {title:'Attack shape',stats:[['SizeMultiplier','Size','multiplier'],['ProjectileSpeedMultiplier','Projectile speed','multiplier'],['DurationMultiplier','Duration','multiplier'],['EliteDamageMultiplier','Damage to elites','multiplier'],['KnockbackMultiplier','Knockback','multiplier']]},
  {title:'Movement',stats:[['MoveSpeedMultiplier','Movement speed','multiplier'],['ExtraJumps','Extra jumps','number'],['JumpHeight','Jump height','number']]},
  {title:'Utility',stats:[['Luck','Luck','number'],['Difficulty','Difficulty','number'],['PickupRange','Pickup range','number'],['XpIncreaseMultiplier','XP gain','multiplier'],['GoldIncreaseMultiplier','Gold gain','multiplier'],['SilverIncreaseMultiplier','Silver gain','multiplier'],['EliteSpawnIncrease','Elite spawn','multiplier'],['PowerupBoostMultiplier','Powerup boost','multiplier'],['PowerupChance','Powerup drop chance','multiplier']]},
];
export function formatStat(value:number,kind:'number'|'multiplier'|'percent'):string{
  const rounded=Math.round(value*1e3)/1e3;
  return kind==='percent'?`${Math.round(value*1e3)/10}%`:kind==='multiplier'?`x${rounded}`:String(rounded);
}
