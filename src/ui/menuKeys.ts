/**
 * Keyboard navigation for menus, like the real UI: arrow keys or WASD move the selection to the nearest button in that direction,
 * Enter/Space press it (native button behaviour). Only active while the pointer is not locked (not playing) and focus is not in a text field.
 * The selected button shows the four-corner brackets (buttons.css, :focus-visible).
 */
const dirs:Record<string,[number,number]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};
function candidates():HTMLElement[]{
  const dialogs=Array.from(document.querySelectorAll<HTMLElement>('[role=dialog]'));
  const root=dialogs.length?dialogs[dialogs.length-1]:document.querySelector<HTMLElement>('.title-screen')??document.body;
  // The map screen keeps two panels in one dialog; other dialogs scope navigation to themselves.
  return Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled)')).filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(b).visibility!=='hidden';});
}
export function installMenuKeys(){
  window.addEventListener('keydown',event=>{
    const dir=dirs[event.code];if(!dir||document.pointerLockElement)return;
    const active=document.activeElement as HTMLElement|null;
    if(active&&(active.tagName==='INPUT'&&(active as HTMLInputElement).type!=='range'||active.tagName==='TEXTAREA'||active.tagName==='SELECT'))return;
    if(active?.tagName==='INPUT'&&dir[1]===0)return; // sliders keep left/right
    const list=candidates();if(!list.length)return;
    if(!active||!list.includes(active)){event.preventDefault();(list.find(b=>b.matches('.title-play,.character-start,.map-confirm,[aria-pressed=true]'))??list[0]).focus();return;}
    const a=active.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;
    let best:HTMLElement|undefined,score=Infinity;
    for(const b of list){if(b===active)continue;const r=b.getBoundingClientRect(),dx=r.left+r.width/2-ax,dy=r.top+r.height/2-ay;
      const along=dx*dir[0]+dy*dir[1];if(along<=1)continue;const across=Math.abs(dx*dir[1])+Math.abs(dy*dir[0]);const s=along+across*2;if(s<score){score=s;best=b;}}
    event.preventDefault();event.stopPropagation();
    if(best){best.focus();best.scrollIntoView({block:'nearest'});}
  },true);
}
