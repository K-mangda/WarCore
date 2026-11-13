"""Import reported pickup chains; retain native serialized evidence and hashes."""
from pathlib import Path
import sys,json,hashlib,shutil,math,wave
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.local-evidence/python'))
import UnityPy
game=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
package=Path(r'C:\Users\Korawit\Desktop\WarCore\megabonk_extracted_assets')
out=root/'public/progression';out.mkdir(parents=True,exist_ok=True)
def clean(v):
 if isinstance(v,float) and not math.isfinite(v):return str(v)
 if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
 if isinstance(v,list):return [clean(x) for x in v]
 return v
def write(name,data):(out/name).write_text(json.dumps(clean(data),indent=2),encoding='utf-8')
assets={name:next(iter(UnityPy.load(str(game/name)).files.values())) for name in ['sharedassets1.assets','sharedassets2.assets','level2']}
manifest={'sprites':{},'limitations':['Runtime behavior comes from external extraction report; disassembly not independently reproduced.','Custom glow/shader and Unity particle simulation remain approximations.']}
for name,file,pid,rid in [('gold','sharedassets2.assets',2403,2582),('silver','sharedassets2.assets',2203,2685),('burst','level2',9162,9328),('text','level2',9076,9389)]:
 a=assets[file];p=a.objects[pid].read_typetree();r=a.objects[rid].read();mat=r.m_Materials[0].deref();md=mat.read_typetree();tex=next(ptr.m_Texture for key,ptr in mat.read().m_SavedProperties.m_TexEnvs if key in ['_TextureSample','_MainTex'] and ptr.m_Texture.path_id).read()
 uv=p['UVModule'];image=tex.image;w=image.width//uv['tilesX'];h=image.height//uv['tilesY'];row=uv['rowIndex']
 # Full source row retained, so frame selection can consume native startFrame.
 image.crop((0,row*h,image.width,(row+1)*h)).save(out/(name+'.png'))
 manifest['sprites'][name]={'frames':uv['tilesX'],'particle':p,'material':md,'sourceFile':file,'particleId':pid,'rendererId':rid,'materialId':mat.path_id,'materialFile':mat.assets_file.name,'textureName':tex.m_Name,'textureId':tex.object_reader.path_id}
 write(name+'-source.json',{'particle':p,'renderer':a.objects[rid].read_typetree(),'material':md})
for clip in ['gold','Silver','Levelup4','LevelupAfter','LevelupAmbience']:
 source=package/'shared/audio/web'/(clip+'.wav')
 with wave.open(str(source),'rb') as wav:
  assert wav.getnframes()>0 and wav.getsampwidth()==2 and wav.getcomptype()=='NONE',clip
 shutil.copyfile(source,root/'public/game-audio'/(clip+'.wav'))
shutil.copyfile(package/'pickups_manifest.json',out/'reported-behavior.json')
write('manifest.json',manifest)
write('provenance.json',{'sourceHashes':{name:hashlib.sha256((game/name).read_bytes()).hexdigest() for name in assets},'audioHashes':{clip:hashlib.sha256((root/'public/game-audio'/(clip+'.wav')).read_bytes()).hexdigest() for clip in ['gold','Silver','Levelup4','LevelupAfter','LevelupAmbience']},'outputHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.is_file() and p.name!='provenance.json'}})
print('Imported gold/silver/level-up sprites, serialized modules and five WAV files.')
