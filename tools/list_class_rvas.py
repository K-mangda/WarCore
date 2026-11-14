"""List method RVAs per class group from dump.cs. Usage: python -I tools/list_class_rvas.py <out.json>"""
import re,sys,json
txt=open(r'C:\Users\Korawit\Desktop\megabonk_decompiled\dump.cs',encoding='utf-8',errors='ignore').read()
parts=re.split(r'\n(?=(?:public |internal |private )?(?:sealed |abstract |static )*(?:class|struct) )',txt)
groups={'weapon':r'^(Weapon\w*|\w*Weapon|\w*Projectile\w*|\w*Aura\w*)$','enemy':r'^(Enemy\w*|Boss\w*|\w*Boss|Ent\w*|Pharaoh\w*|GhostKing\w*|\w*Spawner\w*)$','tome':r'^(Tome\w*|\w*Tome\w*|UpgradeData|Upgrade\w*)$','item':r'^(Item[A-Z]\w*)$','interact':r'^(Interactable\w*|Chest\w*|Shrine\w*|\w*Shrine|\w*Chest|Pot\w*|Pickup\w*|\w*Portal\w*|Quest\w*)$'}
res={k:{} for k in groups}
for p in parts:
    m=re.match(r'(?:public |internal |private )?(?:sealed |abstract |static )*(?:class|struct) (\w+)',p)
    if not m:continue
    name=m.group(1)
    methods=re.findall(r'// RVA: 0x([0-9A-F]+) Offset: \w+ VA: \w+(?: Slot: \d+)?\n\t(?:public|private|protected|internal)[^\n]*? (\w+)\(',p)
    for g,rx in groups.items():
        if re.match(rx,name) and methods:res[g][name]=methods
json.dump(res,open(sys.argv[1],'w'),indent=0)
for g,v in res.items():print(g,len(v),'classes',sum(len(x) for x in v.values()),'methods')
