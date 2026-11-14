import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const destination=resolve('.local-evidence/levelup-emitters-check/ui/LevelUpEmitters.js');mkdirSync(dirname(destination),{recursive:true});
writeFileSync(destination,ts.transpileModule(readFileSync('src/ui/LevelUpEmitters.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const E=await import(pathToFileURL(destination));
let seed=3;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
// Serialized values (docs/LEVELUP_SCREEN_EXTRACTION.md)
const by=name=>E.emitters.find(e=>e.name===name);
const fountain=by('CrystalBlueFountain'),sparks=by('Sparks'),rays=by('TreasureCircleRays');
assert.equal(fountain.rate,30);assert.deepEqual(fountain.lifetime,[3,8]);assert.equal(fountain.gravity,1.3);assert.equal(fountain.simulationSpeed,1.5);assert.equal(fountain.colors.length,3);
assert.equal(sparks.rate,45);assert.equal(sparks.coneAngle,35);assert.equal(rays.rate,35);assert.equal(rays.simulationSpeed,.5);assert.deepEqual(rays.colors[0],{r:1,g:.796,b:.412});
const sim=new E.BackdropSimulation(random,1);
for(let i=0;i<60*10;i++)sim.step(1/60);
const count=name=>sim.particles.filter(p=>E.emitters[p.emitter].name===name).length;
// Steady state population = rate x simulationSpeed x mean lifetime / simulationSpeed in real time = rate x lifetime (life measured in sim seconds)
assert.ok(count('TreasureCircleRays')>25&&count('TreasureCircleRays')<45,'Rays: ~35/s x 0.5 speed x 1 s life / 0.5 = ~35 alive, got '+count('TreasureCircleRays'));
assert.ok(count('CrystalBlueFountain')>150&&count('CrystalBlueFountain')<350,'Fountain population '+count('CrystalBlueFountain'));
assert.ok(sim.particles.every(p=>p.age<p.life),'No expired particle stays alive');
const crystals=sim.particles.filter(p=>E.emitters[p.emitter].name==='CrystalBlueFountain');
assert.ok(crystals.every(p=>p.life>=3&&p.life<=8),'Crystal lifetime 3..8');assert.ok(new Set(crystals.map(p=>p.color.r)).size===3,'Three discrete crystal colours');
assert.ok(crystals.filter(p=>p.vy>0).length>crystals.length*.5,'Gravity pulls crystals down the screen');
const first=new E.BackdropSimulation(()=>.5,1);first.step(1);assert.ok(first.particles.length>0);
assert.equal(E.alphaAt(rays,0),0);assert.equal(E.alphaAt(rays,.501),1);assert.equal(E.alphaAt(rays,1),0,'Rays fade in and out');
assert.ok(E.rayWidthMultiplier(1,1)<.25&&E.rayWidthMultiplier(0,1)===1,'Ray width curve shrinks (1 -> 0.227)');assert.ok(Math.abs(E.rayLengthMultiplier(1,0)-1)<1e-9&&E.rayLengthMultiplier(0,1)<.14,'Ray length grows');
const tall=new E.BackdropSimulation(random,2);tall.step(5);assert.ok(tall.particles.length>0);
console.log('Level-up emitter checks passed: serialized rates/lifetimes/colours, steady-state counts, gravity, ray curves.');
