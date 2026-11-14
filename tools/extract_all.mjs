// One command that extracts everything from the installed game into .local-evidence (nothing is committed):
//   node tools/extract_all.mjs [--skip-ghidra] [--skip-unity] [--after-running-ghidra]
// 1. build the full decompile plan from dump.cs   2. dump all Unity data (objects, textures, sprites, audio, meshes)
// 3. decompile every planned function with Ghidra (resumable, one binary import)   4. regenerate the coverage report.
// Each step logs to .local-evidence/extract-all/run.log and a failing step never stops the next one.
import {spawn} from 'node:child_process';
import {mkdirSync,appendFileSync} from 'node:fs';
const skip=new Set(process.argv.slice(2));
mkdirSync('.local-evidence/extract-all',{recursive:true});
const log=m=>{const line=`${new Date().toISOString()} ${m}`;console.log(line);appendFileSync('.local-evidence/extract-all/run.log',line+'\n');};
const run=(label,cmd,args)=>new Promise(resolve=>{
  log(`START ${label}`);const child=spawn(cmd,args,{stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',c=>appendFileSync(`.local-evidence/extract-all/${label}.out`,c));child.stderr.on('data',c=>appendFileSync(`.local-evidence/extract-all/${label}.err`,c));
  child.on('exit',code=>{log(`END ${label} exit ${code}`);resolve(code);});child.on('error',e=>{log(`FAILED ${label}: ${e}`);resolve(1);});
});
await run('plan','python',['-I','tools/build_decompile_plan.py','.local-evidence/decompile-all-plan.json']);
if(!skip.has('--skip-unity'))await run('unity-dump','python',['-I','tools/dump_all_unity.py','.local-evidence/unity-dump']);
if(!skip.has('--skip-unity'))await run('audio','python',['-I','tools/dump_audio.py','.local-evidence/unity-dump']);
if(!skip.has('--skip-unity'))await run('asset-index','python',['-I','-W','ignore','tools/build_asset_index.py','.local-evidence/unity-dump']);
if(skip.has('--after-running-ghidra')){
  // A Ghidra batch is already running into decompile6: wait for it to end (two imports do not fit in memory), then continue with the full plan.
  const {readFileSync,existsSync}=await import('node:fs');log('waiting for the running Ghidra batch to finish');
  for(;;){const text=existsSync('.local-evidence/decompile6/progress.log')?readFileSync('.local-evidence/decompile6/progress.log','utf8'):'';if(/ finished | FAILED /.test(text.split('opening binary').pop()))break;await new Promise(r=>setTimeout(r,30000));}
  await new Promise(r=>setTimeout(r,15000));
}
if(!skip.has('--skip-ghidra'))await run('ghidra','node',['tools/rea_decompile_batch.mjs','.local-evidence/decompile6','.local-evidence/decompile-all-plan.json']);
await run('disasm-missing','python',['-I','tools/disasm_missing.py','.local-evidence/decompile6','.local-evidence/decompile-all-plan.json']);
await run('normalize','python',['-I','tools/normalize_decompile.py','.local-evidence/decompile6']);
await run('coverage','python',['-I','tools/coverage_report.py','docs/DECOMPILE_COVERAGE.md']);
log('ALL DONE');
