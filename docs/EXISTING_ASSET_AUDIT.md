# ตรวจไฟล์ asset ที่มีอยู่ — 2026-11-13

ตรวจชุดสกัดเดิมแบบหลายชิ้นพร้อมกันเท่านั้น ไม่เปิดไฟล์เกม ไม่แกะ DLL/Unity container และไม่สกัดเพิ่ม ใช้ `tools/audit_existing_assets.py` ตรวจซ้ำได้

ผลรายไฟล์พร้อมขนาด/hash และ reference ที่ไม่พบอยู่ใน `EXISTING_ASSET_AUDIT.json` ตรวจเฉพาะ references ที่ถูกบันทึกใน JSON เดิม ไม่พิสูจน์ว่าผู้สกัดเก็บ dependencies ครบหรือจับคู่ถูกทั้งหมด

## ข้อสรุปและคิวใช้งาน

- มี OBJ ให้ตรวจนำมาใช้ต่อหลายชิ้น เช่น Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger และ Aegis/Shield ไม่ต้องสกัด mesh เหล่านี้ซ้ำ หากต้องการ preview ต้องตรวจ material/texture/transform ที่อ้างมาด้วย
- การพบ OBJ เป็นผู้สมัครสำหรับ preview ภาพ ไม่ได้แปลว่ากติกาโจมตี เสียง และ VFX พร้อมเล่นครบ ต้องเทียบหลักฐานตาม WEAPON_BEHAVIOR.md ก่อนเพิ่มระบบโจมตี
- เพิ่มห้องดูโมเดลใน Lab แล้ว7ชิ้น: Axe, Bow/Arrow, Dice, Mine, Rockets, Bluetooth Dagger, Aegis ดู WEAPON_MODEL_PREVIEWS.md; ใช้ไฟล์เดิม ไม่มีการสกัดเพิ่ม
- Bananarang/Poison Flask ที่อ้าง mesh ชื่อ Cube ต้องตรวจ geometry/material pairing ก่อนตัดสินรูปทรง ชื่อไฟล์อย่างเดียวไม่บอกว่าเป็น placeholder หรือโมเดลที่ถูกต้อง
- EnemyData มีชื่อ AnimatedMesh/pathID แต่ในโฟลเดอร์ enemies มีเพียง JSON; hierarchy ที่ว่างและตัวเลข frameCount ไม่ใช่ vertex/index/UV payload จึงยังใช้สร้างตัวใหม่ไม่ได้จากชุดนี้เพียงอย่างเดียว
- Skeleton/Bandit มีไฟล์ animation/albedo ที่ต่อในเว็บแล้ว แยกจากข้อจำกัดของชุด catalog; ห้ามเหมาว่ามอนทั้งหมดไม่มี asset หรือเรียก importer เพื่อสกัดตัวใหม่เอง
- ตัวละครที่มี portrait/metadata ยังไม่ถือว่ามี rig/skin/animation พร้อมเล่น Fox มี fox-rig.json ในเว็บแล้ว
- ค่า isBoss, frameCount และ audio trigger ใน catalog ยังไม่ใช่หลักฐานยืนยัน พบข้อผิดพลาดมาก่อนแล้ว ไม่แบ่งชนิดบอสหรือสร้างสกิลจากค่าเหล่านี้

## รายการที่ตรวจครบตามโฟลเดอร์

### อาวุธ: 30 รายการ

