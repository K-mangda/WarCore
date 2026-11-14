import {useEffect,useRef,useSyncExternalStore} from 'react';
import {assetUrl} from '../core/assetUrl';
import {getEffectsPreferences,subscribeEffectsPreferences} from '../core/EffectsPreferences';
import {alphaAt,BackdropSimulation,emitters,rayLengthMultiplier,rayWidthMultiplier,sizeAt,type Rgb} from './LevelUpEmitters';
/** Canvas renderer for the extracted level-up particle systems (see LevelUpEmitters.ts). Additive blending like the BasicGlowUI shader. */
const load=(name:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=assetUrl(`levelup/${name}.png`);});
function tinted(source:HTMLImageElement,sx:number,sy:number,size:number,color:Rgb){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d')!;
  ctx.drawImage(source,sx,sy,size,size,0,0,size,size);ctx.globalCompositeOperation='source-in';ctx.fillStyle=`rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})`;ctx.fillRect(0,0,size,size);return canvas;
}
export function LevelUpBackdrop(){
  const effects=useSyncExternalStore(subscribeEffectsPreferences,getEffectsPreferences,getEffectsPreferences);
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    let frame=0,alive=true,last=performance.now();
    const sim=new BackdropSimulation();
    const resize=()=>{const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(canvas.clientWidth*dpr));canvas.height=Math.max(1,Math.round(canvas.clientHeight*dpr));sim.setHeight(canvas.height);};
    resize();window.addEventListener('resize',resize);
    for(let i=0;i<120;i++)sim.step(1/60); // rays and sparks are prewarmed in the source
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    void Promise.all([load('atlas01'),load('atlas02')]).then(([atlas01,atlas02])=>{
      if(!alive)return;
      const cache=new Map<string,HTMLCanvasElement>();
      const sprite=(key:string,make:()=>HTMLCanvasElement)=>{let s=cache.get(key);if(!s){s=make();cache.set(key,s);}return s;};
      const draw=(now:number)=>{
        if(!alive)return;
        const dt=Math.min(.05,(now-last)/1000);last=now;if(!reduced)sim.step(dt);
        ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='lighter';
        ctx.translate(canvas.width/2,canvas.height/2);
        for(const p of sim.particles){
          const config=emitters[p.emitter],t=p.age/p.life,size=p.size*sizeAt(config,t),alpha=alphaAt(config,t);if(size<=0.2||alpha<=0.01)continue;
          ctx.globalAlpha=alpha;ctx.save();ctx.translate(p.x,p.y);
          const color=config.name==='Sparks'?{r:1-(1-.463)*t,g:1-(1-.775)*t,b:1}:p.color;
          if(config.sprite.atlas==='dot'){
            const radius=Math.max(1.5,size*.6),g=ctx.createRadialGradient(0,0,0,0,0,radius);
            g.addColorStop(0,`rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},1)`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
          }else if(config.stretch){
            // Rays: stretched billboards, width = startSize x width curve, length = 1 unit x length curve, pointing away from the centre.
            // Tile atlas01 row 3 frame 14 has its alpha gradient across the width.
            const s=sprite(`ray${p.color.r}`,()=>tinted(atlas01,14*32,3*32,32,p.color));
            const width=size*rayWidthMultiplier(t,p.seed)/sizeAt(config,t),length=config.unitPx*(canvas.height/1080)*rayLengthMultiplier(t,p.seed);
            ctx.rotate(p.direction-Math.PI/2);ctx.drawImage(s,-width/2,0,width,length);
          }else{
            const index=Math.floor(p.age*config.sprite.fps)%config.sprite.frames;
            const s=sprite(`crystal${index}-${p.color.r}-${p.color.g}`,()=>tinted(atlas02,index*16,config.sprite.row*16,16,p.color));
            ctx.rotate(p.rotation);ctx.imageSmoothingEnabled=false;ctx.drawImage(s,-size/2,-size/2,size,size);
          }
          ctx.restore();
        }
        ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
      };
      frame=requestAnimationFrame(draw);
    }).catch(()=>undefined);
    return()=>{alive=false;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);};
  },[]);
  return <div className="upgrade-backdrop" aria-hidden="true" style={{opacity:effects.particlesOpacity}}><canvas ref={ref} className="upgrade-canvas"/></div>;
}
