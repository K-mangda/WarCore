"""Link every exported texture to how the game uses it, so a white/grey mask is never mistaken for the final picture.
Reads .local-evidence/unity-dump (no re-extraction). Output: <dump>/asset-index.json, one entry per texture:
  kind      picture | mask-white (tinted at runtime) | greyscale | normal-map | data/tiny | alpha-only
  usedBy    materials (with their colour properties and shader), UI Image/RawImage objects (with m_Color), sprites (rect, border, pivot)
Usage: python -I tools/build_asset_index.py [dump-dir]"""
from pathlib import Path
import sys,json
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
from PIL import Image
dump=Path(sys.argv[1] if len(sys.argv)>1 else '.local-evidence/unity-dump')
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
files=[d.name for d in sorted(dump.iterdir()) if (d/'objects.jsonl').exists()]
ext={}
for f in files:
    try:
        sf=next(iter(UnityPy.load(str(data/f)).files.values()));ext[f]=[f]+[Path(getattr(e,'path',str(e))).name for e in sf.externals]
    except Exception:ext[f]=[f]
objs={}
for f in files:
    for line in open(dump/f/'objects.jsonl',encoding='utf-8'):
        r=json.loads(line);objs[(f,r['pathID'])]=r
def ref(f,p):
    if not isinstance(p,dict) or not p.get('m_PathID'):return None
    i=p.get('m_FileID',0);names=ext.get(f,[f])
    return (names[i],p['m_PathID']) if i<len(names) else None
def classify(path):
    try:im=Image.open(path).convert('RGBA')
    except Exception:return 'unreadable'
    w,h=im.size
    if w*h<=16:return 'data/tiny'
    small=im.resize((min(w,32),min(h,32)));px=list(small.getdata())
    opaque=[p for p in px if p[3]>8]
    if not opaque:return 'alpha-only'
    grey=sum(1 for r,g,b,a in opaque if abs(r-g)<10 and abs(g-b)<10)/len(opaque)
    white=sum(1 for r,g,b,a in opaque if min(r,g,b)>235)/len(opaque)
    mr=sum(p[0] for p in opaque)/len(opaque);mg=sum(p[1] for p in opaque)/len(opaque);mb=sum(p[2] for p in opaque)/len(opaque)
    if abs(mr-128)<25 and abs(mg-128)<25 and mb>200 and grey<.3:return 'normal-map'
    if white>.9:return 'mask-white'
    if grey>.95:return 'greyscale'
    return 'picture'
index={}
for (f,pid),r in objs.items():
    if r['type']=='Texture2D':
        target=r.get('file') or r.get('duplicateOf')
        index[f'{f}#{pid}']={'name':r.get('name'),'size':r.get('size'),'png':target,'kind':classify(dump/target) if target else 'not-exported','usedBy':[]}
# Sampling settings straight from the game: the port must draw each texture the same way (Point = pixel-sharp, no smoothing).
FILTER={0:'point',1:'bilinear',2:'trilinear'};WRAP={0:'repeat',1:'clamp',2:'mirror',3:'mirror-once'}
FORMAT={1:'Alpha8 (lossless)',3:'RGB24 (lossless)',4:'RGBA32 (lossless)',5:'ARGB32 (lossless)',10:'DXT1/BC1 (block-compressed in the game itself)',12:'DXT5/BC3 (block-compressed in the game itself)',25:'BC7 (block-compressed in the game itself)'}
for f in files:
    try:env=UnityPy.load(str(data/f))
    except Exception:continue
    for o in env.objects:
        if o.type.name!='Texture2D' or f'{f}#{o.path_id}' not in index:continue
        try:
            r=o.read();ts=r.m_TextureSettings;fm=int(r.m_TextureFormat)
            index[f'{f}#{o.path_id}'].update(filter=FILTER.get(ts.m_FilterMode,ts.m_FilterMode),wrap=WRAP.get(ts.m_WrapU,ts.m_WrapU),mipmaps=getattr(r,'m_MipCount',1)>1,format=FORMAT.get(fm,str(fm)))
        except Exception:pass
