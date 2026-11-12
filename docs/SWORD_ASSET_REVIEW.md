# Sword asset handoff review

Reviewed 2026-11-12. Package: C:/Users/Korawit/Desktop/megabonk_extracted_assets. Initial review was read-only. Follow-up corrected exports and a provisional sword mode have since been integrated; see TEMPORARY_IMPLEMENTATIONS.md for current limits.

## Result

Useful extracted files, but the package is not yet a verified, complete sword behavior specification. Do not use README implementation examples as native truth. Native data and provisional combat rules must remain explicitly distinguishable.

## Required corrections

1. extract_sword.py writes audio and material behavior values as literals rather than reading the corresponding source fields. This does not itself prove each value wrong, but it does not reproduce their claimed provenance. Export raw relevant component fields alongside normalized values, including fileID/pathID references and source file hashes.
2. README introduces a 0.06-second audio filter and a random-volume formula without supporting behavior data. Export AudioSpamFilter fields and distinguish extracted configuration from an unverified implementation algorithm.
3. One/Zero is not additive blending by itself. Material429 stores _SrcBlend=1, _DstBlend=0, _ExtraGlow=3 and _ZWrite=1. README recommends AdditiveBlending/depthWrite=false without establishing shader behavior. Resolve shader reference and actual render state; label the Three.js mapping as provisional until verified.
4. The particle JSON exports system6883 while manifest slash_arc references7039. These are different systems: 6883 lifetime0.2/size8/alpha1; 7039 lifetime0.3/size8/alpha~0.749. Export both separately with their renderer, hierarchy and transform references.
5. Export relevant particle modules, especially emission/bursts, shape, renderer mesh and alignment, curves/gradients, size/rotation/color over lifetime and texture-sheet animation. Raw sources have UVModule8x8/rowIndex2; do not call the atlas layout unknowable. Validate which fields are active before implementing them.
6. Source AudioSource6741 has PlayOnAwake=false. Its panLevelCustomCurve is constant0.5; package spatial_blend=0 is not established. Keep AudioSource autoplay distinct from RandomSfx/PlaySfxOnEnable script behavior.
7. Correct documentation claiming 100% fidelity. A valid mesh/texture/audio export does not verify native shader, swing trajectory, hit behavior, timing or randomization algorithms. A dump with empty bodies cannot prove method calls or runtime behavior.

## Verified reference checks

Original sharedassets1 GameObject4107 includes AudioSource6741, RandomSfx9607, AudioSpamFilter9591 and ParticleSystem6883. GameObject3180 includes ParticleSystem7039. Source material429 references texture930. These reference checks support part of the package mapping, not every documented behavior.

## Handoff request

Ask the extractor to correct this sword example before expanding to every weapon. Preserve current assets; add raw source exports, normalized complete modules, source hashes and explicit verified/assumed status per behavior. No need to repeat successful binary exports solely to fix documentation or JSON metadata.

## Additional binary checks

The review agent successfully parsed WAV, PNG and GLB files. GLB has 198 vertices and 348 indices, no materials/images/textures and a 90-degree X node rotation; material and coordinate handling still need integration decisions.

AudioSpamFilter9591 raw bytes, interpreted using dump field order, yield spamDelay~0.1, minVolumeMultiplier~0.5, maxInterval~0.4, overrideMinInterval=0, with references to AudioSource6741 and RandomSfx9607. This provides candidate serialized configuration, not a verified reconstruction of OnEnable/FindVolumeMultiplier. In particular it does not support README's 0.06-second rule.

RandomSfx9607 references clip2112 and AudioSource6741 and stores float values~0.9/~1.1/~0.3 plus its own autoplay flag. Check dump field ordering before labeling the first two values min/max; normalized intended range and actual serialized field names must remain distinguishable.

## Identity correction — supersedes the initial package labels

The original package was HeroSword (EWeapon27), not the Knight's starting Sword (EWeapon2). Knight CharacterData7823 references WeaponSword8633, which references attack4144 and projectile3436. Runtime now uses public/weapons/knight-sword: Particle7070, Material428, Texture704/row1, Icon1315 and SwordSwing2119. Original HeroSword media are retained separately. See TEMPORARY_IMPLEMENTATIONS.md for the remaining renderer/gameplay approximations. Never identify a weapon solely from a mesh or package filename.
