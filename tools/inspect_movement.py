"""Disassemble selected movement methods using REA-derived address evidence."""
import sys,json,struct
from bisect import bisect_right
from pathlib import Path
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import pefile
from capstone import Cs,CS_ARCH_X86,CS_MODE_64
source=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\GameAssembly.dll')
pe=pefile.PE(str(source),fast_load=True); base=pe.OPTIONAL_HEADER.ImageBase
evidence=json.loads(Path('.local-evidence/il2cpp-stdout.json').read_text(encoding='utf-8-sig'))['normalized_result']
names={}
for method,address in zip(evidence['methods'],evidence['method_addresses']):
    if address.get('state')=='code': names[int(address['address'],16)]=evidence['types'][method['declaring_type']]['name']+'.'+method['name']
decoder=Cs(CS_ARCH_X86,CS_MODE_64); decoder.detail=True
targets={'PlayerMovement.StartSlide','PlayerMovement.StartCrouch','PlayerMovement.CheckInput','PlayerMovement.UseLimitedMovement','PlayerMovement.UpdateCrouchState','PlayerMovement.IsSliding','PlayerMovement..ctor','PlayerMovementValues.GetMoveSpeedMultiplier','PlayerMovementValues.GetCounterMovementMultiplier'}
all_addresses=sorted(names)
targets.update({'PlayerMovement.Jump','PlayerMovement.GetJumpForce','PlayerMovement.CanJump','PlayerMovement.CanBhopJump','PlayerMovement.MovementTick','PlayerMovement.CounterMovement','PlayerMovement.UpdateCooldowns','PlayerMovementValues.Init','PlayerMovementValues.GetGravity'})
targets.update({'StatsConstants..cctor','PlayerMovement.UpdateTickRate','PlayerMovementValues.CreateMovement','PlayerMovement.RampMovement'})
targets.update({'PlayerStatsNew.GetBaseValue','PlayerMovement.ResetAerialJumps'})
targets.update({'PlayerInput.FixedUpdate','PlayerInput.MovementInput','PlayerInput..ctor','PlayerMovement.SetBetterInput','PlayerMovement.CheckLanding','PlayerMovement.StartGrounded','PlayerMovement.AirAccelerate','PlayerMovement.GetAirDeceleration','PlayerMovement.GetWishDir'})
# Discover direct callers without assuming the location of Bhop handling.
calls_to={a for a,n in names.items() if n in {'PlayerMovement.CanBhopJump','PlayerInput.IsHoldingJump'}}
for section in pe.sections:
    if not section.Characteristics & 0x20000000: continue
    data=section.get_data(); cursor=0
    while True:
        offset=data.find(b'\xe8',cursor)
        if offset<0 or offset+5>len(data): break
        address=base+section.VirtualAddress+offset
        target=address+5+struct.unpack_from('<i',data,offset+1)[0]
        if target in calls_to:
            index=bisect_right(all_addresses,address)-1
            if index>=0: targets.add(names[all_addresses[index]])
        cursor=offset+1
output=[]
for address,name in sorted(names.items()):
    if name not in targets: continue
    end=next((a for a in all_addresses if a>address),address+2048)
    output.append(f'\n## {name} @ {address:#x}')
    for ins in decoder.disasm(pe.get_data(address-base,min(end-address,6000)),address):
        note=''
        if ins.mnemonic=='call' and ins.op_str.startswith('0x'): note=names.get(int(ins.op_str,16),'')
        for operand in ins.operands:
            if operand.type==3 and ins.reg_name(operand.mem.base)=='rip':
                target=ins.address+ins.size+operand.mem.disp
                try: note+=f' [f32={struct.unpack("<f",pe.get_data(target-base,4))[0]}]'
                except Exception: pass
        output.append(f'{ins.address:#x}: {ins.mnemonic} {ins.op_str} {note}')
Path('.local-evidence/movement-disassembly.txt').write_text('\n'.join(output),encoding='utf-8')
print('Saved movement disassembly')
