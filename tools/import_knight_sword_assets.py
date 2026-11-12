"""Export verified Knight starting Sword (EWeapon2), distinct from HeroSword27.

Run locally with python tools/import_knight_sword_assets.py. No game execution/upload.
"""
from pathlib import Path
import hashlib
import json
import shutil
import struct
import wave
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler

root = Path(__file__).resolve().parents[1]
game = Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out = root / 'public/weapons/knight-sword'
for folder in ['audio', 'vfx/textures', 'metadata/raw']:
    (out / folder).mkdir(parents=True, exist_ok=True)
env = UnityPy.load(str(game / 'sharedassets1.assets'))
asset = next(iter(env.files.values()))
objects = asset.objects


def save(path, data):
    (out / path).write_text(json.dumps(data, indent=2), encoding='utf-8')


def source(pid):
    return {'assetFile': 'sharedassets1.assets', 'pathId': pid, 'type': objects[pid].type.name}


def mono(pid, expected):
    obj = objects[pid]
    name = obj.read(check_read=False).m_Script.read().m_ClassName
    assert name == expected, (pid, name)
    b = obj.get_raw_data()
    save(f'metadata/raw/{pid}.json', {'source': source(pid), 'scriptClass': name, 'hex': b.hex(), 'byteLength': len(b)})
    return b


knight = mono(7823, 'CharacterData')
sword = mono(8633, 'WeaponData')
assert struct.unpack_from('<iq', knight, 316) == (0, 8633)
assert struct.unpack_from('<i', sword, 212)[0] == 2
assert struct.unpack_from('<iq', sword, 332) == (0, 4144)
scripts = {pid: mono(pid, cls) for pid, cls in [(8885, 'ProjectileMelee'), (9400, 'RandomSfx'), (8916, 'PlaySfxOnEnable'), (9003, 'AudioSpamFilter'), (9343, 'ParticleOpacity'), (8928, 'WeaponAttack')]}
assert struct.unpack_from('<iq', scripts[8928], 32) == (0, 3436)
trees = {}
for pid in [3436, 4516, 7070, 7165, 6669, 428, 4144]:
    trees[pid] = objects[pid].read_typetree()
    save(f'metadata/raw/{pid}.json', {'source': source(pid), 'data': trees[pid]})
for pid, file in [(704, 'Atlas03.png'), (1315, 'Sword_Icon.png')]:
    texture = objects[pid].read()
    texture.image.save(out / 'vfx/textures' / file)

quad = objects[7165].read().m_Mesh.read()
assert quad.m_Name == 'Quad'
mesh = MeshHandler(quad)
mesh.process()
save('slash-mesh.json', {
    'source': {'assetFile': 'Library/unity default resources', 'pathId': 10210, 'name': 'Quad'},
    'positions': [v for x, y, z in mesh.m_Vertices for v in [-x, y, z]],
    'uv': [v for uv in mesh.m_UV0 for v in uv[:2]],
    'indices': [i for sub in mesh.get_triangles() for tri in sub for i in reversed(tri)],
    'coordinateConversion': 'NegateX/reverseTriangleWinding, native scale unchanged.',
})
particle = trees[7070]
save('particle.json', {
    'source': source(7070), 'initialModule': particle['InitialModule'], 'uvModule': particle['UVModule'],
    'colorModule': particle['ColorModule'], 'sizeModule': particle['SizeModule'],
    'duration': particle['lengthInSec'],
    'material': {'source': source(428), 'textureFile': 'vfx/textures/Atlas03.png', 'extraGlow': dict(trees[428]['m_SavedProperties']['m_Floats'])['_ExtraGlow'], 'tint': dict(trees[428]['m_SavedProperties']['m_Colors'])['_Tint']},
})
save('metadata/particles.json', [{
    'source': source(7070), 'renderer': source(7165),
    'duration': particle['lengthInSec'], 'loop': particle['looping'],
    'initialModule': particle['InitialModule'], 'uvModule': particle['UVModule'],
    'colorModule': particle['ColorModule'], 'sizeModule': particle['SizeModule'],
    'rotationModule': particle['RotationModule'], 'emissionModule': particle['EmissionModule'],
    'fullData': 'metadata/raw/7070.json', 'fullRendererData': 'metadata/raw/7165.json',
    'mesh': 'slash-mesh.json', 'materialPathIds': [428],
}])
shader = objects[1948].read().m_ParsedForm
passes = []
for sub in shader.m_SubShaders:
    for p in sub.m_Passes:
        state = p.m_State
        passes.append({'name': state.m_Name, 'srcBlend': state.rtBlend0.srcBlend.val, 'dstBlend': state.rtBlend0.destBlend.val, 'zWrite': state.zWrite.val, 'culling': state.culling.val})