- **aegis** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: Shield.obj; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/aegis/data.json`
- **aura** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 1; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/aura/data.json`
- **axe** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: Axe.obj; PNG shared 2; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/axe/data.json`
- **bananarang** — ยังไม่ต่อเว็บ; OBJ: Cube.obj; PNG shared 2; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/bananarang/data.json`
- **black_hole** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/black_hole/data.json`
- **blood_magic** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 4; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/blood_magic/data.json`
- **bluetooth_dagger** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: BluetoothDagger.obj; PNG shared 4; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/bluetooth_dagger/data.json`
- **bone** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/bone/data.json`
- **bow** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: Arrow.obj; PNG shared 2; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/bow/data.json`
- **chunkers** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 4; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/chunkers/data.json`
- **corrupt_sword** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/corrupt_sword/data.json`
- **dexecutioner** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/dexecutioner/data.json`
- **dice** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: Dice.obj; PNG shared 4; WAV 5; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/dice/data.json`
- **dragons_breath** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/dragons_breath/data.json`
- **firestaff** — ต่อเว็บบางส่วนแล้ว; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 4; WAV 4; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/firestaff/data.json`
- **flamewalker** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/flamewalker/data.json`
- **frostwalker** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 4; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/frostwalker/data.json`
- **hero_sword** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/hero_sword/data.json`
- **katana** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/katana/data.json`
- **lightning_staff** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 1; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/lightning_staff/data.json`
- **mine** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: Mine.obj; PNG shared 4; WAV 4; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/mine/data.json`
- **poison_flask** — ยังไม่ต่อเว็บ; OBJ: Outline.obj, Top.obj; PNG shared 6; WAV 3; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/poison_flask/data.json`
- **revolver** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/revolver/data.json`
- **rockets** — มีห้องดูโมเดลใน Lab (ยังไม่มี combat); OBJ: mesh_rocket.obj; PNG shared 4; WAV 5; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/rockets/data.json`
- **scythe** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 4; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/scythe/data.json`
- **shotgun** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 4; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/shotgun/data.json`
- **sniper** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/sniper/data.json`
- **space_noodle** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 3; WAV 5; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/space_noodle/data.json`
- **sword** — ต่อเว็บบางส่วนแล้ว; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 2; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/sword/data.json`
- **tornado** — ยังไม่ต่อเว็บ; OBJ: ไม่มี OBJ ใน references ที่ตรวจ; PNG shared 5; WAV 2; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `weapons/tornado/data.json`

### มอนและรายการชื่อบอสใน catalog: 53 รายการ

- **_test** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/_test/data.json`
- **_test2** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/_test2/data.json`
- **bandit** — ต่อเว็บบางส่วนแล้ว; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/bandit/data.json`
- **bee** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/bee/data.json`
- **boomerspider** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/boomerspider/data.json`
- **bush** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/bush/data.json`
  - มีชื่อ component ใน hierarchy เดิม: EnemySpecialAttackHitscanMultiple; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล
- **cactusshooter** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/cactusshooter/data.json`
- **entstage1** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/entstage1/data.json`
- **entstage2** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/entstage2/data.json`
- **entstage3** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/entstage3/data.json`
- **frogblue** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/frogblue/data.json`
- **froggreen** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/froggreen/data.json`
- **frogred** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/frogred/data.json`
- **ghost** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghost/data.json`
- **ghostgrave1** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostgrave1/data.json`
- **ghostgrave2** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostgrave2/data.json`
- **ghostgrave3** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostgrave3/data.json`
- **ghostgrave4** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostgrave4/data.json`
- **ghostgreater** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostgreater/data.json`
- **ghostinvincible** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostinvincible/data.json`
- **ghostkingdata** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostkingdata/data.json`
- **ghostpurple** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostpurple/data.json`
- **ghostred** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghostred/data.json`
- **ghoul** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/ghoul/data.json`
- **goblinstrong** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/goblinstrong/data.json`
- **goblintank** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/goblintank/data.json`
- **goblinweak** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/goblinweak/data.json`
- **golem** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/golem/data.json`
- **head** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/head/data.json`
- **miniboss_desert_golem** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_desert_golem/data.json`
- **miniboss_ghostham** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_ghostham/data.json`
- **miniboss_golem** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_golem/data.json`
- **miniboss_pig** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_pig/data.json`
  - มีชื่อ component ใน hierarchy เดิม: AudioSource, CircleWarning, EnemyGroundSlam, EnemyProjectileMud, MeshFilter, MeshRenderer, ParticleSystem, ParticleSystemRenderer, RandomSfx, RetroPitchRandomizer, RotateObject; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล
- **miniboss_scorpion** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_scorpion/data.json`
- **miniboss_skeletonking** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/miniboss_skeletonking/data.json`
- **mummy** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/mummy/data.json`
- **mummyancient** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/mummyancient/data.json`
- **mummytank** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/mummytank/data.json`
- **pharaoh1** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/pharaoh1/data.json`
  - มีชื่อ component ใน hierarchy เดิม: AudioPauser, AudioSource, EnemySpecialAttackFollowing, EnemySpecialAttackManyRandom, EnemySpecialAttackSpinningLasers, EnemySpecialAttackTargetLaser, MeshFilter, MeshRenderer, ParticleSystem, ParticleSystemRenderer, RandomSfx; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล
