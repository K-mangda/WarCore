"""Inspect native serialized physics/stat data without copying assets."""
from pathlib import Path
import UnityPy,json
root=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
records=[]
for path in [root/'globalgamemanagers',*root.glob('*.assets')]:
    env=UnityPy.load(str(path))
    for obj in env.objects:
        if obj.type.name in {'TimeManager','PhysicsManager','Rigidbody'}:
            records.append({'file':path.name,'id':obj.path_id,'type':obj.type.name,'data':obj.read_typetree()})
        elif obj.type.name=='MonoBehaviour':
            try:
                data=obj.read_typetree()
                if any('jump' in str(k).lower() or 'stat' in str(k).lower() for k in data) or 'character' in str(data.get('m_Name','')).lower():
                    records.append({'file':path.name,'id':obj.path_id,'type':obj.type.name,'data':data})
            except Exception: pass
Path('.local-evidence/physics-assets.json').write_text(json.dumps(records,ensure_ascii=False),encoding='utf-8')
for record in records:
    if record['type'] in {'TimeManager','PhysicsManager','Rigidbody'}: print(json.dumps(record))
print('Saved',len(records),'records')
