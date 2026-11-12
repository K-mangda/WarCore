"""Read XpPickup's serialized tier colors without starting the game."""
from pathlib import Path
import UnityPy,struct,json
from UnityPy.classes.PPtr import PPtr
root=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
env=UnityPy.load(str(root/'sharedassets2.assets'));asset=next(iter(env.files.values()))
assert asset.objects[872].read().m_Name=='XpPickup'
raw=asset.objects[3096].get_raw_data()
script=PPtr(m_FileID=struct.unpack_from('<i',raw,16)[0],m_PathID=struct.unpack_from('<q',raw,20)[0],assetsfile=asset).read()
assert script.m_ClassName=='XpVisuals' and len(raw)==120
assert struct.unpack_from('<I',raw,28)[0]==0
# Header 32 + ParticleSystem PPtr 12 + Pickup PPtr 12; then four RGBA colors.
colors={name:struct.unpack_from('<4f',raw,56+i*16) for i,name in enumerate(['low','medium','high','echo'])}
print(json.dumps({'file':'sharedassets2.assets','prefab':872,'component':3096,'colors':colors},indent=2))
