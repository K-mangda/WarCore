# GitHub Pages deployment

Repository: K-mangda/WarCore. Workflow: .github/workflows/pages.yml.

The current test deployment follows codex/phase-1-movement. Each push to that branch runs combat/audio/pose checks, builds game and Lab, validates paths, then deploys dist through GitHub Pages. No merge to main is required for this test setup. Change the workflow branch when selecting a different production branch later.

Expected standard site URL: https://k-mangda.github.io/WarCore/ . The published workflow environment URL is authoritative, especially if a custom domain is added.

One-time repository setting: Settings -> Pages -> Build and deployment -> Source: GitHub Actions. The user confirmed this was enabled on2026-11-12. If a github-pages environment has deployment branch restrictions, it must permit the selected workflow branch.

Build locally for Pages: npm run build -- --base=/WarCore/
Check package paths: node tools/check_deploy.mjs /WarCore/
Preview that build: npm run preview -- --base=/WarCore/ --host 127.0.0.1

The Vite BASE_URL helper resolves model/audio/image/JSON and Lab navigation paths. Stylesheets are processed by Vite so font and UI URLs follow the same base. Both index.html and lab.html are build entry points.

Moving to Cloudflare Pages, Vercel or Netlify does not require moving the Git repository. For a normal site-root deployment, use npm run build (default base /) and publish dist. GitHub Pages remains a static host; any future server-side multiplayer/backend will need an appropriate separate service or hosting setup.

Official references: https://vite.dev/guide/static-deploy and https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages .
