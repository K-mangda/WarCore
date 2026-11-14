import {nativeCharacters,nativeDataMeta,nativeEnemies,nativeItems,nativeMaps,nativeStages,nativeTomes,nativeWeapons,type NativeStatModifier} from '../data/NativeData';
/** Pure table builders for the Lab "Native data" page (no DOM, testable in Node). Values are serialized game data; see docs/REA_*.md for evidence tiers. */
export type DataCategory='enemies'|'stages'|'weapons'|'tomes'|'items'|'characters'|'maps';
export interface DataTable {title:string;note:string;columns:string[];rows:string[][];}
export const dataCategories:[DataCategory,string][]=[['enemies','Enemies'],['stages','Stages'],['weapons','Weapons'],['tomes','Tomes'],['items','Items'],['characters','Characters'],['maps','Maps']];
const n=(v:number)=>String(Math.round(v*1e4)/1e4);
const mod=(m:NativeStatModifier)=>`${m.stat} ${m.op==='Multiplication'?'x':m.op==='Addition'?'+':'='}${n(m.value)}${m.op==='Flat'?' (flat)':''}`;
export function dataTable(category:DataCategory):DataTable{
  switch(category){
    case 'enemies':return {title:'Enemies',note:'Serialized EnemyData. XP is 1 for every enemy (elite x10 at runtime). Only Skeleton and Bandit have web models; in the director other species use stand-in visuals.',
      columns:['Enemy','Asset','HP','Damage','Speed','XP','Credit cost','Maps','Can spawn after (s)','Flags','Special attacks'],
      rows:nativeEnemies.map(e=>[e.enemy,e.name,String(e.hp),String(e.damage),n(e.speed),String(e.xp),n(e.creditCost),e.maps.join('+')||'-',n(e.canSpawnAfterTime),[e.isFlying&&'flying',e.canBeElite&&'elite'].filter(Boolean).join(', ')||'-',String(e.specialAttacks)])};
    case 'stages':return {title:'Stage timelines',note:'StageTimeline per StageData. The web plays Forest 1 through the credit director; boss encounters and other stages are not built. Boss names for Graveyard/Hell/Dungeon are unverified.',
      columns:['Stage','Length (s)','Start enemies','Events (minute: type -> enemies, duration)','Minibosses','Boss'],
      rows:nativeStages.map(s=>[s.name,n(s.stageTime),s.startEnemies.join(', ')||'-',s.events.map(e=>`${n(e.timeMinutes)}: ${e.event} -> ${e.enemies.join('/')||'(from minibosses)'} ${n(e.duration)}s`).join('; '),s.minibosses.join(', ')||'-',s.boss??'-'])};
    case 'weapons':return {title:'Weapons',note:'WeaponData with per-level modifiers. The web applies base damage and cooldown for Sword and FireStaff only; levels are not offered yet. DamageMultiplier "flat" values read as +N damage per level (inferred).',
      columns:['Weapon','Damage','Cooldown (s)','Burst (s)','Min burst (s)','Projectiles','Per level'],
      rows:nativeWeapons.map(w=>[w.weapon,n(w.damage),n(w.endCooldown),n(w.burstTime),n(w.minBurstInterval),String(w.projectiles),w.upgradePerLevel.map(mod).join('; ')||'-'])};
    case 'tomes':return {title:'Tomes',note:'TomeData stat modifier per level. Used in the game: Damage, Cooldown, Quantity. Balance/Chaos/Gambler/Hoarder are script driven (placeholder modifier).',
      columns:['Tome','Effect per level','Description'],rows:nativeTomes.map(t=>[t.tome,mod(t),t.description])};
    case 'items':return {title:'Items',note:'ItemData identity and limits only; item effects are code and are not decoded yet.',
      columns:['Item','Rarity','In pool','Max amount','Max per run','Price'],
      rows:nativeItems.map(i=>[i.item,i.rarity,i.inItemPool?'yes':'no',String(i.maxAmount),String(i.maxAmountPerRun),String(i.price)])};
    case 'characters':return {title:'Characters',note:'CharacterData. Only Fox can start a web run; models/rigs for the others are not extracted. Passive formulas are not decoded.',
      columns:['Character','Price','Starting weapon','Passive','Stat modifiers','Quests to show'],
      rows:nativeCharacters.map(c=>[c.character,String(c.price),c.startingWeapon??'-',c.passive??'-',c.statModifiers.map(mod).join('; '),String(c.numQuestsRequiredForVisibility)])};
    case 'maps':return {title:'Maps',note:'MapData stage lists and spawn multipliers. The web has one test arena standing in for Forest.',
      columns:['Map','Stages','Duration (s)','Unlock order','Shrines x','Chests x'],
      rows:nativeMaps.map(m=>[m.name,m.stages.join(', '),n(m.stageDuration),String(m.unlockOrder),n(m.numShrinesMultiplier),n(m.numChestsMultiplier)])};
  }
}
export const provenanceLine=()=>`Generated ${nativeDataMeta.generatedOn} by ${nativeDataMeta.generatedBy} - dump.cs sha256 ${nativeDataMeta.dumpCsSha256.slice(0,12)}... - metadata sha256 ${nativeDataMeta.metadataSha256.slice(0,12)}... - ${nativeDataMeta.evidenceDocs.join(', ')}`;
export const filterRows=(table:DataTable,query:string)=>{const q=query.trim().toLowerCase();return q?table.rows.filter(r=>r.some(c=>c.toLowerCase().includes(q))):table.rows;};
