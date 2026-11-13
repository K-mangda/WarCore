"""Inventory exported files only. Never opens game containers or extracts assets."""
import argparse
import hashlib
import json
from pathlib import Path


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def references(value):
    if isinstance(value, dict):
        for item in value.values():
            yield from references(item)
    elif isinstance(value, list):
        for item in value:
            yield from references(item)
    elif isinstance(value, str) and value.startswith(('shared/', 'weapons/', 'enemies/', 'characters/')) and Path(value).suffix:
        yield value


def component_types(value):
    if isinstance(value, dict):
        for component in value.get('components', []):
            if component.get('type'):
                yield component['type']
        for item in value.values():
            yield from component_types(item)
    elif isinstance(value, list):
        for item in value:
            yield from component_types(item)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    root = args.source.resolve()
    repo = Path(__file__).resolve().parents[1]
    entries = []
    for domain in ('weapons', 'enemies', 'characters'):
        for data_path in sorted((root / domain).glob('*/data.json')):
            data = read(data_path)
            hierarchy_path = data_path.with_name('hierarchy.json')
            hierarchy = read(hierarchy_path) if hierarchy_path.exists() else None
            queue = list(references(data)) + list(references(hierarchy))
            files, missing = {}, []
            while queue:
                relative = queue.pop()
                if relative in files or relative in missing:
                    continue
                path = (root / relative).resolve()
                if not path.is_relative_to(root):
                    raise ValueError(f'Reference escapes dataset: {relative}')
                if not path.is_file() or path.stat().st_size == 0:
                    missing.append(relative)
                    continue
                files[relative] = {'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
                if path.suffix == '.json':
                    queue.extend(references(read(path)))
            ident = data['id']
            integrated = (domain == 'weapons' and ident in ('sword', 'firestaff') or
                          domain == 'enemies' and ident in ('skeleton', 'bandit') or
                          domain == 'characters' and ident == 'fox')
            model_preview = domain == 'weapons' and (repo / 'public/weapons/models' / ident / 'manifest.json').exists()
            entries.append({
                'domain': domain, 'id': ident, 'name': data.get('name', data.get('assetName')),
                'data': str(data_path.relative_to(root)).replace('\\', '/'),
                'dataSha256': hashlib.sha256(data_path.read_bytes()).hexdigest(),
                'hierarchyHasContent': bool(hierarchy),
                'hierarchyComponentTypesUnverified': sorted(set(component_types(hierarchy))),
                'hierarchySha256': hashlib.sha256(hierarchy_path.read_bytes()).hexdigest() if hierarchy_path.exists() else None,
                'files': dict(sorted(files.items())), 'missingReferences': sorted(missing),
                'meshes': sorted(p for p in files if p.endswith('.obj')),
                'textures': sorted(p for p in files if p.endswith('.png') and p.startswith('shared/')),
                'audio': sorted(p for p in files if p.endswith('.wav')),
                'catalogAnimatedMesh': data.get('animatedMesh'),
                'catalogBossFlagUnverified': data.get('isBoss'),
                'webIntegration': 'partial-existing' if integrated else 'model-preview-only' if model_preview else 'not-integrated',
                'readiness': 'existing-web-slice' if integrated else 'lab-model-preview' if model_preview else 'exported-mesh-candidate' if domain == 'weapons' and any(p.endswith('.obj') for p in files) else 'needs-readiness-evidence',
            })
    payload = {'source': str(root), 'scope': 'Existing exported files only; no native container inspection. Catalog identity/behavior claims are not verified.', 'entries': entries}
    output = repo / 'docs/EXISTING_ASSET_AUDIT.json'
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    lines = ['# ตรวจไฟล์ asset ที่มีอยู่ — 2026-11-13', '',
             'ตรวจชุดสกัดเดิมแบบหลายชิ้นพร้อมกันเท่านั้น ไม่เปิดไฟล์เกม ไม่แกะ DLL/Unity container และไม่สกัดเพิ่ม ใช้ `tools/audit_existing_assets.py` ตรวจซ้ำได้', '',
             'ผลรายไฟล์พร้อมขนาด/hash และ reference ที่ไม่พบอยู่ใน `EXISTING_ASSET_AUDIT.json` ตรวจเฉพาะ references ที่ถูกบันทึกใน JSON เดิม ไม่พิสูจน์ว่าผู้สกัดเก็บ dependencies ครบหรือจับคู่ถูกทั้งหมด', '',
             '## ข้อสรุปและคิวใช้งาน', '',
             '- มี OBJ ให้ตรวจนำมาใช้ต่อหลายชิ้น เช่น Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger และ Aegis/Shield ไม่ต้องสกัด mesh เหล่านี้ซ้ำ หากต้องการ preview ต้องตรวจ material/texture/transform ที่อ้างมาด้วย',
             '- การพบ OBJ เป็นผู้สมัครสำหรับ preview ภาพ ไม่ได้แปลว่ากติกาโจมตี เสียง และ VFX พร้อมเล่นครบ ต้องเทียบหลักฐานตาม WEAPON_BEHAVIOR.md ก่อนเพิ่มระบบโจมตี',
             '- เพิ่มห้องดูโมเดลใน Lab แล้ว7ชิ้น: Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger, Aegis ดู WEAPON_MODEL_PREVIEWS.md; ใช้ไฟล์เดิม ไม่มีการสกัดเพิ่ม',
             '- Bananarang/Poison Flask ที่อ้าง mesh ชื่อ Cube ต้องตรวจ geometry/material pairing ก่อนตัดสินรูปทรง ชื่อไฟล์อย่างเดียวไม่บอกว่าเป็น placeholder หรือโมเดลที่ถูกต้อง',
             '- EnemyData มีชื่อ AnimatedMesh/pathID แต่ในโฟลเดอร์ enemies มีเพียง JSON; hierarchy ที่ว่างและตัวเลข frameCount ไม่ใช่ vertex/index/UV payload จึงยังใช้สร้างตัวใหม่ไม่ได้จากชุดนี้เพียงอย่างเดียว',
             '- Skeleton/Bandit มีไฟล์ animation/albedo ที่ต่อในเว็บแล้ว แยกจากข้อจำกัดของชุด catalog; ห้ามเหมาว่ามอนทั้งหมดไม่มี asset หรือเรียก importer เพื่อสกัดตัวใหม่เอง',
             '- ตัวละครที่มี portrait/metadata ยังไม่ถือว่ามี rig/skin/animation พร้อมเล่น Fox มี fox-rig.json ในเว็บแล้ว',
             '- ค่า isBoss, frameCount และ audio trigger ใน catalog ยังไม่ใช่หลักฐานยืนยัน พบข้อผิดพลาดมาก่อนแล้ว ไม่แบ่งชนิดบอสหรือสร้างสกิลจากค่าเหล่านี้', '',
             '## รายการที่ตรวจครบตามโฟลเดอร์', '']
    for domain, title in [('weapons', 'อาวุธ'), ('enemies', 'มอนและรายการชื่อบอสใน catalog'), ('characters', 'ตัวละคร')]:
        group = [e for e in entries if e['domain'] == domain]
        lines.extend([f'### {title}: {len(group)} รายการ', ''])
        for e in group:
            state = 'ต่อเว็บบางส่วนแล้ว' if e['webIntegration'] == 'partial-existing' else 'มีห้องดูโมเดลใน Lab (ยังไม่มี combat)' if e['webIntegration'] == 'model-preview-only' else 'ยังไม่ต่อเว็บ'
            meshes = ', '.join(Path(p).name for p in e['meshes']) or 'ไม่มี OBJ ใน references ที่ตรวจ'
            evidence = f"OBJ: {meshes}; PNG shared {len(e['textures'])}; WAV {len(e['audio'])}"
            if domain != 'weapons':
                evidence = ('มี hierarchy' if e['hierarchyHasContent'] else 'hierarchy ว่าง/null') + '; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ'
            missing = ', '.join(e['missingReferences']) or 'ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ'
            lines.append(f"- **{e['id']}** — {state}; {evidence}; {missing}. metadata: `{e['data']}`")
            if domain == 'enemies' and e['hierarchyComponentTypesUnverified']:
                lines.append('  - มีชื่อ component ใน hierarchy เดิม: '+', '.join(e['hierarchyComponentTypesUnverified'])+'; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล')
        lines.append('')
    lines.extend(['## ส่งต่อ AI สกัดเฉพาะส่วนที่ยังขาด', '',
                  '- อาวุธที่มี OBJ: ตรวจ identity/material pairing, prefab component fields และ runtime behavior ที่ขาดก่อน ขอเฉพาะข้อมูลที่ยังไม่มี ไม่ส่ง mesh/เสียงชุดเดิมซ้ำ',
                  '- มอนใหม่: ขอ per-species playable geometry หรือ baked frames (positions/UV/indices, FPS, state mapping), albedo/material chain และ renderer/collider transform; รวม AI/สกิล/ด่านเกิดตาม EXTRACTION_BACKLOG.md',
                  '- บอส: ต้องมีหลักฐาน classification, spawn/phase/attack transitions ไม่ใช้ชื่อ miniboss หรือ isBoss ใน catalog เป็นข้อยุติ',
                  '- ตัวละครใหม่: ขอ playable rig/skin/animation หรือ baked representation พร้อม material chain และ passive/starting weapon ที่พิสูจน์แล้ว ไม่ต้องส่ง portrait เดิมซ้ำ',
                  '- ข้อมูลที่ยังไม่พร้อมและคำถามละเอียดติดตามที่ EXTRACTION_BACKLOG.md; ผู้รับผิดชอบค้น/สกัดคือ AI อีกตัว', ''])
    (repo / 'docs/EXISTING_ASSET_AUDIT.md').write_text('\n'.join(lines), encoding='utf-8')
    print(json.dumps({'entries': {d: sum(e['domain'] == d for e in entries) for d in ('weapons', 'enemies', 'characters')}, 'meshCandidates': [e['id'] for e in entries if e['readiness'] == 'exported-mesh-candidate'], 'missingReferences': {e['id']: e['missingReferences'] for e in entries if e['missingReferences']}}, ensure_ascii=False))


if __name__ == '__main__':
    main()
