"""Dump the level-up screen hierarchy (LevelupScreen.effects etc.) from the installed game.
Usage: python -I tools/read_levelup_screen.py <out.json>
Finds the LevelupScreen/UpgradePicker/UpgradeButton MonoBehaviours with the fixed typetree generator, then walks the
GameObject trees they reference (components, RectTransforms, ParticleSystem settings, materials, textures)."""
from pathlib import Path
import sys,json,struct
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
from UnityPy.classes.PPtr import PPtr
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
probe=UnityPy.load(str(data/'sharedassets1.assets')); version=next(iter(probe.files.values())).unity_version
class FixedGen(TypeTreeGenerator):
    def get_nodes(self,assembly,fullname):
        nodes=list(super().get_nodes(assembly,fullname))
        for i,n in enumerate(nodes):
            if n.m_Level==1 and n.m_Name=='references':
                j=i+1
                while j<len(nodes) and nodes[j].m_Level>1:j+=1
                block=nodes[i:j];del nodes[i:j];nodes.extend(block);break
        return nodes
gen=FixedGen(version)
dll=Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\DummyDll')
for p in sorted(dll.glob('*.dll')):
    if p.name.startswith(('mscorlib','UnityEngine','Unity.Localization','Assembly-CSharp','Unity.Mathematics','Unity.TextMeshPro')):
        try:gen.load_dll(p.read_bytes())
        except Exception:pass
TARGET={'LevelupScreen','UpgradePicker','UpgradeButton','UpgradeInventoryUI','LevelUpPopup'}
out={'unityVersion':str(version),'screens':[],'objects':{}}
def clean(v,depth=0):
    if isinstance(v,dict):return {k:clean(x,depth+1) for k,x in v.items() if k not in('m_Script','m_GameObject','references')}
    if isinstance(v,list):return [clean(x,depth+1) for x in v[:64]]
    return v
for path in sorted(data.glob('level*'))+sorted(data.glob('*.assets')):
    if path.suffix not in('','.assets'):continue
    try:env=UnityPy.load(str(path))
    except Exception:continue
    env.typetree_generator=gen
    byid={o.path_id:o for o in env.objects}
    for obj in env.objects:
        if obj.type.name!='MonoBehaviour':continue
        try:
            raw=obj.get_raw_data();fid,pid=struct.unpack_from('<iq',raw,16)
            cls=PPtr(m_FileID=fid,m_PathID=pid,assetsfile=obj.assets_file).read().m_ClassName
            if cls not in TARGET:continue
            out['screens'].append({'file':path.name,'pathID':obj.path_id,'class':cls,'data':clean(obj.read_typetree())})
        except Exception as e:pass
    if not out['screens']:continue
    # walk GameObjects referenced by the screen objects in this file
    seen=set()
    def walk_go(pid,depth=0):
        if pid in seen or pid not in byid or depth>8:return None
        seen.add(pid);o=byid[pid]
        if o.type.name!='GameObject':return None
        go=o.read();node={'pathID':pid,'name':go.m_Name,'active':go.m_IsActive,'components':[],'children':[]}
        for comp in go.m_Component:
            try:
                c=comp.component.read() if hasattr(comp,'component') else comp['component'].read()
                ctype=comp.component.type.name if hasattr(comp,'component') else '?'
                entry={'type':ctype,'pathID':comp.component.path_id}
                if ctype in('ParticleSystem','ParticleSystemRenderer','RectTransform','Transform','Image','RawImage','CanvasGroup','Animator','Canvas'):
                    try:entry['data']=clean(byid[comp.component.path_id].read_typetree())
                    except Exception as e:entry['error']=str(e)[:80]
                node['components'].append(entry)
                if ctype in('Transform','RectTransform'):
                    for child in byid[comp.component.path_id].read().m_Children:
                        tchild=byid.get(child.path_id)
                        if tchild is not None:
                            ch=walk_go(tchild.read().m_GameObject.path_id,depth+1)
                            if ch:node['children'].append(ch)
            except Exception as e:node['components'].append({'error':str(e)[:80]})
        return node
    for s in out['screens']:
        if s['file']!=path.name or s['class']!='LevelupScreen':continue
        for field in('window','effects','button'):
            ref=s['data'].get(field)
            if ref and ref.get('m_PathID'):out['objects'][f"{path.name}:{field}"]=walk_go(ref['m_PathID'])
    break
Path(sys.argv[1]).write_text(json.dumps(out,indent=1,default=str,ensure_ascii=False),encoding='utf-8')
print('screens',len(out['screens']),'objects',list(out['objects']))
