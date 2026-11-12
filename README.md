# Megabonk movement lab

Experimental Phase 0–1 web reimplementation using React, Three.js, strict TypeScript and Vite. No combat is implemented. Native behavior parity is **not verified**.

Run `npm install`, then `npm run dev`. Open http://localhost:5173. `npm run build` checks types and creates the production bundle.

Enter sandbox to play. Mouse capture is optional; if your browser denies it, hold the mouse button and drag to look. WASD moves, Space jumps (press again near landing for Bhop), C/Ctrl slides, Esc pauses. Pause to reset or start at the summit. Telemetry reports real render FPS and horizontal velocity.

Evidence and missing systems: [master spec](docs/MEGABONK_MASTER_SPEC.md), [parity ledger](docs/PARITY_MATRIX.md). Extract local enum declarations with `python tools/extract_spec.py`. Source game files are never uploaded. Browser geometry and visuals are placeholders.
