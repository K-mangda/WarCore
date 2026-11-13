# งานข้อมูลต้นฉบับที่ยังขาด — 2026-11-13

รายการนี้สำหรับเตรียมส่งให้อีก AI สืบค้นภายหลัง ไม่ใช่ข้อสรุปว่าข้อมูลไม่มีในเครื่อง และไม่ใช่คำสั่งให้สกัดซ้ำทั้งหมด อ่านข้อมูลเดิมและตาม reference ก่อนเสมอ

โปรเจกต์เว็บ: `C:/Users/Korawit/Desktop/War-Core`  
ชุดสกัดเดิม: `C:/Users/Korawit/Desktop/WarCore/megabonk_extracted_assets`

## ผู้รับผิดชอบและสถานะล่าสุด

ข้อกำหนด Controls ล่าสุด: **ไม่ทำ Controller/gamepad input** จึงไม่ต้องหา/สกัดส่วน controller sensitivity/vibration/disconnect/bindings มาทำ เว็บมีแผนเล่นมือถือในอนาคตด้วย touch controls แยกต่างหาก ยังไม่ได้เริ่มงานมือถือ ดู [CONTROLS_IMPLEMENTATION.md](CONTROLS_IMPLEMENTATION.md)

Controls ที่ต่อแล้วใช้ค่าทดลองเว็บให้ทำงานได้จริง: sensitivity multiplier, optional smoothing, invert axes, arrow look และ upgrade keys1–3 สิ่งที่ให้ AI อีกตัวตรวจจากของเดิมก่อนคือสูตร/range/default/หน่วยของ Sensitivity และ Look Smoothing, time-step behavior, inversion/arrow-look rate, filtering/eligibility ของเลขเลือกอัปเกรด และ save fields พร้อมหลักฐานจริง ภาพ slider1.00/0.60เป็นค่าที่แสดงในภาพ ไม่ใช่หลักฐานสูตรหรือค่า default ห้ามเปลี่ยนค่าจูนผู้ใช้อัตโนมัติ ส่วน Interact/Aim/Quick Reset/Map Overlay/Hold Crouch-Aim ยังไม่ต่อระบบที่ใช้ได้ครบ จึงยังไม่มีแถวตั้งค่าหลอกในเว็บ

แนวทางถาวรที่ผู้ใช้ยืนยัน: เมื่อพบข้อมูลไม่แน่ใจ ให้อัปเดต MD/รายการส่งต่อเองทันทีโดยไม่ต้องรอผู้ใช้สั่งซ้ำ ระบุสิ่งที่ตรวจแล้ว ข้อที่ยังไม่รู้ ค่าทดลองในเว็บ และคำถาม/หลักฐานที่ต้องการจาก AI อีกตัว แยก “มีไฟล์แต่ยังไม่ต่อ” จาก “ข้อมูลขาด/ยังไม่ยืนยัน” ไม่เปลี่ยนข้อสงสัยเป็นข้อเท็จจริง ไม่แกะเกมเอง และไม่หยุดงานส่วนที่มีข้อมูลพร้อมโดยไม่จำเป็น

งานเสียงที่ผู้ใช้ให้ตามเพิ่ม: [AUDIO_MIXER_HANDOFF.md](AUDIO_MIXER_HANDOFF.md) แยกชื่อสไลเดอร์ที่เห็นในภาพจาก routing ที่ยังไม่ยืนยัน พร้อมรายการทุกคลิปที่เว็บจัดเข้าช่องอยู่ ให้ AI อีกตัวตาม slider callback/settings field → exposed mixer parameter/group → AudioSource/runtime assignment โดยเฉพาะ UI/Levelup4, Ambience/LevelupAmbience, Game Sounds/LevelupAfter และ XP and Gold/Silver รวมสูตร gain/dB/default/save-load ห้ามเดาจากชื่อคลิปหรือถือ event ที่ยืนยันแล้วว่าเป็นหลักฐาน mixer ด้วย

