"""Turn decompile files that still hold the full REA evidence JSON into plain pseudocode (keeps the header comment lines).
Usage: python -I tools/normalize_decompile.py <dir>"""
import sys,glob,json,os
fixed=bad=0
for f in glob.glob(os.path.join(sys.argv[1],'*.c')):
    t=open(f,encoding='utf-8',errors='ignore').read()
    i=t.find('{"')
    if i<0 or t[:i].count('\n')>3:continue
    try:
        j=json.loads(t[i:]);n=j.get('normalized_result',{})
        code=n.get('pseudocode') or (n.get('procedure') or {}).get('pseudocode')
        if code:open(f,'w',encoding='utf-8').write(t[:i]+code);fixed+=1
        else:bad+=1
    except Exception:bad+=1
print('normalized',fixed,'unparsed',bad)
