"""Build the full decompile plan: every non-trivial method of every Assembly-CSharp class (TypeDefIndex 4606-5826 in dump.cs), minus library/input noise.
Priority order: weapons, tomes, enemies/bosses, interactables, items, then everything else. Usage: python -I tools/build_decompile_plan.py <out.json>"""
import re,sys,json
txt=open(r'C:\Users\Korawit\Desktop\megabonk_decompiled\dump.cs',encoding='utf-8',errors='ignore').read()
parts=re.split(r'\n(?=(?:public |internal |private )?(?:sealed |abstract |static )*(?:class|struct) )',txt)
tiers=[('weapon',r'^(Weapon\w*|\w*Weapon|\w*Projectile\w*|\w*Aura\w*)$'),('tome',r'^(Tome\w*|\w*Tome\w*|UpgradeData|Upgrade\w*)$'),
 ('enemy',r'^(Enemy\w*|Boss\w*|\w*Boss|Ent\w*|Pharaoh\w*|GhostKing\w*|\w*Spawner\w*)$'),('interact',r'^(Interactable\w*|Chest\w*|Shrine\w*|\w*Shrine|\w*Chest|Pot\w*|Pickup\w*|\w*Portal\w*|Quest\w*)$'),('item',r'^(Item[A-Z]\w*)$')]
noise=re.compile(r'(Template|Rewired|Glyph|UserDataStore|HOTAS|Steam|Leaderboard|ControllerMap|ControllerElement|InputModule|Joystick|Gamepad|^pg_|^[a-zA-Z]{26,}$|ExternalTools|UnityUITextMeshPro)',re.I)
rows={t[0]:[] for t in tiers};rows['game']=[]
for p in parts:
    m=re.match(r'(?:public |internal |private )?(?:sealed |abstract |static )*(?:class|struct) (\w+)',p)
    t=re.search(r'TypeDefIndex: (\d+)',p)
    if not m or not t or not(4606<=int(t.group(1))<5827):continue
    name=m.group(1)
    if noise.search(name):continue
    tier=next((k for k,rx in tiers if re.match(rx,name)),'game')
    for rva,off,meth in re.findall(r'// RVA: 0x([0-9A-F]+) Offset: 0x([0-9A-F]+) VA: \w+(?: Slot: \d+)?\n\t(?:public|private|protected|internal)[^\n]*? (\w+)\(',p):
        if re.match(r'(get_|set_|add_|remove_)',meth):continue
        rows[tier].append({'label':f'{tier}__{name}.{meth}_{rva}','rva':rva,'offset':off})
# IL2CPP shares one body between many methods (same RVA): decompile each RVA once, keep the other names as aliases.
plan=[];by_rva={}
for k in [t[0] for t in tiers]+['game']:
    for x in rows[k]:
        if x['rva'] in by_rva:by_rva[x['rva']].setdefault('aliases',[]).append(x['label'])
        else:by_rva[x['rva']]=x;plan.append(x)
json.dump(plan,open(sys.argv[1],'w'))
print({k:len(v) for k,v in rows.items()},'methods',sum(len(v) for v in rows.values()),'unique functions',len(plan))
