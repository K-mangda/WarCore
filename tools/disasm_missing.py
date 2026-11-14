"""Fallback for functions Ghidra could not decompile (no procedure at the IL2CPP entry): write Capstone disassembly instead.
Reads the plan and the decompile dir, writes <label>.asm.c for every planned RVA without a .c file. Usage: python -I tools/disasm_missing.py <dir> <plan.json>"""
import sys,json,struct,re
from pathlib import Path
sys.path.insert(0,str(Path('.local-evidence/python').resolve()))
import pefile
from capstone import Cs,CS_ARCH_X86,CS_MODE_64
out=Path(sys.argv[1]);plan=json.loads(Path(sys.argv[2]).read_text())
pe=pefile.PE(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\GameAssembly.dll',fast_load=True);base=pe.OPTIONAL_HEADER.ImageBase
ev=json.loads(Path('.local-evidence/il2cpp-stdout.json').read_text(encoding='utf-8-sig'))['normalized_result']
names={}
for m,a in zip(ev['methods'],ev['method_addresses']):
    if a.get('state')=='code':names[int(a['address'],16)]=ev['types'][m['declaring_type']]['name']+'.'+m['name']
starts=sorted(names)
have={re.search(r'_([0-9A-Fa-f]+)(?:\.asm)?\.c$',f.name).group(1).upper() for f in out.glob('*.c') if re.search(r'_([0-9A-Fa-f]+)(?:\.asm)?\.c$',f.name)}
d=Cs(CS_ARCH_X86,CS_MODE_64);d.detail=True;n=0
import bisect
for p in plan:
    if p['rva'].upper() in have:continue
    va=base+int(p['rva'],16);i=bisect.bisect_right(starts,va);end=starts[i] if i<len(starts) else va+2048
    lines=[f"// {p['label']} RVA 0x{p['rva']} (Capstone disassembly: Ghidra has no function at this entry)"]
    for ins in d.disasm(pe.get_data(va-base,min(max(end-va,16),8000)),va):
        note=names.get(int(ins.op_str,16),'') if ins.mnemonic in('call','jmp') and ins.op_str.startswith('0x') else ''
        lines.append(f'{ins.address:#x}: {ins.mnemonic} {ins.op_str} {note}'.rstrip())
        if ins.mnemonic in('ret','int3') and len(lines)>3 and ins.address+ins.size>=end-1:break
    (out/(re.sub(r'[^\w.-]','_',p['label'])+'.asm.c')).write_text('\n'.join(lines),encoding='utf-8');n+=1
print('disassembled',n)
