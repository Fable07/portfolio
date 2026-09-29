# Checkpoint

`Last updated: 2026-09-29 · Current phase: LIVE (Vercel + Render) → performance + smoke test`

## ▶ Resume here (2026-09-29)
- **Site LIVE**: frontend on Vercel (production = `main`), API https://portfolio-api-podn.onrender.com. `FRONTEND_URLS` on Render set to the Vercel origin + localhost.
- Release flow: work on `dev` → `git push origin dev` → `git push origin dev:main` (fast-forward only).
- Render auto-deploy switched to **On Commit** (dashboard + render.yaml, 7416a4c) because GitHub Actions is billing-locked. Revert to `checksPass` in both places once Actions runs again.
- vercel.json `ignoreCommand` removed (418dcd7): it made Vercel skip Redeploys, so env-var changes never built.
- Slowness diagnosed: Render = Singapore, Supabase = Sydney (ap-southeast-2) → data calls ~1.3–1.9 s warm vs /up ~0.4 s. Fix: public GET responses cached (CachePublicResponse, flushed on admin writes by FlushPublicCache, TTL `PUBLIC_CACHE_TTL`=600 s for edits made outside the API, e.g. local dev on the shared DB).
- Caching live (d784c27): cached calls ~0.46 s vs ~1.5 s. Automated smoke test passed (routes, static files, CORS, headers, auth 401/422, APP_DEBUG off). Resume PDF iframe CSP fixed (ff510c2). UptimeRobot skipped by owner (accepts cold starts).
- Live site: https://jscaragay-portfolio.vercel.app
- Media features committed on `dev` (7b47a1f, NOT on main yet): video avatar plays on hover, hobby galleries (new nullable `hobbies.media` column), certificate/project PDFs with Cloudinary page-1 previews, f_auto/q_auto delivery, video limit 20 MB. Backend 46 tests, frontend 46 tests, build OK. Not yet tried in a browser.
- **Before pushing 7b47a1f to main:** (a) owner sets `RUN_MIGRATIONS=true` in Render dashboard (render.yaml already says true → deploy auto-migrates, adds nullable hobbies.media); (b) Cloudinary → Settings → Security → enable "Allow delivery of PDF and ZIP files" (PDFs are now image resources).
- **Next steps:**
  1. Owner: reset admin password with `php artisan admin:create <email>` (forgot credentials).
  2. Owner to clarify what "stale" pages means (old content vs stuck loading).
  3. Owner browser checks: console CSP errors, send a contact message, Cloudinary upload. Clean up test data (project "forum website", empty profile).
  4. Fix GitHub billing lock → CI runs again → switch Render back to checksPass.
- The sections below are the detailed history; this block is the current truth.

## Where we are

- **Phase 1 complete locally**: monorepo merged with both git histories (36 commits), root CI workflows added (path-filtered), docker-compose moved to root, Laravel Vite scaffolding removed from backend, S2/S4/S6 security fixes applied, render.yaml Blueprint added.
- **QA green**: frontend 45/45 tests pass, lint/format clean, build OK; backend 34 tests pass / 160 assertions.
- **Owner decisions accepted** (2026-09-28): keep both git histories ✅; ONE shared Supabase DB for dev+prod ✅; Cloudinary for media ✅; free `*.vercel.app` domain ✅; Render free plan ✅; auto-deploy from GitHub main ✅.
- **Pushed to GitHub** — `dev` and `main` both at 24eba35 on github.com/Fable07/portfolio.

## QA status (Phase 1 complete)

| Check | Before | After | Detail |
|---|---|---|---|
| Frontend vitest | PASS (45) | PASS (45) | Unchanged |
| Frontend lint + format | PASS | PASS | Clean |
| Frontend build | PASS | PASS | CSP fixed (added `data:` to img-src) |
| Backend phpunit | PASS (28/139) | PASS (34/160) | +6 tests (trustProxies, visitor validation) |
| API routes | 37 | 37 | —  |
| Monorepo structure | N/A | ✅ | Root `.github/workflows`, docker-compose at root |

**Security fixes applied**: S2 (trustProxies), S4 (CSP + headers in vercel.json), S6 (visitor_id validation). S3 is accepted risk (shared DB). Render env values quoted, Vercel ignoreCommand uses `VERCEL_GIT_PREVIOUS_SHA`.

## Owner action items (unchecked = not yet done)

