"""Reuse the existing local Skeleton mesh export for the combat sandbox."""
from pathlib import Path
import json,shutil,hashlib
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\Korawit\Desktop\WarCore\src\enemies\megabonkForest\assets')
model=json.loads((source/'models.json').read_text(encoding='utf-8'))['enemy_skeleton']
assert len(model['pos'])//3==len(model['uv'])//2
assert max(model['idx'])<len(model['pos'])//3
out=root/'public/combat';out.mkdir(parents=True,exist_ok=True)
(out/'skeleton.json').write_text(json.dumps(model,separators=(',',':')),encoding='utf-8')
shutil.copy2(source/model['tex'],out/model['tex'])
(out/'provenance.json').write_text(json.dumps({'source':'Existing local WarCore Unity export, enemy_skeleton','rig':False,'texture':model['tex'],'nativeMaterialVerified':False,'note':'Static visual reused; combat balance and behavior are provisional.','sha256':{name:hashlib.sha256((out/name).read_bytes()).hexdigest() for name in ['skeleton.json',model['tex']]}},indent=2),encoding='utf-8')
print('Imported static Skeleton visual.')
