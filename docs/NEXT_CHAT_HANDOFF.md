# รับช่วง War-Core — 2026-11-14 (Asia/Bangkok)

## เริ่มตรงนี้

ผู้ใช้กำลังจะเปิดแชทใหม่ เอกสารนี้เป็นบริบทส่งต่อ ไม่ใช่คำสั่งให้สร้างโปรเจกต์ใหม่ อ่าน skill + git status/diff ก่อนแก้ทุกครั้ง และอ่านท้าย TEMPORARY_IMPLEMENTATIONS.md เพราะค่าจูนใหม่สุดอาจแทนข้อความเก่า

- **เว็บที่แก้:** `C:/Users/Korawit/Desktop/War-Core/` (มีขีด)
- **ชุด asset ที่สกัดไว้แล้ว:** `C:/Users/Korawit/Desktop/WarCore/megabonk_extracted_assets/` (ไม่มีขีด) อ่าน/คัดลอกของเดิมได้ แต่ไม่แก้ต้นฉบับ
- Remote: `https://github.com/K-mangda/WarCore.git`
- Branch เผยแพร่: `codex/phase-1-movement` ห้ามเปลี่ยนเพราะชื่อเก่า — **ปัจจุบัน Phase 2** ระบบสนามทดสอบและเครื่องมือผู้เล่น
- เว็บ: `https://k-mangda.github.io/WarCore/`
- โค้ดเกมล่าสุดก่อนเอกสารส่งต่อนี้: **069d594** (แถบสีเวลอัปเร็วขึ้น) Build/Deploy สำเร็จแล้ว เอกสารส่งต่อนี้อาจอยู่ commit ถัดมา ให้ตรวจ HEAD จริงเสมอ

## กติกาถาวรของผู้ใช้

1. ใช้ skill `warcore-development`: `C:/Users/Korawit/.codex/skills/warcore-development/SKILL.md` (สำเนาใน repo: `skills/warcore-development/SKILL.md`)
2. งานที่ทำเสร็จและตรวจผ่านแล้ว **commit/push อัตโนมัติ** ไป branch/remote เดิม ไม่ต้องถามให้สั่ง push ซ้ำ GitHub Actions เผยแพร่ Pages ให้เอง ตรวจผลจริงก่อนบอกว่า deploy สำเร็จ ห้าม force-push/เปลี่ยนปลายทางเอง
3. ถ้าจะเปลี่ยน phase ต้องแจ้งก่อน ตอนนี้อยู่ Phase 2 แล้ว แต่ native movement parity ยังมีช่องว่าง ไม่ใช่ทุกระบบตรงต้นฉบับครบ
4. ผู้ใช้เทสภาพ/เสียง/gameplay feel เอง ตรวจ build และ focused checks เท่าที่จำเป็น การจูนภาพเล็ก ๆ ไม่ต้องเทียบละเอียด/เปิด browser ทดสอบยืดยาว
5. **ห้ามสกัด/แกะเกมเอง** งานนั้นเป็นอีก AI หน้าที่ฝั่งนี้คือค้นไฟล์ที่ส่งออกไว้แล้วเป็นชุด ๆ ได้หลายอาวุธ/มอน/ตัวละครพร้อมกัน ต่อสิ่งที่ข้อมูลครบ และบันทึกสิ่งที่ขาดลง MD ให้อีก AI หา
6. ไม่แน่ใจให้จดเองทันที แยก **มี asset แต่ยังไม่ต่อ** ออกจาก **ข้อมูล/พฤติกรรมยังขาด** ห้ามเดาสูตร/trigger จากชื่อคลิป ภาพตัวอย่าง หรือ flag ใน catalog ที่ยังไม่ตรวจหลักฐาน
7. รักษางานค้าง/ค่าที่ผู้ใช้จูนและหลักฐานเดิม ไม่ reset/ลบทับ ข้อความเก่าว่าไม่ push ถูกแทนด้วยคำสั่ง push อัตโนมัติแล้ว
8. ไม่ทำ Controller/Gamepad อนาคตมือถือใช้ touch แต่ยังไม่ใช่งานที่ต่อเสร็จ
9. ตอบไทยสั้น ชัด ลงมือกับงานที่อนุญาตแล้ว ไม่ต้องขออนุมัติ routine ซ้ำ ไม่สรุปว่ารายการที่พูดถึงคือระบบทั้งหมดของเกม

