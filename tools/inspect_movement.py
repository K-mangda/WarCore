"""Disassemble selected movement methods using REA-derived address evidence."""
import sys,json,struct
from pathlib import Path
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import pefile
from capstone import Cs,CS_ARCH_X86,CS_MODE_64
source=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\GameAssembly.dll')
pe=pefile.PE(str(source)); base=pe.OPTIONAL_HEADER.ImageBase
evidence=json.loads(Path('.local-evidence/il2cpp-stdout.json').read_text(encoding='utf-8-sig'))['normalized_result']
names={}
for method,address in zip(evidence['methods'],evidence['method_addresses']):
    if address.get('state')=='code': names[int(address['address'],16)]=evidence['types'][method['declaring_type']]['name']+'.'+method['name']
decoder=Cs(CS_ARCH_X86,CS_MODE_64); decoder.detail=True
targets={'PlayerMovement.StartSlide','PlayerMovement.StartCrouch','PlayerMovement.CheckInput','PlayerMovement.UseLimitedMovement','PlayerMovement.UpdateCrouchState','PlayerMovement.IsSliding','PlayerMovement..ctor','PlayerMovementValues.GetMoveSpeedMultiplier','PlayerMovementValues.GetCounterMovementMultiplier'}
all_addresses=sorted(names)
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
print('\n'.join(output))
