---
name: warcore-development
description: Implement and deliver changes in the War-Core Megabonk web playtest repository, preserving native evidence, user tuning, automatic Git push and phase-change notification preferences.
---

# War-Core development

Applies to `C:/Users/Korawit/Desktop/War-Core` and its `K-mangda/WarCore` repository. The separate `Desktop/WarCore/megabonk_extracted_assets` folder is a source asset package, not the web repository.

## Receive and implement work

- Read relevant handoff notes and the tail of `docs/TEMPORARY_IMPLEMENTATIONS.md`, then inspect Git status/diff before editing. Preserve unrelated and uncommitted work.
- Preserve original extracted assets and provenance. Record user-directed size, movement, sound or appearance adjustments as web tuning; do not claim they are native formulas. For weapon changes, read `docs/WEAPON_BEHAVIOR.md`.
- The user handles image, audio and gameplay feel testing. Prefer build/type checking and only necessary focused checks. For small reversible visual tuning, act promptly without prolonged comparison, broad testing or browser sessions unless a concrete issue requires them.

## Automatic delivery — explicit user preference, 2026-11-13

- After completing an authorized code/asset change and its appropriate checks, commit and push automatically. Do not leave completed changes local or ask the user to repeat "push". This replaces the earlier project default of waiting for explicit push/deploy authorization on each change.
- Confirm the current branch and remote before pushing. The established destination is `https://github.com/K-mangda/WarCore.git`, branch `codex/phase-1-movement`; its existing workflow publishes GitHub Pages automatically. The user authorized this normal delivery path. Do not infer permission to switch destination, force-push, rewrite history or create unrelated deployments.
- Commit the authorized completed work, preserving unrelated edits. If earlier completed authorized changes remain pending, include them coherently and state their scope. Report the pushed commit and any unresolved limitation. Never claim successful deployment solely because push succeeded.
- If required checks fail, fix them before pushing. If access, authentication, network or automatic approval review blocks delivery, report the actual blocker and retain the work; do not bypass the control.
- A later explicit user instruction to wait, stop, keep work local or not push overrides this default.

## Phase changes

- Tell the user before changing the project's phase, starting another phase's scope, or renaming/switching a phase branch. Explain the current phase, proposed next phase and why the transition is appropriate.
- Do not silently treat an ordinary tuning request as a phase transition. Notification is required; the user has not imposed an additional approval gate. Follow any explicit deferral or scope restriction already in the conversation.

## Maintained source

This file is maintained at `skills/warcore-development/SKILL.md` in the repository. Keep the installed copy at `C:/Users/Korawit/.codex/skills/warcore-development/SKILL.md` synchronized when changing this skill.
