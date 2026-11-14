"""Generate src/data/NativeData.ts from the evidence tables in docs/rea/*.json.

The web game imports this typed module instead of the JSON so that the Node check scripts (which transpile TypeScript
files one by one) keep working. Run after tools/build_rea_tables*.py:
    python tools/build_web_data.py
Every value is a serialized game value (tier V in docs/REA_GAME_DATA_FINDINGS.md); formulas that combine them live in code.
"""
import hashlib
import json
from datetime import date
from pathlib import Path

rea = Path('docs/rea')
load = lambda n: json.loads((rea / n).read_text(encoding='utf-8'))
schema = load('dump_schema.json')
enemies = load('enemies.json')
stages = load('stages.json')
tomes = load('tomes.json')
weapons = load('weapons.json')

def r(v):
    return round(v, 4) if isinstance(v, float) else v

enemy_rows = [{
    'name': e['name'], 'enemy': e['enemy'], 'hp': e['hp'], 'damage': e['damage'], 'speed': r(e['speed']), 'xp': e['xp'],
    'creditCost': r(e['creditCost']), 'minStage': e['minStage'], 'canSpawnAfterTime': r(e['canSpawnAfterTime']),
    'maps': e['maps'], 'isFlying': e['isFlying'], 'canBeElite': e['canBeElite'], 'specialAttacks': e['specialAttackCount'],
    'source': e['source'],
} for e in enemies]
stage_rows = [{
    'name': s['name'], 'stageTime': r(s['stageTime']), 'checkNewEnemyInterval': r(s['checkNewEnemyInterval']),
    'startEnemies': s['startEnemies'], 'minibosses': s['minibosses'], 'boss': s['boss']['name'],
    'events': [{'event': ev['event'], 'enemies': ev['enemies'], 'timeMinutes': r(ev['timeMinutes']), 'duration': r(ev['duration'])} for ev in s['events']],
    'source': s['source'],
} for s in stages]
tome_rows = [{
    'tome': t['tome'], 'description': t['description'], 'stat': t['modifier']['stat'], 'op': t['modifier']['op'],
    'value': r(t['modifier']['value']), 'source': t['source'],
} for t in tomes]
weapon_rows = [{
    'weapon': w['weapon'], 'damage': r(w['damage']), 'endCooldown': r(w['endCooldown']), 'burstTime': r(w['burstTime']),
    'minBurstInterval': r(w['minBurstInterval']), 'projectiles': w['projectiles'],
    'upgradePerLevel': [{'stat': m['stat'], 'op': m['op'], 'value': r(m['value'])} for m in (w['upgradePerLevel'] or [])],
    'source': w['source'],
} for w in weapons]

meta = {
    'generatedBy': 'tools/build_web_data.py',
    'generatedOn': date.today().isoformat(),
    'dumpCsSha256': schema['sha256'],
    'metadataSha256': '17b506a77616b943b414b9a42d35e3acbdaf71eec5dc6c470fc4da338010d550',
    'evidenceDocs': ['docs/REA_GAME_DATA_FINDINGS.md', 'docs/REA_RUNTIME_SYSTEMS.md', 'docs/REA_PROGRESSION_FINDINGS.md'],
    'tiers': 'Values are serialized (V). Formulas combining them are documented per module and may be inferred (I).',
}
dump = lambda o: json.dumps(o, indent=1, ensure_ascii=False)
out = f"""// GENERATED FILE - do not edit. Source: tools/build_web_data.py from docs/rea/*.json (see nativeDataMeta).
export type MapFlag='Forest'|'Desert'|'Hell'|'Graveyard';
export interface NativeEnemy {{name:string;enemy:string;hp:number;damage:number;speed:number;xp:number;creditCost:number;minStage:number;canSpawnAfterTime:number;maps:MapFlag[];isFlying:boolean;canBeElite:boolean;specialAttacks:number;source:string;}}
export interface NativeTimelineEvent {{event:'MiniBoss'|'Swarm'|'AddEnemyCard';enemies:string[];timeMinutes:number;duration:number;}}
export interface NativeStage {{name:string;stageTime:number;checkNewEnemyInterval:number;startEnemies:string[];minibosses:string[];boss:string|null;events:NativeTimelineEvent[];source:string;}}
export interface NativeStatModifier {{stat:string;op:'Addition'|'Multiplication'|'Flat';value:number;}}
export interface NativeTome {{tome:string;description:string;stat:string;op:'Addition'|'Multiplication'|'Flat';value:number;source:string;}}
export interface NativeWeapon {{weapon:string;damage:number;endCooldown:number;burstTime:number;minBurstInterval:number;projectiles:number;upgradePerLevel:NativeStatModifier[];source:string;}}
export const nativeDataMeta={dump(meta)} as const;
export const nativeEnemies:NativeEnemy[]={dump(enemy_rows)};
export const nativeStages:NativeStage[]={dump(stage_rows)};
export const nativeTomes:NativeTome[]={dump(tome_rows)};
export const nativeWeapons:NativeWeapon[]={dump(weapon_rows)};
"""
Path('src/data').mkdir(exist_ok=True)
Path('src/data/NativeData.ts').write_text(out, encoding='utf-8')
print('wrote src/data/NativeData.ts', len(out), 'bytes')
