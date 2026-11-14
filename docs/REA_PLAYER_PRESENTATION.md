# REA findings — Player presentation (spawn portal, damage, low HP, death) — 2026-11-14

Scope: static analysis only (no game launch, no web changes, no push). Evidence tiers: **V** = verified from shipped binary (field layout/const/disassembly read directly), **I** = inferred from V, **U** = unknown / not yet traced.

## Provenance

| Item | Value |
|---|---|
| Binary | `Steam/.../Megabonk/GameAssembly.dll` (IL2CPP), image base `0x180000000` |
| Metadata evidence | REA 6.8.0 `ev_03e4dbb0f9506d75f2eead8861ab8bdf77c803d1df33132b47fb6866cecb93e9`, metadata SHA256 `17b506a7…d550` (see REVERSE_ENGINEERING_FINDINGS.md) |
| Layout source | Il2CppDumper `dump.cs` (TypeDefIndex + field offsets + `const` values) |
| Disassembly | `python tools/disasm_methods.py "<regex>" out.txt` (Capstone, REA method→address map); condensed with `tools/summarize_disasm.py`. Raw output stays in `.local-evidence/disasm/` (not in Git) |
| Schema export | `docs/rea/dump_schema.json` via `tools/extract_dump_schema.py` |

All times are seconds, floats are IEEE-754 read from the instruction stream. "RVA" is the method address in GameAssembly.dll.

## 1. Spawn portal — `SpawnPlayerPortal` (TypeDef 4682)

Serialized fields **(V)**: `audioOpen 0x20, audioLoop 0x28, audioClose 0x30, audioPassing 0x38` (AudioSource), `blockObjectSpawns 0x40`, `portalRender 0x48` (Transform, scaled by `Update`), `portalScale 0x50`, `passingFx 0x60` (ParticleSystem), statics `A_PortalOpen`, `A_PortalClosed`. Ctor defaults **(V)**: `moveTime = 1.0` (`+0x6C`), `openTime = 0.5` (`+0x8C`).

**Audio binding is therefore verified:** the four portal sounds are the four AudioSources on this component. Which WAV is assigned to which source lives in the prefab (not read yet → **U**). Names PortalOpen/Loop/Close/Pass are consistent with the field names but the prefab assignment still needs one read.

### `StartPortal` RVA 0x361220 (called when run starts, skip path) **(V)**
1. Reads portal position + `forward`.
2. `MyPlayer.Spawn(position, …)` → creates player at the portal; `PlayerInput.SetSpawnDirection(XZVector(forward))`.
3. Places the camera pivot at `portal.position + forward * (-5)` then `+5` constants (`-5`/`5` movss) and `Transform.LookAt`.
4. `GameManager.StartPlaying()`, `MapTitle.StartAnimation()`.
5. Reparent/`Destroy` of the portal object. A `StartCoroutine` follows (`DoPortal`). `CanSkipPortalAnimation` (RVA 0x360F90) gates which path is used — body not decoded → **U** (likely a setting/first-time check).

