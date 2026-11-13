import {assetUrl} from '../core/assetUrl';
import {getAudioPreferences,setAudioPreferences,subscribeAudioPreferences} from '../audio/AudioPreferences';
export interface SoundSample {name:string;file:string;volume:number;pitch:number;}
interface Media {id:string;samples:SoundSample[];sharedHit:boolean;}
/** Manual auditions only; no inferred attack triggers, looping, or RandomSfx variation. */
export class WeaponSoundPreview {
 private media=new Map<string,Media>();private buffers=new Map<string,Promise<AudioBuffer>>();
 private context?:AudioContext;private voice?:{source:AudioBufferSourceNode;gain:GainNode;volume:number};
 private request=0;private disposed=false;private abort=new AbortController();
 private unsubscribe=subscribeAudioPreferences(()=>this.updateVolume());
 private updateVolume(){const preferences=getAudioPreferences();if(this.voice)this.voice.gain.gain.value=preferences.muted?0:this.voice.volume*.35*preferences.master*preferences.game;}
 async load(id:string){
  const response=await fetch(assetUrl(`weapons/models/${id}/media.json`),{signal:this.abort.signal});
  if(!response.ok)throw Error(`Sound list unavailable: ${id}`);
  const media=await response.json() as Media;if(!this.disposed)this.media.set(id,media);
 }
 samples(id:string){return this.media.get(id)?.samples??[];}
 async play(sample:SoundSample){
  this.stop();if(this.disposed||getAudioPreferences().muted)return;const request=this.request;
  const context=this.context??=new AudioContext();await context.resume();
  if(this.disposed||request!==this.request||getAudioPreferences().muted)return;
  let buffer=this.buffers.get(sample.file);
  if(!buffer){buffer=fetch(assetUrl(sample.file),{signal:this.abort.signal}).then(response=>{if(!response.ok)throw Error(`Sound unavailable: ${sample.name}`);return response.arrayBuffer();}).then(data=>context.decodeAudioData(data)).catch(error=>{this.buffers.delete(sample.file);throw error;});this.buffers.set(sample.file,buffer);}
  const decoded=await buffer;if(this.disposed||request!==this.request||getAudioPreferences().muted)return;
  const source=context.createBufferSource(),gain=context.createGain();source.buffer=decoded;
  source.playbackRate.value=sample.pitch;gain.gain.value=sample.volume*.35;source.connect(gain);gain.connect(context.destination);
  this.voice={source,gain,volume:sample.volume};this.updateVolume();source.onended=()=>{if(this.voice?.source===source){this.voice=undefined;source.disconnect();gain.disconnect();}};
  source.start(0,0,Math.min(decoded.duration,5));
 }
 stop(){
  this.request++;const voice=this.voice;this.voice=undefined;
  if(voice){voice.source.onended=null;try{voice.source.stop();}catch{/* Already ended. */}voice.source.disconnect();voice.gain.disconnect();}
 }
 setMuted(muted:boolean){setAudioPreferences({muted});if(muted)this.stop();}
 dispose(){this.disposed=true;this.stop();this.unsubscribe();this.abort.abort();this.buffers.clear();this.media.clear();void this.context?.close().catch(()=>{});}
}
