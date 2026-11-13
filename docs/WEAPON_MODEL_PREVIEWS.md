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

Weapons แยกช่อง Weapon กับ Room: Sword/Firestaff มี Combat ส่วน7ชิ้นใหม่มี Model และ Sounds;6ชิ้นยกเว้น Aegis มี Hit effect ด้วย กด Rotate model เพื่อหมุนหนึ่งรอบ หรือปรับ Facing angle/Preview time เพื่อดูด้านต่าง ๆ ลิงก์ตรงเช่น lab.html?weapon=model-axe, sounds-axe หรือ hit-axe ยังใช้ได้

ห้อง Model โหลดเฉพาะ asset ของชิ้นนั้น ไม่มีการโหลด Fox/มอน/เสียงเพื่อดูโมเดล และเก็บโมเดลไว้ใช้ซ้ำระหว่างเปิด Lab อยู่ สลับห้องจะซ่อนโมเดลเดิม ปิด Lab จะคืน geometry/material/texture รวมถึงผลโหลดที่เพิ่งเสร็จหลังปิด

### ต่อภาพ/เสียง/เอฟเฟกต์จากข้อมูลที่พร้อมแล้ว

- Sounds: ทั้ง7ชิ้นมีปุ่มชื่อคลิปให้ฟังทีละเสียง รวม17WAVไม่ซ้ำ ใช้ไฟล์เดิมทั้งหมด คัดลอกเพิ่ม15ไฟล์และอ้าง Hit2/retro_explosion_fireball1 ที่อยู่ในเว็บแล้วแทนการคัดลอกซ้ำ โหลด/ถอดรหัสเมื่อกดครั้งแรกแล้ว cache ระหว่างเปิด Lab; เล่นหนึ่งเสียงต่อครั้ง ไม่วนเอง และฟังเนื้อเสียงได้สูงสุด5วินาทีต่อการกด
- ค่า gain/pitch ใช้ AudioSource บน node เดียวกับคลิป/RandomSfx จาก hierarchy ที่มีอยู่แบบ fixed; คลิปที่ไม่มี binding ให้ตรวจใช้ gain0.25 สำหรับ audition และระบุไว้ใน media.json ทุกคลิปผ่าน web master0.35 ไม่มีการอนุมาน RandomSfx distribution, procedural trigger หรือ mixer routing
- Hit effect: Axe/Bow/Dice/Mine/Rockets/Bluetooth Dagger อ้าง GeneralProjectileHit3790 จริงใน hierarchy เดิม จึงใช้ชุดเต็ม7145+7001จาก public/weapons/staff/manifest.json ที่ต่อไว้แล้ว ไม่ใช้ summary particle ที่ขาด UV/curves ตัว package เลือกเฉพาะสองชั้น/วัสดุที่เกี่ยวข้องและ reuse texture URLs เดิม ไม่โหลด Firestaff projectile/muzzle/explosion มาด้วย
- Play effect + sound เริ่ม fixture เอฟเฟกต์หนึ่งครั้งตรงกลางโมเดลที่ระดับ1.25ม. และเรียก Hit2 ด้วย GameAudio เดิม; เลื่อน timeline เงียบ/หยุดค้างได้ และ reset/switch/close เคลียร์ particles เสียง และผลรอถอดรหัส ไม่สร้าง damage/การโจมตีจริงหรือสรุปจังหวะ hit ของอาวุธจาก fixture
- Aegis ไม่มี GeneralProjectileHit reference จึงไม่มีห้อง Hit effect ไม่เอาเอฟเฟกต์อื่นมาแทน Mine/Rockets/Dice ยังไม่มี explosion เฉพาะใน preview นี้ การมีเสียงระเบิดไม่เพียงพอให้เลือกเอฟเฟกต์ระเบิดผิดชนิด

ข้อมูลผูกเสียง/แหล่งไฟล์/hash และ reference ของ hit อยู่ใน public/weapons/models/<id>/media.json; public/weapons/preview-hit/provenance.json บันทึกการเลือกข้อมูลเดิม Source manifest hash normalize CRLF→LF เฉพาะเพื่ออ้างอิงข้ามระบบ ส่วน hash ของ OBJ/PNG/WAV ที่คัดลอกยังตรวจ raw bytes แบบเดิม

