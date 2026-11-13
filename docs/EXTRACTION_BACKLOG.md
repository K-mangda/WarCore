# งานข้อมูลต้นฉบับที่ยังขาด — 2026-11-13

รายการนี้สำหรับเตรียมส่งให้อีก AI สืบค้นภายหลัง ไม่ใช่ข้อสรุปว่าข้อมูลไม่มีในเครื่อง และไม่ใช่คำสั่งให้สกัดซ้ำทั้งหมด อ่านข้อมูลเดิมและตาม reference ก่อนเสมอ

โปรเจกต์เว็บ: `C:/Users/Korawit/Desktop/War-Core`  
ชุดสกัดเดิม: `C:/Users/Korawit/Desktop/WarCore/megabonk_extracted_assets`

## ลำดับแรก: มอนเกิดตามด่านและช่วงเวลา

ผู้ใช้ยืนยันว่ามอนแยกตามด่าน ปัจจุบัน Skeleton/Bandit ปนกันเฉพาะสนามเทส กติกาทุกตัวที่4 เป็น Bandit ไม่ใช่ roster จริง และห้ามนำไปอ้างเป็นด่านต้นฉบับ

ให้อีก AI ตาม StageData / map enums / timeline / wave / encounter / spawn manager ไปจนได้:

- แต่ละด่านและระดับความยากใช้มอนชนิดใดบ้าง พร้อม EnemyData references ที่ resolve แล้ว
- เวลาเริ่ม/สิ้นสุดของแต่ละกลุ่ม, น้ำหนักหรือ credit cost, spawn budget/rate และข้อจำกัดจำนวน พร้อมแยกค่าที่ serialized กับสูตร runtime
- เงื่อนไข elite, miniboss และ boss แยกจากมอนปกติ
- ตัวแปรที่เปลี่ยนตามเวลา stage/tier/cycle และตัวละครหรือโหมด ถ้ามีหลักฐาน
- ผลลัพธ์เป็น stage roster ที่อ่านง่ายกับ JSON ใช้งานได้ พร้อม source fileID/pathID และ RVA ของสูตร ห้ามสรุปจากชื่อโฟลเดอร์อย่างเดียว

## ลำดับถัดไป: พฤติกรรม Skeleton และ Bandit

ข้อมูลโมเดลครบในเว็บแล้ว: Skeleton EnemyData8037 → AnimatedMesh7798 / Material277 / Texture802 (8เฟรม,8FPS); Bandit EnemyData8032 → AnimatedMesh7779 / Material106 / Texture824 (8เฟรม,7FPS), sharedassets1.assets

ยังต้องตาม:

- การเลือก/เริ่ม/วนเฟรมของ AnimatedMesh และความสัมพันธ์ FPS กับความเร็ววิ่ง/สถานะ; มี idle/attack state ที่อื่นจริงหรือไม่
- ขนาดจริงจาก renderer offset/rotation/scale + collider; ตอนนี้เว็บ normalize ความสูง1.6ม. เป็นค่าทดลอง
- การไล่ผู้เล่น/หยุด/หลบ/โจมตี/ระยะสัมผัส/คูลดาวน์ดาเมจ และความต่างระหว่าง Skeleton กับ Bandit
- การสเกล HP, ดาเมจ, speed, knockback และจำนวน XP ตามด่าน/เวลา เว็บยังใช้ sandbox balance ร่วมกัน
- White flash และ EnemyDissolve: เวลา, noise/threshold/edge shader, การหยุด/คืน pool และท่าที่ค้างตอนตาย เว็บตอนนี้ใช้ dissolve ทดแทน0.45วินาที

ห้ามเพิ่มเสียงร้องมอนจาก category labels ของ catalog รายงาน combat ระบุ Enemy.Damage ไม่มีเสียงเจ็บทั่วไป; hit เป็นหน้าที่ของ weapon hit effect

## เงิน: แยก Gold กับ Silver

ภาพ, serialized tint และเสียงของทั้งสองสกุลมีแล้ว ไม่ต้องหา WAV/ภาพใหม่ก่อนตรวจของเดิม

- Gold: มอนชนิดใด/ด่านใดให้เท่าไร สูตรโอกาสและ modifier เป็นอย่างไร ปัจจุบันทุกตัวให้1 ตามคำสั่งเทสของผู้ใช้
- Silver: เงื่อนไขที่มาและจำนวนจริง **ยังไม่ยืนยัน** เว็บทุก12คิลเป็นค่าชั่วคราวเท่านั้น
- การดรอปจากมอนธรรมดาเทียบกับบอส/หีบ: Pickup / PickupOrb / pool ตัวไหนถูกใช้จริง
- จุดเกิด, launch, การโค้ง/ดูดอัตโนมัติ, ระยะเปิดใช้งาน และการเปลี่ยนขนาดระหว่างดูด ต้องมี call site/สูตรถ้าต้องการ parity ปัจจุบัน Gold โค้งสูง/ดูดเอง/หด/เรืองแสงเป็นการจูนตามผู้ใช้