ผู้ใช้ย้ำว่าอาวุธ ตัวละคร มอน และบอสยังมีอีกมาก ห้ามถือว่าสิ่งที่มีใน Lab คือรายชื่อครบเกม หากจะเพิ่มตัวใด ให้ตรวจ manifest และไฟล์เดิมก่อน: **มี asset แต่ยังไม่ต่อเว็บ** ต่างจาก **asset/พฤติกรรมยังไม่พร้อม** กรณีหลังให้จดรายการรายตัวที่นี่เพื่อส่ง AI สกัด ไม่สร้างของแทนหรือสรุปว่าต้องสกัดใหม่โดยไม่มีการตรวจ

## คิวขยายเนื้อหา: อาวุธ / ตัวละคร / มอน / บอส

อัปเดตล่าสุดตามคำสั่ง “ถ้ามีครบให้ต่อ”: ทั้ง7อาวุธมีห้อง Sounds ให้ฟัง17WAVจากของเดิมแล้ว และ6ชิ้นที่มี GeneralProjectileHit reference มีห้อง Hit effect พร้อม Hit2 แล้ว (ยกเว้น Aegis) ใช้สองชั้น7145/7001ที่มีข้อมูลเต็มในเว็บ ไม่สกัดเพิ่ม รายละเอียดใน WEAPON_MODEL_PREVIEWS.md ส่วนที่รออีก AI ยังเป็นพฤติกรรมโจมตี/event mapping กับเอฟเฟกต์เฉพาะที่ยังไม่มีข้อมูลเต็ม ไม่ต้องสกัดไฟล์เสียงเหล่านี้ซ้ำ

คำย้ำเรื่อง7อาวุธใน Lab: **มี asset หลายชนิดแล้ว** สิ่งที่รออีก AI เป็นข้อมูลพฤติกรรมและ event mapping ที่ขาด/ยังไม่ยืนยัน ไม่ใช่สั่งสกัดไฟล์ทั้งชุดซ้ำ รายชื่อเสียงที่มีแล้วแยกรายอาวุธ และคำถาม targeting/motion/hitbox/timing/VFX/audio/pause/pooling อยู่ในหัวข้อ “แยกมี asset แล้วแต่ยังไม่ต่อกับข้อมูลยังขาด” ของ [WEAPON_MODEL_PREVIEWS.md](WEAPON_MODEL_PREVIEWS.md) ให้ตรวจของเดิมและส่งเฉพาะส่วนที่ยังไม่ครบ

อัปเดต: นำไฟล์เดิมมาเพิ่มห้อง Model ใน Lab แล้ว7อาวุธ (Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger, Aegis) ยังไม่ใช่ combat ที่พร้อมเล่น ดู [WEAPON_MODEL_PREVIEWS.md](WEAPON_MODEL_PREVIEWS.md) สำหรับพฤติกรรมที่ขาดรายชิ้น; ไม่ต้องส่ง OBJ/texture ที่คัดลอกแล้วซ้ำ ส่วน Bananarang/Poison Flask ยังรอ geometry/material mapping ให้ชัด

ตัวละคร: Fox เป็นตัวเดียวที่มี playable web rig อยู่ขณะนี้ ชุด catalog มี21รายการและ8 hierarchy ที่ไม่ว่าง ยังไม่พบ playable payload ครบของตัวอื่นใน references ที่ตรวจ ให้ตรวจไฟล์เดิมก่อน แล้วส่ง rig/skin/clips หรือ baked representation หลายตัวเป็นชุด (เช่น Amog, Bush, Chadwell, Dicehead, Megachad, Ogre, Spaceman, Vlad ตาม hierarchy ที่มีจริง; resolve ID/ชื่อก่อนใช้) รวม passive/starting weapon/state/material chain ไม่ใช้ portrait แทนโมเดลในเกม

คำสั่งล่าสุด: ตรวจของที่มีอยู่ **หลายชิ้นเป็นชุดได้เลย รวมถึงมอน** ไม่จำกัดทีละชิ้น คำว่า “หา” หมายถึงสำรวจไฟล์ที่สกัดไว้แล้ว ไม่ใช่ให้ AI ฝั่งเว็บแกะเกม งานสกัดยังเป็นหน้าที่ AI อีกตัวเสมอ

