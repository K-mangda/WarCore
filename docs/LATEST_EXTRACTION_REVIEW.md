# Latest extraction handoff review — 2026-11-12

Actual latest package: C:/Users/Korawit/Desktop/WarCore/megabonk_extracted_assets (schema2.0.0). The Desktop-root package remains the old Sword sample. Do not confuse these directories when importing assets or renaming project folders.

The latest package contains per-domain catalogs, shared files, manifest/coverage/unresolved records and a validator. Sampled SwordSwing/HeroSwordAttack/Xp2 WAV frame data is readable. Actual Sword attack4144/projectile3436/audio2119 references in the data are useful, despite different IDs in the pasted prose report.

It is not100% behavior-verified:

- extract_all_weapons.py hardcodes Sword3/HeroSword28 rather than installed source enum2/27. Consecutive-byte boolean parsing ignores serialized4-byte alignment; Sword canMultiHit is incorrectly false. Some exported audio volume1 contradicts the native Sword AudioSource0.4.
- extract_game_assets.py sets weapon/system sound statuses true and uses is_trig=is_ref, conflating references with confirmed triggers. Missing PPtrs are labeled procedural without proof of a runtime call site.
- validate_manifest.py checks file/header/JSON integrity, not native identity, references or actual trigger behavior. Some completeness totals are hardcoded; missing path can returnTrue, and expected_type is unused. No source-file build fingerprint was found.

Treat this as a useful expanded extraction catalog. Verify source identities/serialized fields and correct the status logic before allowing normalized behavior fields to replace already verified game data. No whole-package import or runtime parity claim was made in this deployment change.