## EXP และ progression

มีภาพ native, สี4กลุ่ม, tier thresholds, รายงาน stacking/attraction และ Xp2 แล้ว ดู XP_ASSET_HANDOFF.md และ PROGRESSION_IMPLEMENTATION.md ก่อน

- สูตร EXP ที่ต้องใช้ต่อเลเวล และ modifiers; ตอนนี้เว็บใช้5+3ต่อเลเวล
- XP จริงที่ EnemyData ให้กับแต่ละมอน และการสเกล runtime ก่อนส่งให้ pickup manager
- ตรวจการรวมก้อน/ขอบเขต500/ลำดับ FIFO กับ native method body หากต้องการความแม่นยำเกินรายงานที่ส่งต่อ
- Echo XP / passive ที่สร้างมัน และ XpDamager ระหว่างบิน: เงื่อนไข/ดาเมจจริง เว็บยังไม่เปิดระบบเหล่านี้
- Native ring-buffer/frame age ของก้อน EXP: ตอนนี้วน7เฟรมตามคำขอผู้ใช้
- แค็ตตาล็อกอัปเกรดจริง: pool, rarity, roll weights, eligibility และผลของแต่ละ stat; เว็บมีเพียงสามตัวเลือกทดลอง

สี EXP เป็นช่วงค่าที่อยู่ในก้อนตามรายงาน ไม่ใช่สรุปว่าสีฟ้าให้1เสมอ: ฟ้า1..9, เหลือง10..49, แดง50+, ม่วง echo ต้องแยกหลักฐาน tier กับ value ของการดรอป

## งาน parity ภาพ/เสียงที่เหลือ (ความสำคัญรอง)

- Shader/postprocessing ของ hit/explosion และ enemy toon/outline: saved blend fields ไม่พอพิสูจน์ pass state; ไม่อนุมาน Additive จาก `_SrcBlend=1/_DstBlend=0`
- RandomSfx random-volume distribution, AudioSpamFilter attenuation, mixer/spatial routing และ native UI event queue timing
- จังหวะ LEVEL UP / เปิดหน้าเลือกของ / แสดง burst และตัวเลขเก็บจริง หากผู้ใช้ต้องการตรงต้นฉบับ ภาพและการเคลื่อนไหวป้ายตอนนี้ผ่านการจูนหลายครั้งตามผู้ใช้ ไม่ให้การสืบข้อมูลใหม่ลบทับค่าจูนโดยอัตโนมัติ

## สิ่งที่หาแล้ว อย่าส่งกลับมาเป็นงานขาดซ้ำ

- Skeleton/Bandit baked mesh, albedo, serialized FPS/frame lists และ raw provenance อยู่ใน `public/enemies/`
- Sword/Firestaff ใช้ GeneralProjectileHit/Hit2; multi-target สั่งเสียงครั้งเดียวต่อการโจมตี/ระเบิดตามรายงาน มี per-target VFX ในเว็บแล้ว
- PlayerDamage volume0.17, DeathImpact0.50 ตรวจ AudioSource จริงแล้ว
- UI press: Enter5, AudioManager.uiClick; hover/selection แยกกัน เว็บคง hover เดิมตามผู้ใช้ ดู `public/game-audio/ui-click-provenance.json`
- LevelupAfter / Levelup4 / LevelupAmbience แยกหน้าที่แล้ว; Levelup3 ไม่ใช่เสียงเลเวลอัปใน run
- Hit atlases เดิม32×32ต่อเฟรมและ Point filter; ไม่แก้ความเป็น pixel art ด้วยการสกัด/อัปสเกลใหม่โดยไม่มีเหตุผล

## รูปแบบส่งงานให้อีก AI

เลือกทีละหัวข้อและระบุว่าไม่แก้เว็บ/ไม่ commit/push ไม่ต้องสกัดชุดใหญ่ซ้ำ ผลที่ต้องส่ง:

1. สรุปพฤติกรรมที่อ่านได้ พร้อม JSON ที่มีหน่วย/enum/reference ครบ
2. Raw serialized fields/bytes และการ resolve external fileID/pathID จริง
3. RVA + disassembly excerpt หรือหลักฐาน method body สำหรับสูตรและ event trigger; declaration ว่างไม่ใช่หลักฐาน
4. Source build/hash กับไฟล์ผลลัพธ์ hash และแยก **ยืนยันแล้ว / อนุมาน / ยังไม่ทราบ**
5. หากหาไม่พบ ระบุขอบเขตที่ตรวจแล้ว อย่าเปลี่ยน filename/category เป็น `trigger_verified`

รักษาหลักฐานเดิมและแยกข้อมูลต้นฉบับจากค่าที่ผู้ใช้ตั้งใจจูนในเว็บเสมอ
