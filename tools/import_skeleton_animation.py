"""Export EnemyData -> baked mesh animation with native reference evidence."""
from pathlib import Path
import sys,json,struct,hashlib,math
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.local-evidence/python'))
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler
source=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data\sharedassets1.assets')
a=next(iter(UnityPy.load(str(source)).files.values()));out=root/'public/enemies/skeleton';out.mkdir(parents=True,exist_ok=True)
b=a.objects[8037].get_raw_data();assert struct.unpack_from('<q',b,48)[0]==277 and struct.unpack_from('<q',b,60)[0]==7798
raw=a.objects[7798].get_raw_data();fps,count=struct.unpack_from('<ii',raw,52);assert count==1
length=struct.unpack_from('<i',raw,60)[0];name=raw[64:64+length].decode();at=(64+length+3)&~3
n=struct.unpack_from('<i',raw,at)[0];at+=4;assert at+n*12==len(raw);assert struct.unpack_from('<3f',b,80)==(-90,0,0);frames=[];refs=[]
for i in range(n):
 fid,pid=struct.unpack_from('<iq',raw,at+i*12);assert fid==0
 mesh=a.objects[pid].read();h=MeshHandler(mesh);h.process()
 # Native renderer rotation -90X: (x,y,z)->(x,z,-y), then Unity->Three mirror X.
 positions=[v for x,y,z in h.m_Vertices for v in [-x,z,-y]]
 indices=[v for sm in h.get_triangles() for tri in sm for v in reversed(tri)]
 frames.append({'positions':positions,'uv':[v for uv in h.m_UV0 for v in uv[:2]],'indices':indices})
 refs.append({'pathId':pid,'name':mesh.m_Name,'sha256':hashlib.sha256(a.objects[pid].get_raw_data()).hexdigest()})
lowest=min(f['positions'][i] for f in frames for i in range(1,len(f['positions']),3));highest=max(f['positions'][i] for f in frames for i in range(1,len(f['positions']),3));scale=1.6/(highest-lowest)
for f in frames:
 f['positions']=[(v-lowest if i%3==1 else v)*scale for i,v in enumerate(f['positions'])]
material=a.objects[277].read();tex=next(env.m_Texture.read() for key,env in material.m_SavedProperties.m_TexEnvs if key=='_AlbedoMap');tex.image.save(out/'albedo.png')
data={'fps':fps,'clip':name,'frames':frames,'texture':'albedo.png','visualHeight':1.6}
(out/'animation.json').write_text(json.dumps(data,separators=(',',':')))
def safe(v):
 if isinstance(v,float) and not math.isfinite(v):return str(v)
 if isinstance(v,dict):return {k:safe(x) for k,x in v.items()}
 if isinstance(v,list):return [safe(x) for x in v]
 return v
(out/'source.json').write_text(json.dumps(safe({'enemyData':{'pathId':8037,'rawHex':b.hex()},'animatedMesh':{'pathId':7798,'rawHex':raw.hex()},'frames':refs,'material':a.objects[277].read_typetree(),'rendererRotation':[-90,0,0],'rendererScale':1.25}),indent=2))
(out/'provenance.json').write_text(json.dumps({'sourceFile':str(source),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'chain':'EnemyData8037 -> AnimatedMesh7798 / Material277 -> Texture802','fps':fps,'frameCount':n,'limitations':['Baked mesh swapping, not a skinned rig.','Source rotation applied; uniform 1.6m normalization retains current sandbox enemy size rather than native1.25 scale.','Native toon material, runtime animation state/speed changes and AI remain incomplete.','Catalog reports7 frames; serialized list contains8.'],'outputHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.name!='provenance.json'}},indent=2))
print(f'Exported {n} {name} frames at {fps} FPS, albedo={tex.m_Name}.')
