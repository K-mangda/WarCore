"""Extract declarations, never infer native method bodies. Local source stays private."""
from pathlib import Path
import re, hashlib, json
source = Path(r'C:\Users\Korawit\Desktop\megabonk_decompiled\dump.cs')
text = source.read_text(encoding='utf-8-sig')
groups = {'movement':['EMovementState'], 'combat':['EWeapon','EStat'], 'character':['ECharacter'], 'enemy':['EEnemy','EWaveType'], 'environment':['EMap']}
root = Path(__file__).resolve().parents[1]
sections=[]
for domain,names in groups.items():
    output=['// Generated from local dump.cs. Run python tools/extract_spec.py.']
    for name in names:
        match=re.search(r'public enum '+name+r'\s[^\n]*\n\{(.*?)\n\}',text,re.S)
        if not match:
            sections.append(f'## {name}\nDeclaration not found; unresolved.\n')
            continue
        entries=re.findall(r'public const '+name+r' (\w+) = ([^;]+);',match[1])
        declaration='export enum '+name+' {\n'+''.join(f'  {key} = {value},\n' for key,value in entries)+'}\n'
        output.append(declaration)
        sections.append(f'## {name}\nSource line {text[:match.start()].count(chr(10))+1}\n```ts\n{declaration}```\n')
    dest=root/'src/types'/f'{domain}.ts'
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text('\n'.join(output),encoding='utf-8')
movement=root/'src/types/movement.ts'
with movement.open('a',encoding='utf-8') as f:
    f.write('export interface PlayerMovementValues { moveSpeed: number; maxRunSpeed: number; airDeceleration: number; slideForce: number; extraGravity: number; swimSpeed: number; }\nexport const movementValues: Readonly<PlayerMovementValues> = { moveSpeed: 2700, maxRunSpeed: 10, airDeceleration: 0.003, slideForce: 200, extraGravity: 11, swimSpeed: 10 };\n')
docs=root/'docs'; docs.mkdir(exist_ok=True)
(docs/'MEGABONK_MASTER_SPEC.md').write_text('# Megabonk web — evidence ledger\n\nScope: Phase 0–1 only. This is an experimental reimplementation, not verified 1:1 parity.\n\nSource SHA256: '+hashlib.sha256(source.read_bytes()).hexdigest()+'\n\nPlayerMovementValues, line 374017: constants 2700, 10, 200, 0.003, 11 and swim speed 10 are directly declared. Methods in this IL2CPP declaration dump have empty bodies. Rigidbody mass, counter movement, jump impulse, camera settings, collision tolerances and native formulas remain unresolved. Camera distance 3.6 and half-height crouch are user requirements, not verified source constants.\n\nThe browser motor is a fixed-step experimental translation. Gravity interpretation, jump speed 13, air steering 0.06, ground friction 12, jump buffer 0.12 seconds and particle settings are explicitly provisional. No Steam assets are copied into the public repository.\n\n'+ '\n'.join(sections),encoding='utf-8')
(docs/'PARITY_MATRIX.md').write_text('''# Phase parity ledger

No system has verified 100% behavioral parity. Native method bodies and reference captures are required.

| Source | Browser module | Evidence / status |
| --- | --- | --- |
| PlayerMovementValues / PlayerMovement | player/Motor.ts | Declared constants and movement enum extracted; motor formulas provisional |
| SlideEffect | vfx/Effects.ts | Dirt effect present; source thresholds unavailable |
| VelocityParticles | vfx/Effects.ts + UI | Velocity-driven streaks; appearance provisional |
| Third person camera | camera/Orbit.ts | Requested 3.6m offset, terrain raycast; original settings unresolved |
| SpawnPositions / knockbackVelocity / flyingKnockupVel | enemies/ | Deferred Phase 2+ |
| Desert / Tumbleweed / sandstorm | environment/desert/ | Deferred Phase 2+ |
| Hell lava damage | environment/hell/ | Deferred Phase 2+ |
| AudioSpamFilter | audio/ | Deferred; Phase 1 has no audio |
| WeaponInventory / TomeInventory / ItemInventory | UI | Deferred Phase 2+; no invented combat |

## Acceptance
Build and strict type check are automated. Interactive movement feel, slope traversal, collision and 60+ FPS require testing on target hardware. FPS is displayed live; no unmeasured performance claim is made.
''',encoding='utf-8')
print('Extracted enums and evidence documents.')
