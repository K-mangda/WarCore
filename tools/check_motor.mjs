import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const files=['player/Motor','player/Slide','player/Physics','types/movement','environment/forest/Sandbox'];
for(const file of files){
  const output=resolve('.local-evidence/check',file+'.js');mkdirSync(dirname(output),{recursive:true});
  const code=ts.transpileModule(readFileSync('src/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'");
  writeFileSync(output,code);
}
const {Motor}=await import(pathToFileURL(resolve('.local-evidence/check/player/Motor.js')));
const {physics,playtestMovement}=await import(pathToFileURL(resolve('.local-evidence/check/player/Physics.js')));
const input={keys:new Set(),jumpTicks:0};const dt=physics.fixedStep;
const motor=new Motor();motor.slideEnabled=true;motor.velocity.z=-10;input.keys.add('KeyC');motor.step(dt,input,0);
assert.ok(motor.speed>13.7&&motor.speed<14.1,`Slide start must boost 10 m/s once: ${motor.speed}`);
let maxSpeed=motor.speed;for(let i=0;i<15;i++){motor.step(dt,input,0);maxSpeed=Math.max(maxSpeed,motor.speed);}
assert.ok(maxSpeed<14.1,'Holding slide must not repeat its start force');
motor.reset();input.keys.clear();input.jumpTicks=4;motor.step(dt,input,0);
const expectedVelocity=14*playtestMovement.airTimeScale+(physics.gravity-physics.extraGravity)*playtestMovement.airTimeScale**2*dt;
assert.ok(Math.abs(motor.velocity.y-expectedVelocity)<.01,'Time-stretched jump must scale impulse and gravity together');
input.jumpTicks=0;let apex=motor.position.y,flightTime=dt;
for(let i=0;i<80;i++){const airborne=!motor.grounded;motor.step(dt,input,0);if(airborne)flightTime+=dt;apex=Math.max(apex,motor.position.y);}
assert.ok(apex>2.8&&apex<3.3,`Expected height from extracted impulse/gravity, got ${apex}`);
assert.equal(motor.grounded,true,'Jump must return to ground');
assert.ok(flightTime>1.08&&flightTime<1.2,`Slower jump should keep height but extend flight: ${flightTime}`);
assert.equal(motor.jumps,1);
// A queued press just before contact must survive to the next physics tick.
motor.reset();motor.position.y=.05;motor.grounded=false;motor.velocity.y=-2;
input.jumpTicks=4;for(let i=0;i<3;i++)motor.step(dt,input,0);
assert.equal(motor.jumps,2,'A near-landing press must jump after contact');
assert.ok(motor.velocity.y>0);
// An early air press must expire, rather than causing an unexpected later jump.
motor.reset();motor.position.y=5;motor.grounded=false;motor.velocity.y=0;
input.jumpTicks=4;for(let i=0;i<70;i++)motor.step(dt,input,0);
assert.equal(input.jumpTicks,0);
assert.equal(motor.jumps,2,'Expired air input must not trigger on landing');
console.log(JSON.stringify({slidePeak:maxSpeed,jumpApex:apex,flightTime,grounded:motor.grounded,note:'Regression of translated equations; not a native runtime comparison.'}));