- [x] Pushed to GitHub (dev + main at 24eba35, 2026-09-28)
- [x] Supabase RLS enabled on all tables (S1) — verified live
- [ ] Create Cloudinary account (free tier), set credentials in Render secrets
- [ ] Connect Render Blueprint: New → Blueprint → select `Fable07/portfolio` → reads `render.yaml`
- [ ] Connect Vercel: Add New → Project → import `Fable07/portfolio` → Root Directory: `frontend`
- [ ] Set env vars on Render: `APP_KEY`, `APP_URL`, database credentials, `FRONTEND_URLS` (after Vercel exists), Cloudinary keys
- [ ] Set env vars on Vercel: `VITE_API_URL=https://<render-name>.onrender.com/api` (production)
- [ ] Decide repo visibility (public or private) — optional, current GitHub setting is kept
- [ ] Create first admin user: `php artisan admin:create <email> --name="Your Name"` (can run locally; shares prod DB)

## Next step (Phases 4–5 — deploy)

**See `docs/DEPLOYMENT.md`** for the click-by-click runbook:
1. **Supabase**: connection string under Project Settings → Database → Connection string (session pooler port 5432)
2. **Cloudinary**: sign up, get cloud name + API key/secret
3. **Render**: Blueprint setup (env vars + secrets via dashboard)
4. **Vercel**: import repo, set build env vars, deploy
5. **Wire CORS**: set `FRONTEND_URLS` on Render to match Vercel origin (exact, no trailing slash)
6. **First admin user**: `admin:create` command
7. **Smoke test**: site loads, icons show, API responds, contact form works, image upload → Cloudinary

Free tier notes: Render sleeps after 15 min idle (~30–60 s cold start); Vercel builds only if `frontend/` changed; Render deploys only if `backend/` changed and CI passes.

## Open security items

- [x] **S2 (High)** — trustProxies config ✅ applied
- [x] **S4 (Medium)** — Security headers + CSP ✅ in vercel.json
- [x] **S6 (Low)** — visitor_id validation ✅ added
- [x] **S1 (High)** — Supabase RLS enabled on all public tables (2026-09-28), owner = postgres; live API re-verified. Re-run the RLS SQL in docs/DEPLOYMENT.md §1 after any migration that adds a table.
- [x] **S3 (Medium)** — Dev+prod shared DB: ✅ accepted risk (documented in PLAN.md)
- [ ] **S5 (Medium)** — Media persistence: Render free tier → use `MEDIA_DRIVER=cloudinary` once keys set
- [ ] **S7 (Low)** — `APP_DEBUG=false` in render.yaml ✅; verify it (ENV check post-deploy)
- [ ] **S8 (Low)** — `FRONTEND_URLS` must be set to exact Vercel origin post-deploy

## How to resume

Tell Claude: **"Winky dinky"** (resume phrase, defined in CLAUDE.md) The root `CLAUDE.md` auto-loads this instruction at session start.

## Session log

- **2026-09-28** — Phase 0 complete: reviewed both `frontend/` and `backend/` folders; confirmed Supabase Postgres + in-memory SQLite tests; security scan identified S1–S8; baseline QA all green; wrote `docs/PLAN.md` and root `CLAUDE.md`.
- **2026-09-28** — Phase 1 complete: monorepo merge done (both histories preserved, 36 commits), root CI workflows added, docker-compose moved to root, Laravel scaffolding removed, security S2/S4/S6 applied, render.yaml Blueprint added, QA all green, Phase 1 documentation and unified deployment runbook created. Ready for push to GitHub and Phases 4–5 deployment.
- **2026-09-28** — Phase 4 in progress: Cloudinary account + Render Blueprint created by owner. First Render build failed (composer missing in runtime stage, exit 127). Fixed in f34bd18 along with 3 latent boot bugs (libpq, busybox mkdir, missing resources/views). Owner to push and redeploy.
- **2026-09-28** — Render LIVE at https://portfolio-api-podn.onrender.com (manual deploy). /up, /api/projects, /api/visitors/count OK against Supabase. Auto-deploy blocked: GitHub Actions not running ("account is locked due to a billing issue") so checksPass never fires — owner to fix billing or switch render.yaml to autoDeployTrigger: commit. Next: APP_URL on Render, Vercel import (root=frontend, VITE_API_URL=https://portfolio-api-podn.onrender.com/api), then FRONTEND_URLS.
- **2026-09-28** — S1 closed: owner enabled RLS on all public tables; live API re-tested (projects, hobbies, resume, visitors, login 422 on bad creds) — all OK.
- **2026-09-29** — Frontend deployed to Vercel (old Vercel project deleted; env `VITE_API_URL` fixed after build skipped by ignoreCommand). CORS wired. Render auto-deploy → On Commit. Added public-response caching (+5 tests, 39 pass / 188 assertions).