save('metadata/material.json', {
    'source': source(428), 'name': trees[428]['m_Name'],
    'shader': {'source': source(1948), 'name': shader.m_Name, 'passes': passes},
    'savedProperties': trees[428]['m_SavedProperties'],
    'texture': {'source': source(704), 'name': objects[704].read().m_Name, 'file': 'vfx/textures/Atlas03.png'},
    'unverified': 'Compiled shader glow equation not reconstructed. Pass state is source-backed, not inferred from unused saved properties.',
})
random = scripts[9400]
spam = scripts[9003]
assert len(random) == 76 and len(spam) == 72
assert struct.unpack_from('<q', random, 40)[0] == 2119
clip = objects[2119].read()
assert clip.m_Name == 'SwordSwing'
audio_file = out / 'audio/SwordSwing.wav'
audio_origin = 'DirectUnityPyAudioClipDecode'
try:
    samples = list(clip.samples.values())
    assert len(samples) == 1
    audio_file.write_bytes(samples[0])
except Exception as error:
    previous = Path(r'C:\Users\Korawit\Desktop\WarCore\public\audio\megabonk\SwordSwing.wav')
    shutil.copyfile(previous, audio_file)
    audio_origin = f'Existing local Unity WAV export: {previous}; direct decode failed {type(error).__name__}. Native compressed waveform not independently compared.'
with wave.open(str(audio_file)) as wav:
    validation = {'channels': wav.getnchannels(), 'rate': wav.getframerate(), 'sampleWidth': wav.getsampwidth(), 'frames': wav.getnframes()}
save('metadata/audio.json', {
    'source': source(6669), 'clip': {'source': source(2119), 'name': clip.m_Name, 'file': 'audio/SwordSwing.wav'},
    'volume': trees[6669]['m_Volume'], 'pitch': trees[6669]['m_Pitch'], 'loop': trees[6669]['Loop'],
    'spatialBlendCurve': trees[6669]['panLevelCustomCurve'],
    'randomSfx': {'source': source(9400), 'serializedMaxPitch': struct.unpack_from('<f', random, 48)[0], 'serializedMinPitch': struct.unpack_from('<f', random, 52)[0], 'randomVolume': struct.unpack_from('<f', random, 56)[0], 'playOnAwake': bool(random[72])},
    'spamFilter': {'source': source(9003), **{name: struct.unpack_from('<f', spam, offset)[0] for name, offset in [('spamDelay', 56), ('minVolumeMultiplier', 60), ('maxInterval', 64), ('overrideMinInterval', 68)]}},
    'unverified': 'Native RandomSfx/AudioSpamFilter algorithms unknown. Keep serialized field names despite reversed min/max values; distribution/order not inferred.',
    'exportOrigin': audio_origin, 'validation': validation,
})
save('provenance.json', {
    'identity': {'character': {'name': 'Knight', 'source': source(7823), 'weaponPPtrOffset': 316, 'weaponPathId': 8633}, 'weapon': {'name': 'WeaponSword', 'source': source(8633), 'enumOffset': 212, 'eWeapon': 2, 'attackPPtrOffset': 332, 'attackPathId': 4144}, 'attackComponent': {'source': source(8928), 'projectilePPtrOffset': 32, 'projectilePathId': 3436}, 'projectile': source(3436)},
    'notHeroSword': {'wrongPreviousWeaponData': 8622, 'wrongPreviousEWeapon': 27, 'wrongPreviousTexture': 930, 'wrongPreviousParticle': 7039},
    'sourceGameData': str(game), 'unityVersion': asset.unity_version, 'unityPyVersion': UnityPy.__version__,
    'audioOrigin': audio_origin,
    'hashes': {str(p.relative_to(out)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name != 'provenance.json'},
    'limitations': ['Native attack motion, opacity controller behavior and damage collision not reconstructed.', 'No live game comparison performed.'],
})
print(json.dumps({'output': str(out), 'weaponEnum': 2, 'particle': 7070, 'uvRow': particle['UVModule']['rowIndex'], 'startSize': particle['InitialModule']['startSize']['scalar'], 'audio': clip.m_Name}))
