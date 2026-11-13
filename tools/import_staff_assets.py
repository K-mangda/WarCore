"""Export native FireStaff hierarchy/audio/VFX with serialized evidence; no runtime claims."""
from pathlib import Path
import json,struct,hashlib,shutil,wave,argparse,math
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler
p=argparse.ArgumentParser();p.add_argument('--game',type=Path,default=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data'));p.add_argument('--package',type=Path,default=Path(r'C:\Users\Korawit\Desktop\WarCore\megabonk_extracted_assets'));a=p.parse_args()
out=Path(__file__).resolve().parents[1]/'public/weapons/staff'
for d in ['metadata/raw','textures','meshes','audio']:(out/d).mkdir(parents=True,exist_ok=True)
e=UnityPy.load(str(a.game/'sharedassets1.assets'));asset=next(iter(e.files.values()));objects=asset.objects
manifest={'weapon':{'name':'FireStaff','enumId':0,'weaponDataPathId':8619},'phases':{},'materials':{},'audio':{}}
def strict_json(v):
 if isinstance(v,float) and not math.isfinite(v):return 'Infinity' if v>0 else '-Infinity' if v<0 else 'NaN'
 if isinstance(v,dict):return {k:strict_json(value) for k,value in v.items()}
 if isinstance(v,(list,tuple)):return [strict_json(value) for value in v]
 return v

def write(path,v):(out/path).write_text(json.dumps(strict_json(v),ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
def raw(pid):
 o=objects[pid]
 if o.type.name=='MonoBehaviour':
  b=o.get_raw_data();d={'hex':b.hex(),'byteLength':len(b)}
 else:d=o.read_typetree()
 write(f'metadata/raw/{pid}.json',{'pathId':pid,'assetFile':'sharedassets1.assets','type':o.type.name,'data':d});return d

def mul(q,r):
 x,y,z,w=q;X,Y,Z,W=r
 return [w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z]
def rotate(q,v):return mul(mul(q,[*v,0]),[-q[0],-q[1],-q[2],q[3]])[:3]
def vec(v):return [v[k] for k in ['x','y','z']]
def compose(parent,local):
 pp,pq,ps=parent;lp,lq,ls=local;rot=rotate(pq,[lp[i]*ps[i] for i in range(3)])
 return ([pp[i]+rot[i] for i in range(3)],mul(pq,lq),[ps[i]*ls[i] for i in range(3)])
def trans(t):return {'position':dict(zip(['x','y','z'],t[0])),'rotation':dict(zip(['x','y','z','w'],t[1])),'scale':dict(zip(['x','y','z'],t[2]))}
def export_mat(pid):
 if str(pid) in manifest['materials']:return
 d=raw(pid);props=d['m_SavedProperties'];textures={}
 for key,env in props.get('m_TexEnvs',[]):
  ref=env['m_Texture'];tid=ref['m_PathID']
  if not tid:continue
  tex=objects[tid].read();file=f'textures/{tid}_{tex.m_Name}.png';tex.image.save(out/file)
  textures[key]={'file':file,'pathId':tid,'scale':env['m_Scale'],'offset':env['m_Offset'],'name':tex.m_Name}
 colors=dict(props.get('m_Colors',[]));floats=dict(props.get('m_Floats',[]))
 shader=objects.get(d['m_Shader']['m_PathID']);shader_name=None
 if shader:
  try:shader_name=shader.read().m_Name
  except:pass
 manifest['materials'][str(pid)]={'name':d['m_Name'],'shader':d['m_Shader'],'shaderName':shader_name,'textures':textures,'texture':next(iter(textures.values()),None),'colors':colors,'floats':floats,'warning':'Saved properties do not prove shader pass implementation or blending.'}
def mesh_export(ptr):
 if not ptr.path_id:return None
 m=ptr.read();h=MeshHandler(m);h.process();file=f'meshes/{ptr.path_id}.json'
 write(file,{'positions':[v for x,y,z in h.m_Vertices for v in [-x,y,z]],'uv':[v for uv in h.m_UV0 for v in uv[:2]],'indices':[i for sm in h.get_triangles() for tri in sm for i in reversed(tri)],'coordinateConversion':'negate X/reverse winding'})
 return file

def walk(gid,phase,parent=((0,0,0),(0,0,0,1),(1,1,1)),root=False):
 go=objects[gid].read();raw(gid);components=[c.component.deref() for c in go.m_Component];tr=next(c for c in components if c.type.name=='Transform');td=raw(tr.path_id)
 local=(vec(td['m_LocalPosition']),[td['m_LocalRotation'][k] for k in ['x','y','z','w']],vec(td['m_LocalScale']))
 # Prefab root scene placement excluded; preserve root scale while runtime supplies orientation.
 actual=compose(parent,((0,0,0),(0,0,0,1),local[2]) if root else local)
 node={'gameObjectPathId':gid,'name':go.m_Name,'transformId':tr.path_id,'parentTransformId':td['m_Father']['m_PathID'],'localTransform':trans(local),'transform':trans(actual),'components':[]}
 ps=next((c for c in components if c.type.name=='ParticleSystem'),None);renderer=next((c for c in components if c.type.name=='ParticleSystemRenderer'),None)
 for c in components:
  node['components'].append({'pathId':c.path_id,'type':c.type.name})
  if c.type.name=='MonoBehaviour':raw(c.path_id)
 if ps:
  d=raw(ps.path_id);r=raw(renderer.path_id) if renderer else {};mids=[v['m_PathID'] for v in r.get('m_Materials',[]) if v['m_PathID']]
  for mid in mids:export_mat(mid)
  particle={'pathId':ps.path_id,'name':go.m_Name,'transformId':tr.path_id,'parentTransformId':td['m_Father']['m_PathID'],'transform':trans(actual),'localTransform':trans(local),'duration':d['lengthInSec'],'loop':d['looping'],'simulationSpace':d['moveWithTransform'],'playOnAwake':d['playOnAwake'],'initial':d['InitialModule'],'emission':d['EmissionModule'],'uv':d['UVModule'],'shape':d['ShapeModule'],'colorOverLifetime':d['ColorModule'],'sizeOverLifetime':d['SizeModule'],'rotationOverLifetime':d['RotationModule'],'velocityOverLifetime':d['VelocityModule'],'renderer':{'mode':r.get('m_RenderMode'),'materialIds':mids,'alignment':r.get('m_RenderAlignment'),'lengthScale':r.get('m_LengthScale'),'velocityScale':r.get('m_VelocityScale'),'cameraVelocityScale':r.get('m_CameraVelocityScale'),'rawPath':f'metadata/raw/{renderer.path_id}.json' if renderer else None}}
  if renderer and renderer.read().m_Mesh.path_id:particle['renderer']['meshFile']=mesh_export(renderer.read().m_Mesh)
  manifest['phases'][phase]['particles'].append(particle)
 manifest['phases'][phase]['hierarchy'].append(node)
 for child in tr.read().m_Children:walk(child.read().m_GameObject.path_id,phase,actual)
for phase,gid in [('projectile',4255),('muzzle',3316),('impact',3784),('hit',3790)]:
 manifest['phases'][phase]={'rootPathId':gid,'particles':[],'hierarchy':[]};walk(gid,phase,root=True)

def clip(pid):
 name=objects[pid].read().m_Name;source=a.package/'shared/audio/web'/f'{name}.wav';file=f'audio/{name}.wav'
 if not source.exists():source=Path(r'C:\Users\Korawit\Desktop\WarCore\public\audio\megabonk')/f'{name}.wav'
 shutil.copyfile(source,out/file)
 with wave.open(str(out/file)) as w:info={'channels':w.getnchannels(),'rate':w.getframerate(),'sampleWidth':w.getsampwidth(),'frames':w.getnframes()}
 return {'pathId':pid,'name':name,'file':file,'copiedFrom':str(source),'validation':info}
def f(b,n):return struct.unpack_from('<f',b,n)[0]
def i(b,n):return struct.unpack_from('<i',b,n)[0]
for phase,src,rand,spam in [('projectile',6641,8898,8901),('muzzle',6639,9246,9143),('impact',6672,9501,8857),('hit',6675,9572,8913)]:
 d=raw(src);rb=objects[rand].get_raw_data();sb=objects[spam].get_raw_data();n=i(rb,32);clips=[clip(struct.unpack_from('<q',rb,40+12*x)[0]) for x in range(n)];at=36+12*n
 manifest['audio'][phase]={'audioSourcePathId':src,'volume':d['m_Volume'],'pitch':d['m_Pitch'],'loop':d['Loop'],'audioSourceEnabled':d['m_Enabled'],'audioSourcePlayOnAwake':d['m_PlayOnAwake'],'spatialBlendCurve':d['panLevelCustomCurve'],'clips':clips,'randomSfx':{'pathId':rand,'componentEnabled':bool(i(rb,12)),'serializedPitchEndpoints':[f(rb,at),f(rb,at+4)],'randomVolume':f(rb,at+8),'playOnAwake':bool(i(rb,at+24))},'spamFilter':{'pathId':spam,'componentEnabled':bool(i(sb,12)),**{key:f(sb,off) for key,off in [('spamDelay',56),('minVolumeMultiplier',60),('maxInterval',64),('overrideMinInterval',68)]}},'triggerVerified':False,'warning':'Serialized configuration/references only. Event triggering, random distribution and native filtering algorithm require method reconstruction.'}
b=objects[8619].get_raw_data();raw(8619);raw(9627);raw(9507)
manifest['weapon'].update({'damage':f(b,236),'knockback':f(b,240),'onlySpawnWhenCloseEnemies':bool(i(b,232)),'projectiles':i(b,252),'attackDuration':f(b,260),'maxDuration':f(b,264),'effectDuration':f(b,272),'projectileSpeed':f(b,276),'endCooldown':f(b,280),'burstTime':f(b,284),'minBurstInterval':f(b,288),'useVision':bool(i(b,304)),'canMultiHit':bool(i(b,308)),'hasCrosshair':bool(i(b,312)),'spawnProjectileRange':f(b,316),'spawnOffset':{'x':f(b,324),'y':f(b,328),'z':f(b,332)},'attackPrefabPathId':3199,'projectilePrefabPathId':4255,'muzzlePrefabPathId':3316,'explosionPrefabPathId':3784,'hitPrefabPathId':3790,'evidence':'WeaponData serialized offsets validated against dump.cs public field order; Unity bool serialized 4-byte. Package enum+1 is wrong.'})
pb=objects[9507].get_raw_data();ab=objects[9627].get_raw_data()
manifest['weapon']['projectileSizeMultiplier']=f(ab,68)
manifest['projectile']={'class':'ProjectileExploding','componentPathId':9507,'projectileRadius':f(pb,32),'direction':{'x':f(pb,36),'y':f(pb,40),'z':f(pb,44)},'bounces':i(pb,48),'maxBounces':i(pb,52),'explosionRadius':f(pb,56),'explosionEffectPathId':struct.unpack_from('<q',pb,64)[0],'warning':'Serialized base values only; scaling and collision/explosion timing require native method reconstruction.'}
manifest['coordinateSystem']='Unity source coordinates for all particle transforms composed relative prefab root, root position/rotation omitted, root scale preserved. Geometry JSON alone converted to Three coordinates.'
write('manifest.json',manifest)
write('provenance.json',{'gameData':str(a.game),'unityVersion':asset.unity_version,'unityPyVersion':UnityPy.__version__,'sourceHashes':{'sharedassets1.assets':hashlib.sha256((a.game/'sharedassets1.assets').read_bytes()).hexdigest()},'assetHashes':{str(p.relative_to(out)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name!='provenance.json'},'limitations':['WAV decoded files copied from latest package then structurally validated; waveform not independently decoded from native clip compressed bytes.','Particle modules/hierarchy are native serialized evidence, not a complete Unity particle simulation.','Native shader implementation, audio event schedule and exact randomization/filter algorithms not reconstructed.','Audio randomSfx serialized endpoints retained in source order, not falsely relabeled min/max.']})
print(json.dumps({'particles':{k:len(v['particles']) for k,v in manifest['phases'].items()},'materials':len(manifest['materials']),'audio':{k:[c['name'] for c in v['clips']] for k,v in manifest['audio'].items()}}))
