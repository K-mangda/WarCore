import {assetUrl} from '../core/assetUrl';
const clips={click:'MenuClick',hover:'menuMove',shot:'retro_shoot_fireball3',xp:'Xp2',level:'Levelup3',hurt:'PlayerDamage',death:'DeathImpact',jump:'Player_Jump',land:'Player_Landing',sword:'SwordSwing',staffImpact:'retro_explosion_fireball1',staffImpactAlt:'retro_explosion_fireball3',staffHit:'Hit2'} as const;
const clipUrl=(key:Sound,file:string)=>assetUrl(key==='sword'?'weapons/knight-sword/audio/SwordSwing.wav':key==='shot'||key.startsWith('staff')?`weapons/staff/audio/${file}.wav`:`game-audio/${file}.wav`);
export type Sound=keyof typeof clips;
interface Voice {key:Sound;source:AudioBufferSourceNode;gain:GainNode;priority:number;}
const gameplaySounds=new Set<Sound>(['shot','sword','staffImpact','staffImpactAlt','staffHit','xp','hurt','jump','land']);
const priority=(key:Sound)=>key==='death'||key==='level'||key==='hurt'?3:key==='sword'||key.startsWith('staff')?2:key==='shot'?1:0;
/** Original WAV clips. Browser unlock, voice priorities and repeat guards are web policies. */
export class GameAudio {
  private context?:AudioContext;
  private gain?:GainNode;
  private buffers=new Map<Sound,AudioBuffer>();
  private voices=new Set<Voice>();
  private last=new Map<Sound,number>();
  private requests=new AbortController();
  private encoded=new Map<Sound,Promise<ArrayBuffer|null>>();
  private disposed=false;
  private decoding:Promise<void>=Promise.resolve();
  muted=false;
  constructor(){
    // Network preload needs no AudioContext or user gesture. Decoding and playback
    // still begin only after unlock, so late gameplay sounds are never queued.
    for(const [name,file] of Object.entries(clips)){
      const key=name as Sound;
      this.encoded.set(key,fetch(clipUrl(key,file),{signal:this.requests.signal}).then(r=>{
        if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();
      }).catch(()=>null));
    }
  }
  unlock(){
    if(this.disposed)return;
    try{
      if(!this.context){
        const context=this.context=new AudioContext();
        this.gain=context.createGain();this.gain.gain.value=this.muted?0:.35;this.gain.connect(context.destination);
        this.decoding=Promise.all([...this.encoded].map(([key,bytes])=>bytes.then(data=>data?context.decodeAudioData(data):null).then(buffer=>{
          if(buffer&&!this.disposed)this.buffers.set(key,buffer);
        }).catch(()=>{}))).then(()=>{});
      }
      void this.context.resume().catch(()=>{});
    }catch{/* Audio remains optional when a browser blocks it. */}
  }
  async prepare(){this.unlock();await this.decoding;}
  toggle(){this.muted=!this.muted;if(this.gain)this.gain.gain.value=this.muted?0:.35;return this.muted;}
  private release(voice:Voice,stop=false){
    if(!this.voices.delete(voice))return;
    voice.source.onended=null;
    if(stop){try{voice.source.stop();}catch{/* Already ended. */}}
    voice.source.disconnect();voice.gain.disconnect();
  }
  play=(key:Sound)=>{
    if(key==='staffImpact'&&Math.random()<.5)key='staffImpactAlt';
    const context=this.context,buffer=this.buffers.get(key);
    if(!context||!buffer||context.state!=='running'||this.muted||this.disposed)return;
    const now=context.currentTime;
    // A swing event corresponds to one attack instance. Do not drop fast swings
    // behind the former invented .1s hard cooldown. Native spam attenuation is
    // not yet reconstructed; other repeat guards remain provisional web tuning.
    const interval=key==='sword'||key==='shot'||key.startsWith('staff')?0:key==='xp'?.08:key==='hover'?.07:.12;
    if(now-(this.last.get(key)??-Infinity)<interval)return;
    const importance=priority(key);
    if(this.voices.size>=10){
      let lowest:Voice|undefined;
      for(const voice of this.voices)if(!lowest||voice.priority<lowest.priority)lowest=voice;
      if(!lowest||lowest.priority>importance)return;
      this.release(lowest,true);
    }
    this.last.set(key,now);
    const source=context.createBufferSource();source.buffer=buffer;
    const gain=context.createGain();gain.gain.value=key==='sword'||key==='staffImpact'||key==='staffImpactAlt'?.4:key==='shot'?.7:key==='staffHit'?.12:1;
    // Source SwordSwing endpoints are .9/1.1 and volume .4. Uniform pitch
    // sampling is provisional; native random-volume distribution is unknown.
    if(key==='sword'||key==='staffImpact'||key==='staffImpactAlt')source.playbackRate.value=.9+Math.random()*.2;
    if(key==='shot')source.playbackRate.value=.94+Math.random()*.12;
    if(key==='staffHit')source.playbackRate.value=.9+Math.random()*.3;
    source.connect(gain);gain.connect(this.gain!);
    const voice:Voice={key,source,gain,priority:importance};this.voices.add(voice);
    source.onended=()=>this.release(voice);source.start();
  };
  /** Stop stale run sounds while keeping UI, level-up and death feedback. */
  stopGameplay(){
    for(const voice of this.voices)if(gameplaySounds.has(voice.key))this.release(voice,true);
    for(const key of gameplaySounds)this.last.delete(key);
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;this.requests.abort();
    for(const voice of this.voices)this.release(voice,true);
    this.buffers.clear();this.encoded.clear();
    void this.context?.close().catch(()=>{});
  }
}
