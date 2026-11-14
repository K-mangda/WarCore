"""Export the top-HUD icon sprites: walk the GameObject hierarchy around GameTimer / KillsAndGoldCounter / XpBarUI in level2 and save every Image/RawImage sprite or texture.
Usage: python -I tools/read_hud_icons.py <out-dir>"""
from pathlib import Path
import sys,json,struct
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
from UnityPy.classes.PPtr import PPtr
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
env=UnityPy.load(str(data/'level2'))
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
class FixedGen(TypeTreeGenerator):
    def get_nodes(self,assembly,fullname):
        nodes=list(super().get_nodes(assembly,fullname))
        for i,n in enumerate(nodes):
            if n.m_Level==1 and n.m_Name=='references':
                j=i+1
                while j<len(nodes) and nodes[j].m_Level>1:j+=1
                block=nodes[i:j];del nodes[i:j];nodes.extend(block);break
        return nodes
probe=UnityPy.load(str(data/'sharedassets1.assets'));gen=FixedGen(next(iter(probe.files.values())).unity_version)
for q in sorted(Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\DummyDll').glob('*.dll')):
    if q.name.startswith(('mscorlib','UnityEngine','Unity.Localization','Assembly-CSharp','Unity.Mathematics','Unity.TextMeshPro')):
        try:gen.load_dll(q.read_bytes())
        except Exception:pass
env.typetree_generator=gen
byid={o.path_id:o for o in env.objects}
ext=['','globalgamemanagers.assets','sharedassets2.assets','resources.assets','sharedassets1.assets','unity default','sharedassets0.assets']
envs={}
def get(fid,pid):
    e=env if fid==0 else envs.setdefault(fid,UnityPy.load(str(data/ext[fid])))
    return next((o for o in e.objects if o.path_id==pid),None)
def cls(obj):
    raw=obj.get_raw_data();fid,pid=struct.unpack_from('<iq',raw,16)
    return PPtr(m_FileID=fid,m_PathID=pid,assetsfile=obj.assets_file).read().m_ClassName
# Find the HUD root: GameObject owning KillsAndGoldCounter, then climb 3 parents.
targets={'GameTimer','KillsAndGoldCounter','XpBarUI','GoldCounter'}
roots=[]
for o in env.objects:
    if o.type.name!='MonoBehaviour':continue
    try:
        if cls(o) in targets:roots.append(struct.unpack_from('<iq',o.get_raw_data(),0)[1])
    except Exception:pass
print('hud objects',roots)
def go_children(gopid,depth,seen,rows):
    if gopid in seen or depth>6 or gopid not in byid:return
    seen.add(gopid);go=byid[gopid].read();name=go.m_Name
    rt=None
    for c in go.m_Component:
        comp=c.component if hasattr(c,'component') else c['component']
        o=comp.deref() if hasattr(comp,'deref') else None
        if o is None:continue
        t=o.type.name
        if t=='RectTransform':rt=o.read()
        if t=='MonoBehaviour':
            try:
                tt=o.read_typetree()
            except Exception:continue
            for key in('m_Sprite','m_Texture'):
                v=tt.get(key)
                if isinstance(v,dict) and v.get('m_PathID'):
                    obj=get(v['m_FileID'],v['m_PathID'])
                    if obj is not None and obj.type.name in('Sprite','Texture2D'):
                        r=obj.read();rows.append((depth,name,r.m_Name))
                        try:r.image.save(out/f'{name}__{r.m_Name}.png')
                        except Exception as e:pass
    if rt is not None:
        for ch in rt.m_Children:
            tr=ch.deref() if hasattr(ch,'deref') else None
            if tr is not None:go_children(tr.read().m_GameObject.path_id,depth+1,seen,rows)
rows=[];seen=set()
for pid in roots:
    # climb to HUD root (3 levels)
    cur=pid
    for _ in range(3):
        go=byid[cur].read()
        rt=next((c.component.deref().read() for c in go.m_Component if c.component.deref().type.name=='RectTransform'),None)
        if rt is None or not rt.m_Father.m_PathID:break
        cur=rt.m_Father.deref().read().m_GameObject.path_id
    go_children(cur,0,seen,rows)
for r in rows:print(r)
