import type {Upgrade} from '../combat/Run';
import {getControlPreferences} from './ControlPreferences';
export function upgradeHotkey(event:KeyboardEvent,choices:readonly Upgrade[]):Upgrade|undefined {
 if(!getControlPreferences().numberUpgrades||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const target=event.target as HTMLElement|null;if(target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target?.tagName??''))return;
 const match=/^(?:Digit|Numpad)([1-3])$/.exec(event.code);return match?choices[Number(match[1])-1]:undefined;
}
