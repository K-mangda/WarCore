// Native rarity roll (Rarity.CalculateRarityWeights RVA 0x42D1B0, GetUpgradeOfferRarity RVA 0x42D2C0, GetItemRarity RVA 0x42D3F0).
// Base weights: upgrade/encounter offers come from a static float[5] in global-metadata (offset 0x748388); item rarities are immediates.
// Luck factor: log helper at 0x300CD0 is a natural log (ln2 split-constant polynomial), so c = 1.5 * ln(1 + luck).
export type UpgradeRarity='Common'|'Uncommon'|'Rare'|'Epic'|'Legendary';
export type ItemRarity='Common'|'Rare'|'Epic'|'Legendary';
export const upgradeRarities:UpgradeRarity[]=['Common','Uncommon','Rare','Epic','Legendary'];
export const upgradeWeights=[1.5,.3,.15,.04,.009] as const;
export const itemRarities:ItemRarity[]=['Common','Rare','Epic','Legendary'];
export const itemWeights=[70,15,6,1.5] as const;
/** Rarity.GetMultiplier: numeric effect multiplier for a rolled upgrade rarity. */
export const upgradeMultiplier:Record<UpgradeRarity,number>={Common:1,Uncommon:1.2,Rare:1.4,Epic:1.6,Legendary:2};

/** Applies Luck: w[i] *= 1.5^(-c*(n-1-i)), c=1.5*ln(1+luck), then normalises (index 0 = commonest). */
export function rarityWeights(base:readonly number[],luck:number):number[]{
  const c=1.5*Math.log(1+luck),n=base.length;
  const scaled=base.map((w,i)=>w*Math.pow(1.5,-c*(n-1-i)));
  const sum=scaled.reduce((a,b)=>a+b,0);
  return scaled.map(w=>w/sum);
}
function roll<T>(items:readonly T[],weights:number[],random:number):T{
  let acc=0;
  for(let i=0;i<items.length;i++){acc+=weights[i];if(random<=acc)return items[i];}
  return items[items.length-1];
}
export const rollUpgradeRarity=(luck:number,random=Math.random()):UpgradeRarity=>roll(upgradeRarities,rarityWeights(upgradeWeights,luck),random);
export const rollItemRarity=(luck:number,random=Math.random()):ItemRarity=>roll(itemRarities,rarityWeights(itemWeights,luck),random);