- **pharaoh2** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/pharaoh2/data.json`
  - มีชื่อ component ใน hierarchy เดิม: AudioPauser, AudioSource, EnemySpecialAttackFollowing, EnemySpecialAttackManyRandom, EnemySpecialAttackSpinningLasers, EnemySpecialAttackTargetLaser, MeshFilter, MeshRenderer, ParticleSystem, ParticleSystemRenderer, RandomSfx; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล
- **pharaoh3** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/pharaoh3/data.json`
  - มีชื่อ component ใน hierarchy เดิม: AudioPauser, AudioSource, EnemySpecialAttackFollowing, EnemySpecialAttackManyRandom, EnemySpecialAttackSpinningLasers, EnemySpecialAttackTargetLaser, MeshFilter, MeshRenderer, ParticleSystem, ParticleSystemRenderer, RandomSfx; เป็นเบาะแสค้นต่อ ไม่ยืนยันเงื่อนไข/สูตรของสกิล
- **scorpion** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/scorpion/data.json`
- **scorpionbig** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/scorpionbig/data.json`
- **skeleton** — ต่อเว็บบางส่วนแล้ว; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeleton/data.json`
- **skeletonarmored** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeletonarmored/data.json`
- **skeletonarmoreddusty** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeletonarmoreddusty/data.json`
- **skeletondusty** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeletondusty/data.json`
- **skeletongold** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeletongold/data.json`
- **skeletonxp** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/skeletonxp/data.json`
- **slime** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/slime/data.json`
- **tumblebone** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/tumblebone/data.json`
- **wisp** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/wisp/data.json`
- **zombie** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `enemies/zombie/data.json`

### ตัวละคร: 21 รายการ

- **amog** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/amog/data.json`
- **athena** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/athena/data.json`
- **bandit** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/bandit/data.json`
- **birdo** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/birdo/data.json`
- **bush** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/bush/data.json`
- **calcium** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/calcium/data.json`
- **chadwell** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/chadwell/data.json`
- **clank** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/clank/data.json`
- **dicehead** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/dicehead/data.json`
- **fox** — ต่อเว็บบางส่วนแล้ว; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/fox/data.json`
- **knight** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/knight/data.json`
- **megachad** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/megachad/data.json`
- **monke** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/monke/data.json`
- **ninja** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/ninja/data.json`
- **noelle** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/noelle/data.json`
- **ogre** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/ogre/data.json`
- **roberto** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/roberto/data.json`
- **robinette** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/robinette/data.json`
- **spaceman** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/spaceman/data.json`
- **tonymczoom** — ยังไม่ต่อเว็บ; hierarchy ว่าง/null; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/tonymczoom/data.json`
- **vlad** — ยังไม่ต่อเว็บ; มี hierarchy; ไม่พบ playable mesh/rig payload จาก references ที่ตรวจ; ไม่พบ reference ชี้ไฟล์ขาดในขอบเขตที่ตรวจ. metadata: `characters/vlad/data.json`

## ส่งต่อ AI สกัดเฉพาะส่วนที่ยังขาด

- อาวุธที่มี OBJ: ตรวจ identity/material pairing, prefab component fields และ runtime behavior ที่ขาดก่อน ขอเฉพาะข้อมูลที่ยังไม่มี ไม่ส่ง mesh/เสียงชุดเดิมซ้ำ
- มอนใหม่: ขอ per-species playable geometry หรือ baked frames (positions/UV/indices, FPS, state mapping), albedo/material chain และ renderer/collider transform; รวม AI/สกิล/ด่านเกิดตาม EXTRACTION_BACKLOG.md
- บอส: ต้องมีหลักฐาน classification, spawn/phase/attack transitions ไม่ใช้ชื่อ miniboss หรือ isBoss ใน catalog เป็นข้อยุติ
- ตัวละครใหม่: ขอ playable rig/skin/animation หรือ baked representation พร้อม material chain และ passive/starting weapon ที่พิสูจน์แล้ว ไม่ต้องส่ง portrait เดิมซ้ำ
- ข้อมูลที่ยังไม่พร้อมและคำถามละเอียดติดตามที่ EXTRACTION_BACKLOG.md; ผู้รับผิดชอบค้น/สกัดคือ AI อีกตัว
