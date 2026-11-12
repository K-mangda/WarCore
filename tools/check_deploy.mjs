import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const base=process.argv[2]??'/WarCore/';
for(const entry of ['index.html','lab.html']){
 const html=readFileSync(join('dist',entry),'utf8');
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(url==='./'||url.startsWith('http'))continue;
  assert.ok(url.startsWith(base),`${entry} references asset outside deployment base: ${url}`);
  assert.ok(existsSync(join('dist',url.slice(base.length))),`Missing bundled asset: ${url}`);
 }
}
for(const file of ['megabonk/fox-rig.json','combat/skeleton.json','game-ui/damage/atlas.png','game-ui/damage/glyphs.json','weapons/knight-sword/particle.json','weapons/knight-sword/audio/SwordSwing.wav','game-audio/Player_Jump.wav'])assert.ok(existsSync(join('dist',file)),`Missing game dependency: ${file}`);
for(const file of readdirSync('dist/assets').filter(name=>name.endsWith('.css'))){
 const css=readFileSync(join('dist/assets',file),'utf8');
 for(const [,url] of css.matchAll(/url\(["']?([^\)"']+)["']?\)/g)){
  if(url.startsWith('data:'))continue;
  assert.ok(url.startsWith(base),`CSS asset outside deployment base: ${url}`);
  assert.ok(existsSync(join('dist',url.slice(base.length))),`Missing CSS asset: ${url}`);
 }
}
console.log(`Deployment package checks passed for ${base}: game, Lab, CSS and core media.`);
