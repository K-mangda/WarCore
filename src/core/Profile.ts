/**
 * Meta progression kept between runs (localStorage; per browser). Mirrors ProgressionSaveFile: silver, shop item levels, unlocks.
 * Shop data: ShopItemData assets (sharedassets1, read from the Unity dump). Price: ShopItemData.GetLevelPrice (RVA 0x38E850, V):
 * level 0 -> price; otherwise round(price x exponentialMultiplier^level) + level x linearIncrease
 * (checked against the real shop: Silver at level 8 = 30 + 40 = 70). The round mode (FUN_1800021f0) is assumed nearest (I).
 */
export type ShopItemId='Refresh'|'Skip'|'Banish'|'Weapons'|'Tomes'|'SilverMultiplier'|'Boombox'|'Toggler';
export interface ShopItem {id:ShopItemId;name:string;description:string;icon:string;price:number;maxLevel:number;linearIncrease:number;exponentialMultiplier:number;canRefund:boolean;value?:number;}
export const shopItems:ShopItem[]=[
  {id:'SilverMultiplier',name:'Silver',description:'Increase Silver earned',icon:'🪙',price:5,maxLevel:20,linearIncrease:5,exponentialMultiplier:1.25,canRefund:false,value:2.5},
  {id:'Refresh',name:'Refresh',description:'+1 Refresh per run (re-roll the level-up offers)',icon:'↻',price:8,maxLevel:6,linearIncrease:5,exponentialMultiplier:1.3,canRefund:true},
  {id:'Skip',name:'Skip',description:'+1 Skip per run (skip a level-up offer)',icon:'➜',price:8,maxLevel:6,linearIncrease:5,exponentialMultiplier:1.3,canRefund:true},
  {id:'Banish',name:'Banish',description:'+1 Banish per run (remove an offer for the rest of the run)',icon:'✖',price:8,maxLevel:6,linearIncrease:5,exponentialMultiplier:1.3,canRefund:true},
  {id:'Weapons',name:'Weapon slot',description:'+1 weapon slot',icon:'⚔',price:25,maxLevel:2,linearIncrease:100,exponentialMultiplier:1,canRefund:true},
  {id:'Tomes',name:'Tome slot',description:'+1 Tome slot',icon:'📘',price:35,maxLevel:2,linearIncrease:100,exponentialMultiplier:1,canRefund:true},
  {id:'Boombox',name:'Boombox',description:'Unlocks the music player',icon:'📻',price:5,maxLevel:1,linearIncrease:0,exponentialMultiplier:1,canRefund:false},
  {id:'Toggler',name:'Toggler',description:'Toggle weapons, Tomes and items on or off',icon:'🔒',price:50,maxLevel:1,linearIncrease:0,exponentialMultiplier:1,canRefund:false},
];
export const shopPrice=(item:ShopItem,level:number)=>level===0?item.price:Math.round(item.price*Math.pow(item.exponentialMultiplier,level))+level*item.linearIncrease;
export interface CharacterProgress {xp:number;runs:number;}
export interface Profile {silver:number;shop:Partial<Record<ShopItemId,number>>;unlocked:string[];characters:Record<string,CharacterProgress>;disabled?:string[];}
const key='warcore.profile.v1';
const fresh=():Profile=>({silver:0,shop:{},unlocked:[],characters:{}});
let cache:Profile|undefined;const listeners=new Set<()=>void>();
export function getProfile():Profile{
  if(cache)return cache;
  try{const raw=JSON.parse(localStorage.getItem(key)??'null');cache=raw&&typeof raw.silver==='number'?{...fresh(),...raw}:fresh();}catch{cache=fresh();}
  return cache!;
}
function save(next:Profile){cache=next;try{localStorage.setItem(key,JSON.stringify(next));}catch{/* private mode: keep in memory */}listeners.forEach(l=>l());}
export const subscribeProfile=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l);};};
export const shopLevel=(id:ShopItemId)=>getProfile().shop[id]??0;
export function buyShopItem(id:ShopItemId):boolean{
  const item=shopItems.find(i=>i.id===id)!,p=getProfile(),level=p.shop[id]??0;
  if(level>=item.maxLevel)return false;const cost=shopPrice(item,level);if(p.silver<cost)return false;
  save({...p,silver:p.silver-cost,shop:{...p.shop,[id]:level+1}});return true;
}
export function addSilver(amount:number){if(amount>0)save({...getProfile(),silver:getProfile().silver+Math.floor(amount)});}
export function unlock(id:string,cost:number):boolean{const p=getProfile();if(p.unlocked.includes(id)||p.silver<cost)return false;save({...p,silver:p.silver-cost,unlocked:[...p.unlocked,id]});return true;}
/**
 * Character rank (CharacterProgression, V): OnRunFinished(xp) adds round(xp x xpModifier) and counts a run;
 * GetRank = XpUtility.XpToLevel(xp) + 1, the same XP table as in-run levels (XpToLevel walks xpForLevelsTable, cumulative).
 * Ranks go to 240 in 6 tiers of 40 (Ranks.maxRank/numRankTiers). The XP the game passes per run is assumed to be the run's total XP (P); xpModifier taken as 1 (P).
 */
export function recordRun(character:string,runXp:number){const p=getProfile(),c=p.characters?.[character]??{xp:0,runs:0};save({...p,characters:{...p.characters,[character]:{xp:c.xp+Math.round(runXp),runs:c.runs+1}}});}
export function characterRank(xp:number,xpForLevel:(level:number)=>number){let level=1,total=0;while(level<240){const need=xpForLevel(level);if(xp<total+need)break;total+=need;level++;}return {rank:level,progress:(xp-total)/xpForLevel(level)};}
/**
 * Shop effects for a run. Charges: PlayerInventory.InitSkipRefreshBanish (RVA 0x4E0380, V) = min(level, maxLevel) of Refresh/Skip/Banish
 * (+1 each from an unread achievement-style stat; not modelled, P). Slots: InventoryUtility.GetNumAvailableWeapon/TomeSlots (V) = 2 + level.
 */
export function runLoadout(){const l=(id:ShopItemId)=>Math.min(shopLevel(id),shopItems.find(i=>i.id===id)!.maxLevel);const off=(getProfile().disabled??[]).map(id=>({'t:Damage':'damage','t:Cooldown':'haste','t:Quantity':'projectiles','w:FireStaff':'weapon:bolt','w:Sword':'weapon:sword'} as Record<string,string>)[id]).filter(Boolean);
  return {disabled:off,weaponSlots:2+l('Weapons'),tomeSlots:2+l('Tomes'),refresh:l('Refresh'),skip:l('Skip'),banish:l('Banish')};}
/** Silver kept at the end of a run: tier multiplier (RunConfig.GetSilverMultiplier; 1x/1.1x/1.2x shown on the map screen, V) x shop Silver bonus
 * (+2.5% per level from ShopItemData.value 2.5; how the value is applied is inferred, I). */
export const silverMultiplier=(tier:number)=>[1,1.1,1.2][tier]??1;
export const bankedSilver=(silver:number,tier:number)=>Math.floor(silver*silverMultiplier(tier)*(1+.025*shopLevel('SilverMultiplier')));
/** Toggler (shop item): switch an unlocked weapon/Tome/item off so it never appears in level-up offers. */
export function toggleDisabled(id:string){const p=getProfile(),d=p.disabled??[];save({...p,disabled:d.includes(id)?d.filter(x=>x!==id):[...d,id]});}
