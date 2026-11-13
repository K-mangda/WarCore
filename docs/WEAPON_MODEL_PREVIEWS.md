# ชุดดูโมเดลอาวุธใน Lab — 2026-11-13

ผู้ใช้อนุมัติให้นำไฟล์ที่มีอยู่มาเพิ่มหลายชิ้นพร้อมกัน งานนี้คัดลอกจากชุดสกัดเดิมเท่านั้น ไม่เปิดเกม/DLL/Unity containers ไม่เรียก importer สกัดใหม่

## เพิ่มแล้ว 7 ชิ้น

- Axe: Axe.obj → m_ogre_axe_Projectile → Axe_Default.png
- Bow: Arrow.obj → m_Arrow → FBX_Arrow_Color.png (เป็นโมเดลลูกธนูที่ projectile อ้าง ไม่ใช่คันธนู)
- Dice: Dice.obj → m_dice → FBX_Dice_Color.png
- Mine: Mine.obj → m_mine → FBX_Mine_Color.png
- Rockets: mesh_rocket.obj → Black (ไม่มี texture ใน material นี้)
- Bluetooth Dagger: BluetoothDagger.obj → m_bluetoothDagger → FBX_BluetoothBlade_Color.png
- Aegis: Shield.obj → Forcefield_Aegis (ไม่มี texture ใน material นี้)

จับคู่ MeshFilter กับ MeshRenderer บน node เดียวกันจาก hierarchy JSON ที่มีอยู่ ไม่เลือก material จากรายการ dependency รวม ข้อมูลนี้เป็นหลักฐานของชุดสกัด ไม่ใช่การตรวจ native PPtr ใหม่ ใช้ `python tools/package_weapon_models.py C:/Users/Korawit/Desktop/WarCore/megabonk_extracted_assets` คัดลอกซ้ำได้

ไฟล์อยู่ที่ public/weapons/models/<id>/ มี OBJ/texture, data.json, hierarchy.json, material.json, manifest.json และ provenance.json พร้อม source/output hash ไฟล์ต้นฉบับไม่ได้ถูกแก้

## การใช้งาน

Weapons แยกช่อง Weapon กับ Room: Sword/Firestaff มี Combat ส่วน7ชิ้นใหม่มี Model กด Rotate model เพื่อหมุนหนึ่งรอบ หรือปรับ Facing angle/Preview time เพื่อดูด้านต่าง ๆ ลิงก์ตรงเช่น lab.html?weapon=model-axe ยังใช้ได้

ห้อง Model โหลดเฉพาะ asset ของชิ้นนั้น ไม่มีการโหลด Fox/มอน/เสียงเพื่อดูโมเดล และเก็บโมเดลไว้ใช้ซ้ำระหว่างเปิด Lab อยู่ สลับห้องจะซ่อนโมเดลเดิม ปิด Lab จะคืน geometry/material/texture รวมถึงผลโหลดที่เพิ่งเสร็จหลังปิด

เพื่อดูรูปทรงชัด ใช้ opaque Lambert สองด้าน เก็บ RGB tint/UV scale/offset จาก material และ texture แบบ nearest; ไม่อ้างว่าแปลง Unity shader สำเร็จครบ โดยเฉพาะ Aegis forcefield/outline/alpha จัดโมเดลไว้กลางห้องและ normalize ด้านยาวสุด2ม. เป็นสเกลดูตัวอย่าง ไม่ใช่ขนาดในเกม หรือ transform ของ projectile จริง ไม่มีการเพิ่มการโจมตี/เสียงสมมุติให้7ชิ้นนี้ในเกมหลัก

## ข้อมูลที่ส่งต่ออีก AI

ไม่ต้องสกัด mesh/PNG ชุดนี้ซ้ำ ให้ส่งข้อมูลพฤติกรรมพร้อมหลักฐานตาม WEAPON_BEHAVIOR.md และ EXTRACTION_BACKLOG.md:

- Axe: aiming/spawn, เส้นทางเคลื่อนที่/การหมุน, hit history/penetration, จังหวะเสียง throw/spin/stop
- Bow: การเลือกเป้า/เล็ง, quantity/burst, ความเร็ว/อายุ/การทะลุของลูกธนู และเสียง spawn/hit
- Dice: การเคลื่อนที่/เด้ง, เงื่อนไขผลจากหน้าลูกเต๋าและ explosion (ถ้ามี), damage และ audio event
- Mine: จุดวาง, เงื่อนไขเริ่มทำงาน/ระเบิด, รัศมีและคูลดาวน์ต่อเป้า, lifetime และเสียง
- Rockets: การเล็ง/เปลี่ยนทิศ (มี homing หรือไม่), lifetime/impact/explosion radius, hit history และเสียง
- Bluetooth Dagger: การเลือกเป้า/การกลับหรือเปลี่ยนเป้า (ถ้ามี), hitbox/penetration, lifetime และเสียง
- Aegis: เงื่อนไขใช้โล่/ฟื้น, block/attack trigger, shield geometry และ VFX/material behavior, เสียง use/recharge

Bananarang อ้าง Cube.obj จึงยังรอการยืนยัน geometry/material chain; Poison Flask มี Outline/Top หลาย material แต่ dependency รวมมี Cube ที่ไม่ตรงกับ node หลัก ต้องขอ resolved mesh/submesh/material-slot mapping ก่อนเพิ่ม ไม่ตั้งชื่อ Cube ว่าเป็นโมเดลของทั้งสองชนิดโดยอัตโนมัติ

## ตัวละคร

จากข้อมูลปัจจุบันมี Fox ที่เป็น playable web rig ครบอยู่ใน public/megabonk/fox-rig.json เท่านั้น ไม่ใช่ข้อสรุปว่าต้นฉบับมีตัวละครเดียว ชุดสกัดมี21รายการ/portrait และ8 hierarchy ที่ไม่ว่าง แต่ reference ที่ตรวจยังไม่ให้ payload vertices/skin weights/inverse bind matrices/animation clips พร้อมใช้สำหรับตัวใหม่ ให้ AI อีกตัวส่งชุด playable export หลายตัวพร้อมกันโดยตรวจของเดิมก่อน และแนบ starting weapon/passive/state/FPS/material chain ข้อมูลตามรายตัวอยู่ใน EXISTING_ASSET_AUDIT.json

## ตรวจสอบ

Build/typecheck, deployment/boot checks, room-cache tests และ check_weapon_models.mjs ตรวจ hash ที่คัดลอก, OBJ vertices/UV, bounds/center, สลับการมองเห็น, disposal และ late-load หลังปิด โดย mock image loading ไม่อ้างผลภาพจริงหรือความตรง shader ผู้ใช้ตรวจภาพ/เสียง/เกมเพลย์เองตามแนวทางเดิม ไม่มีการเปลี่ยน phase
