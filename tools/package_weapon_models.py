"""Copy already-exported weapon models into Lab; never reads native game files."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

MODELS = ['axe', 'bow', 'dice', 'mine', 'rockets', 'bluetooth_dagger', 'aegis']


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def mesh_nodes(node):
    if not isinstance(node, dict):
        return
    components = node.get('components', [])
    meshes = [c for c in components if c.get('type') == 'MeshFilter']
    renderers = [c for c in components if c.get('type') == 'MeshRenderer']
    if meshes and renderers:
        yield node, meshes[0], renderers[0]
    for value in node.values():
        if isinstance(value, dict):
            yield from mesh_nodes(value)
        elif isinstance(value, list):
            for child in value:
                yield from mesh_nodes(child)


def audio_bindings(node):
    if not isinstance(node, dict):
        return
    components = node.get('components', [])
    sources = [c for c in components if c.get('type') == 'AudioSource']
    for component in components:
        names = component.get('sounds', []) if component.get('type') == 'RandomSfx' else [component.get('clip')] if component.get('type') == 'AudioSource' else []
        for name in filter(None, names):
            source = component if component.get('type') == 'AudioSource' else sources[0] if sources else None
            yield name, {'node': node.get('name'), 'nodePathId': node.get('pathId'), 'componentPathId': component.get('pathId'), 'componentType': component['type'], 'audioSource': source}
    for value in node.values():
        if isinstance(value, dict):
            yield from audio_bindings(value)
        elif isinstance(value, list):
            for child in value:
                yield from audio_bindings(child)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    source = parser.parse_args().source.resolve()
    repo = Path(__file__).resolve().parents[1]
    for ident in MODELS:
        folder = source / 'weapons' / ident
        hierarchy = read(folder / 'hierarchy.json')
        nodes = list(mesh_nodes(hierarchy))
        if len(nodes) != 1:
            raise ValueError(f'{ident}: requires an explicit multi-mesh assessment')
        node, mesh, renderer = nodes[0]
        materials = renderer['materials']
        if len(materials) != 1:
            raise ValueError(f'{ident}: unresolved material slots')
        material_path = materials[0]['relativePath']
        material = read(source / material_path)
        texture = next((t for name in ['_AlbedoMap', '_MainTex'] for t in material.get('textures', []) if t['property'] == name), None)
        output = repo / 'public/weapons/models' / ident
        output.mkdir(parents=True, exist_ok=True)
        copies = {'model.obj': mesh['mesh'], 'data.json': f'weapons/{ident}/data.json', 'hierarchy.json': f'weapons/{ident}/hierarchy.json', 'material.json': material_path}
        if texture:
            copies['albedo.png'] = texture['texture']
        provenance = []
        for dest, relative in copies.items():
            original = (source / relative).resolve()
            if not original.is_relative_to(source) or not original.is_file():
                raise ValueError(relative)
            shutil.copyfile(original, output / dest)
            provenance.append({'source': relative, 'output': dest, 'sha256': hashlib.sha256(original.read_bytes()).hexdigest()})
        colors = material.get('colors', {})
        tint = colors.get('_MainColor', colors.get('_AlbedoColor', colors.get('_Color', [1, 1, 1, 1])))
        manifest = {'id': ident, 'mesh': 'model.obj', 'texture': 'albedo.png' if texture else None, 'tint': tint[:3],
                    'textureScale': texture['scale'] if texture else [1, 1], 'textureOffset': texture['offset'] if texture else [0, 0],
                    'previewOnly': True, 'meshNode': {'name': node['name'], 'pathId': node['pathId'], 'meshFilterPathId': mesh['pathId'], 'rendererPathId': renderer['pathId'], 'transform': node.get('transform')},
                    'previewPolicy': 'Centered, longest dimension 2m, opaque Lambert inspection material; native shader/transform/attack not reproduced.'}
        (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
        (output / 'provenance.json').write_text(json.dumps({'sourceRoot': str(source), 'operation': 'Copied existing exported files; no extraction or native identity verification.', 'files': provenance}, indent=2) + '\n', encoding='utf-8')
        data = read(folder / 'data.json')
        bindings = {}
        for name, binding in audio_bindings(hierarchy):
            bindings.setdefault(name, []).append(binding)
        samples = []
        for relative in data['dependencies']:
            if not relative.endswith('.wav'):
                continue
            original = source / relative
            content = original.read_bytes()
            if content[:4] != b'RIFF' or content[8:12] != b'WAVE':
                raise ValueError(f'Invalid WAV: {relative}')
            name = original.stem
            public_paths = [repo / 'public/game-audio' / original.name, repo / 'public/weapons/staff/audio' / original.name]
            existing = next((p for p in public_paths if p.is_file() and p.read_bytes() == content), None)
            target = existing or repo / 'public/weapons/preview-audio' / original.name
            if not existing:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(original, target)
            mapped = bindings.get(name, [])
            audio_source = next((b['audioSource'] for b in mapped if b['audioSource']), None)
            samples.append({'name': name, 'file': target.relative_to(repo / 'public').as_posix(), 'source': relative, 'sha256': hashlib.sha256(content).hexdigest(),
                            'volume': audio_source.get('volume', 0.25) if audio_source else 0.25, 'pitch': audio_source.get('pitch', 1) if audio_source else 1,
                            'previewGainPolicy': 'fixed serialized AudioSource value' if audio_source else 'web audition gain 0.25; runtime routing unknown', 'bindings': mapped})
        hit = hierarchy.get('hit') or {}
        media = {'id': ident, 'samples': samples, 'sharedHit': hit.get('name') == 'GeneralProjectileHit' and hit.get('pathId') == 3790,
                 'hitReference': hit, 'scope': 'Manual sound samples and shared hit-effect fixture, not native attack timing. RandomSfx variation/loops are not inferred.'}
        (output / 'media.json').write_text(json.dumps(media, indent=2) + '\n', encoding='utf-8')
        print(ident, mesh['mesh'], '->', material_path)
    # Reuse the already-packaged complete hit layers; the catalog summary alone lacks UV/curve data.
    staff = read(repo / 'public/weapons/staff/manifest.json')
    hit_layers = staff['phases']['hit']['particles']
    if {layer['pathId'] for layer in hit_layers} != {7145, 7001}:
        raise ValueError('Unexpected shared hit source')
    material_ids = {str(pid) for layer in hit_layers for pid in layer['renderer']['materialIds']}
    materials = {pid: staff['materials'][pid] for pid in material_ids}
    for material in materials.values():
        if material.get('texture', {}).get('file'):
            material['texture']['file'] = '../staff/' + material['texture']['file']
    hit_output = repo / 'public/weapons/preview-hit'
    hit_output.mkdir(parents=True, exist_ok=True)
    hit_manifest = {'phases': {name: staff['phases']['hit'] if name == 'hit' else {'particles': []} for name in ['projectile', 'muzzle', 'impact', 'hit']}, 'materials': materials}
    (hit_output / 'manifest.json').write_text(json.dumps(hit_manifest, indent=2) + '\n', encoding='utf-8')
    (hit_output / 'provenance.json').write_text(json.dumps({'source': 'weapons/staff/manifest.json', 'sourceLfNormalizedSha256': hashlib.sha256((repo / 'public/weapons/staff/manifest.json').read_bytes().replace(b'\r\n', b'\n')).hexdigest(), 'layers': [7145, 7001], 'operation': 'Select existing shared-hit layers/materials; rewrite texture URLs to reuse existing images. Source manifest hash normalizes CRLF to LF for Git portability, copied OBJ/PNG/WAV hashes remain exact. No extraction.'}, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
