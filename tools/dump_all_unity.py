"""Dump EVERYTHING readable from the installed game's Unity data in one run (Megabonk_Data).
Per asset file <out>/<file>/ :
  objects.jsonl   every object's type, path id, name and full typetree (MonoBehaviour/ScriptableObject use the fixed IL2CPP generator, class name included)
  textures/       Texture2D -> PNG          sprites/  Sprite -> PNG (atlas crops)
  audio/          AudioClip -> WAV          meshes/   Mesh -> OBJ
  catalog.json    object counts by type
Usage: python -I tools/dump_all_unity.py <out-dir> [file-name ...]   (default: every level*/sharedassets*/resources/globalgamemanagers asset)
Resumable: a file with a finished marker (done.txt) is skipped. Failures are logged to errors.log and never stop the run."""
from pathlib import Path
import sys,json,struct,traceback,re,hashlib,gzip
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
from UnityPy.classes.PPtr import PPtr
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
wanted=sys.argv[2:]
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
for p in sorted(Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\DummyDll').glob('*.dll')):
    try:gen.load_dll(p.read_bytes())  # every assembly, so types from System.Core, Rewired, Newtonsoft etc. resolve
    except Exception:pass
# Content-addressed de-duplication: identical bytes are written once; later copies only record `duplicateOf`.
seen={}
def write_unique(path,blob,rec):
    h=hashlib.sha256(blob).hexdigest();rec['sha256']=h
    if h in seen:rec['duplicateOf']=seen[h];return
    path.parent.mkdir(exist_ok=True);path.write_bytes(blob);seen[h]=path.relative_to(out).as_posix();rec['file']=seen[h]
def png(image):
    import io
    b=io.BytesIO();image.save(b,'PNG');return b.getvalue()
safe=lambda s:re.sub(r'[^\w.-]','_',str(s))[:80] or 'unnamed'
HEAVY={'Texture2D','AudioClip','Mesh','Shader','VideoClip','Cubemap','Texture3D','Texture2DArray'}
def files():
    names=[p.name for p in sorted(data.iterdir()) if p.is_file() and (p.name.startswith(('level','sharedassets','resources','globalgamemanagers')) and p.suffix in('','.assets') and not p.name.endswith('.resS'))]
    return [n for n in names if not wanted or n in wanted]
def cls_name(obj):
    try:
        raw=obj.get_raw_data();fid,pid=struct.unpack_from('<iq',raw,16)
        return PPtr(m_FileID=fid,m_PathID=pid,assetsfile=obj.assets_file).read().m_ClassName
    except Exception:return None
total={}
for name in files():
    d=out/name;d.mkdir(parents=True,exist_ok=True)
    if (d/'done.txt').exists():print('skip',name);continue
    err=open(d/'errors.log','w',encoding='utf-8')
    try:env=UnityPy.load(str(data/name))
    except Exception as e:print('cannot load',name,e);continue
    env.typetree_generator=gen
    counts={};n=0
    with open(d/'objects.jsonl','w',encoding='utf-8') as jl:
        for obj in env.objects:
            t=obj.type.name;counts[t]=counts.get(t,0)+1;n+=1
            rec={'type':t,'pathID':obj.path_id}
            try:
                if t=='Texture2D':
                    r=obj.read();rec.update(name=r.m_Name,size=[r.m_Width,r.m_Height])
                    try:write_unique(d/'textures'/f'{safe(r.m_Name)}_{obj.path_id}.png',png(r.image),rec)
                    except Exception as e:rec['exportError']=str(e)[:100]
                elif t=='Sprite':
                    r=obj.read();rec.update(name=r.m_Name)
                    try:write_unique(d/'sprites'/f'{safe(r.m_Name)}_{obj.path_id}.png',png(r.image),rec)
                    except Exception as e:rec['exportError']=str(e)[:100]
                    try:rec['data']=obj.read_typetree()
                    except Exception:pass
                elif t=='AudioClip':
                    rec['name']=obj.read().m_Name  # samples are exported by tools/dump_audio.py in a clean process (FMOD fails with FORMAT in this one)
                elif t=='Mesh':
                    r=obj.read();rec.update(name=r.m_Name)
                    try:write_unique(d/'meshes'/f'{safe(r.m_Name)}_{obj.path_id}.obj',r.export().encode('utf-8'),rec)
                    except Exception as e:rec['exportError']=str(e)[:100]
                    try:  # full mesh (bone weights, bind poses, blend shapes) for skinned models
                        raw=json.dumps(obj.read_typetree(),default=str).encode('utf-8');(d/'meshes_raw').mkdir(exist_ok=True)
                        h=hashlib.sha256(raw).hexdigest()
                        if h not in seen:
                            with gzip.open(d/'meshes_raw'/f'{safe(r.m_Name)}_{obj.path_id}.json.gz','wb') as z:z.write(raw)
                            seen[h]=f'{name}/meshes_raw/{safe(r.m_Name)}_{obj.path_id}.json.gz'
                        rec['raw']=seen[h]
                    except Exception as e:rec['rawError']=str(e)[:100]
                elif t in('Font','TextAsset'):
                    r=obj.read();rec.update(name=r.m_Name)
                    blob=bytes(r.m_FontData) if t=='Font' else (r.m_Script.encode('utf-8','surrogateescape') if isinstance(r.m_Script,str) else bytes(r.m_Script))
                    if blob:write_unique(d/('fonts' if t=='Font' else 'text')/f'{safe(r.m_Name)}_{obj.path_id}'+('.ttf' if t=='Font' else '.txt'),blob,rec)
                elif t in HEAVY:
                    rec['name']=getattr(obj.read(),'m_Name','')
                else:
                    tt=obj.read_typetree()
                    rec['data']=tt
                    if t=='MonoBehaviour':rec['class']=cls_name(obj)
                    if isinstance(tt,dict) and 'm_Name' in tt:rec['name']=tt['m_Name']
            except Exception as e:
                err.write(f'{t} {obj.path_id}: {str(e)[:200]}\n')
            jl.write(json.dumps(rec,default=str)+'\n')
    (d/'catalog.json').write_text(json.dumps(counts,indent=1,sort_keys=True),encoding='utf-8')
    err.close();(d/'done.txt').write_text('ok',encoding='utf-8')
    print(name,n,'objects');
    for k,v in counts.items():total[k]=total.get(k,0)+v
(out/'summary.json').write_text(json.dumps(total,indent=1,sort_keys=True),encoding='utf-8')
(out/'unique-files.json').write_text(json.dumps(seen,indent=0),encoding='utf-8')
print('finished',sum(total.values()),'objects')
