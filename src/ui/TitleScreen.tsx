import {useState,useSyncExternalStore} from 'react';
import {nativeCharacters,nativeItems,nativeTomes,nativeWeapons} from '../data/NativeData';
import {buyShopItem,getProfile,shopItems,shopLevel,shopPrice,subscribeProfile,unlock} from '../core/Profile';
import {assetUrl} from '../core/assetUrl';
/**
 * Title screen modelled on the real main menu (user screenshots 2026-11-14): PLAY / UNLOCKS / QUESTS / SHOP in the centre,
 * SETTINGS / CREDITS on the left, Silver top right. Unlocks has the five tabs; Shop sells the 8 ShopItemData entries.
 * Web limits: only Fox, Firestaff, Sword and three Tomes exist in the playable game; other entries are listed from game data only.
 * Leaderboards, Discord, language and quests are not built.
 */
type Tab='Characters'|'Weapons'|'Tomes'|'Items'|'Hats';
const playable=new Set(['Fox','FireStaff','Sword','Damage','Cooldown','Quantity']);
export function TitleScreen({play,settings,history}:{play:()=>void;settings:()=>void;history:()=>void}){
  const profile=useSyncExternalStore(subscribeProfile,getProfile,getProfile);
  const [window,setWindow]=useState<'none'|'unlocks'|'shop'>('none');
  return <section className="title-screen">
    <div className="title-silver"><img src={assetUrl('ui/hud/silver.png')} alt=""/>{profile.silver}</div>
    <div className="title-logo"><img src={assetUrl('branding/warcore-logo-transparent.png')} alt="WARCORE"/><p>there might be bonk</p></div>
    <nav className="title-main" aria-label="Main menu">
      <button className="title-play" onClick={play}>PLAY</button>
      <button onClick={()=>setWindow('unlocks')}>UNLOCKS</button>
      <button disabled title="Quests are not built yet">QUESTS</button>
      <button onClick={()=>setWindow('shop')}>SHOP</button>
    </nav>
    <nav className="title-side" aria-label="Options">
      <button onClick={settings}>SETTINGS</button>
      <button onClick={history}>RUN HISTORY</button>
    </nav>
    {window==='unlocks'&&<Unlocks close={()=>setWindow('none')}/>}
    {window==='shop'&&<Shop close={()=>setWindow('none')}/>}
  </section>;
}
function Unlocks({close}:{close:()=>void}){
  const profile=useSyncExternalStore(subscribeProfile,getProfile,getProfile);
  const [tab,setTab]=useState<Tab>('Characters'),[selected,setSelected]=useState<string>('');
  const entries:{id:string;name:string;price:number;note:string}[]=
    tab==='Characters'?nativeCharacters.map(c=>({id:'c:'+c.character,name:c.character,price:c.price,note:c.statModifiers.map(m=>`${m.stat} ${m.op==='Addition'?'+'+Math.round(m.value*100)+'%':'+'+m.value}`).join(', ')}))
    :tab==='Weapons'?nativeWeapons.map(w=>({id:'w:'+w.weapon,name:w.weapon,price:0,note:`Damage ${w.damage} · cooldown ${w.endCooldown}s`}))
    :tab==='Tomes'?nativeTomes.map(t=>({id:'t:'+t.tome,name:t.tome+' Tome',price:0,note:t.description??''}))
    :tab==='Items'?nativeItems.filter(i=>i.inItemPool).map(i=>({id:'i:'+i.item,name:i.item,price:i.price,note:i.rarity}))
    :[];
  const owned=(e:{id:string;name:string;price:number})=>e.price===0||profile.unlocked.includes(e.id)||playable.has(e.id.slice(2));
  const current=entries.find(e=>e.id===selected)??entries[0];
  return <div className="title-window" role="dialog" aria-label="Unlocks"><header><h2>UNLOCKS</h2><button className="title-close" onClick={close} aria-label="Close">✕</button></header>
    <div className="title-tabs">{(['Characters','Weapons','Tomes','Items','Hats'] as Tab[]).map(t=><button key={t} aria-pressed={t===tab} onClick={()=>{setTab(t);setSelected('');}}>{t.toUpperCase()}</button>)}</div>
    <div className="title-grid">{entries.map(e=><button key={e.id} className={owned(e)?'tile owned':'tile locked'} aria-pressed={current?.id===e.id} onClick={()=>setSelected(e.id)} title={e.name}>
      {owned(e)?<span>{e.name.slice(0,10)}</span>:<span className="tile-price"><img src={assetUrl('ui/hud/silver.png')} alt=""/>{e.price}</span>}{playable.has(e.id.slice(2))&&<i>PLAYABLE</i>}
    </button>)}{tab==='Hats'&&<p className="upgrade-muted">Hats are not built yet (22 HatData assets are in the dump).</p>}</div>
    {current&&<footer><strong>{current.name}</strong><p>{current.note||' '}</p>{!owned(current)&&<button onClick={()=>unlock(current.id,current.price)} disabled={profile.silver<current.price}>BUY {current.price}</button>}{!playable.has(current.id.slice(2))&&<small>Not in the web game yet.</small>}</footer>}
  </div>;
}
function Shop({close}:{close:()=>void}){
  const profile=useSyncExternalStore(subscribeProfile,getProfile,getProfile);
  const [selected,setSelected]=useState(shopItems[0].id);
  const item=shopItems.find(i=>i.id===selected)!,level=profile.shop[item.id]??shopLevel(item.id),maxed=level>=item.maxLevel,cost=shopPrice(item,level);
  return <div className="title-window" role="dialog" aria-label="Shop"><header><h2>SHOP</h2><button className="title-close" onClick={close} aria-label="Close">✕</button></header>
    <div className="title-grid shop">{shopItems.map(i=>{const l=profile.shop[i.id]??0;return <button key={i.id} className="tile owned" aria-pressed={i.id===selected} onClick={()=>setSelected(i.id)}>
      <span className="shop-icon">{i.icon}</span><span className="pips">{Array.from({length:i.maxLevel},(_,k)=><b key={k} className={k<l?'on':''}/>)}</span></button>;})}</div>
    <footer><strong>{item.name}</strong><p>{item.description}</p>{maxed?<em>MAX</em>:<button onClick={()=>buyShopItem(item.id)} disabled={profile.silver<cost}>BUY {cost}</button>}
      <small>{item.id==='Refresh'||item.id==='Skip'||item.id==='Banish'?'Charges are not used by the level-up screen yet.':'Effect not built yet.'}</small></footer>
  </div>;
}
