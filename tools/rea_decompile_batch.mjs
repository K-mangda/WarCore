// Batch decompile through the REA MCP server, saving only the pseudocode (full evidence JSON is ~750 KB per function).
// Usage: node tools/rea_decompile_batch.mjs <out-dir> <plan.json>   plan = [{label, rva}] (RVA hex, image base 0x180000000 added). Resumable.
import {Client} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/index.mjs';
import {StdioClientTransport} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/stdio.mjs';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync,appendFileSync,existsSync,readFileSync,readdirSync} from 'node:fs';
const out=resolve(process.argv[2]);mkdirSync(out,{recursive:true});
const plan=JSON.parse(readFileSync(process.argv[3],'utf8'));
const log=m=>{console.log(m);appendFileSync(resolve(out,'progress.log'),new Date().toISOString()+' '+m+'\n');};
const transport=new StdioClientTransport({
  command:resolve('tools/rea-runtime/node_modules/node/bin/node.exe'),
  args:[resolve('tools/rea-runtime/node_modules/rea-agents/scripts/rea.mjs'),'mcp'],
  env:{...process.env,GHIDRA_INSTALL_DIR:resolve('.local-evidence/tooling/ghidra_12.1.4_PUBLIC'),JAVA_HOME:'C:/Program Files/Android/Android Studio/jbr',REA_GHIDRA_STARTUP_TIMEOUT_MS:'3600000'},
  stderr:'pipe'});
transport.stderr?.on('data',c=>appendFileSync(resolve(out,'server-stderr.log'),c));
const client=new Client({name:'war-core-batch',version:'1.0.0'});
const safe=s=>s.replace(/[^\w.-]/g,'_');
const pseudo=j=>j.normalized_result?.pseudocode??j.normalized_result?.procedure?.pseudocode;
// Shrink files an earlier version saved as the full evidence JSON (~750 KB) down to the pseudocode.
for(const f of readdirSync(out).filter(f=>f.endsWith('.c'))){const full=resolve(out,f),text=readFileSync(full,'utf8'),brace=text.indexOf('{');if(text.length<200000||brace<0)continue;try{const code=pseudo(JSON.parse(text.slice(brace)));if(code)writeFileSync(full,text.slice(0,brace)+code);}catch{}}
try{
  await client.connect(transport);
  await client.callTool({name:'update_analysis_settings',arguments:{changes:[{setting:'ghidra.startup_timeout_ms',action:'set',value:3600000}]}},{timeout:600000});
  log('opening binary');
  await client.callTool({name:'open_binary',arguments:{path:'C:/Program Files (x86)/Steam/steamapps/common/Megabonk/GameAssembly.dll',provider_id:'ghidra'}},{timeout:7200000});
  log('binary open; '+plan.length+' functions');
  // Resume by RVA, not by label: a function already decompiled under another name (earlier plan, alias) is not done twice.
  const have=new Set(readdirSync(out).map(f=>/_([0-9A-Fa-f]+)\.c$/.exec(f)?.[1]?.toUpperCase()).filter(Boolean));
  let done=0,failed=0;
  for(const {label,rva,aliases} of plan){
    const file=resolve(out,safe(label)+'.c');if(existsSync(file)||have.has(rva.toUpperCase())){done++;continue;}
    const va='0x'+(0x180000000+parseInt(rva,16)).toString(16);
    try{
      const r=await client.callTool({name:'analyze_function',arguments:{procedure:va,detail:'complete'}},{timeout:7200000});
      const text=r.content?.find(c=>c.type==='text')?.text??'';
      let code=text;try{code=pseudo(JSON.parse(text))??text;}catch{}
      writeFileSync(file,`// ${label} RVA 0x${rva}\n`+(aliases?.length?`// same body as: ${aliases.join(', ')}\n`:'')+code);
    }catch(e){failed++;appendFileSync(resolve(out,'failures.log'),`${label} 0x${rva} ${String(e).slice(0,200)}\n`);}  // no .c file, so a re-run retries it
    done++;if(done%25===0)log(`${done}/${plan.length} (failed ${failed})`);
  }
  log(`finished ${done}/${plan.length} (failed ${failed})`);
  await client.callTool({name:'close_binary',arguments:{}});
}catch(e){log('FAILED '+String(e).slice(0,500));}finally{try{await client.close();}catch{}}