ผลตรวจชุดแรกครบ30อาวุธ/53รายการมอน/21ตัวละครอยู่ใน [EXISTING_ASSET_AUDIT.md](EXISTING_ASSET_AUDIT.md) และ JSON คู่กัน มี OBJ candidates เพิ่ม9อาวุธ; คิวภาพที่ชื่อ mesh ตรงพอให้ตรวจต่อก่อนคือ Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger, Aegis/Shield ส่วน Bananarang และ Poison Flask ต้องตรวจการจับคู่ mesh ชื่อ Cube เพิ่ม ไม่ถือว่ามีพฤติกรรมพร้อมเล่นทั้งหมด

มอนใหม่ยังไม่มี per-frame geometry ที่พร้อมใช้ใน references ของชุด catalog นี้ (มี AnimatedMesh name/pathID เท่านั้น) ให้ AI อีกตัวส่ง baked geometry/albedo chain ของหลายตัวเป็นชุด เช่น Bee, GoblinWeak/Strong/Tank, Mummy, Slime และ Zombie พร้อม state/FPS/transform ที่พิสูจน์แล้ว โดยตรวจว่ามีไฟล์พร้อมใช้อยู่ที่อื่นก่อนสกัดเพิ่ม รายชื่อเป็นคิวข้อมูล ไม่ใช่ยืนยันด่านเกิด/บทบาท หรือสั่งให้ใส่สนามเทสทุกตัวทันที

รายการด้านล่างเป็นเกณฑ์ตรวจความพร้อม ไม่ใช่ผลตรวจว่า asset ทั้งหมดขาด ข้อมูลจำนวนรวมจากรายงานเดิมยังต้องเทียบ manifest/reference ก่อนใช้ตัดสินรายตัว

- **อาวุธ:** เว็บมี Sword และ Firestaff เป็นชุดทดสอบ สำหรับอาวุธถัดไปให้ตรวจ mesh/texture/material, projectile/attack prefab, VFX, เสียง, targeting, hitbox, cooldown/quantity/burst และผลอัปเกรด แยก Sword/HeroSword ตาม ID จริง หากข้อมูล runtime ขาดให้ระบุ method/field ที่ต้องตาม
- **ตัวละคร:** เว็บใช้ Fox สำหรับทดสอบ สำหรับตัวถัดไปให้ตรวจโมเดล/rig หรือ baked frames, animation states/อัตราเล่น, material, portrait, starting weapon, passive/stats, ขนาด/collider และ footstep/event mapping ภาพ portrait หรือ starting weapon อย่างเดียวไม่เท่ากับพร้อมเล่นครบ
- **มอน:** เว็บต่อภาพ Skeleton/Bandit แล้ว แต่ AI และ balance ยังเป็นสนามเทส สำหรับตัวอื่นให้ตรวจ mesh/frame lists/FPS/material, collider, movement/attack/special attacks, hit/death, loot และ stage roster; ไม่เหมาระบบเดินไล่เป็นพฤติกรรมจริงทุกตัว
- **บอส:** ยังไม่ยืนยันชุดบอสที่พร้อมใช้งานครบ ให้ส่งรายชื่อ/ID และหลักฐาน classification แยกจากมอนธรรมดา/elite พร้อม encounter/spawn trigger, phases/thresholds, ท่าทั้งหมดและ transition, telegraph/VFX/audio, hitbox/damage/cooldown, death/reward/despawn และข้อจำกัดสนาม หากพบ animation อย่างเดียวให้บันทึกว่ายังขาดพฤติกรรม

เมื่อเลือกตัวถัดไป ให้เพิ่มบันทึกรายตัวในรูปแบบนี้:

```text
หมวด / ชื่อ / ID:
สถานะ: ยังไม่ตรวจ | มีข้อมูลพร้อมต่อเว็บ | รอ AI สกัด | ต่อเว็บบางส่วน
ไฟล์เดิมและ references ที่ตรวจแล้ว:
ส่วนที่พร้อมใช้:
ส่วนที่ขาด/ยังไม่ยืนยัน (ระบุคำถามเป็นข้อ):
งานที่ให้อีก AI หา และหลักฐานที่ต้องส่ง:
ข้อจำกัด/ค่าทดลองในเว็บที่ต้องรักษา:
ลิงก์รายงานผลเมื่อได้รับ:
```