def use(key,entry):
    k=f'{key[0]}#{key[1]}'
    if k in index and len(index[k]['usedBy'])<40:index[k]['usedBy'].append(entry)
go_name=lambda f,d:(objs.get(ref(f,d.get('m_GameObject')) or ('',0),{}).get('name'))
for (f,pid),r in objs.items():
    d=r.get('data')
    if not isinstance(d,dict):continue
    if r['type']=='Material':
        sp=d.get('m_SavedProperties',{});colors={k:[round(v.get(c,0),3) for c in 'rgba'] for k,v in sp.get('m_Colors',[]) if isinstance(v,dict)}
        shader=objs.get(ref(f,d.get('m_Shader')) or ('',0),{}).get('name')
        for prop,env in sp.get('m_TexEnvs',[]):
            t=ref(f,env.get('m_Texture'))
            if t:use(t,{'by':'material','name':d.get('m_Name'),'property':prop,'colors':colors,'shader':shader})
    elif r['type']=='Sprite':
        t=ref(f,d.get('m_RD',{}).get('texture'))
        if t:use(t,{'by':'sprite','name':d.get('m_Name'),'rect':d.get('m_Rect'),'border':d.get('m_Border'),'pivot':d.get('m_Pivot'),'pixelsToUnits':d.get('m_PixelsToUnits'),'png':r.get('file') or r.get('duplicateOf')})
    elif r['type']=='MonoBehaviour' and 'm_Color' in d and ('m_Texture' in d or 'm_Sprite' in d):
        color=[round(d['m_Color'].get(c,0),3) for c in 'rgba'];t=ref(f,d.get('m_Texture'))
        if not t and d.get('m_Sprite'):
            s=objs.get(ref(f,d['m_Sprite']) or ('',0))
            if s and isinstance(s.get('data'),dict):t=ref(ref(f,d['m_Sprite'])[0],s['data'].get('m_RD',{}).get('texture'))
        if t:use(t,{'by':'ui','object':go_name(f,d),'component':r.get('class'),'color':color,'imageType':d.get('m_Type')})
# Any script field that points at a texture or sprite (icons in WeaponData/ItemData, RawImage textures set from code, ...).
def walk(v,path,f,owner):
    if isinstance(v,dict):
        if 'm_PathID' in v and 'm_FileID' in v and len(v)==2:
            t=ref(f,v);o=objs.get(t) if t else None
            if o and o['type']=='Texture2D':use(t,{'by':'script-field','class':owner.get('class'),'object':owner.get('name') or go_name(f,owner['data']),'field':path})
            elif o and o['type']=='Sprite' and isinstance(o.get('data'),dict):
                tt=ref(t[0],o['data'].get('m_RD',{}).get('texture'))
                if tt:use(tt,{'by':'script-field','class':owner.get('class'),'object':owner.get('name') or go_name(f,owner['data']),'field':path,'sprite':o.get('name')})
            return
        for k,x in v.items():walk(x,f'{path}.{k}' if path else k,f,owner)
    elif isinstance(v,list):
        for x in v[:64]:walk(x,path+'[]',f,owner)
for (f,pid),r in objs.items():
    if r['type']=='MonoBehaviour' and isinstance(r.get('data'),dict) and not('m_Color' in r['data'] and ('m_Texture' in r['data'] or 'm_Sprite' in r['data'])):walk(r['data'],'',f,r)
kinds={}
for v in index.values():kinds[v['kind']]=kinds.get(v['kind'],0)+1
(dump/'asset-index.json').write_text(json.dumps(index,indent=0),encoding='utf-8')
unused=sum(1 for v in index.values() if not v['usedBy'])
filters={}
for v in index.values():filters[v.get('filter','?')]=filters.get(v.get('filter','?'),0)+1
print(len(index),'textures',kinds,'| filter',filters,'| no recorded user:',unused)
