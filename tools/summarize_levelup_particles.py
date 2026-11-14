"""Summarise the level-up screen effects (output of read_levelup_screen.py) into compact JSON + resolve materials/textures.
Usage: python -I tools/summarize_levelup_particles.py <levelup-screen.json> <out.json> [texture-out-dir]"""
from pathlib import Path
import sys,json
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import UnityPy
src=json.load(open(sys.argv[1],encoding='utf-8'));out=Path(sys.argv[2]);texdir=Path(sys.argv[3]) if len(sys.argv)>3 else None
env=UnityPy.load(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data\level2')
byid={o.path_id:o for o in env.objects}
def mm(v):
    if v is None:return None
    state=v['minMaxState'];s=v['scalar'];lo=v['minScalar']
    if state==0:return s
    if state==3:return [lo,s]
    curve=v['maxCurve']['m_Curve']
    return {'curve':[(round(k['time'],3),round(k['value'],3)) for k in curve],'scalar':s} if state==1 else {'curves':True,'scalar':s,'min':lo}
def rgba(c):return [round(c[k],3) for k in('r','g','b','a')]
def grad(g):
    n=g['m_NumColorKeys'];m=g['m_NumAlphaKeys']
    return {'colors':[(round(g[f'ctime{i}']/65535,3),rgba(g[f'key{i}'])[:3]) for i in range(n)],'alphas':[(round(g[f'atime{i}']/65535,3),round(g[f'key{i}']['a'],3)) for i in range(m)]}
def color(v):
    state=v['minMaxState']
    if state==0:return rgba(v['maxColor'])
    if state==2:return {'between':[rgba(v['minColor']),rgba(v['maxColor'])]}
    return {'gradient':grad(v['maxGradient'])}
def material(ref):
    try:m=ref.read()
    except Exception:return None
    info={'name':m.m_Name,'shader':None,'textures':{}}
    try:info['shader']=m.m_Shader.read().m_ParsedForm.m_Name
    except Exception:
        try:info['shader']=m.m_Shader.read().m_Name
        except Exception:pass
    envs=m.m_SavedProperties.m_TexEnvs
    for k,v in (envs.items() if hasattr(envs,'items') else envs):
        try:
            t=v.m_Texture.read();info['textures'][k]={'name':t.m_Name,'size':[t.m_Width,t.m_Height]}
            if texdir:
                texdir.mkdir(parents=True,exist_ok=True);t.image.save(texdir/f'{t.m_Name}.png')
        except Exception as e:
            if v.m_Texture.path_id:info['textures'][k]={'error':str(e)[:80]}
    try:cols=m.m_SavedProperties.m_Colors;info['colors']={k:rgba({'r':c.r,'g':c.g,'b':c.b,'a':c.a}) for k,c in (cols.items() if hasattr(cols,'items') else cols) if k in('_Color','_TintColor','_BaseColor')}
    except Exception:pass
    return info
def system(node):
    comp={c.get('type','?'):c.get('data') for c in node['components']}
    out={'name':node['name'],'path':None}
    ps=comp.get('ParticleSystem')
    if ps:
        i=ps['InitialModule'];e=ps['EmissionModule'];sh=ps['ShapeModule']
        out['system']={'duration':ps['lengthInSec'],'looping':bool(ps['looping']),'prewarm':bool(ps['prewarm']),'speed':ps['simulationSpeed'],'startDelay':mm(ps['startDelay']),
            'startLifetime':mm(i['startLifetime']),'startSpeed':mm(i['startSpeed']),'startSize':mm(i['startSize']),'startColor':color(i['startColor']),'gravity':mm(i.get('gravityModifier')),
            'maxParticles':i.get('maxNumParticles'),'rateOverTime':mm(e['rateOverTime']),
            'bursts':[{'time':round(b['time'],3),'count':mm(b['countCurve']),'cycles':b['cycleCount'],'interval':round(b['repeatInterval'],3)} for b in e.get('m_Bursts',[])],
            'shape':{'enabled':bool(sh['enabled']),'type':sh['type'],'angle':sh['angle'],'radius':sh.get('radius'),'rotation':sh['m_Rotation'],'scale':sh['m_Scale']},
            'sizeOverLifetime':(mm(ps['SizeModule']['curve']) if ps['SizeModule']['enabled'] else None),
            'rotationOverLifetime':(mm(ps['RotationModule']['curve']) if ps['RotationModule']['enabled'] else None),
            'colorOverLifetime':(grad(ps['ColorModule']['gradient']['maxGradient']) if ps['ColorModule']['enabled'] else None),
            'velocityOverLifetimeY':(mm(ps['VelocityModule']['y']) if ps['VelocityModule']['enabled'] else None),
            'textureSheet':({'mode':ps['UVModule']['mode'],'tilesX':ps['UVModule'].get('tilesX'),'tilesY':ps['UVModule'].get('tilesY'),'frameOverTime':mm(ps['UVModule']['frameOverTime']),'fps':ps['UVModule']['fps']} if ps['UVModule']['enabled'] else None),
            'subEmitters':[s['emitter']['m_PathID'] for s in ps['SubModule']['subEmitters']] if ps['SubModule']['enabled'] else []}
    rid=next((c.get('pathID') for c in node['components'] if c.get('type')=='ParticleSystemRenderer'),None)
    r=comp.get('ParticleSystemRenderer')
    if r and rid in byid:
        out['renderer']={'renderMode':r.get('m_RenderMode'),'sortingOrder':r.get('m_SortingOrder'),'minSize':r.get('m_MinParticleSize'),'maxSize':r.get('m_MaxParticleSize'),'materials':[material(ref) for ref in byid[rid].read().m_Materials]}
    tr=comp.get('Transform') or comp.get('RectTransform')
    if tr:out['transform']={'position':tr.get('m_LocalPosition'),'rotation':tr.get('m_LocalRotation'),'scale':tr.get('m_LocalScale')}
    out['children']=[system(c) for c in node['children']]
    return out
result={name:system(node) for name,node in src['objects'].items() if node}
out.write_text(json.dumps(result,indent=1,default=str),encoding='utf-8')
print('ok',list(result))