เพื่อดูรูปทรงชัด ใช้ opaque Lambert สองด้าน เก็บ RGB tint/UV scale/offset จาก material และ texture แบบ nearest; ไม่อ้างว่าแปลง Unity shader สำเร็จครบ โดยเฉพาะ Aegis forcefield/outline/alpha จัดโมเดลไว้กลางห้องและ normalize ด้านยาวสุด2ม. เป็นสเกลดูตัวอย่าง ไม่ใช่ขนาดในเกม หรือ transform ของ projectile จริง ไม่มีการเพิ่มการโจมตี/เสียงสมมุติให้7ชิ้นนี้ในเกมหลัก

## ข้อมูลที่ส่งต่ออีก AI

### แยก “มี asset แล้วแต่ยังไม่ต่อ” กับ “ข้อมูลยังขาด”

ตามคำย้ำผู้ใช้: ห้ามรายงานว่าอาวุธ7ชิ้นนี้มีแค่โมเดล ขณะนี้เว็บนำเข้าเฉพาะ model/material/texture เพื่อดูใน Lab ส่วนชุดสกัดเดิมมี data/hierarchy, icon, material และไฟล์เสียงที่ references ระบุอยู่แล้ว รวมถึงข้อมูล particle/prefab บางส่วน การมีไฟล์ครบตาม references ไม่ยืนยันว่าจังหวะใช้งานหรือ runtime fields ครบ

เสียงที่พบใน dependency ของแต่ละชิ้น (มีไฟล์แล้ว **ยังไม่ยืนยันว่าแต่ละชื่อถูกเรียกตอนไหน**):

- Axe: AxeSpin, AxeThrow, Hit2
- Bow: Arrow, Bow, Hit2
- Dice: DiceHit6, DiceHitNormal, DiceThrow, Hit2, retro_explosion_fireball1
- Mine: Hit2, MineSpawn, NoodleStop, bombExplosion
- Rockets: Hit2, NoodleStop, bombExplosion, retro_shoot_missile, retro_shoot_missile02
- Bluetooth Dagger: BluetoothDagger, Hit2
- Aegis: AegisRecharge, AegisUse

**อัปเดตงานฝั่งเว็บ:** คลิปเสียงทั้งหมดในรายการข้างต้นต่อให้ฟังใน Sounds แล้ว และ GeneralProjectileHit ต่อใน Hit effect ของ6ชิ้นแล้ว สิ่งที่ยังไม่ต่อคือการเรียก asset เหล่านี้จากการโจมตีจริง และเอฟเฟกต์เฉพาะที่ข้อมูลเต็มยังไม่ครบ ไม่จัดเป็นคำขอให้สกัด WAV/ภาพ/โมเดลใหม่ทั้งหมด

**งานข้อมูลที่ยังขาดหรือยังไม่ยืนยัน ให้อีก AI หา:** activation/targeting, เส้นทางและการหมุน, quantity/burst/cooldown, damage lifetime เทียบ visual lifetime, hitbox/penetration/bounce/hit history, spawn transforms และ event mapping ของภาพ/เสียง (spawn/hit/loop/stop/expiry) พร้อมค่าที่ runtime เปลี่ยน รวม pause/reset/pooling รายชิ้นตามหัวข้อด้านล่าง ตรวจ JSON/report เดิมก่อน และส่งเฉพาะช่องว่างที่เหลือ ไม่อนุมาน event จากชื่อคลิปหรือ `trigger_verified` ใน catalog

ผลส่งกลับที่ต้องการ: ผัง event → component/asset reference, ค่าพารามิเตอร์พร้อมหน่วย, หลักฐาน raw fields และ method/call site สำหรับ runtime พร้อมสถานะยืนยัน/อนุมาน/ไม่ทราบ แยก “ไม่มีไฟล์” จาก “มีไฟล์แต่ไม่ทราบวิธีเรียก” ทุกครั้ง

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

Build/typecheck, deployment/boot checks, room-cache tests และ check_weapon_models.mjs ตรวจ hash ที่คัดลอก, OBJ vertices/UV, bounds/center, สลับการมองเห็น, disposal และ late-load หลังปิด; check_weapon_media.mjs ตรวจ WAV/hash/reference, สองชั้น hit ที่เหมือนชุดเดิม, timeline/pause/backward scrub/reset และ audition cache/mute/pending cancellation/disposal โดย mock image/audio loading ไม่อ้างผลภาพจริงหรือความตรง shader/เสียงที่ฟัง ผู้ใช้ตรวจภาพ/เสียง/เกมเพลย์เองตามแนวทางเดิม ไม่มีการเปลี่ยน phase