คิว Bandit/Skeleton ด้านล่างยังเป็นงานข้อมูลเร่งด่วน ส่วนรายชื่อเนื้อหาอื่นยังไม่ถูก audit รายตัว ห้ามเติมสถานะว่าไฟล์ขาดล่วงหน้า งานฝั่งเว็บระหว่างรอเลือกได้เฉพาะสิ่งที่ข้อมูลพร้อมหรือปรับระบบร่วมเดิม; หากจะเปลี่ยน phase ต้องแจ้งผู้ใช้ก่อนตาม skill

ตามคำสั่งผู้ใช้: งานค้น/ดูด/สกัดข้อมูลที่ยังขาดให้ **AI อีกตัว** ทำ รายการนี้เป็นคิวส่งต่อ; AI ฝั่งเว็บบันทึกช่องว่างและนำผลที่ตรวจหลักฐานแล้วมา implement ไม่เริ่มสกัดแทนโดยอัตโนมัติ การเพิ่มหัวข้อในไฟล์นี้ไม่ใช่การยืนยันว่าพฤติกรรมนั้นมีจริง

- คิวถัดไปที่แนะนำ: **ยืนยันบทบาทและสกิล Bandit** แล้วเทียบกับ Skeleton
- สถานะ: รอผลจาก AI สกัด ยังไม่ยืนยันว่า Bandit เป็นมอนธรรมดา / elite / miniboss / boss
- Lab มี Walk / Hit / Death เป็นสถานการณ์ทดสอบของเว็บ ไม่ได้พิสูจน์ว่าต้นฉบับมีแอนิเมชันหรือ state แยกครบสามท่า
- โมเดลและ baked run frames พร้อมแล้ว; AI สกัดไม่ต้องส่งโมเดลชุดเดิมซ้ำ

### ชุดส่งต่อถัดไป: Bandit + Skeleton combat behavior

1. ยืนยัน Bandit EnemyData8032 ว่าเข้าเส้นทาง spawn ปกติ, elite, miniboss หรือ boss ที่ใดบ้าง และแยกจากตัวอื่นที่ชื่อคล้ายกันด้วย reference จริง อย่าใช้ชื่อ Bandit หรือค่า `isBoss:false` ใน catalog เป็นข้อยุติ
2. Resolve `EnemyData.specialAttacks` ของ Bandit และ Skeleton8037 จาก raw asset พร้อม array count, PPtr ทุกตัว และชนิด component ปลายทาง หากว่าง ให้ตาม runtime assignment / prefab / AI class ต่อก่อนสรุปว่าไม่มีสกิล
3. หากมีท่าพิเศษ: ระบุ trigger/เงื่อนไข, ระยะเริ่ม/เล็ง, wind-up, active/recovery, cooldown, จำนวนครั้ง/กระสุน, trajectory, hitbox, damage และการสเกล พร้อมหน่วยและ call site
4. ระบุ animation ที่ท่านั้นใช้, จังหวะหยุดเดิน/ล็อกเป้า, เสียง/VFX ที่เรียกจริง และเงื่อนไขยกเลิกเมื่อโดนตี/ตาย/เกม pause; อ้าง asset ที่มีอยู่ก่อนสกัดเพิ่ม
5. หากไม่มีท่าพิเศษที่ยืนยันได้ ส่งหลักฐานขอบเขตที่ตรวจและพฤติกรรม chase/contact จริงแทน ห้ามแต่งสกิลจากโมเดลหรือวิดีโออย่างเดียว

ผลที่ต้องการ: รายงาน Markdown + JSON แยกรายตัว โดยแยก serialized data / runtime formula / ข้อที่ยังไม่ทราบ ใช้รูปแบบหลักฐานท้ายไฟล์นี้ งานฝั่งเว็บหลังรับข้อมูลคือแยกพฤติกรรมรายมอนและเพิ่มสถานการณ์ Lab ตามที่พิสูจน์ได้ โดยยังรักษาค่าจูนผู้ใช้ไว้

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

