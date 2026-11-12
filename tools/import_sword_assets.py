"""Rebuild local sword media and evidence from installed Unity assets.

Run: python tools/import_sword_assets.py [--game PATH] [--package PATH]
Does not run the game, modify the external extraction package or upload assets.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import struct
import wave

import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--game', type=Path, default=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data'))
parser.add_argument('--package', type=Path, default=Path(r'C:\Users\Korawit\Desktop\megabonk_extracted_assets'))
args = parser.parse_args()
out = Path(__file__).resolve().parents[1] / 'public/weapons/sword'
for folder in ['audio', 'vfx/textures', 'vfx/models', 'metadata/raw']:
    (out / folder).mkdir(parents=True, exist_ok=True)
env = UnityPy.load(str(args.game / 'sharedassets1.assets'))
asset = next(iter(env.files.values()))
objects = asset.objects


def write_json(path, value):
    (out / path).write_text(json.dumps(value, indent=2, ensure_ascii=False), encoding='utf-8')


def source(path_id):
    return {'assetFile': 'sharedassets1.assets', 'pathId': path_id, 'type': objects[path_id].type.name}


def raw_tree(path_id):
    tree = objects[path_id].read_typetree()
    write_json(f'metadata/raw/{path_id}.json', {'source': source(path_id), 'data': tree})
    return tree


# Retain complete native particle modules, including curves and UV animation.
trees = {pid: raw_tree(pid) for pid in [4107, 3180, 5162, 4753, 6883, 7039, 7255, 7227, 6741, 429]}
for pid in [615, 930]:
    texture = objects[pid].read()
    texture.image.save(out / 'vfx/textures' / ('HeroSword_Icon.png' if pid == 615 else 'atlas03_Custom.png'))

# Re-extract sound and raw mesh directly; retain GLB as an explicitly converted artifact.
clip = objects[2112].read()
audio_copy = args.package / 'weapons/sword/audio/HeroSwordAttack.wav'
shutil.copyfile(audio_copy, out / 'audio/HeroSwordAttack.wav')
mesh = objects[1853].read()
(out / 'vfx/models/Sword.obj').write_text(mesh.export(), encoding='utf-8')
glb_source = args.package / 'weapons/sword/vfx/models/Sword.glb'
glb = glb_source.read_bytes()
assert struct.unpack_from('<III', glb) == (0x46546C67, 2, len(glb)), 'Invalid package GLB'
shutil.copyfile(glb_source, out / 'vfx/models/Sword.glb')

# The slash renderer uses Unity's built-in Quad, NOT the Sword weapon mesh.
quad = objects[7255].read().m_Mesh.read()
assert quad.m_Name == 'Quad'
(out / 'vfx/models/SlashQuad.obj').write_text(quad.export(), encoding='utf-8')
handler = MeshHandler(quad)
handler.process()
write_json('slash-mesh.json', {
    'source': {'assetFile': 'Library/unity default resources', 'pathId': 10210, 'name': 'Quad'},
    'coordinateConversion': 'Unity left-handed to Three right-handed: negate X and reverse triangle winding; unchanged scale.',
    'positions': [v for x, y, z in handler.m_Vertices for v in [-x, y, z]],
    'uv': [v for uv in handler.m_UV0 for v in uv[:2]],
    'indices': [i for submesh in handler.get_triangles() for tri in submesh for i in reversed(tri)],
})

# MonoBehaviours have no usable typetree in this build. Preserve exact bytes,
# and decode serialized public fields using dump.cs declarations, not heap offsets.
script_records = {}
for pid in [9591, 9607]:
    data = objects[pid].get_raw_data()
    script_records[pid] = {'source': source(pid), 'byteLength': len(data), 'hex': data.hex()}
    write_json(f'metadata/raw/{pid}.json', script_records[pid])
spam = objects[9591].get_raw_data()
random = objects[9607].get_raw_data()
assert len(spam) == 72 and len(random) == 76, 'Serialized script layout changed; recheck field offsets'


def f32(data, offset):
    return struct.unpack_from('<f', data, offset)[0]


audio_source = trees[6741]
audio = {
    'source': source(6741),
    'volume': audio_source['m_Volume'], 'pitch': audio_source['m_Pitch'],
    'loop': audio_source['Loop'], 'audioSourcePlayOnAwake': audio_source['m_PlayOnAwake'],
    'mixerGroup': audio_source['OutputAudioMixerGroup'],
    'spatialBlendCurve': audio_source['panLevelCustomCurve'],
    'randomSfx': {
        'source': source(9607), 'clipPathId': struct.unpack_from('<q', random, 40)[0],
        'serializedFields': [
            {'nameFromDump': 'maxPitch', 'offset': 48, 'value': f32(random, 48)},
            {'nameFromDump': 'minPitch', 'offset': 52, 'value': f32(random, 52)},
            {'nameFromDump': 'randomVolume', 'offset': 56, 'value': f32(random, 56)},
        ],
        'playOnAwake': bool(random[72]),
        'warning': 'Serialized maxPitch is lower than minPitch. Preserve source labels; runtime use/order requires native method inspection. randomVolume distribution is also unverified.',
    },
    'spamFilter': {
        'source': source(9591),
        'serializedFields': [
            {'nameFromDump': name, 'offset': offset, 'value': f32(spam, offset)}
            for name, offset in [('spamDelay', 56), ('minVolumeMultiplier', 60), ('maxInterval', 64), ('overrideMinInterval', 68)]
        ],
        'warning': 'Serialized values only. Native OnEnable/FindVolumeMultiplier implementation is not reconstructed; do not replace it with a guessed hard cooldown.',
    },
    'fieldEvidence': 'megabonk_decompiled/dump.cs AudioSpamFilter line329422 and RandomSfx line329663, interpreted serialized public field order; raw bytes retained alongside.',
}
write_json('metadata/audio.json', audio)
material = trees[429]
write_json('metadata/material.json', {
    'source': source(429), 'name': material['m_Name'], 'shader': material['m_Shader'],
    'savedProperties': material['m_SavedProperties'],
    'verified': 'Saved SrcBlend=One, DstBlend=Zero and ZWrite=1; these are material properties, not proof of actual shader pass state.',
    'unverified': 'Shader pass blend/depth state and custom glow equation are not reconstructed. AdditiveBlending and depthWrite=false are not confirmed native equivalents.',
})
particle_records = []
for pid, renderer in [(6883, 7255), (7039, 7227)]:
    tree = trees[pid]
    particle_records.append({
        'source': source(pid), 'renderer': source(renderer),
        'fullData': f'metadata/raw/{pid}.json', 'fullRendererData': f'metadata/raw/{renderer}.json',
        'duration': tree['lengthInSec'], 'loop': tree['looping'],
        'initialModule': tree['InitialModule'], 'uvModule': tree['UVModule'],
        'mesh': {'name': 'Quad', 'fileId': 3, 'pathId': 10210, 'externalAsset': 'Library/unity default resources', 'export': 'vfx/models/SlashQuad.obj', 'geometry': 'slash-mesh.json'},
        'materialPathIds': [ref['m_PathID'] for ref in trees[renderer]['m_Materials']],
    })
write_json('metadata/particles.json', particle_records)

with wave.open(str(out / 'audio/HeroSwordAttack.wav')) as sound:
    audio_info = {'channels': sound.getnchannels(), 'sampleWidth': sound.getsampwidth(), 'rate': sound.getframerate(), 'frames': sound.getnframes()}
for image_path in (out / 'vfx/textures').glob('*.png'):
    with Image.open(image_path) as image:
        image.load()
write_json('provenance.json', {
    'sourceGameData': str(args.game), 'unityVersion': asset.unity_version,
    'unityPyVersion': UnityPy.__version__,
    'directExports': [source(pid) for pid in [615, 930, 1853]],
    'convertedGlb': {'copiedFrom': str(glb_source), 'note': 'Package Blender OBJ conversion; geometry only, no native material/rig. Original orientation not runtime-verified.'},
    'copiedWav': {'copiedFrom': str(audio_copy), 'claimedUnitySource': source(2112), 'verifiedClipName': clip.m_Name, 'note': 'Validated existing decoded WAV; local UnityPy direct sample decode fails FMOD FORMAT. Waveform not independently compared with native compressed bytes.'},
    'audioValidation': audio_info,
    'hashes': {str(p.relative_to(out)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name != 'provenance.json'},
    'limitations': ['Native weapon motion, hit detection, shader pass state and audio runtime algorithm are not reconstructed.', 'Raw particle modules and native renderer Quad are now retained; Three.js simulation remains a separate implementation task.'],
})
print(json.dumps({'output': str(out), 'particles': [6883, 7039], 'nativeSlashMesh': quad.m_Name, 'audio': audio_info}))
