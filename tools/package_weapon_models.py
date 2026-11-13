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
        print(ident, mesh['mesh'], '->', material_path)


if __name__ == '__main__':
    main()
