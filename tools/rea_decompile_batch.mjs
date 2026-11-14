// Batch decompile through the REA MCP server, saving only the pseudocode (full evidence JSON is ~750 KB per function).
// Usage: node tools/rea_decompile_batch.mjs <out-dir> <plan.json>   plan = [{label, rva}] (RVA hex, image base 0x180000000 added). Resumable.
import {Client} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/index.mjs';
import {StdioClientTransport} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/stdio.mjs';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync,appendFileSync,existsSync,readFileSync} from 'node:fs';
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
try{
  await client.connect(transport);
  await client.callTool({name:'update_analysis_settings',arguments:{changes:[{setting:'ghidra.startup_timeout_ms',action:'set',value:3600000}]}},undefined,{timeout:600000});
  log('opening binary');
  await client.callTool({name:'open_binary',arguments:{path:'C:/Program Files (x86)/Steam/steamapps/common/Megabonk/GameAssembly.dll',provider_id:'ghidra'}},undefined,{timeout:7200000});
  log('binary open; '+plan.length+' functions');
  let done=0,failed=0;
  for(const {label,rva} of plan){
    const file=resolve(out,safe(label)+'.c');if(existsSync(file)){done++;continue;}
    const va='0x'+(0x180000000+parseInt(rva,16)).toString(16);
    try{
      const r=await client.callTool({name:'analyze_function',arguments:{procedure:va,detail:'complete'}},undefined,{timeout:600000});
      const text=r.content?.find(c=>c.type==='text')?.text??'';
      let code=text;try{code=JSON.parse(text).normalized_result?.procedure?.pseudocode??text;}catch{}
      writeFileSync(file,`// ${label} RVA 0x${rva}\n`+code);
    }catch(e){failed++;writeFileSync(file,`// ${label} RVA 0x${rva}\n// FAILED ${String(e).slice(0,200)}\n`);}
    done++;if(done%25===0)log(`${done}/${plan.length} (failed ${failed})`);
  }
  log(`finished ${done}/${plan.length} (failed ${failed})`);
  await client.callTool({name:'close_binary',arguments:{}});
}catch(e){log('FAILED '+String(e).slice(0,500));}finally{try{await client.close();}catch{}}
