import {getControlPreferences,subscribeControlPreferences,type BindingAction} from './ControlPreferences';
const canonical:Record<BindingAction,string>={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',jump:'Space'};
export class Input {
 keys=new Set<string>();private heldMovement=new Set<string>();jumpTicks=0;private unsubscribe:()=>void;
 constructor(private isActive:()=>boolean,private pause:()=>void){
  let bindings=getControlPreferences().bindings;
  this.unsubscribe=subscribeControlPreferences(()=>{const next=getControlPreferences().bindings;if(Object.keys(canonical).some(key=>bindings[key as BindingAction]!==next[key as BindingAction]))this.blur();bindings=next;});
  window.addEventListener('keydown',this.down);window.addEventListener('keyup',this.up);window.addEventListener('blur',this.blur);
 }
 private mapped(code:string){const bindings=getControlPreferences().bindings;const action=(Object.keys(canonical) as BindingAction[]).find(key=>bindings[key]===code);return action?canonical[action]:undefined;}
 private down=(event:KeyboardEvent)=>{
  if(event.altKey||event.metaKey)return;
  if(event.ctrlKey&&!event.code.startsWith('Control')&&!Object.values(getControlPreferences().bindings).some(code=>code.startsWith('Control')))return;
  const mapped=this.mapped(event.code);
  if(this.isActive()&&mapped&&mapped!=='Space')this.heldMovement.add(event.code);
  if(!this.isActive())return;
  if(event.code==='Escape'){this.pause();return;}
  if(mapped||event.code==='Tab'||getControlPreferences().arrowLook&&event.code.startsWith('Arrow'))event.preventDefault();
  if(mapped)this.keys.add(mapped);else if(event.code.startsWith('Arrow'))this.keys.add(event.code);
  if(mapped==='Space'&&!event.repeat)this.jumpTicks=4;
 };
 private up=(event:KeyboardEvent)=>{this.keys.delete(this.mapped(event.code)??event.code);this.heldMovement.delete(event.code);};
 resume(){for(const code of this.heldMovement){const mapped=this.mapped(code);if(mapped)this.keys.add(mapped);}}
 private blur=()=>{this.heldMovement.clear();this.clear();};
 clear=()=>{this.keys.clear();this.jumpTicks=0;};
 dispose(){this.unsubscribe();window.removeEventListener('keydown',this.down);window.removeEventListener('keyup',this.up);window.removeEventListener('blur',this.blur);}
}
