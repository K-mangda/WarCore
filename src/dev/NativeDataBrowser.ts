import './lab.css';
import {dataCategories,dataTable,filterRows,provenanceLine,type DataCategory} from './NativeDataTables';
const tabs=document.getElementById('data-tabs')!,search=document.getElementById('data-search') as HTMLInputElement,out=document.getElementById('data-table')!,note=document.getElementById('data-note')!,count=document.getElementById('data-count')!;
document.getElementById('data-provenance')!.textContent=provenanceLine();
if(new URLSearchParams(location.search).has('embedded')){document.getElementById('back')!.hidden=true;(document.getElementById('to-lab') as HTMLAnchorElement).href='./lab.html?embedded=1';}
let current:DataCategory='enemies';
function render(){
  const table=dataTable(current),rows=filterRows(table,search.value);
  document.getElementById('room-title')!.textContent=`NATIVE DATA - ${table.title.toUpperCase()}`;
  note.textContent=table.note;count.textContent=`${rows.length} / ${table.rows.length} rows`;
  const head=document.createElement('tr');for(const column of table.columns){const th=document.createElement('th');th.scope='col';th.textContent=column;head.append(th);}
  const body=rows.map(row=>{const tr=document.createElement('tr');for(const cell of row){const td=document.createElement('td');td.textContent=cell;tr.append(td);}return tr;});
  const thead=document.createElement('thead');thead.append(head);const tbody=document.createElement('tbody');tbody.append(...body);out.replaceChildren(thead,tbody);
  for(const tab of Array.from(tabs.querySelectorAll<HTMLButtonElement>('[role=tab]'))){const active=tab.dataset.category===current;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
}
for(const [id,label] of dataCategories){
  const tab=document.createElement('button');tab.role='tab';tab.id=`data-tab-${id}`;tab.dataset.category=id;tab.textContent=label;
  tab.addEventListener('click',()=>{current=id;search.value='';render();});tabs.append(tab);
}
search.addEventListener('input',render);render();
