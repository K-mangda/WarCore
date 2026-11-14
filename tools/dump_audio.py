"""Export every AudioClip as WAV in a clean process (no typetree generator loaded: with it FMOD fails with FORMAT).
Identical audio is written once (sha256). Usage: python -I tools/dump_audio.py <out-dir>   -> <out>/<file>/audio/*.wav + <out>/audio-index.json"""
from pathlib import Path
import sys,json,hashlib,re
import UnityPy
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out=Path(sys.argv[1]);seen={};index=[]
safe=lambda s:re.sub(r'[^\w.-]','_',str(s))[:80] or 'unnamed'
for p in sorted(data.iterdir()):
    if not p.is_file() or p.suffix not in('','.assets') or not p.name.startswith(('level','sharedassets','resources','globalgamemanagers')):continue
    try:env=UnityPy.load(str(p))
    except Exception:continue
    for obj in env.objects:
        if obj.type.name!='AudioClip':continue
        rec={'file':p.name,'pathID':obj.path_id}
        try:
            r=obj.read();rec.update(name=r.m_Name,frequency=r.m_Frequency,channels=r.m_Channels,length=getattr(r,'m_Length',None))
            for fn,blob in r.samples.items():
                h=hashlib.sha256(blob).hexdigest();rec['sha256']=h
                if h in seen:rec['duplicateOf']=seen[h];continue
                d=out/p.name/'audio';d.mkdir(parents=True,exist_ok=True)
                target=d/f'{safe(r.m_Name)}_{obj.path_id}.wav';target.write_bytes(blob);seen[h]=f'{p.name}/audio/{target.name}';rec['wav']=seen[h]
        except Exception as e:rec['error']=str(e)[:120]
        index.append(rec)
(out/'audio-index.json').write_text(json.dumps(index,indent=0),encoding='utf-8')
print(len(index),'clips;',len(seen),'unique;',sum(1 for r in index if 'error' in r),'errors')
