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
const {physics}=await import(pathToFileURL(resolve('.local-evidence/check/player/Physics.js')));
const input={keys:new Set(),jumpUntil:0};const dt=physics.fixedStep;
const motor=new Motor();motor.velocity.z=-10;input.keys.add('KeyC');motor.step(dt,input,0);
assert.ok(motor.speed>13.7&&motor.speed<14.1,`Slide start must boost 10 m/s once: ${motor.speed}`);
let maxSpeed=motor.speed;for(let i=0;i<15;i++){motor.step(dt,input,0);maxSpeed=Math.max(maxSpeed,motor.speed);}
assert.ok(maxSpeed<14.1,'Holding slide must not repeat its start force');
motor.reset();input.keys.clear();input.jumpUntil=Infinity;motor.step(dt,input,0);
assert.ok(motor.velocity.y>13&&motor.velocity.y<14,'Base flat jump should use 7 * (1.5 + 0.5), minus first gravity step');
input.jumpUntil=0;let apex=motor.position.y;
for(let i=0;i<80;i++){motor.step(dt,input,0);apex=Math.max(apex,motor.position.y);}
assert.ok(apex>2.8&&apex<3.3,`Expected height from extracted impulse/gravity, got ${apex}`);
assert.equal(motor.grounded,true,'Jump must return to ground');
assert.equal(motor.jumps,1);
console.log(JSON.stringify({slidePeak:maxSpeed,jumpApex:apex,grounded:motor.grounded,note:'Regression of translated equations; not a native runtime comparison.'}));
