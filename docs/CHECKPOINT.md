# Checkpoint

`Last updated: 2026-09-28 · Current phase: 0 done → Phase 1 next`

## Where we are

- Phase 0 (review + plan) complete; PLAN.md and CLAUDE.md bootstrap files written.
- Frontend and backend maintain separate `.git` folders; frontend remote at `github.com/Fable07/portfolio` (branches `dev`/`main`); backend local-only.
- No commits merged, pushed, or deployed to Render/Vercel yet.
- Database confirmed: **Supabase Postgres** (session pooler at `*.pooler.supabase.com:5432`); test suite runs on in-memory SQLite.
- Security baseline: Supabase RLS status **not yet verified** (S1), missing proxy trust config (S2), dev/prod share one DB (S3), and 5 medium/low findings documented (S4–S8).

## QA baseline (2026-09-28, before any changes)

| Check | Result | Detail |
|---|---|---|
| Frontend vitest | PASS | 4 files, 45 tests |
| Frontend lint:check (oxlint + eslint) | PASS | 0 warnings/errors |
| Frontend format:check | PASS | — |
| Frontend build (VITE_API_URL=/api) | PASS | 186 modules; note stale caniuse-lite (informational) |
| Backend phpunit (in-memory SQLite) | PASS | 28 tests, 139 assertions |
| Backend API routes | OK | 37 routes |

**Tool versions:** node v20.20.0, npm 10.8.2, php 8.2.12 (XAMPP), composer 2.9.5.

## Waiting on the owner

- [ ] Git history — keep both histories (recommended) or start fresh?
- [ ] Dev database — keep one shared Supabase DB, or create a separate free dev project (recommended)?
- [ ] Media — will you upload project screenshots/videos via the admin panel? If yes → Cloudinary account needed before Phase 4.
- [ ] Domain — custom domain, or `*.vercel.app` + `*.onrender.com` for now?
- [ ] Render plan — free (cold starts) or Starter ($7/mo, always on)?
- [ ] Repo visibility — public (typical for portfolios), or private?

## Next step (Phase 1 — monorepo merge)

**Lead: Sonnet (DevOps) · Review: Opus**

1. Move frontend files into `frontend/` subdirectory on a branch (git mv).
2. Rewrite backend repo history into `backend/` subdirectory (git filter-repo or git subtree).
3. Merge backend into frontend repo with `--allow-unrelated-histories`.
4. Add root files: `.gitignore`, `.editorconfig`, `.gitattributes`, `.github/workflows/ci.yml` (path-filtered).
5. Move `docker-compose.*.yml` from `frontend/` to root; update paths to point to `./backend` and `./frontend`.
6. Remove unused Laravel scaffolding: `backend/package.json`, `backend/resources/`, `backend/welcome.blade.php`.
7. Remove unused dependency `doctrine/dbal` from `backend/composer.json`.
8. Add root `README.md` with overview, quick start, links to `docs/`.
9. Merge `DEPLOYMENT.md` and overlapping docs; commit.
10. Push branch to `dev`, create PR → `main`, merge after review.

## Open security items

- [ ] **S1 (High)** — Check Supabase → Advisors → Security; if RLS is off on `public` tables, enable it on all tables (Laravel's `postgres` role bypasses it) or disable the Data API.
- [ ] **S2 (High)** — No `trustProxies` config; behind Render proxy, rate limits become global.
- [ ] **S3 (Medium)** — Dev and prod share one Supabase DB; recommend separate free project for dev.
- [ ] **S4 (Medium)** — No security headers on SPA; add CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`.
- [ ] **S5 (Medium)** — Render free tier has no persistent disk; uploads vanish on deploy.
- [ ] **S6 (Low)** — `VisitorController` doesn't validate `visitor_id`; add validation.
- [ ] **S7 (Low)** — `APP_DEBUG=true` locally; must be `false` on Render.
- [ ] **S8 (Low)** — CORS `FRONTEND_URLS` must be set to exact Vercel domain(s).

## How to resume

Tell Claude: **"Read `docs/CHECKPOINT.md` and continue."** The root `CLAUDE.md` auto-loads this instruction at session start.

## Session log

- **2026-09-28** — Phase 0 complete: reviewed both `frontend/` and `backend/` folders; confirmed Supabase Postgres + in-memory SQLite tests; security scan identified S1–S8; baseline QA all green; wrote `docs/PLAN.md` and root `CLAUDE.md`.
