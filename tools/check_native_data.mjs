import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
for(const name of ['data/NativeData','dev/NativeDataTables']){
  const destination=resolve('.local-evidence/native-data-check',name+'.js');mkdirSync(dirname(destination),{recursive:true});
  writeFileSync(destination,ts.transpileModule(readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.js'"));
}
const data=await import(pathToFileURL(resolve('.local-evidence/native-data-check/data/NativeData.js')));
const tables=await import(pathToFileURL(resolve('.local-evidence/native-data-check/dev/NativeDataTables.js')));
assert.equal(data.nativeEnemies.length,53);assert.equal(data.nativeStages.length,9);assert.equal(data.nativeTomes.length,26);assert.equal(data.nativeWeapons.length,30);
assert.equal(data.nativeCharacters.length,21);assert.equal(data.nativeItems.length,87);assert.equal(data.nativeMaps.length,5);
assert.match(data.nativeDataMeta.dumpCsSha256,/^[0-9a-f]{64}$/);assert.match(data.nativeDataMeta.metadataSha256,/^[0-9a-f]{64}$/);
assert.ok(data.nativeEnemies.every(e=>e.source.includes('#')&&e.hp>0),'Every enemy keeps its asset provenance');
const forest=data.nativeStages.find(s=>s.name==='StageForest1');assert.equal(forest.events.length,4);assert.deepEqual(forest.startEnemies,['Goblin']);
for(const [id] of tables.dataCategories){
  const table=tables.dataTable(id);assert.ok(table.rows.length>0,id+' has rows');
  assert.ok(table.rows.every(row=>row.length===table.columns.length),id+' rows match their columns');
  assert.ok(table.rows.every(row=>row.every(cell=>typeof cell==='string'&&!cell.includes('undefined')&&!cell.includes('NaN'))),id+' has no undefined/NaN cells');
}
assert.equal(tables.dataTable('enemies').rows.length,53);
const sword=tables.dataTable('weapons').rows.find(r=>r[0]==='Sword');assert.equal(sword[1],'11');assert.equal(sword[2],'0.75');
assert.equal(tables.filterRows(tables.dataTable('tomes'),'luck').length,1);assert.equal(tables.filterRows(tables.dataTable('enemies'),'zzzz').length,0);
const fox=tables.dataTable('characters').rows.find(r=>r[0]==='Fox');assert.equal(fox[2],'FireStaff');assert.equal(fox[3],'RngBlessing');
assert.match(tables.provenanceLine(),/dump\.cs sha256/);
console.log('Native data checks passed: row counts, provenance hashes, table shape, search and key values.');
