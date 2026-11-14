import {nativeCharacters,nativeStatBase,type NativeStatModifier} from '../data/NativeData';
import {nativeTomes} from '../data/NativeData';
/**
 * Player stat sheet. Base values come from PlayerStatsNew.GetBaseValue (RVA 0x445920, switch decoded: MaxHealth 100, HealthRegen 10,
 * Evasion 0.01, CritChance 0.01, JumpHeight 7, PickupRange 5, most multipliers 1, the rest 0). Character modifiers come from CharacterData.
 * Folding is verified from PlayerStatsNew.UpdateStat: value = (base + flat) x (1 + additions) x product of Multiplication accumulators.
 * CheckFinalValue (RVA 0x4458A0) is verified: Armor a/(a+0.75)*0.999 and Evasion e/(e+1)*0.999.
 */
export type StatName=string;
export type StatSheet=Record<StatName,number>;
export function characterModifiers(character:string):NativeStatModifier[]{return nativeCharacters.find(c=>c.character===character)?.statModifiers??[];}
/** Accumulated Tome values (sum of the rarity-scaled value of every level), as kept by TomeInventory. */
export interface TomeBonuses {damage:number;haste:number;projectiles:number;}
export const noTomes:TomeBonuses={damage:0,haste:0,projectiles:0};
const tomeStat=(name:string)=>nativeTomes.find(t=>t.tome===name)!;
/** Raw stat values (before the Armor/Evasion final transform). UpdateStat (RVA 0x446290, Ghidra): (base + flat) x (1 + additions) x product(Multiplication accumulators). */
export function rawStats(character:string,tomes:TomeBonuses=noTomes):StatSheet{
  const flat:StatSheet={},add:StatSheet={},mult:StatSheet={};
  const apply=(m:NativeStatModifier)=>{
    if(m.op==='Flat')flat[m.stat]=(flat[m.stat]??0)+m.value;
    else if(m.op==='Addition')add[m.stat]=(add[m.stat]??0)+m.value;
    else mult[m.stat]=(mult[m.stat]??1)*m.value;
  };
  for(const modifier of characterModifiers(character))apply(modifier);
  // A Multiplication Tome accumulator starts at 1 and every level adds to it; Addition/Flat Tomes start at 0.
  const damage=tomeStat('Damage'),haste=tomeStat('Cooldown'),quantity=tomeStat('Quantity');
  mult[damage.stat]=(mult[damage.stat]??1)*(1+tomes.damage);
  add[haste.stat]=(add[haste.stat]??0)+tomes.haste;
  flat[quantity.stat]=(flat[quantity.stat]??0)+tomes.projectiles;
  const sheet:StatSheet={};
  for(const [stat,base] of Object.entries(nativeStatBase))sheet[stat]=(base+(flat[stat]??0))*(1+(add[stat]??0))*(mult[stat]??1);
  return sheet;
}
export const armorReduction=(armor:number)=>armor<=0?0:armor/(armor+.75)*.999;
export const evasionChance=(evasion:number)=>evasion<=0?0:evasion/(evasion+1)*.999;
export const playerStats=(character:string,tomes:TomeBonuses=noTomes):StatSheet=>{
  const sheet=rawStats(character,tomes);
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
