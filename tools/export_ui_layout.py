"""Read scene RectTransforms to guide the browser HUD, without launching Unity."""
from pathlib import Path
import UnityPy,json
root=Path(__file__).resolve().parents[1]
env=UnityPy.load(r'C:\Program Files (x86)\Steam\steamapps\common\Megabonk\Megabonk_Data\level2')
objects=next(iter(env.files.values())).objects
gos={o.path_id:o.read_typetree() for o in env.objects if o.type.name=='GameObject'}
transforms={o.path_id:o.read_typetree() for o in env.objects if o.type.name in ['Transform','RectTransform']}
targets={'HUD','XpBar','XpBarOuter','PauseUI','Upgrades','ItemsContainerWeapons','ItemsContainerTomes','Tomes','Weapons','Timer','t_Timer_Run','t_Timer_Stage','T_Xp','UpgradeButton','UpgradeButton (1)','UpgradeButton (2)','UpgradeButton (3)'}
records=[]
for object_id,data in transforms.items():
    go=gos.get(data['m_GameObject']['m_PathID'],{})
    if go.get('m_Name') not in targets or 'm_AnchorMin' not in data:continue
    ancestors=[];parent=data['m_Father']['m_PathID']
    while parent in transforms:
        item=transforms[parent];ancestors.append(gos.get(item['m_GameObject']['m_PathID'],{}).get('m_Name','?'));parent=item['m_Father']['m_PathID']
    record={'name':go['m_Name'],'path':'/'.join(reversed(ancestors))+ '/'+go['m_Name'],'gameObjectId':data['m_GameObject']['m_PathID'],'transformId':object_id,'active':go['m_IsActive'],'anchorMin':data['m_AnchorMin'],'anchorMax':data['m_AnchorMax'],'pivot':data['m_Pivot'],'position':data['m_AnchoredPosition'],'sizeDelta':data['m_SizeDelta']}
    records.append(record)
out=root/'public/game-ui/layout.json';out.write_text(json.dumps({'source':'level2','records':records},indent=2),encoding='utf-8')
for record in records:
    if record['name'] in {'HUD','XpBarOuter','ItemsContainerWeapons','ItemsContainerTomes','t_Timer_Run','Upgrades','PauseUI','T_Xp'}:print(json.dumps(record))
