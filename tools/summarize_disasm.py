"""Condense a disasm_methods.py output: per method, ordered named calls and float/int constants.
Usage: python tools/summarize_disasm.py <disasm.txt>"""
import re,sys
cur=None
noise=('0x1802696c0','0x1802699a0')
for line in open(sys.argv[1],encoding='utf-8'):
    line=line.rstrip()
    if line.startswith('## '): print('\n'+line); continue
    m=re.match(r'(0x[0-9a-f]+): (\w+) (.*?)\s*$',line)
    if not m: continue
    a,mn,rest=m.groups()
    if mn=='call':
        if any(n in rest for n in noise): continue
        name=rest.split(' ',1)[1] if ' ' in rest else rest
        print(f'  {a} call {name}')
    elif 'f32=' in rest and mn.startswith(('movss','mulss','addss','subss','divss','comiss','ucomiss','maxss','minss')):
        v=re.search(r'f32=([-\d.e+]+)',rest).group(1)
        if abs(float(v))>1e-10: print(f'  {a} {mn} const {v}')
    elif mn=='mov' and re.search(r', 0x[0-9a-f]+$',rest) and 'dword ptr' in rest:
        print(f'  {a} {mn} {rest}')
