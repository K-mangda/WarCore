/**
 * Level-up selection backdrop particle systems, read from the game's `Levelup` UI object (level2 scene, LevelupScreen.effects):
 * CrystalBlueFountain, Sparks and TreasureCircleRays (docs/LEVELUP_SCREEN_EXTRACTION.md, tools/read_levelup_screen.py).
 * Values are the serialized ParticleSystem settings (V); the screen-space mapping of the 3D cone shapes and the sprite frame
 * animation are inferred (I). The Sparkle/EndSparkle sub-emitters are not modelled.
 * Units: Unity UI particles scale 1 unit = `unitPx` pixels at the 1080p reference height.
 */
export interface Rgb {r:number;g:number;b:number;}
export interface EmitterConfig {
  name:string;rate:number;lifetime:[number,number];speed:[number,number];size:[number,number];
  /** Pixels per unit (transform scale of the emitter). */
  unitPx:number;simulationSpeed:number;gravity:number;
  coneAngle:number;radius:number;radiusThickness:number;
  /** Start colour: list of discrete random picks (gradient with hard stops) or a single colour. */
  colors:Rgb[];
  /** Normalised life -> size multiplier keys (linear), life -> alpha keys. */
  sizeCurve:[number,number][];alphaCurve:[number,number][];
  /** Random spin range in rad/s. */
  spin:number;stretch:boolean;
  sprite:{atlas:'atlas01'|'atlas02'|'dot';tile:number;row:number;frames:number;fps:number};
}
const to=(r:number,g:number,b:number):Rgb=>({r,g,b});
export const emitters:EmitterConfig[]=[
  // Rays first so crystals draw on top. Warm yellow stretched streaks that start tiny, grow and fade; speed ~0, emitted from the centre.
  {name:'TreasureCircleRays',rate:35,lifetime:[1,1],speed:[1e-4,1e-4],size:[.05,.07],unitPx:2537,simulationSpeed:.5,gravity:0,coneAngle:69.88,radius:1e-4,radiusThickness:1,
   colors:[to(1,.796,.412)],sizeCurve:[[0,1],[1,1]],alphaCurve:[[0,0],[.501,1],[1,0]],spin:0,stretch:true,sprite:{atlas:'atlas01',tile:32,row:3,frames:1,fps:0}},
  // Three discrete colours (blue / green / red-orange) rising from the centre in a 25 degree cone, falling back with gravity 1.3.
  {name:'CrystalBlueFountain',rate:30,lifetime:[3,8],speed:[1,3.33],size:[.12,.2],unitPx:200,simulationSpeed:1.5,gravity:1.3,coneAngle:25,radius:.9,radiusThickness:.15,
   colors:[to(.307,.799,1),to(.408,1,.357),to(1,.362,.316)],sizeCurve:[[0,.833],[.489,1],[1,1]],alphaCurve:[[0,1],[1,1]],spin:Math.PI/4,stretch:false,sprite:{atlas:'atlas02',tile:16,row:12,frames:8,fps:12}},
  {name:'Sparks',rate:45,lifetime:[.4,1],speed:[1,7],size:[.02,.02],unitPx:200,simulationSpeed:.75,gravity:1,coneAngle:35,radius:.25,radiusThickness:1,
   colors:[to(1,1,1),to(.463,.775,1)],sizeCurve:[[0,1],[.237,.726],[.486,.441],[.675,.826],[.892,.231],[1,.231]],alphaCurve:[[0,1],[1,1]],spin:0,stretch:false,sprite:{atlas:'dot',tile:4,row:0,frames:1,fps:0}},
];
const lerpCurve=(keys:[number,number][],t:number)=>{
  if(t<=keys[0][0])return keys[0][1];
  for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const [t0,v0]=keys[i-1],[t1,v1]=keys[i];return v0+(v1-v0)*((t-t0)/(t1-t0||1));}
  return keys[keys.length-1][1];
};
/** TreasureCircleRays uses separate-axis size over lifetime (two random-between curves each): width shrinks, length grows; startSize Y = 1 unit. */
export const rayWidthMultiplier=(t:number,seed:number)=>{const max=lerpCurve([[0,1],[1,.227]],t),min=lerpCurve([[0,.23],[1,1]],t);return min+(max-min)*seed;};
export const rayLengthMultiplier=(t:number,seed:number)=>{const max=lerpCurve([[0,.132],[1,1]],t),min=lerpCurve([[0,.51],[1,1]],t);return min+(max-min)*seed;};
/** EndSparkle sub-emitter (burst of 1 when a crystal dies, life 0.2-0.3 s, tint 0.82/0.92/1 -> 0.49/0.69/1). Frame art not extracted; drawn as a spinning star (I). */
export interface Flash {x:number;y:number;age:number;life:number;size:number;rotation:number;spin:number;}
export interface Particle {emitter:number;x:number;y:number;vx:number;vy:number;age:number;life:number;size:number;rotation:number;spin:number;color:Rgb;direction:number;seed:number;}
export const sizeAt=(config:EmitterConfig,t:number)=>lerpCurve(config.sizeCurve,t);
export const alphaAt=(config:EmitterConfig,t:number)=>lerpCurve(config.alphaCurve,t);
/** 1 unit of velocity/size in pixels, scaled by the canvas height against the 1080p reference. */
export class BackdropSimulation {
  readonly particles:Particle[]=[];readonly flashes:Flash[]=[];
  private carry:number[]=emitters.map(()=>0);
  constructor(private random:()=>number=Math.random,private heightScale=1){}
  setHeight(height:number){this.heightScale=height/1080;}
  private spawn(index:number){
    const c=emitters[index],r=this.random,between=(range:[number,number])=>range[0]+(range[1]-range[0])*r();
    const azimuth=r()*Math.PI*2,theta=r()*c.coneAngle*Math.PI/180,speed=between(c.speed)*c.unitPx*this.heightScale;
    const radial=c.radius*(1-c.radiusThickness*r())*c.unitPx*this.heightScale;
    // The cone axis points along the UI Z axis, so only the sin(theta) part of the velocity is visible in screen space.
    const lateral=Math.sin(theta)*speed;
    this.particles.push({emitter:index,x:Math.cos(azimuth)*radial,y:Math.sin(azimuth)*radial,vx:Math.cos(azimuth)*lateral,vy:Math.sin(azimuth)*lateral,
      age:0,life:between(c.lifetime),size:between(c.size)*c.unitPx*this.heightScale,rotation:r()*Math.PI*2,spin:(r()*2-1)*c.spin,
      color:c.colors[Math.min(c.colors.length-1,Math.floor(r()*c.colors.length))],direction:azimuth,seed:r()});
  }
  /** Advance by dt real seconds; emission, motion and ageing all run on the emitter's simulation speed. */
  step(dt:number){
    emitters.forEach((c,index)=>{
      const sim=dt*c.simulationSpeed;
      this.carry[index]+=c.rate*sim;
      while(this.carry[index]>=1){this.carry[index]--;this.spawn(index);}
    });
    for(let i=this.flashes.length-1;i>=0;i--){const f=this.flashes[i];f.age+=dt;f.rotation+=f.spin*dt;if(f.age>=f.life)this.flashes.splice(i,1);}
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i],c=emitters[p.emitter],sim=dt*c.simulationSpeed;
      p.age+=sim;
      if(p.age>=p.life){
        if(emitters[p.emitter].name==='CrystalBlueFountain')this.flashes.push({x:p.x,y:p.y,age:0,life:.2+this.random()*.1,size:p.size*1.6,rotation:p.rotation,spin:(this.random()*2-1)*6});
        this.particles.splice(i,1);continue;
      }
      // Gravity acts in world units, and in a screen-space-overlay canvas 1 world unit is 1 pixel, so it is NOT multiplied by the emitter scale (I).
      // (An earlier build multiplied by unitPx and the crystals fell off the screen far too fast.)
      p.vy+=c.gravity*9.81*this.heightScale*sim;
      p.x+=p.vx*sim;p.y+=p.vy*sim;p.rotation+=p.spin*sim;
    }
  }
}
