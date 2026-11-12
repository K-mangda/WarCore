# Focused jump fix and deferred research

The user reduced scope from exhaustive parity research to a practical jump fix. Broad Ghidra analysis was stopped; no native game launch or user gameplay is needed for this fix.

## Shipped-code findings used

REA metadata and direct instruction inspection identify a four-physics-tick jump queue in PlayerInput. A press survives across fixed ticks and expires after four ticks, independent of browser rendering time. The previous 120ms wall-clock buffer was a provisional implementation and has been removed.

Previously recovered base JumpHeight=7, flat jump impulse=14, world gravity=-19.62 and airborne extra downward acceleration=11 remain in use. Character modifiers and exceptional contacts remain outside this focused correction.

## Verification

The whole-motor regression checks verify a normal jump returns to ground, a press just before landing triggers after contact, and an early airborne press expires without triggering a later jump. These verify translated equations and input behavior; they are not native runtime parity measurements.

## Deferred investigation record

REA 6.8.0 metadata evidence indexed 271 managed methods (258 unique native entries) across movement, input, camera, stats and presentation. Ghidra 12.1.4 and supported local Node were prepared. The first sandboxed batch failed private target snapshot admission; the subsequent static import outside that sandbox reached the 330-second startup timeout. A longer retry was stopped following the user's scope correction. No completed Ghidra decompile is claimed.

Research scripts and raw diagnostics are archived under .local-evidence and excluded from Git. No analysis processes were left running. Future deep research is optional and must not block small, useful gameplay fixes.
