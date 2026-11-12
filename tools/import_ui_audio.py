"""Extract real UI textures/fonts and validate locally exported original WAVs."""
from pathlib import Path
import UnityPy,json,hashlib,shutil,wave

root=Path(__file__).resolve().parents[1]
game=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
ui=root/'public/game-ui';ui.mkdir(parents=True,exist_ok=True)
audio=root/'public/game-audio';audio.mkdir(parents=True,exist_ok=True)
wanted={'BorderWindow','BorderNew','BorderOnly','MyButtonNew','MyButtonOverlay','WOOD_1A','MegabonkLogo','icon_health','icon_coin','Firestaff','DamageTome','CooldownTome','QuantityTome','Fox'}
records=[];found=set()
for file in ['sharedassets0.assets','sharedassets1.assets']:
    env=UnityPy.load(str(game/file))
    for obj in env.objects:
        if obj.type.name=='Texture2D':
            data=obj.read()
            if data.m_Name not in wanted:continue
            data.image.save(ui/(data.m_Name+'.png'));found.add(data.m_Name)
            records.append({'name':data.m_Name,'file':file,'pathId':obj.path_id,'type':'Texture2D','size':[data.m_Width,data.m_Height]})
        elif obj.type.name=='Font':
            data=obj.read()
            if data.m_Name not in {'alagard','NotoSansThai_Condensed-Bold'}:continue
            (ui/(data.m_Name+'.ttf')).write_bytes(bytes(data.m_FontData))
            records.append({'name':data.m_Name,'file':file,'pathId':obj.path_id,'type':'Font','bytes':len(data.m_FontData)})
        elif obj.type.name=='Sprite':
            data=obj.read()
            if data.m_Name not in wanted:continue
            border=data.m_Border
            records.append({'name':data.m_Name,'file':file,'pathId':obj.path_id,'type':'Sprite','border':{'left':border.x,'bottom':border.y,'right':border.z,'top':border.w}})
missing=wanted-found
if missing:raise RuntimeError('Missing UI textures: '+str(missing))
source=Path(r'C:\Users\Korawit\Desktop\WarCore\public\audio\megabonk')
names=['MenuClick','menuMove','retro_shoot_fireball3','Xp2','Levelup3','PlayerDamage','DeathImpact','Player_Jump','Player_Landing','Bonk']
sound_records=[]
for name in names:
    path=source/(name+'.wav')
    with wave.open(str(path),'rb') as clip:
        duration=clip.getnframes()/clip.getframerate()
        assert duration>0
        sound_records.append({'name':name,'duration':duration,'rate':clip.getframerate(),'channels':clip.getnchannels(),'source':'Existing Unity AudioClip WAV export'})
    shutil.copy2(path,audio/path.name)
(ui/'provenance.json').write_text(json.dumps({'assets':records,'hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ui.iterdir() if p.suffix in ['.png','.ttf']}},indent=2),encoding='utf-8')
(audio/'provenance.json').write_text(json.dumps({'sounds':sound_records,'hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in audio.glob('*.wav')}},indent=2),encoding='utf-8')
print(json.dumps({'ui':records,'audio':sound_records}))
