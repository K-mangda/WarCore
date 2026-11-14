"""Read serialized ScriptableObject/MonoBehaviour data for gameplay classes from the installed game.
Typetree schema comes from the Il2CppDumper DummyDll declarations; VALUES come from shipped .assets files.
Usage: python -I tools/read_game_data.py <out.json> Class1,Class2,...
PPtrs are resolved to (file, pathID, name, class) where the target is in an opened file."""
from pathlib import Path
import sys,json,struct
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
from UnityPy.classes.PPtr import PPtr
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out=Path(sys.argv[1]); target=set(sys.argv[2].split(','))
probe=UnityPy.load(str(data/'sharedassets1.assets'))
version=next(iter(probe.files.values())).unity_version
class FixedGen(TypeTreeGenerator):
    # The AssetsTools backend emits the managed-reference registry ('references') after the base class that
    # owns a [SerializeReference] field; Unity serializes it at the very end of the object. Move it last.
    def get_nodes(self, assembly, fullname):
        nodes=list(super().get_nodes(assembly, fullname))
        for i,n in enumerate(nodes):
            if n.m_Level==1 and n.m_Name=='references':
                j=i+1
                while j<len(nodes) and nodes[j].m_Level>1: j+=1
                block=nodes[i:j]; del nodes[i:j]; nodes.extend(block); break
        return nodes
gen=FixedGen(version)
dll=Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\DummyDll')
for p in sorted(dll.glob('*.dll')):
    if p.name.startswith(('mscorlib','UnityEngine','Unity.Localization','Assembly-CSharp','Unity.Mathematics','Unity.TextMeshPro','Unity.Splines')):
        try: gen.load_dll(p.read_bytes())
        except Exception as e: print('skip',p.name,e)
records=[];failures=[];counts={}
files=list(data.glob('*.assets'))+[p for p in data.glob('level*') if p.suffix=='']
for path in files:
    try: env=UnityPy.load(str(path))
    except Exception as e: failures.append({'file':path.name,'error':str(e)[:200]}); continue
    env.typetree_generator=gen
    for obj in env.objects:
        if obj.type.name!='MonoBehaviour': continue
        try:
            raw=obj.get_raw_data(); fid,pid=struct.unpack_from('<iq',raw,16)
            script=PPtr(m_FileID=fid,m_PathID=pid,assetsfile=obj.assets_file).read()
            cls=script.m_ClassName
            counts[cls]=counts.get(cls,0)+1
            if cls not in target: continue
            tree=obj.read_typetree()
            records.append({'file':path.name,'pathID':obj.path_id,'class':cls,'name':tree.get('m_Name'),'data':tree})
        except Exception as exc:
            failures.append({'file':path.name,'id':obj.path_id,'error':str(exc)[:160]})
out.write_text(json.dumps({'unityVersion':str(version),'records':records,'failures':failures[:200],'failureCount':len(failures),'monoBehaviourClassCounts':counts},ensure_ascii=False,default=str),encoding='utf-8')
print('records',len(records),'failures',len(failures))