### `DoPortal` coroutine (`<DoPortal>d__12.MoveNext`, RVA 0x362AD0) **(V order; V constants listed)**
Sequence of calls in order:
1. portal position, `forward * 3` → `MyPlayer.Spawn` (spawn offset constants **3** then **6** appear in two `forward *` multiplies).
2. `PlayerCamera.StartPortalCamera(portal)` (RVA in dump: PlayerCamera) — dedicated portal camera move.
3. `blockObjectSpawns.SetActive`, **`CinematicBars.InstaShow()`** (black letterbox bars appear instantly).
4. Read `portalRender.localScale`, **`audioOpen.Play()`**.
5. `yield WaitForSeconds(0.5)` (`openTime`).
6. `yield WaitForSeconds(1.0)`.
7. `yield WaitForSeconds(x)` (non-RIP constant, probably `moveTime`/field — **U**).
8. `SetActive` (player visible), **`PlayerRenderer.ForceMoving(true)`** (player runs out through portal), **`MyPlayer.PauseInventory(true)`** (weapons don't fire), `audioPassing.PlayDelayed(0.2)`, then `Invoke(PassShake, 0.1)` (`mulss 0.2`, `addss 0.1` constants), `passingFx.Play()` (SetActive + Play).
9. `yield WaitForSeconds(…)`, then `ForceMoving(false)`, **`audioLoop.Play()`**.
10. `yield WaitForSeconds(…)`, **`audioOpen/Loop.Stop()`**-style stop (`AudioSource.Stop`), invoke **`A_PortalOpen`** (static Action; `HealthUI.OnPortalOpen/OnPortalClose` subscribe to portal events to hide/show HP bar).
11. `GameManager.StartPlaying()`, `MyPlayer.PauseInventory(false)`, `MapTitle.StartAnimation()`, **`CinematicBars.Hide()`**.
12. `yield WaitForSeconds(2.0)`, then `Object.Destroy(portal gameObject)`; `A_PortalClosed`/`ClosePortal` path.

`Update` (RVA 0x361850): `MovePlayer()` then portal scale animation using **`Easing.InOutCirc`** over `openTime`; `MovePlayer` (RVA 0x361080) lerps player position from `playerStartPosition` to `desiredPosition` over `moveTime=1.0` with `Transform.set_position` (V). `PassShake` (RVA 0x361200): camera-shake call with constants **0.25** and **0.4** (V constants; parameter meaning magnitude/duration → I, needs `CameraShakerController` signature).

**Still unknown (U):** exact third/fourth WaitForSeconds durations (non-RIP immediates), portal prefab particle/material/shader dependency chain, portal color/emission, which sound clip is on which AudioSource, where `CanSkipPortalAnimation` reads its flag.

## 2. Nonlethal damage

`PlayerHealth` (TypeDef 5543) — **constants (V)**:
- `damageCooldownTime = 0.15` s i-frames after a hit (`const`).
- ctor defaults: `baseHp = 100`, `baseShield = 25`, `minFallDamageSpeed = 30`, `maxFallDamageSpeed = 140`, `shieldRegenCooldownTime = 6.0`, `checkDeadInterval = 1.0`, `overhealRemovalFractionPerSecond = 0.03`, `shieldHealingPerTick = 10`, `healingPerMinute = 10`, `static maxMaxHp = 50000`. Damage sources: `"fallDamage"`, `"Enemy"`, `"HealthRegen"`.
- Events: `A_TakeDamage(PlayerHealth, DamageContainer, bool shieldDamage)`, `A_Heal`, `A_Died`, `A_Evaded(Enemy)`.

**Red flash on the player model (V):** `PlayerRenderer.OnDamage` (RVA 0x345E90) swaps the renderer's shared materials to `damageFlash` (Material at field `+0x30`) and sets `resetMaterialTime = Time.time + 0.15`; `Update` restores `beforeDamageFlashMaterials` when the time passes (`ResetMaterial`). Flash length = **0.15 s** = the damage cooldown. Material asset itself not yet exported (**U**: shader/colour). Shield hit: `PlayerShieldEffects.OnDamage` (shieldBreakFx/Sfx).

**Floating red damage numbers:** `DamageNumbers` class exists (TypeDef 5177) with `HealthUI`; not traced yet (**U**).

## 3. Low-HP red screen edge

Chain **(V)**: `PlayerEffects.Update` (RVA 0x3384B0) computes `dangerValue` (`+0x50`) from `GetCombinedHp/GetCombinedMaxHp`:
- target rises when HP ratio **< 0.25** (comiss 0.25), `dangerIncreaseSpeed = 4`, `dangerDecaySpeed = 0.02`, `sustainedLowThreshold = 15` (s of sustained low HP before the slower decay), `lerpSpeed = 1.5` (const fields).
- `GetDangerRatioMusic` = `clamp01((danger − 0.6) / 0.4)` — drives music/danger audio filter (`LowpassController` exists).
- `LowHpUi.Update` (RVA 0x53BF90): reads `vignette` RawImage (`+0x20`) colour, sets **alpha = PlayerEffects.dangerValue × maxOpacity**, `maxOpacity = 1.0` (ctor). RGB is taken from the RawImage's own colour (serialized in the scene → **U**: red tone value).

So: a red vignette RawImage whose alpha follows `danger`, which rises quickly (×4) once HP < 25 % and decays slowly.

**Settings link (I):** the "Low HP Effects" option in the settings screen presumably toggles this; reading it is **U**.

## 4. Death

`PlayerHealth.CheckDead` (RVA 0x427A70) is gated by `nextCheckDeadTime` (`Time.time` + `checkDeadInterval = 1.0` s, so death is detected at most once per second — V from `comiss`/`addss` on fields `+0x54/+0x58`), and if `hp <= 0` and the invulnerable flag is off, calls `PlayerDied` (RVA 0x429A40) which sets `hp = shield = overheal = 0` and invokes static `A_Died` **(V)**. (`KillPlayer` RVA 0x428DB0 is the instant path; not decoded.)

**`PlayerRenderer.OnDeath` (RVA 0x345F90) contains no animation call (V: body is only a null-check)** — the original has no dedicated death clip in this method. The frozen falling pose the user described is therefore probably produced elsewhere (animator speed 0 / ragdoll-free freeze via `OnPause`, or `PlayerCamera`) → **U**.

**Post-process look (`DeathPP`, TypeDef 4979) (V):** defaults `deadVignetteIntensity = 0.3` (`0x3E99999A`), `deadVignetteSmoothness = 0.4` (`0x3ECCCCCD`), `deadContrast = 20` (`0x41A00000`), `deadSaturation = −40` (`0xC2200000`). `OnPlayerDied` sets one `ColorGrading` float (`+0x18` of param at `+0x…`) to **2.0**. While `dead`, `Update` lerps with `Time.deltaTime`: param A toward 0 at rate **×8/s**, and contrast→20, saturation→−40, vignette smoothness→0.4, vignette intensity→0.3 at rate **×0.5/s**. (Interpretation: brief exposure flash decaying quickly, then slow desaturate/high-contrast/vignette — I; the exact ColorGrading parameter at the 2.0 is I.)

**Death screen (`DeathScreen`, TypeDef 4981) (V structure):** fields `blocksUi, deadUiWindow, statsWindow, background, leaderboardsWindow, victoryScreen, t_dead (UiAnimation), b_continue, audio, playerOnlyRender (RawImage), canvasGroup, fadeInTime, fadeTimer`. `StartDeathScreen` (RVA 0x532450) starts coroutine `DoTransition` (RVA 0x5454D0) whose order is **(V)**:
1. `deadUiWindow.SetActive`, `t_dead.ScaleIn(…, 2)` ("YOU DIED" text, constant 2), `ButtonManager.ForceHoverButton`.
2. `WaitForSeconds(1.2)`.
3. activate stats/background objects, set a `Material` float (the black inward-roll wipe is a shader float — I; material not exported), **`audio.Play()`** (DeathScreen.audio source), `RawImage.set_texture` for `playerOnlyRender` (player-only render texture is shown).
4. `WaitForSeconds(2.0)`, then stats window flows (`ShowStats`, `ShowLeaderboard`, `Restart`, `GoToMenu`).
`DeathScreen.Update` (RVA 0x5324D0) fades `canvasGroup.alpha` over `fadeInTime` and scales with **`Easing.OutCirc`**.

**Black inward-rolling transition:** a candidate is `TransitionUI` (TypeDef 5166) — not yet read (**U**). User screenshots remain the only visual evidence for the wipe's look.

## What the web currently lacks (use when implementing, with tier)

| Web item | Evidence available | Missing |
|---|---|---|
| Portal spawn timeline | order + 0.5/1.0/3/6/0.2/0.1/2.0 s constants, InOutCirc scale, cinematic bars show/hide, player pause during portal | 3 wait values, portal prefab VFX/materials, clip↔AudioSource map |
| Hit flash | 0.15 s material swap to `damageFlash` | the flash material colour/shader |
| Low-HP vignette | threshold 0.25, up-rate 4, decay 0.02, lerp 1.5, alpha = danger × 1 | vignette texture/colour (scene) |
| Death look | DeathPP numbers above | which ColorGrading/Vignette params; wipe shader (`TransitionUI`) ; pose freeze mechanism |
| Death UI timing | 1.2 s then 2.0 s waits, ScaleIn 2, OutCirc fade | `fadeInTime` default, `t_dead` animation data |

Next trace targets (RVAs available through `docs/rea/dump_schema.json`): `PlayerCamera.StartPortalCamera`, `CinematicBars.InstaShow/Hide`, `CameraShakerController` signature, `TransitionUI`, `DamageNumbers`, `HealthUI.UpdateBars`, `PlayerHealth.Damage` (RVA 0x428220), prefab `SpawnPlayerPortal` serialized values (needs asset read).
