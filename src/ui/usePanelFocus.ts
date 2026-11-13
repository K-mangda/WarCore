import {useEffect,useRef} from 'react';
/** Keyboard focus stays in the open menu; input cannot leak into gameplay. */
export function usePanelFocus(onEscape?:()=>void){
 const panel=useRef<HTMLElement>(null),escape=useRef(onEscape);escape.current=onEscape;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const buttons=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')??[]);buttons()[0]?.focus();
  const key=(event:KeyboardEvent)=>{if(event.code==='Escape'){event.preventDefault();event.stopPropagation();escape.current?.();}if(event.key==='Tab'){const entries=buttons(),first=entries[0],last=entries.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key,true);
  return ()=>{document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus();};
 },[]);return panel;
}
