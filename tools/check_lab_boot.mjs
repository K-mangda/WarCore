import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('dist/lab.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'Lab needs recovery outside its module graph');
class Script{} class Link{rel='modulepreload';}
let listener;const status={textContent:'Loading...',append(link){this.link=link;}};
vm.runInNewContext(script,{window:{addEventListener(type,fn,capture){assert.equal(type,'error');assert.equal(capture,true);listener=fn;}},HTMLScriptElement:Script,HTMLLinkElement:Link,URL,Date,location:{href:'https://example.com/WarCore/lab.html?embedded=1&weapon=bandit-walk'},document:{readyState:'complete',getElementById(){return status;},createElement(){return {};}}});
listener({target:{}});assert.equal(status.textContent,'Loading...','Ignore unrelated image/media errors');
for(const target of [new Script(),new Link()]){
 listener({target});assert.match(status.textContent,/could not load/);
 const retry=new URL(status.link.href);assert.equal(retry.searchParams.get('embedded'),'1');assert.equal(retry.searchParams.get('weapon'),'bandit-walk');assert.ok(retry.searchParams.get('reload'));
}
const game=readdirSync('dist/assets').find(name=>/^game-.*\.js$/.test(name));
assert.match(readFileSync(`dist/assets/${game}`,'utf8'),/lab\.html\?embedded=1&build=[a-z0-9]+/,'Embedded Lab must have a compiled build version');
console.log('Lab boot recovery and versioned iframe checks passed.');
