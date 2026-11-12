const clips={click:'MenuClick',hover:'menuMove',shot:'retro_shoot_fireball3',hit:'Bonk',xp:'Xp2',level:'Levelup3',hurt:'PlayerDamage',death:'DeathImpact',jump:'Player_Jump',land:'Player_Landing',sword:'HeroSwordAttack'} as const;
const clipUrl=(key:Sound,file:string)=>key==='sword'?'/weapons/sword/audio/HeroSwordAttack.wav':`/game-audio/${file}.wav`;
export type Sound=keyof typeof clips;
/** Original WAV clips, with browser gesture unlock and bounded overlapping voices. */
export class GameAudio {
  private context?:AudioContext;
  private gain?:GainNode;
  private buffers=new Map<Sound,AudioBuffer>();
  private voices=new Set<AudioBufferSourceNode>();
  private last=new Map<Sound,number>();
  private disposed=false;
  muted=false;
  unlock(){
    if(this.disposed)return;
    try{
      if(!this.context){
        const context=this.context=new AudioContext();
        this.gain=context.createGain();this.gain.gain.value=this.muted?0:.35;this.gain.connect(context.destination);
        for(const [key,file] of Object.entries(clips))void fetch(clipUrl(key as Sound,file)).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).then(b=>{if(!this.disposed)this.buffers.set(key as Sound,b);}).catch(()=>{});
      }
      void this.context.resume().catch(()=>{});
    }catch{/* Audio is optional when a browser blocks it. */}
  }
  toggle(){this.muted=!this.muted;if(this.gain)this.gain.gain.value=this.muted?0:.35;return this.muted;}
  play=(key:Sound)=>{
    const context=this.context,buffer=this.buffers.get(key);
    if(!context||!buffer||context.state!=='running'||this.muted||this.disposed)return;
    const now=context.currentTime,interval=key==='xp'?.08:key==='hit'?.09:key==='hover'?.07:key==='sword'?.1:.12;
    if(now-(this.last.get(key)??-Infinity)<interval||this.voices.size>=10)return;
    this.last.set(key,now);
    const voice=context.createBufferSource();voice.buffer=buffer;
    // Source stores .4 volume and .9/1.1 endpoints. Sampling and hard-skip
    // filtering are provisional; native RandomSfx/filter method bodies unknown.
    const localGain=context.createGain();localGain.gain.value=key==='sword'?.4:1;
    if(key==='sword')voice.playbackRate.value=.9+Math.random()*.2;
    voice.connect(localGain);localGain.connect(this.gain!);this.voices.add(voice);
    voice.onended=()=>{this.voices.delete(voice);voice.disconnect();localGain.disconnect();};voice.start();
  };
  dispose(){this.disposed=true;for(const voice of this.voices)voice.stop();this.voices.clear();void this.context?.close().catch(()=>{});}
}
