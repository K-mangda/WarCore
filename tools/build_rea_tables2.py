"""Second pass: weapons / tomes / items / characters / maps tables.
Requires game-data read with the fixed generator (tools/read_game_data.py) and docs/rea/dump_schema.json.
Usage: python tools/build_rea_tables2.py <game-data2.json> <docs/rea>"""
import json
import sys
from pathlib import Path

gd = json.load(open(sys.argv[1], encoding='utf-8'))
out = Path(sys.argv[2])
schema = json.load(open(out / 'dump_schema.json', encoding='utf-8'))
en = {k: {v: n for n, v in schema['enums'][k]['values']} for k in schema['enums']}


def rec(c):
    return [r for r in gd['records'] if r['class'] == c]


def mods(lst):
    return [{'stat': en['EStat'].get(m['stat'], m['stat']), 'op': en['EStatModifyType'].get(m['modifyType'], m['modifyType']), 'value': m['modification']} for m in lst]


def by_pid(cls):
    return {r['pathID']: r for r in rec(cls)}


upg, pas, wpn = by_pid('UpgradeData'), by_pid('PassiveData'), by_pid('WeaponData')


def upgrades(p):
    r = upg.get(p['m_PathID']) if p and p.get('m_FileID') == 0 else None
    return mods(r['data']['upgradeModifiers']) if r else None


weapons = []
for r in rec('WeaponData'):
    d = r['data']
    weapons.append({
        'source': f"{r['file']}#{r['pathID']}", 'name': r['name'], 'weapon': en['EWeapon'].get(d['eWeapon'], d['eWeapon']), 'price': d['price'],
        'damage': d['damage'], 'knockback': d['knockback'], 'critChance': d['critChance'], 'element': en['EElement'].get(d['element']),
        'projectiles': d['projectiles'], 'projectileBounces': d['projectileBounces'], 'attackDuration': d['attackDuration'],
        'maxDuration': d['maxDuration'], 'maxSizeMultiplier': d['maxSizeMultiplier'], 'effectDuration': d['effectDuration'],
        'projectileSpeed': d['projectileSpeed'], 'endCooldown': d['endCooldown'], 'burstTime': d['burstTime'],
        'minBurstInterval': d['minBurstInterval'], 'canBounce': bool(d['canBounce']),
        'amplificationMode': en['EAmplificationMode'].get(d['amplificationMode']), 'procCoefficient': d['procCoefficient'],
        'useVision': bool(d['useVision']), 'canMultiHit': bool(d['canMultiHit']), 'hasCrosshair': bool(d['hasCrosshair']),
        'spawnProjectileRange': d['spawnProjectileRange'], 'isAura': bool(d['isAura']),
        'onlySpawnWhenCloseEnemies': bool(d['onlySpawnWhenCloseEnemies']), 'spawnOffset': d['spawnOffset'],
        'upgradePerLevel': upgrades(d['upgradeData']), 'attackPrefabPathID': d['attack']['m_PathID'], 'iconPathID': d['icon']['m_PathID']})
weapons.sort(key=lambda w: str(w['weapon']))
(out / 'weapons.json').write_text(json.dumps(weapons, indent=1, ensure_ascii=False), encoding='utf-8')

tomes = [{'source': f"{r['file']}#{r['pathID']}", 'name': r['name'], 'tome': en['ETome'].get(r['data']['eTome']),
          'description': r['data']['description'], 'price': r['data']['price'], 'modifier': mods([r['data']['statModifier']])[0],
          'upgradeDataPathID': r['data']['upgradeData']['m_PathID']} for r in rec('TomeData')]
tomes.sort(key=lambda t: str(t['tome']))
(out / 'tomes.json').write_text(json.dumps(tomes, indent=1, ensure_ascii=False), encoding='utf-8')

items = [{'source': f"{r['file']}#{r['pathID']}", 'name': r['name'], 'item': en['EItem'].get(r['data']['eItem']),
          'rarity': en['EItemRarity'].get(r['data']['rarity']), 'inItemPool': bool(r['data']['inItemPool']),
          'maxAmount': r['data']['maxAmount'], 'maxAmountPerRun': r['data']['maxAmountPerRun'], 'price': r['data']['price'],
          'itemTickPriority': r['data']['itemTickPriority']} for r in rec('ItemData')]
items.sort(key=lambda i: str(i['item']))
(out / 'items.json').write_text(json.dumps(items, indent=1, ensure_ascii=False), encoding='utf-8')

chars = []
for r in rec('CharacterData'):
    d = r['data']
    w = wpn.get(d['weapon']['m_PathID'])
    p = pas.get(d['passive']['m_PathID'])
    chars.append({
        'source': f"{r['file']}#{r['pathID']}", 'name': r['name'], 'character': en['ECharacter'].get(d['eCharacter']), 'price': d['price'],
        'statModifiers': mods(d['statModifiers']), 'startingWeapon': w['name'] if w else None,
        'passive': en['EPassive'].get(p['data']['ePassive']) if p else None,
        'colliderHeight': d['colliderHeight'], 'colliderWidth': d['colliderWidth'],
        'numQuestsRequiredForVisibility': d['numQuestsRequiredForVisibilityInCharacterSelection'],
        'footstepClipPathIDs': [a['m_PathID'] for a in d['audioFootsteps']], 'prefabPathID': d['prefab']['m_PathID'],
        'statCategoryRatios': [{'category': en['EStatCategory'].get(c['category']), 'value': c['value']} for c in d['StatCategoryRatios']]})
chars.sort(key=lambda c: str(c['character']))
(out / 'characters.json').write_text(json.dumps(chars, indent=1, ensure_ascii=False), encoding='utf-8')

stage_by = {r['pathID']: r['name'] for r in rec('StageData')}
maps = [{'source': f"{r['file']}#{r['pathID']}", 'name': r['name'], 'map': en['EMap'].get(r['data']['eMap']),
         'stages': [stage_by.get(s['m_PathID']) for s in r['data']['stages']], 'stageDuration': r['data']['stageDuration'],
         'unlockOrder': r['data']['unlockOrder'], 'numShrinesMultiplier': r['data']['numShrinesMultiplier'],
         'numChestsMultiplier': r['data']['numChestsMultiplier'], 'numShrinesPotsAndOtherMultiplier': r['data']['numShrinesPotsAndOtherMultiplier'],
         'isWaterDamaging': bool(r['data']['isWaterDamaging']), 'mapType': en['EMapType'].get(r['data']['mapType']),
         'shrinePrefabCount': len(r['data']['shrines'])} for r in rec('MapData')]
(out / 'maps.json').write_text(json.dumps(maps, indent=1, ensure_ascii=False), encoding='utf-8')
print(len(weapons), 'weapons', len(tomes), 'tomes', len(items), 'items', len(chars), 'characters', len(maps), 'maps')
