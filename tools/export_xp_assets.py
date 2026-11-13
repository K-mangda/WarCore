"""Export the native XP billboard atlas row and serialized evidence."""
from pathlib import Path
import sys,json,struct,math
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.local-evidence/python'))
import UnityPy
root=Path(__file__).resolve().parents[1];out=root/'public/pickups/xp';out.mkdir(parents=True,exist_ok=True)
e=UnityPy.load(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data\sharedassets2.assets');a=next(iter(e.files.values()))
ps=a.objects[2314].read_typetree();renderer=a.objects[2588].read();mat=renderer.m_Materials[0].deref();md=mat.read_typetree()
tex=mat.assets_file.objects[545].read();image=tex.image
uv=ps['UVModule'];w=image.width//uv['tilesX'];h=image.height//uv['tilesY'];frames=math.ceil(uv['frameOverTime']['scalar']*uv['tilesX'])
image.crop((0,uv['rowIndex']*h,frames*w,(uv['rowIndex']+1)*h)).save(out/'frames.png')
raw=a.objects[3096].get_raw_data();colors={name:list(struct.unpack_from('<4f',raw,56+i*16)) for i,name in enumerate(['low','medium','high','echo'])}
def clean(v):
 if isinstance(v,float) and not math.isfinite(v):return str(v)
 if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
 if isinstance(v,list):return [clean(x) for x in v]
 return v
manifest={'source':'sharedassets2.assets','prefab':872,'particle':2314,'renderer':2588,'material':{'file':'sharedassets1.assets','pathId':424},'texture':{'pathId':545,'name':tex.m_Name},'frames':frames,'duration':ps['InitialModule']['startLifetime']['scalar'],'size':ps['InitialModule']['startSize']['scalar'],'colors':colors,'sampling':'Source row12, columns0..6; Unity atlas top-row convention.','limitations':['Native shader extra glow not reconstructed','Drop/attraction behavior remains sandbox tuning']}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
(out/'source.json').write_text(json.dumps(clean({'particle':ps,'renderer':a.objects[2588].read_typetree(),'material':md,'pickupRaw':a.objects[3389].get_raw_data().hex()}),indent=2,allow_nan=False))
print(json.dumps(manifest))
