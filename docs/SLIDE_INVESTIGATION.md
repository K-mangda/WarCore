# Slide bug and direct binary evidence

The browser previously applied `slideForce * dt` every grounded frame with crouch held, normalized the slope irrespective of steepness, and never limited that acceleration. The reported 80 m/s is consistent with that bug; it was not an observed original-game speed.

REA-derived method addresses were used to disassemble the installed GameAssembly.dll with Capstone. Reproduce with `python tools/inspect_movement.py` after installing local `capstone` and `pefile` modules into `.local-evidence/python`. The complete disassembly remains local.

- `CheckInput`, RVA `0x33c030`: checks crouching input, existing crouch state, `readyToCrouch`, speed OR surface angle, grounded OR surfing before `StartSlide`.
- Constructor RVA `0x344970`: initializes `slideThresholdSpeed` at offset `0x108` to 8 and `slideAngle` at `0x84` to 30 degrees. Serialized overrides remain unverified.
- `StartSlide`, RVA `0x342f50`: checks `UseLimitedMovement` and `readyToSlide`; one AddForce call at `0x3432a4`, then sets crouch state 2 and clears `readyToSlide`. Force also depends on fall speed and landing/input conditions. It is not a constant acceleration applied on every crouched step.
- `UpdateCrouchState`, RVA `0x344030`: compares velocity magnitude with threshold and downgrades slide to crouch below threshold.
- `UseLimitedMovement`, RVA `0x344170`: follows SaveManager.Instance → config → settings → offset `0x60`, checks integer value 1. Declaration lookup identifies this setting as `pege_mode`; it is not a per-character comparison in this method.
- Character friction multipliers differ: Calcium 0.2, TonyMcZoom 0.15, otherwise 1 in static GetCounterMovementMultiplier RVA `0x4b7b80`. This does not itself establish slide eligibility.

Browser fix removes the repeated force and adds distinct crouch/slide states and grounded/velocity/limited-mode transition checks. The original one-shot force is deliberately withheld pending verified Rigidbody mass, fixed timestep and remaining formula interpretation. No invented maximum slide speed was added. Surfing, cooldown timing, serialized overrides and character-wide call-site behavior remain incomplete. This is a targeted correction, not a complete native motor port.

## Other chat's asset claim checked

The named WarCore directories contain 105 WAV, 145 PNG and 43 model JSON entries. Presence/count is confirmed; authenticity of every mesh/texture/rig is not yet checked against the shipped objects. The extraction script records source files/names for some assets.

`forestHeight.ts` contains FOREST_GRID=241 and 8-bit base64 heights with FOREST_MAX_H=6.3. Its extraction script reads mesh path ID 150 from `level2`, rounds x/z to a 241×241 grid, clamps/scales y into 0–255. It is not a direct full-precision TerrainData export and the claimed 260m exact map is unsupported by this script. Some original detail is quantized or potentially clipped.

The installed dump has 21 character enum entries, unlike the pasted brief's 14. DummyDll is a reconstructed declaration assembly and must not be represented as complete recovered gameplay method bodies.