## ไฟล์ที่ควรอ่านตามลำดับ

- เอกสารนี้ + `git status --short`, `git diff`, `git log -8 --oneline`
- `docs/TEMPORARY_IMPLEMENTATIONS.md` **ท้ายไฟล์** (ไฟล์เก่ามี encoding ผสม: ถ้าอ่าน UTF-8 ไม่ผ่าน ห้าม decode ทับทั้งไฟล์; ต่อท้ายโดยรักษา bytes เดิม)
- `docs/PHASE_STATUS.md`, `docs/PLAYTEST_SYSTEMS.md`
- งานปัจจุบัน: `docs/UPGRADE_SCREEN_REFERENCE.md`, `docs/CHARACTER_SELECTION.md`
- รายการส่งอีก AI: `docs/EXTRACTION_BACKLOG.md` เป็นศูนย์กลาง + ลิงก์เฉพาะหัวข้อข้างใน
- เมื่อแก้อาวุธ: `docs/WEAPON_BEHAVIOR.md`, `docs/WEAPON_MODEL_PREVIEWS.md`
- EXP/เงิน/เลเวล: `docs/XP_ASSET_HANDOFF.md`, `docs/PROGRESSION_IMPLEMENTATION.md` (ข้อความเก่าใน XP handoff บางส่วนถูก follow-up แทนแล้ว)
- Pause/ตาย: `docs/PAUSE_END_REFERENCE.md`
- Settings: `docs/SETTINGS_REFERENCE_BACKLOG.md`, `docs/AUDIO_MIXER_HANDOFF.md` และเอกสาร Controls/Video/Effects/Game UI ใน docs
- Asset inventory: `docs/EXISTING_ASSET_AUDIT.md` และ JSON คู่กัน ไม่ถือว่า catalog ครบแปลว่าพร้อมเล่นครบ

## ทำอะไรไปแล้ว

### สนามทดสอบและ Lab

- เกมเล่นด้วย Fox, Firestaff/Sword, Skeleton/Bandit, ดรอป EXP/Gold/Silver, Tome ทดลอง 3 ชนิด, pause ตอนเลือกของ แล้ว resume
- มอนใช้ baked mesh batches/ฉากต้นไม้ instancing และปรับต้นทุน render แล้ว ผู้ใช้ยืนยัน FPS ดีขึ้นมาก อย่าถอยไปสร้าง mesh ต่อมอน/ต้นไม้หรือทำงานหนักต่อเฟรมซ้ำ
- Lab แบ่ง Weapons / Pickups / Effects / Characters / Enemies; เลือกตัวก่อนแล้วเลือก action/room, ค้นหาในหมวด, readiness, retry asset ห้อง, iframe มี build nonce + module boot recovery
- อาวุธเพิ่ม 7 ชิ้นเป็น Model/Sounds และ 6 ชิ้นมี shared Hit fixture: **ยังไม่ใช่ combat native ที่เล่นได้ทั้งหมด** Aegis ไม่มีห้อง hit, ดูเอกสารรายชิ้น
- Characters Lab: Fox 5 คลิปจริง Idle/Run/Jump/Falling/Grind, scrub/play/stop/หมุน ไม่มีการเปิดสกิล Grind หรือเดาเสียงตามคลิป
- Character selection: Play -> รายชื่อ 21 ตัว -> Confirm, 20 portrait จริงพร้อม hashes; TonyMcZoom portrait ขาด เลือกดูตัวอื่นได้แต่เริ่มได้เฉพาะ Fox
- หน้าตาม selection reference: roster ซ้าย / โมเดล Fox กลาง / รายละเอียดขวา; Fox หันหน้า, **กดเมาส์ซ้ายค้างลากซ้ายขวาหมุนได้** ตัวที่เล่นไม่ได้เป็น **เงาดำ** ทั้ง portrait ในรายชื่อ/รายละเอียด
- Fox description/Firestaff/RNG Blessing มาจากภาพผู้ใช้ แต่ **ยังไม่เปิดผล passive luck** ไม่เดา Rank/run count/ราคา/skin หรือชื่อทางการที่จับคู่ยังไม่ชัวร์