อัปเดตงานเลือกอัปเกรด: อ่าน item JSON เดิมครบ142รายการแล้ว รายละเอียดรายตัวใน UPGRADE_DATA_AUDIT.json และ [UPGRADE_IMPLEMENTATION.md](UPGRADE_IMPLEMENTATION.md) ทั้ง26Tomes มี description ว่างและไม่มี numeric modifier/stat mapping ในไฟล์ที่ตรวจ;87Equipment มี29คำอธิบายว่าง (บางอันที่มีถูกตัด) จึงไม่ถือว่าพร้อมทำ effect จากข้อความอย่างเดียว

เว็บต่อระบบเลือก/เก็บเลเวล/แสดงค่าก่อนหลัง/คัดตัวเลือกเต็มแล้วโดยใช้ผลเดิม3แบบของ Damage/Cooldown/Quantity เท่านั้น (+5,×0.85 floor0.15s,+1 cap8 เป็นค่าทดลองเดิม ไม่ใช่ค่าจริง Tome) อีก23Tomes ยังไม่เปิด gameplay รอ AI อีกตัวส่ง:

- ทุก Tome: enum/identity chain, stat IDs และ operation (add/multiply/override), modifier values ต่อ level/rarity พร้อมหน่วยและสูตรรวมกับอาวุธ/ตัวละคร
- ชื่อ/คำอธิบาย localized ที่ resolve ครบ ไม่เดาค่าจากชื่อหรือ icon
- eligible pool, unlocks/slot limit/duplicates, weights/rarity roll, level caps, เมื่อ pool เต็ม/หมด รวม reroll/banish ถ้ามีจริง
- หลักฐานว่า equipment/passive/shop ชิ้นใดเข้า level-up pool จริง แยกจากหีบ/ร้าน/starting passive ก่อนเสนอให้ผู้เล่นเลือก
- Source fields และ runtime call sites ตามรูปแบบส่งงานท้ายไฟล์ ไม่ต้องส่ง PNG เดิมซ้ำหรือแก้เสียงกดเลือกที่ผู้ใช้ยืนยันแล้ว

มีภาพ native, สี4กลุ่ม, tier thresholds, รายงาน stacking/attraction และ Xp2 แล้ว ดู XP_ASSET_HANDOFF.md และ PROGRESSION_IMPLEMENTATION.md ก่อน

- สูตร EXP ที่ต้องใช้ต่อเลเวล และ modifiers; ตอนนี้เว็บใช้5+3ต่อเลเวล
- XP จริงที่ EnemyData ให้กับแต่ละมอน และการสเกล runtime ก่อนส่งให้ pickup manager
- ตรวจการรวมก้อน/ขอบเขต500/ลำดับ FIFO กับ native method body หากต้องการความแม่นยำเกินรายงานที่ส่งต่อ
- Echo XP / passive ที่สร้างมัน และ XpDamager ระหว่างบิน: เงื่อนไข/ดาเมจจริง เว็บยังไม่เปิดระบบเหล่านี้
- Native ring-buffer/frame age ของก้อน EXP: ตอนนี้วน7เฟรมตามคำขอผู้ใช้
- แค็ตตาล็อกอัปเกรดจริง: pool, rarity, roll weights, eligibility และผลของแต่ละ stat; เว็บมีเพียงสามตัวเลือกทดลอง

สี EXP เป็นช่วงค่าที่อยู่ในก้อนตามรายงาน ไม่ใช่สรุปว่าสีฟ้าให้1เสมอ: ฟ้า1..9, เหลือง10..49, แดง50+, ม่วง echo ต้องแยกหลักฐาน tier กับ value ของการดรอป

## งาน parity ภาพ/เสียงที่เหลือ (ความสำคัญรอง)

- หน้าตั้งค่าเสียง6ช่องทำแล้วตามภาพผู้ใช้ ดู AUDIO_SETTINGS.md; หมวดเสียงเป็น web policy ยังไม่ยืนยัน native mixer routing ช่อง Music บันทึกค่าแล้วแต่สนามเทสยังไม่เล่น BGM หากจะต่อเพลงจริงให้ตรวจ WAV เดิมก่อน แล้วให้อีก AI ยืนยัน track/scene/event/loop transition และ routing ที่ยังไม่ทราบ ไม่สกัดเพลงซ้ำหรือเอา LevelupAmbience ไปเรียกว่าเพลง

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
