import {defineConfig} from 'vite';
import {execFileSync} from 'node:child_process';
let sha=process.env.GITHUB_SHA;
if(!sha){try{sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{sha='local';}}
export default defineConfig({define:{'import.meta.env.VITE_BUILD_ID':JSON.stringify(Date.now().toString(36)),'import.meta.env.VITE_BUILD_SHA':JSON.stringify(sha.slice(0,7)),'import.meta.env.VITE_BUILD_TIME':JSON.stringify(new Date().toISOString())},build:{rollupOptions:{input:{game:'index.html',lab:'lab.html',data:'data.html',levelup:'levelup.html'}}}});
