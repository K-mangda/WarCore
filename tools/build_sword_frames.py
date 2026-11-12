"""Measure original Sword atlas alpha centers; no image edits or dynamic pivot changes."""
from pathlib import Path
import hashlib,json
from PIL import Image

def build(root=None):
    root=Path(root) if root else Path(__file__).resolve().parents[1]/'public/weapons/knight-sword'
    source=root/'vfx/textures/Atlas03.png'
    particle=json.loads((root/'particle.json').read_text(encoding='utf-8'))
    uv=particle['uvModule'];cols=uv['tilesX'];rows=uv['tilesY'];row=uv['rowIndex']
    image=Image.open(source).convert('RGBA');width=image.width//cols;height=image.height//rows
    frames=[]
    for frame in range(cols):
        tile=image.crop((frame*width,row*height,(frame+1)*width,(row+1)*height))
        alpha=list(tile.getchannel('A').getdata());total=sum(alpha)
        # The exported Quad negates X: U increases toward local -X.
        x=sum((i%width+.5)*a for i,a in enumerate(alpha))/total/width if total else .5
        y=sum((i//width+.5)*a for i,a in enumerate(alpha))/total/height if total else .5
        frames.append({'index':frame,'visible':total>0,'center':[.5-x,.5-y,0]})
    result={'source':'vfx/textures/Atlas03.png','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'row':row,'tiles':[cols,rows],'derivation':'Measured alpha centers in exported quad coordinates. Only the first frame calibrates a fixed web orientation; later frames must never move the quad pivot. Not native pivot metadata.','frames':frames}
    (root/'frame-alignment.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    return result

if __name__=='__main__':
    print(json.dumps(build()))
