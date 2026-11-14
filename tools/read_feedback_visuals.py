"""Dump LowHpUi (vignette RawImage) and PlayerRenderer (damageFlash material) serialized data from the installed game.
Usage: python -I tools/read_feedback_visuals.py <out.json>"""
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
TARGET={'LowHpUi','PlayerRenderer','PlayerEffects'}
out=[]
def clean(v):
    if isinstance(v,dict):return {k:clean(x) for k,x in v.items() if k not in('m_Script','references')}
    if isinstance(v,list):return [clean(x) for x in v[:32]]
    return v
def resolve(env,ptr):
    try:
        o=ptr.deref() if hasattr(ptr,'deref') else ptr.read()
        t=o.type.name if hasattr(o,'type') else type(o).__name__
        return o,t
    except Exception as e:return None,str(e)
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
            tt=obj.read_typetree();entry={'file':path.name,'pathID':obj.path_id,'class':cls,'data':clean(tt),'refs':{}}
            for k,v in tt.items():
                if isinstance(v,dict) and 'm_PathID' in v and v['m_PathID'] and v.get('m_FileID',0)==0 and v['m_PathID'] in byid:
                    t=byid[v['m_PathID']]
                    try:
                        if t.type.name in('Material','RawImage','MonoBehaviour','Texture2D','Sprite'):
                            d=t.read_typetree();entry['refs'][k]={'type':t.type.name,'data':clean(d)}
                    except Exception as e:entry['refs'][k]={'error':str(e)}
            out.append(entry)
        except Exception:pass
Path(sys.argv[1]).write_text(json.dumps(out,indent=1,default=str))
print(len(out),'objects')
