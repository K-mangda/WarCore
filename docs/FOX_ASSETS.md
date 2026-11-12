# Fox base skin and original rig

Map work is deferred at the user's request. The existing movement test arena remains unchanged. Sliding is disabled by default and its controls are removed; FoxGrind2 is not used as a substitute slide animation.

The runtime now loads public/megabonk/fox-rig.json and FoxBase.png, generated with python tools/export_fox_rig.py from the installed sharedassets1.assets and its external references. No game process or native binary needs to run.

Source identifiers: mesh 1831 (FoxWizard), SkinnedMeshRenderer 6842, material 150 (m_fox_default), texture external file ID 5/path ID 77 (sharedassets0.assets, Fox_Default). The old export selected FBX_FoxWizard_Color by name; that cyan texture did not match the default material's texture reference. Runtime now resolves the default material's _AlbedoMap, rather than selecting a palette by its filename.

Converted original data: 23 skin joints, 37 transform nodes, 2,577 vertices, original normals/UVs, normalized four-weight skinning and inverse bind matrices. The exporter reflects x and reverses face winding to convert coordinates. Bind checks compare boneWorld * inverseBind against the renderer transform. The source prefab has a posed left shoulder: the check verifies its four arm joints inherit the same rigid pose delta, while all remaining joints reconstruct the bind transform directly.

Original clips exported: FoxIdle (2031), FoxRun (2033), FoxJump4 (2032), FoxFalling (2029), FoxGrind2 (2030). Streamed polynomial curves and constant curves are decoded and sampled at the source clip sample rate. Quaternion and Euler bindings are handled separately. The browser selects Idle/Run/Jump/Falling from motor state; Unity Animator transitions and its shader are not ported verbatim. Grind remains unused.

The visual is uniformly fitted to the browser motor's 1.8m body. It uses a Three.js Lambert material and short animation crossfades. These are explicit integration choices, not claims of identical native prefab scale, lighting or Animator timing. No synthetic walk/jump animation or flattened-mesh crouch is used.

Checks: node tools/check_fox.mjs validates skin weights, joint indices, inverse binds, clip channels and quaternion lengths. Browser inspection confirmed base skin, intact rig and changing airborne pose; no console warnings/errors were returned in that check. Production build and movement regression checks are also run.