### เมนูและเครื่องมือ

- Pause: Resume/Settings/Lab/New Run/History พร้อม Inventory/Stats; หน้าตาย Damage/Summary/Quests แต่ดาเมจรวม/DPS/Quests/รางวัลจบรอบยังไม่มี ต้องแสดง unavailable ไม่ใส่ค่าปลอม
- ประวัติใน localStorage สูงสุด 30 รอบ, death/reset บันทึกครั้งเดียว; ข้อมูลต่อ browser/origin ไม่มี server sync
- เปลี่ยนปุ่มเดิน/กระโดดเอง ตรวจซ้ำ/คีย์สงวน/reset; แก้ held-key resume แล้ว
- Settings ใช้ได้: audio routing ปัจจุบัน (Music ยังไม่มีเพลง), mouse/look, Video/Low-Balanced-High, Effects และ Game HUD prefs — ดู MD สำหรับ scope/unknown ไม่อ้างว่าทุกสไลเดอร์ตรง native
- หน้าเกม/Lab มี short Git SHA; build จาก Actions ใช้ GITHUB_SHA

### หน้าเวลอัปและค่าจูนล่าสุด (ห้ามย้อนกลับ)

- หน้าเลือกอัปเกรดใหม่: **Inventory (Weapons/Tomes/Items) ซ้าย / Upgrade Offers เรียงแนวตั้งกลาง / Stats ขวา**
- ยังมีแค่ Tome ทดลอง Damage/Haste/Quantity ที่เชื่อมจริง ไม่สร้าง rarity/pool/new weapon จากภาพอย่างเดียว
- Banish/Skip/Refresh แสดง **disabled** ไม่มีตัวเลข charges ปลอม; native rules รออีก AI
- PlayerStats ใช้ร่วม Pause/Upgrade แสดงค่าจริงที่มีเท่านั้น สเตตัสย่อยส่วนใหญ่ในภาพต้นฉบับยังไม่รองรับ
- แถบสีเวลอัป 6 สีวิ่งวน **รอบละ 1 วินาที** ล่าสุดจาก 4 วินาที -> เร็วขึ้น 4 เท่า; reduced motion คงหยุดภาพ แถบนี้เป็น visual ไม่ใช่ XP gain ปลอม
- **EXP และเหรียญไม่เรืองแสงแล้ว**: เอา halo ของ EXP/Gold ออก, EXP brightness=1 อย่าใส่กลับเพราะอ่านข้อจูนเก่า
- เฉพาะเอฟเฟกต์ LEVEL UP: สีครีมทอง/เหลืองนวล, ประกายเล็กลงเหลือ **18%**, ความเร็วกระจาย **2.5–4.5**, glow จาง ๆ ของข้อความ/ประกาย (ไม่ใช่เงิน/EXP)
- ป้าย LEVEL UP เกิดเหนือหัว, ขยายจากเล็ก แกว่งข้างเดียวหนึ่งที ย่อหุบเข้ากลางหายเร็ว และอายุอนิเมชันหยุดตาม gameplay pause ใช้ renderer เดียวกับ Lab
- เลขรับของข้างตัว: **Silver +จำนวน สีเงิน อยู่เหนือ EXP**, EXP +จำนวน สีฟ้า, Gold $จำนวน สีเหลืองอยู่ล่าง EXP; ได้แต่ละครั้งเด้งใหญ่แล้วหด, รัว ๆ ก็เด้งรัว, เฟดช่วงท้าย — ภาพ Silver ที่ซีดคือกำลังจะหาย ไม่ใช่ให้ซีดตลอด
- เหรียญ Gold เล็ก ลอยโค้งเข้าผู้เล่นอัตโนมัติและหดตอนเข้าใกล้; ผู้ใช้จูนให้ช้าลงหลายครั้งแล้ว ห้ามรีเซ็ตความเร็ว/ขนาด
- เดิน/กระโดด/Firestaff range/hitbox/knockback เคยจูนหลายครั้ง ให้รักษาค่าปัจจุบัน ไม่ยกค่าใน screenshot มาแทน

