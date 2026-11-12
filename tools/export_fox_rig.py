"""Export Fox's shipped skeleton, weights, default material and sampled clips."""
from pathlib import Path
import UnityPy,json,math,struct,zlib,hashlib
from UnityPy.helpers.MeshHelper import MeshHandler
from UnityPy.classes.PPtr import PPtr

root=Path(__file__).resolve().parents[1]
data=Path(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data')
out=root/'public/megabonk';out.mkdir(parents=True,exist_ok=True)
env=UnityPy.load(str(data/'sharedassets1.assets'));asset=next(iter(env.files.values()))
transforms={obj.path_id:obj.read_typetree() for obj in env.objects if obj.type.name=='Transform'}
renderer=asset.objects[6842].read_typetree()
mesh=asset.objects[1831].read();handler=MeshHandler(mesh);handler.process()
assert mesh.m_Name=='FoxWizard' and renderer['m_Mesh']['m_PathID']==1831
nodes=[];node_by_id={};hashes={}
def visit(path_id,path=''):
    transform=transforms[path_id]
    name=asset.objects[transform['m_GameObject']['m_PathID']].read().m_Name
    current=(path+'/'+name).strip('/') if path_id!=4840 else ''
    index=len(nodes);node_by_id[path_id]=index
    p=transform['m_LocalPosition'];q=transform['m_LocalRotation'];s=transform['m_LocalScale']
    nodes.append({'name':name,'position':[-p['x'],p['y'],p['z']] if path_id!=4840 else [0,0,0],
                  'rotation':[q['x'],-q['y'],-q['z'],q['w']], 'scale':[s['x'],s['y'],s['z']], 'children':[]})
    hashes[zlib.crc32(current.encode())&0xffffffff]=index
    for child in transform['m_Children']:
        nodes[index]['children'].append(visit(child['m_PathID'],current))
    return index
visit(4840)
indices=[index for submesh in handler.get_triangles() for triangle in submesh for index in reversed(triangle)]
bindposes=[]
for matrix in mesh.m_BindPose:
    # Reflect Unity x, and store matrices column-major for Three.js.
    bindposes.append([getattr(matrix,f'e{row}{column}')*(-1 if (row==0)!=(column==0) else 1) for column in range(4) for row in range(4)])
weights=[]
for row in handler.m_BoneWeights:
    total=sum(row);assert total>0;weights.extend(value/total for value in row)
material=asset.objects[150].read_typetree()
assert material['m_Name']=='m_fox_default'
slot=dict(material['m_SavedProperties']['m_TexEnvs'])['_AlbedoMap']['m_Texture']
texture=PPtr(m_FileID=slot['m_FileID'],m_PathID=slot['m_PathID'],assetsfile=asset).read()
assert texture.m_Name=='Fox_Default'
texture.image.save(out/'FoxBase.png')

def quaternion(euler):
    x,y,z=[math.radians(value)*.5 for value in euler]
    sx,cx,sy,cy,sz,cz=math.sin(x),math.cos(x),math.sin(y),math.cos(y),math.sin(z),math.cos(z)
    # Unity Euler: rotations z, then x, then y; reflect resulting quaternion in x.
    return [cy*sx*cz+sy*cx*sz,-(sy*cx*cz-cy*sx*sz),-(cy*cx*sz-sy*sx*cz),cy*cx*cz+sy*sx*sz]

clips=[]
for clip_id in [2031,2033,2032,2029,2030]:
    clip=asset.objects[clip_id].read_typetree();muscle=clip['m_MuscleClip'];raw=muscle['m_Clip']['data']
    stream=raw['m_StreamedClip'];assert raw['m_DenseClip']['m_CurveCount']==0
    buffer=struct.pack('<'+'I'*len(stream['data']),*stream['data']);offset=0;frames=[]
    while offset<len(buffer):
        time,count=struct.unpack_from('<fi',buffer,offset);offset+=8;keys={}
        for _ in range(count):
            curve,*coefficients=struct.unpack_from('<i4f',buffer,offset);offset+=20
            keys[curve]=coefficients
        frames.append((time,keys))
    bindings=clip['m_ClipBindingConstant']['genericBindings']
    assert all(binding['typeID']==4 and binding['attribute'] in [1,2,4] for binding in bindings)
    assert all(binding['path'] in hashes for binding in bindings),'Unresolved animation bone path'
    constant=raw['m_ConstantClip']['data']
    assert sum(4 if binding['attribute']==2 else 3 for binding in bindings)==stream['curveCount']+len(constant)
    start,stop=muscle['m_StartTime'],muscle['m_StopTime'];duration=stop-start
    count=max(2,math.ceil(duration*clip['m_SampleRate'])+1);times=[i*duration/(count-1) for i in range(count)]
    tracks=[];curve_index=0
    for binding in bindings:
        values=[]
        for relative in times:
            time=start+relative;sample=[]
            dimension=4 if binding['attribute']==2 else 3
            for component in range(dimension):
                index=curve_index+component
                if index>=stream['curveCount']:
                    sample.append(constant[index-stream['curveCount']]);continue
                candidates=[(t,keys[index]) for t,keys in frames if t<=time+1e-6 and index in keys]
                frame_time,coefficients=candidates[-1];a,b,c,d=coefficients
                delta=max(0,time-frame_time)
                sample.append(((a*delta+b)*delta+c)*delta+d)
            if binding['attribute']==1:values.extend([-sample[0],sample[1],sample[2]])
            elif binding['attribute']==2:
                # Polynomial interpolation of quaternion components can drift
                # from unit length; restore the rotation before Three.js slerp.
                length=math.sqrt(sum(value*value for value in sample));assert length>1e-8
                values.extend([sample[0]/length,-sample[1]/length,-sample[2]/length,sample[3]/length])
            else:values.extend(quaternion(sample))
        tracks.append({'node':hashes[binding['path']],'property':'position' if binding['attribute']==1 else 'quaternion','times':times,'values':values})
        curve_index+=4 if binding['attribute']==2 else 3
    clips.append({'name':clip['m_Name'],'duration':duration,'loop':muscle['m_LoopTime'],'tracks':tracks})
model={'nodes':nodes,'root':0,'meshNode':node_by_id[5408],
       'positions':[value for x,y,z in handler.m_Vertices for value in [-x,y,z]],
       'normals':[value for normal in handler.m_Normals for value in [-normal[0],normal[1],normal[2]]],
       'uv':[value for uv in handler.m_UV0 for value in uv[:2]],'indices':indices,
       'joints':[node_by_id[ptr['m_PathID']] for ptr in renderer['m_Bones']],
       'weights':weights,'skinIndices':[value for row in handler.m_BoneIndices for value in row],
       'inverseBindMatrices':bindposes,'clips':clips,'texture':'FoxBase.png'}
(out/'fox-rig.json').write_text(json.dumps(model,separators=(',',':')),encoding='utf-8')
provenance={'source':'sharedassets1.assets','mesh':1831,'renderer':6842,'material':150,
            'materialName':material['m_Name'],'textureSource':{'fileId':slot['m_FileID'],'pathId':slot['m_PathID'],'name':texture.m_Name},
            'bones':len(model['joints']),'nodes':len(nodes),'vertices':len(handler.m_Vertices),
            'clips':[{'id':i,'name':c['name'],'duration':c['duration']} for i,c in zip([2031,2033,2032,2029,2030],clips)],
            'conversion':'Mirrored x with reversed winding; original hierarchy, normalized skin weights, original inverse binds; streamed curves sampled at original clip sample rate',
            'sha256':{name:hashlib.sha256((out/name).read_bytes()).hexdigest() for name in ['fox-rig.json','FoxBase.png']}}
(out/'provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')
print(json.dumps(provenance))
