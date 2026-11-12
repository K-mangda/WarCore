"""Read-only local Unity asset inventory; does not publish source assets."""
from pathlib import Path
import collections,json
import UnityPy
root=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
counts=collections.Counter(); assets=[]; errors=[]
for path in root.glob('*.assets'):
    try:
        env=UnityPy.load(str(path))
        for obj in env.objects:
            kind=obj.type.name; counts[kind]+=1
            if kind in {'Texture2D','Sprite','Mesh','AudioClip','Font','Shader','Material'}:
                try:
                    data=obj.read()
                    assets.append({'file':path.name,'id':obj.path_id,'type':kind,'name':getattr(data,'m_Name','')})
                except Exception as exc: errors.append({'file':path.name,'id':obj.path_id,'error':str(exc)[:160]})
    except Exception as exc: errors.append({'file':path.name,'error':str(exc)[:160]})
out=Path('.local-evidence');out.mkdir(exist_ok=True)
(out/'assets.json').write_text(json.dumps({'counts':dict(counts),'assets':assets,'errors':errors},ensure_ascii=False),encoding='utf-8')
print(json.dumps({'counts':dict(counts),'read_errors':len(errors)}))
