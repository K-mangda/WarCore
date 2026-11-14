// Decompile selected GameAssembly.dll functions through the REA MCP server (Ghidra provider).
// Usage: node tools/rea_decompile.mjs <out-dir> <rva-hex>[,<rva-hex>...]   (RVA, image base 0x180000000 added)
import {Client} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/index.mjs';
import {StdioClientTransport} from './rea-runtime/node_modules/@modelcontextprotocol/client/dist/stdio.mjs';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync,appendFileSync} from 'node:fs';
const out=resolve(process.argv[2]);mkdirSync(out,{recursive:true});
const rvas=process.argv[3].split(',');
const log=m=>{console.log(m);appendFileSync(resolve(out,'progress.log'),new Date().toISOString()+' '+m+'\n');};
const transport=new StdioClientTransport({
  command:resolve('tools/rea-runtime/node_modules/node/bin/node.exe'),
  args:[resolve('tools/rea-runtime/node_modules/rea-agents/scripts/rea.mjs'),'mcp'],
  env:{...process.env,GHIDRA_INSTALL_DIR:resolve('.local-evidence/tooling/ghidra_12.1.4_PUBLIC'),JAVA_HOME:'C:/Program Files/Android/Android Studio/jbr',REA_GHIDRA_STARTUP_TIMEOUT_MS:'3600000'},
  stderr:'pipe'});
transport.stderr?.on('data',c=>appendFileSync(resolve(out,'server-stderr.log'),c));
const client=new Client({name:'war-core-decompile',version:'1.0.0'});
const call=async(name,args)=>{log('start '+name+' '+JSON.stringify(args).slice(0,100));const r=await client.callTool({name,arguments:args},{timeout:7200000});writeFileSync(resolve(out,name+'-'+Date.now()+'.json'),JSON.stringify(r,null,1));log(name+(r.isError?' ERROR':' ok'));return r;};
try{
  await client.connect(transport);
  await call('update_analysis_settings',{changes:[{setting:'ghidra.startup_timeout_ms',action:'set',value:3600000}]});
  await call('open_binary',{path:'C:/Program Files (x86)/Steam/steamapps/common/Megabonk/GameAssembly.dll',provider_id:'ghidra'});
  for(const rva of rvas){
    const va='0x'+(0x180000000+parseInt(rva,16)).toString(16);
    const r=await call('analyze_function',{procedure:va,detail:'complete'});
    const t=r.content?.find(c=>c.type==='text')?.text??'';
    writeFileSync(resolve(out,'fn_'+rva+'.json'),t);
  }
  await call('close_binary',{});
}catch(e){log('FAILED '+String(e).slice(0,500));}finally{try{await client.close();}catch{}}
