"""Build compact evidence tables from read_game_data.py output + dump_schema.json.
Usage: python tools/build_rea_tables.py <game-data.json> <docs/rea>"""
import json,sys
from pathlib import Path
gd=json.load(open(sys.argv[1],encoding='utf-8')); out=Path(sys.argv[2])
schema=json.load(open(out/'dump_schema.json',encoding='utf-8'))
en={k:{v:n for n,v in schema['enums'][k]['values']} for k in schema['enums']}
en.update({'ETimelineEvent':{0:'AddEnemyCard',1:'MiniBoss',2:'Swarm'},'EWaveType':{0:'Normal',1:'Swarm',2:'Boss',3:'FinalSwarm'}})
rec=lambda c:[r for r in gd['records'] if r['class']==c]
byid={(r['file'],r['pathID']):r for r in gd['records']}
def ref(file,p):
    r=byid.get((file,p['m_PathID'])) if p and p.get('m_FileID')==0 else None
    return {'pathID':p['m_PathID'],'name':r['name'] if r else None}
def flags(v,e):
    return [n for x,n in en[e].items() if x and v&x==x] if v else []
enemies=[]
for r in rec('EnemyData'):
    d=r['data']
    enemies.append({'source':f"{r['file']}#{r['pathID']}",'name':r['name'],'enemy':en['EEnemy'].get(d['enemyName'],d['enemyName']),
        'hp':d['hp'],'damage':d['damage'],'shield':d['shield'],'speed':d['speed'],'mass':d['mass'],'knockbackResistance':d['knockbackResistance'],
        'xp':d['xp'],'creditCost':d['creditCost'],'minStage':d['minStage'],'canSpawnAfterTime':d['canSpawnAfterTime'],'maps':flags(d['maps'],'EMap'),'mapsRaw':d['maps'],
        'isFlying':bool(d['isFlying']),'isRunningFromPlayer':bool(d['isRunningFromPlayer']),'stayDistance':[d['minStayAtDistance'],d['maxStayAtDistance']],'teleportCooldown':d['teleportCooldown'],
        'canBeElite':bool(d['canBeElite']),'canBeExecuted':bool(d['canBeExecuted']),'isPoison':bool(d['isPoison']),'nukeProtection':bool(d['nukeProtection']),'despawnTime':d['despawnTime'],'maxSuckTime':d['maxSuckTime'],
        'colliderRadius':d['colliderRadius'],'overrideHeight':d['overrideHeight'],'rendererScale':d['rendererScale'],
        'specialAttackCount':len(d['specialAttacks']),'specialAttacks':d['specialAttacks'],
        'animation':ref(r['file'],d['animation']),'material':ref(r['file'],d['material'])})
enemies.sort(key=lambda e:str(e['enemy']))
(out/'enemies.json').write_text(json.dumps(enemies,indent=1,ensure_ascii=False),encoding='utf-8')
stages=[]
for r in rec('StageData'):
    d=r['data'];t=d['stageTimeline']
    nm=lambda ids:[en['EEnemy'].get(i,i) for i in ids]
    stages.append({'source':f"{r['file']}#{r['pathID']}",'name':r['name'],'stageTime':t['stageTime'],'checkNewEnemyInterval':t['checkNewEnemyInterval'],
        'startEnemies':nm(t['startEnemies']),'minibosses':nm(t['minibosses']),'boss':ref(r['file'],t['boss']),
        'events':[{'event':en['ETimelineEvent'].get(ev['eTimelineEvent']),'enemies':nm(ev['enemies']),'timeMinutes':ev['timeMinutes'],'duration':ev['duration']} for ev in t['events']],
        'isWaterDamage':bool(d['isWaterDamage']),'fog':[d['fogIntensity'],d['fogColor']],'farClipPlane':d['farClipPlane']})
(out/'stages.json').write_text(json.dumps(stages,indent=1,ensure_ascii=False),encoding='utf-8')
print(len(enemies),'enemies',len(stages),'stages')
