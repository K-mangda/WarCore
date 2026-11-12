"""Export native damage-number font evidence and baked SDF atlas.

The installed build contains a baked Press Start 2P TMP font, not its TTF.
No replacement TTF is fabricated or downloaded by this tool.
"""
from pathlib import Path
import json
import struct
import hashlib
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.local-evidence/python'))
import UnityPy
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator

root = Path(__file__).resolve().parents[1]
game = Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out = root / 'public/game-ui/damage'
out.mkdir(parents=True, exist_ok=True)
env = UnityPy.load(str(game / 'sharedassets2.assets'))
asset = next(iter(env.files.values()))
objects = asset.objects
tmp = objects[3205].get_raw_data()
damage = objects[3114].get_raw_data()
assert struct.unpack_from('<iq', damage, 32) == (0, 3205)
assert struct.unpack_from('<iq', tmp, 100) == (0, 3029)
assert struct.unpack_from('<iq', tmp, 112) == (0, 2)
font = objects[3029].read(check_read=False)
assert font.m_Name == 'PressStart2P-Regular SDF'
material = objects[2].read_typetree()
assert material['m_Name'] == 'PressStart2P-Regular SDF Material'
texenvs = dict(material['m_SavedProperties']['m_TexEnvs'])
assert texenvs['_MainTex']['m_Texture'] == {'m_FileID': 0, 'm_PathID': 110}
atlas = out / 'atlas.png'
objects[110].read().image.save(atlas)
generator = TypeTreeGenerator(asset.unity_version)
declarations = Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\DummyDll')
for name in ['mscorlib.dll', 'UnityEngine.CoreModule.dll', 'UnityEngine.TextCoreFontEngineModule.dll', 'UnityEngine.TextCoreTextEngineModule.dll', 'UnityEngine.TextRenderingModule.dll', 'UnityEngine.UI.dll', 'UnityEngine.UIModule.dll', 'Unity.TextMeshPro.dll']:
    generator.load_dll((declarations / name).read_bytes())
env.typetree_generator = generator
font_tree = objects[3029].read_typetree()
glyph_by_id = {g['m_Index']: g for g in font_tree['m_GlyphTable']}
characters = {}
for c in font_tree['m_CharacterTable']:
    glyph = glyph_by_id[c['m_GlyphIndex']]
    rect = glyph['m_GlyphRect']
    metrics = glyph['m_Metrics']
    characters[chr(c['m_Unicode'])] = {
        'unicode': c['m_Unicode'], 'glyphIndex': glyph['m_Index'],
        'rect': {'x': rect['m_X'], 'y': rect['m_Y'], 'width': rect['m_Width'], 'height': rect['m_Height']},
        'imageRect': {'x': rect['m_X'], 'y': font_tree['m_AtlasHeight'] - rect['m_Y'] - rect['m_Height'], 'width': rect['m_Width'], 'height': rect['m_Height']},
        'metrics': {key[2].lower() + key[3:]: value for key, value in metrics.items()},
        'scale': glyph['m_Scale'] * c['m_Scale'], 'atlasIndex': glyph['m_AtlasIndex'],
    }
assert all(c in characters for c in '0123456789')
(out / 'glyphs.json').write_text(json.dumps({
    'faceInfo': font_tree['m_FaceInfo'],
    'atlas': {'file': 'atlas.png', 'width': font_tree['m_AtlasWidth'], 'height': font_tree['m_AtlasHeight'], 'padding': font_tree['m_AtlasPadding']},
    'characters': characters,
    'rectCoordinates': 'rect uses Unity bottom-left; imageRect converts to exported PNG top-left. Glyph rect is native content; sample additional atlas padding when implementing SDF underlay.',
}, indent=2), encoding='utf-8')
(out / 'font-raw.json').write_text(json.dumps(font_tree, indent=2), encoding='utf-8')
available_fonts = []
for filename in ['globalgamemanagers.assets', 'sharedassets0.assets', 'sharedassets1.assets', 'sharedassets2.assets', 'resources.assets']:
    e = UnityPy.load(str(game / filename))
    for o in e.objects:
        if o.type.name != 'Font':
            continue
        f = o.read()
        available_fonts.append({'file': filename, 'pathId': o.path_id, 'name': f.m_Name, 'bytes': len(f.m_FontData)})
        if f.m_Name.lower().replace('-', '').replace(' ', '').startswith('pressstart2p') and f.m_FontData:
            (out / 'PressStart2P-Regular.ttf').write_bytes(bytes(f.m_FontData))
record = {
    'assetFile': 'sharedassets2.assets',
    'chain': [
        {'pathId': 785, 'type': 'GameObject', 'name': 'DamageNumbersNew'},
        {'pathId': 3114, 'type': 'DamageNumbers', 'damageTextPPtrOffset': 32, 'target': 3205},
        {'pathId': 3205, 'type': 'TextMeshProUGUI', 'fontAssetPPtrOffset': 100, 'target': 3029, 'sharedMaterialPPtrOffset': 112, 'materialTarget': 2},
        {'pathId': 3029, 'type': 'TMP_FontAsset', 'name': font.m_Name, 'family': 'Press Start 2P', 'style': 'Regular'},
        {'pathId': 2, 'type': 'Material', 'name': material['m_Name'], 'texturePathId': 110},
    ],
    'nativeMaterialProperties': material['m_SavedProperties'],
    'nativeMaterialKeywords': material['m_ValidKeywords'],
    'bakedAtlas': {'file': atlas.name, 'sha256': hashlib.sha256(atlas.read_bytes()).hexdigest()},
    'availableNativeFonts': available_fonts,
    'nativeTtfExported': (out / 'PressStart2P-Regular.ttf').exists(),
    'sourceFontFile': font_tree['m_SourceFontFile'],
    'limitations': 'Baked SDF atlas is not a TTF. Render using exported glyph metrics and SDF atlas. Runtime DamageNumbers.Init may override color/size; material defaults alone do not establish per-damage-type appearance. Web SDF threshold and underlay must be labeled approximate until native shader reproduction.',
    'tmpRawHex': tmp.hex(),
    'fontAssetRawHex': objects[3029].get_raw_data().hex(),
}
(out / 'provenance.json').write_text(json.dumps(record, indent=2), encoding='utf-8')
print(json.dumps({'nativeTtfExported': record['nativeTtfExported'], 'atlas': str(atlas), 'family': 'Press Start 2P', 'nativeFontsFound': len(available_fonts)}))
