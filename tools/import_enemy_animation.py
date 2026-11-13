"""Export EnemyData -> baked mesh animation with native reference evidence."""
from pathlib import Path
import sys,json,struct,hashlib,math,argparse
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.local-evidence/python'))
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler
source=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data\sharedassets1.assets')
parser=argparse.ArgumentParser();parser.add_argument('--species',choices=['skeleton','bandit'],default='bandit');args=parser.parse_args()
species=args.species;enemyId={'skeleton':8037,'bandit':8032}[species]
a=next(iter(UnityPy.load(str(source)).files.values()));out=root/'public/enemies'/species;out.mkdir(parents=True,exist_ok=True)
b=a.objects[enemyId].get_raw_data();at=(32+struct.unpack_from('<i',b,28)[0]+3)&~3
mf,materialId=struct.unpack_from('<iq',b,at+4);af,animationId=struct.unpack_from('<iq',b,at+16);assert mf==af==0
rotation=struct.unpack_from('<3f',b,at+40);rendererScale=struct.unpack_from('<f',b,at+52)[0];assert rotation==(-90,0,0)
raw=a.objects[animationId].get_raw_data();at=(32+struct.unpack_from('<i',raw,28)[0]+3)&~3
fps,count=struct.unpack_from('<ii',raw,at);assert count==1;at+=8
length=struct.unpack_from('<i',raw,at)[0];at+=4;name=raw[at:at+length].decode();at=(at+length+3)&~3
n=struct.unpack_from('<i',raw,at)[0];at+=4;assert at+n*12==len(raw);frames=[];refs=[]
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
material=a.objects[materialId].read();tex=next(env.m_Texture.read() for key,env in material.m_SavedProperties.m_TexEnvs if key=='_AlbedoMap');tex.image.save(out/'albedo.png')
data={'fps':fps,'clip':name,'frames':frames,'texture':'albedo.png','visualHeight':1.6}
(out/'animation.json').write_text(json.dumps(data,separators=(',',':')))
def safe(v):
 if isinstance(v,float) and not math.isfinite(v):return str(v)
 if isinstance(v,dict):return {k:safe(x) for k,x in v.items()}
 if isinstance(v,list):return [safe(x) for x in v]
 return v
(out/'source.json').write_text(json.dumps(safe({'enemyData':{'pathId':enemyId,'rawHex':b.hex()},'animatedMesh':{'pathId':animationId,'rawHex':raw.hex()},'frames':refs,'material':a.objects[materialId].read_typetree(),'rendererRotation':list(rotation),'rendererScale':rendererScale}),indent=2))
(out/'provenance.json').write_text(json.dumps({'sourceFile':str(source),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'chain':f'EnemyData{enemyId} -> AnimatedMesh{animationId} / Material{materialId}','fps':fps,'frameCount':n,'limitations':['Baked mesh swapping, not a skinned rig.','Source rotation applied; uniform 1.6m normalization retains current sandbox enemy size rather than native1.25 scale.','Native toon material, runtime animation state/speed changes and AI remain incomplete.','Serialized frame list is authoritative over the supplied catalog count.'],'outputHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.name!='provenance.json'}},indent=2))
print(f'Exported {species}: {n} {name} frames at {fps} FPS, albedo={tex.m_Name}.')
