"""Extract enums and class field layouts from Il2CppDumper dump.cs into JSON.
Usage: python tools/extract_dump_schema.py <dump.cs> <outdir>
Evidence tier: serialized type layout only (names/offsets/consts/enum values). No runtime behaviour."""
import re,sys,json,hashlib
from pathlib import Path
src=Path(sys.argv[1]); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
text=src.read_text(encoding='utf-8',errors='replace').split('\n')
ENUMS=['EStatModifyType','EItemRarity','EElement','EAmplificationMode','EStatCategory','EPassive','EMapType','EWaveType','ETimelineEvent','ECharacter','EEnemy','EMap','EStat','ERarity','EItem','ETome','EWeapon','EStatusEffect','EEncounter','ETier','EStage']
CLASSES=['StageData','MapData','EnemyData','EnemyWave','CharacterData','ItemData','WeaponData','TomeData','EnemySpawner','EnemyManager','EnemyStats','PlayerXp','PickupManager','PlayerStatsNew','StatsConstants','AudioManager','ChestOpening','InteractableChest','InteractableShrineGreed','InteractableShrineMagnet','InteractableShrineChallenge','InteractableShrineCursed','InteractableShrineBalance','InteractableShrineMoai','InteractablePot','BossSummoner','BossOrb','SpawnPlayerPortal','DeathScreen','DeathPP','LowHpUi','PlayerEffects','PlayerRenderer','PlayerHealth','HealthUI','DamageNumbers','CameraShakerController','PlayerMovement','PlayerMovementValues','PlayerInput','MyPlayer','BanishItem','UpgradeButton','ShrineLogs','DamageContainer']
head=re.compile(r'^(?:\[.*\]\s*)?(?:public|internal|private|protected)?[a-z ]*?(class|enum|struct) ([A-Za-z0-9_<>.]+)(?: : [^/]*)? // TypeDefIndex: (\d+)')
res={'source':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'enums':{},'classes':{}}
i=0;n=len(text)
while i<n:
    m=head.match(text[i])
    if m and (m.group(2) in ENUMS or m.group(2) in CLASSES):
        kind,name,idx=m.groups(); i+=2; body=[]
        while i<n and text[i]!='}': body.append(text[i]); i+=1
        if kind=='enum':
            vals=[]
            for l in body:
                e=re.match(r'\s*public const \w+ (\w+) = (-?\d+);',l)
                if e: vals.append([e.group(1),int(e.group(2))])
            res['enums'][name]={'typeDefIndex':int(idx),'values':vals}
        elif name not in res['classes']:
            fields=[];methods=[];last=None
            for l in body:
                f=re.match(r'\s*(public|private|protected|internal)( static| const| readonly)* ([\w<>\[\],. ]+?) (\w+)(?: = ([^;]+))?;(?: // (0x[0-9A-F]+))?',l)
                if f and '(' not in l:
                    fields.append({'access':f.group(1),'mod':(f.group(2) or '').strip(),'type':f.group(3),'name':f.group(4),'const':f.group(5),'offset':f.group(6)})
                    continue
                r=re.match(r'\s*// RVA: (0x[0-9A-F]+)',l)
                if r: last=r.group(1); continue
                s=re.match(r'\s*(?:public|private|protected|internal)[\w ]* ([\w<>\[\],.]+) (\w+)\((.*)\) \{ \}',l)
                if s: methods.append({'rva':last,'ret':s.group(1),'name':s.group(2),'args':s.group(3)}); last=None
            res['classes'][name]={'typeDefIndex':int(idx),'fields':fields,'methods':methods}
    i+=1
(out/'dump_schema.json').write_text(json.dumps(res,indent=1),encoding='utf-8')
for k,v in res['enums'].items(): print(k,len(v['values']))
print('classes',len(res['classes']),[c for c in CLASSES if c not in res['classes']])