## จุดเข้าโค้ด

- `src/main.tsx`: Engine lifecycle + เมนู/overlays/flow
- `src/ui/UpgradeMenu.tsx`, `src/ui/PlayerStats.tsx`, `src/ui/combat.css`: หน้าตอนเลเวลอัป
- `src/ui/CharacterSelect.tsx`, `CharacterPreview.tsx`, `character-select.css`, `src/characters/Catalog.ts`: เลือกตัว/preview/roster
- `src/ui/RunPanels.tsx`, `run-panels.css`, `usePanelFocus.ts`: Pause/ตาย/ประวัติ/focus
- `src/dev/SwordPreview.ts`, `LabAssets.ts`, `CharacterRooms.ts`, `WeaponModels.ts`, `lab.html`: Lab
- `src/combat/Run.ts`, `Upgrades.ts`, `Balance.ts`, `Pickups.ts`: ระบบจริงและค่าทดลอง
- `src/combat/ProgressionView.ts`: เหรียญ/LEVEL UP; `XpView.ts`, `XpAppearance.ts`: EXP; `PickupNumbers.ts`: ตัวเลขรับของ
- `src/core/Engine.ts`, `RunHistory.ts`, `ControlPreferences.ts`, `VideoPreferences.ts`, `EffectsPreferences.ts`, `GamePreferences.ts`; เสียงใน `src/audio/`

## งานที่ยังเหลือ / แนวทางไปต่อ

ผู้ใช้ย้ำว่ามีระบบในเกมจริงอีกมาก ไม่ใช่แค่ที่พูดถึง: HUD, สเตตัสย่อย, อาวุธ/Tomes/items, กล่อง/ชาม/แท่น/โทเทม/shrines, ตัวละคร/skins/passives, มอน/บอส/สกิล/การเกิดแยกด่าน ฯลฯ

- งานใกล้สุดยังเป็น **UI เลเวลอัป / HUD และ feedback ตามภาพผู้ใช้** ขณะนี้แค่โครง UI ใกล้ขึ้น ไม่ใช่ parity ครบแล้ว ต่อยอดส่วนที่ข้อมูลครบได้ แต่อย่าสร้างเลข stat หรือข้อเสนอที่เล่นไม่ได้ให้ดูเหมือนใช้ได้
- ทำบัญชีขยายระบบเป็นหมวด: ต่อแล้ว / มีไฟล์แต่ยังไม่ต่อ / ข้อมูลขาด ไม่ไปสกัดเอง
- `UPGRADE_SCREEN_REFERENCE.md` มีคำขอครบเรื่อง stat สูตร/หน่วย/stacking/rounding, pool/rarity/charges, inventory caps, backdrop VFX, HUD clocks/compass/counters
- กล่อง/ชาม/โทเทม/items ต้องตรวจ assets + interaction rules + เสียง/รางวัลก่อนนำเข้ารอบเล่น ข้อมูลพร้อมให้ทำได้ ไม่พร้อมให้จดรายตัว ไม่ใช้ mesh/portrait แทน behavior
- ตัวละครอื่นยังต้อง payload ที่พร้อมเล่น ไม่ถือว่า 20 portraits = 20 playable models; มอนที่ stage ไหนเกิดอะไร/บอสสกิลยังมีช่องว่าง
- สถานะ Phase 1 แบบ playable foundation เสร็จแล้ว แต่ strict native movement parity ยังไม่ครบ; ไม่ต้องขังงานทั้งหมดไว้ Phase 1

