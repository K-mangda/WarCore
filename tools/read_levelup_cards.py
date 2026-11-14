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
TARGET={'UpgradeButton'}
def clean(v):
    if isinstance(v,dict):return {k:clean(x) for k,x in v.items() if k not in('m_Script','references','m_OnCullStateChanged')}
    if isinstance(v,list):return [clean(x) for x in v[:16]]
    return v
env=UnityPy.load(str(data/'level2'));env.typetree_generator=gen
byid={o.path_id:o for o in env.objects}
ext=['','globalgamemanagers.assets','sharedassets2.assets','resources.assets','sharedassets1.assets','unity default','sharedassets0.assets']
envs={}
def other(fid):
    if fid not in envs:envs[fid]=UnityPy.load(str(data/ext[fid]));envs[fid].typetree_generator=gen
    return envs[fid]
def get(ptr):
    fid,pid=ptr['m_FileID'],ptr['m_PathID']
    if not pid:return None
    e=env if fid==0 else other(fid)
    return next((o for o in e.objects if o.path_id==pid),None)
out={}
n=0
for obj in env.objects:
    if obj.type.name!='MonoBehaviour':continue
    try:
        raw=obj.get_raw_data();fid,pid=struct.unpack_from('<iq',raw,16)
        cls=PPtr(m_FileID=fid,m_PathID=pid,assetsfile=obj.assets_file).read().m_ClassName
        if cls!='UpgradeButton':continue
        tt=obj.read_typetree()
    except Exception:continue
    if n:break
    n+=1
    for k in ['iconBorder','iconBackground','background','backgroundOverlay','disabledOverlay','banishOverlay']:
        o=get(tt[k]);
        if o is None:continue
        try:
            d=o.read_typetree();ent={'type':o.type.name,'data':clean(d)}
            go=get(d['m_GameObject']);
            if go:
                g=go.read();ent['go']=g.m_Name
            sp=d.get('m_Sprite')
            if sp:
                so=get(sp)
                if so:
                    s2=so.read();ent['sprite']=s2.m_Name
                    try:s2.image.save(f'.local-evidence/levelup-ui-{k}.png')
                    except Exception as e:ent['spriteErr']=str(e)
            out[k]=ent
        except Exception as e:out[k]={'error':str(e)}
Path(sys.argv[1]).write_text(json.dumps(out,indent=1,default=str))
print(list(out))
