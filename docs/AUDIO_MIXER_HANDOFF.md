# ส่งต่อ AI ตรวจช่องเสียงต้นฉบับ — 2026-11-13

ผู้ใช้ให้บันทึกทุกจุดที่ยังไม่แน่ใจเพื่อให้อีก AI หา ไม่ให้ AI ฝั่งเว็บเดาการจัดกลุ่มเสียงเพิ่ม งานนี้เป็นคำขอข้อมูล ไม่ใช่คำสั่งให้แก้เว็บหรือเปลี่ยนคลิป/ค่าจูน

## สิ่งที่รู้กับสิ่งที่ยังไม่รู้

- ภาพอ้างอิงยืนยันว่าหน้า Audio แสดง Master Volume, Music Volume, Game Sounds, Ambience, UI, XP and Gold ตามลำดับ แต่ภาพไม่บอกว่าแต่ละสไลเดอร์ควบคุมคลิปใด
- UI โดยทั่วไปหมายถึงส่วนติดต่อผู้ใช้ การใช้ชื่อนี้ตามภาพไม่ได้พิสูจน์ว่า Enter5/menuMove/Levelup4 ทั้งหมดต้องอยู่ช่อง UI ในเกมต้นฉบับ
- มีหลักฐานหน้าที่/แหล่งเรียกของ Enter5 (uiClick), LevelupAfter, Levelup4 และ LevelupAmbience อยู่แล้ว **การรู้ event ไม่เท่ากับรู้ mixer group** ห้ามเปลี่ยนสถานะเป็น routing verified จากชื่อคลิป/ตัวแปร/category ของ catalog
- โค้ดเว็บปรับเสียงแยกกลุ่มได้จริง แต่การจัดคลิปลงกลุ่มปัจจุบันเป็น web policy ที่ยังไม่ได้ยืนยันจาก native mixer รวมถึง default1 และ master calibration0.35 เป็นนโยบายเว็บ ไม่ใช่ค่าเริ่มต้น/เส้นโค้งของต้นฉบับ

## การผูกช่องปัจจุบันในเว็บ — ต้องตรวจ ไม่ใช่คำตอบต้นฉบับ

อ่าน src/audio/GameAudio.ts (`soundChannel`, `clips`, `updateVolumes`) และ src/dev/WeaponSoundPreview.ts ประกอบ:

- UI: `click` → Enter5, `hover` → menuMove, `levelOpen` → Levelup4 **ยังไม่ยืนยัน mixer group ทั้งสาม โดยเฉพาะ Levelup4**
- Ambience: `levelAmbience` → LevelupAmbience **ยังไม่ยืนยันว่าควรอยู่ Ambience หรือช่องอื่น** และยังไม่มีเสียงบรรยากาศฉากเชื่อมเข้าช่องนี้
- XP and Gold: `xp` → Xp2, `gold` → gold, `silver` → Silver **ยังไม่ยืนยันว่า Silver รวมอยู่ในช่องเดียวกันจริงหรือไม่**
- Game Sounds: shot/SwordSwing, staff impacts/Hit2, PlayerDamage/DeathImpact, Player_Jump/Player_Landing และ `level` → LevelupAfter **ยังไม่ยืนยัน routing รายคลิป โดยเฉพาะเสียงแจ้งเลเวลอัป**
- เสียงทดลองอาวุธใน Lab: ตอนนี้ทั้งหมดผ่าน Game Sounds โดยตั้งใจเป็น preview policy ไม่ใช่ข้อมูลระบบต้นฉบับ
- Music: บันทึกค่าและเตรียม bus แล้ว แต่สนามเทสยังไม่มี BGM playback จึงยังไม่ใช่ตัวควบคุมเพลงที่กำลังเล่น ไม่ได้หมายความว่าไม่มีไฟล์เพลงในชุดสกัด
- Master: ปัจจุบันคูณทุก bus แบบ linear; โครง parent/child จริง, dB mapping, floor/mute ยังไม่ยืนยัน

## คำถามให้อีก AI หา

1. ตาม UI slider callback ไปยัง settings fields และ AudioMixer exposed parameters จริง: ชื่อ parameter/group, GUID/fileID/pathID, parent/child และ call site ที่ SetFloat/ปรับ volume ใช้ ห้ามจับคู่จากคำว่า UI ในชื่อตัวแปรอย่างเดียว
2. Resolve AudioSource.outputAudioMixerGroup และการ assign group ตอน runtime ของทุกคลิปในรายการข้างบน รวมเสียงที่ AudioManager เรียก procedural; ระบุว่าเล่นผ่าน source ใดและ inherit กลุ่มใด
3. แยก LevelupAfter / Levelup4 / LevelupAmbience ให้ได้ว่าแต่ละเสียงอยู่ group ใด ช่อง Ambience ของต้นฉบับรวมเสียงเมนู/ฉาก/หน้าเลือกของอย่างไร และ UI คุมอะไรบ้างจริง
4. ยืนยันว่าช่อง XP and Gold ครอบคลุม Silver หรือไม่ รวมเสียง pickup/หีบ/เลือกของชนิดอื่นหรือไม่
5. ยืนยัน Game Sounds ครอบคลุม footstep/jump/hurt/death/weapon/notification ใด และมี child groups หรือ AudioSource ที่ข้าม slider หรือไม่
6. ค่าที่สไลเดอร์แสดง0..1 แปลงเป็น linear gain/dB ด้วยสูตรใด; default, clamp, zero/mute floor, snapshot/ducking, pause/modal effects และลำดับการคูณ master/category/source เป็นอย่างไร
7. ค่าเหล่านี้ save/load ที่ไหนและใช้ field ใด ค่า0.69/0.48ในภาพเป็นค่าผู้เล่น ห้ามถือเป็น default โดยไม่มีหลักฐาน
8. เพลง/ambient ของฉาก: ตรวจ WAV/report ที่มีแล้วก่อน ขอ track → scene/event/loop/transition/routing เท่าที่ขาด ไม่ต้องสกัดเพลงหรือภาพซ้ำ

## รูปแบบส่งกลับ

ส่งรายงาน MD + JSON ของ slider/parameter/group/clip mappings พร้อม source build/hash, raw serialized reference chain และ RVA/method-body excerpt สำหรับ runtime wiring/formulas แยกสถานะ **ยืนยันแล้ว / อนุมาน / ยังไม่ทราบ** รายช่องและรายคลิป ถ้าคลิปหนึ่งเล่นหลาย source ให้แยก call site อย่าสรุปรวมเป็น routing เดียว

ระบุชัดว่าการผูกช่องปัจจุบันของเว็บข้อใดถูก/ผิด/ยังตัดสินไม่ได้ พร้อมข้อเสนอแก้ที่อ้างหลักฐาน งาน implement เป็นของ AI ฝั่งเว็บหลังรับข้อมูล รักษาคลิป/เสียงที่ผู้ใช้ยืนยันและค่าจูนปัจจุบันไว้ก่อน ไม่เปิด DLL/Unity containers หรือเริ่มสกัดในงานบันทึกนี้