## หลักฐานภาพผู้ใช้ (ถ้ายังอยู่ในเครื่อง)

อยู่ใต้ `C:/Users/Korawit/AppData/Local/Temp/` ไม่ใช่ assets ที่ต้องนำทั้ง screenshot ลงเว็บ:
- `codex-clipboard-9e470d83-7e11-43ae-8bf7-baddeec59ead.png`: selection ต้นฉบับ
- `codex-clipboard-8905d05b-cbc2-43e4-ae3a-7b28118429ff.png`: Upgrade Offers/Inventory/Stats/HUD ต้นฉบับ
- `codex-clipboard-65d609d5-4da4-43f1-b001-12a0289d2d6e.png`: ประกายเหลืองและป้าย LEVEL UP
- `codex-clipboard-55452f8c-98c4-472f-b1e8-cd831ebda470.png`: Silver receipt เหนือ EXP ตอนกำลัง fade
- `codex-clipboard-2f09f42b-33e7-499f-8a88-e9a99d6e1dec.png`: Pause ต้นฉบับ
- `codex-clipboard-72f259e2-2425-4530-bef0-eec0cb13627a.png`: หน้าตายต้นฉบับ

## ตรวจและส่งงาน

- `npm run build -- --base=/WarCore/` (รอเสร็จก่อนรัน packaged checks)
- เลือก focused checks ให้ตรงงาน: `tools/check_combat.mjs`, `check_staff.mjs`, `check_effects.mjs`, `check_resume.mjs`, `check_controls.mjs`, `check_run_panels.mjs`, `check_character_select.mjs` (ตัวนี้ตรวจ dist portraits ต้อง build ก่อน), `check_character_lab.mjs`
- Package: `node tools/check_deploy.mjs /WarCore/`, `node tools/check_lab_boot.mjs`
- `.github/workflows/pages.yml` มีรายการ CI ที่ต้องผ่านครบ ห้ามข้าม/ลบ check เพื่อให้ deploy ผ่าน
- user ดูภาพ/เสียงเอง; ไม่อ้าง pixel/audio/native parity จาก unit checks และไม่บอก deploy สำเร็จแค่ push สำเร็จ

## ข้อความคัดลอกไปแชทใหม่

```text
ทำต่อใน C:\Users\Korawit\Desktop\War-Core
อ่าน docs/NEXT_CHAT_HANDOFF.md, skill warcore-development และท้าย docs/TEMPORARY_IMPLEMENTATIONS.md ก่อน แล้วตรวจ git status/diff/log ห้ามทับงานค้าง
ตอนนี้ Phase 2 แต่ branch เผยแพร่ยังชื่อ codex/phase-1-movement ใช้ branch เดิม
ทำต่อจากสถานะล่าสุด ไม่ย้อนค่าจูนภาพ/เสียง/การเคลื่อนไหว ผู้ใช้เทส feel เอง ตรวจ build/focused checks เท่าที่จำเป็น และ commit/push อัตโนมัติเมื่อเสร็จ แจ้งก่อนเปลี่ยน phase
หน้าที่คุณคือใช้ asset ที่สกัดไว้แล้ว ไม่แกะเกมเอง; มีแต่ยังไม่ต่อกับขาดข้อมูลต้องแยกกัน อันไหนไม่ชัวร์จดลง docs/EXTRACTION_BACKLOG.md และ MD เฉพาะหัวข้อให้อีก AI หาได้เลย
งานต่อยังเป็น UI เลเวลอัป/HUD และระบบที่ข้อมูลพร้อม รายละเอียด/ภาพอ้างอิง/ข้อค้างอยู่ใน handoff อย่าถือว่าระบบในภาพครบแล้วหรือเดาสูตร stat/pool/rarity/กล่อง/แท่นขึ้นมา
สรุปสิ่งที่จะลงมือถัดไปสั้น ๆ จากไฟล์จริงก่อน แล้วทำส่วนที่ข้อมูลครบต่อได้เลย
```
