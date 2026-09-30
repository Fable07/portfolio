# Portfolio — Master Plan

> Owner: Opus (project manager / architecture / security). Last updated: 2026-09-28.
> Resume point for every session: read `docs/CHECKPOINT.md` first.

## 1. What we have

| Part | Stack | Where it lives today |
|---|---|---|
| `frontend/` | Vue 3.5, Vite 7, Pinia, Vue Router 5, Tailwind 4, Vitest | Own git repo → `github.com/Fable07/portfolio` (branches `dev`, `main`), 11 commits |
| `backend/` | Laravel 12 (PHP 8.2), Sanctum bearer tokens, PHPUnit | Own git repo, **local only, no remote**, 12 commits |
| Database | **Supabase Postgres** (confirmed: `DB_CONNECTION=pgsql`, host `*.pooler.supabase.com`, port 5432 = session pooler) | Remote; `backend/database/database.sqlite` is a stale leftover |
| Media | `MEDIA_DRIVER=local`, 0 uploaded files on disk. Cloudinary driver already implemented (`backend/app/Services/Media/`) | — |

Architecture: SPA (public site + `/admin` panel) → JSON REST API (`/api/*`, 37 routes) → Supabase Postgres.

## 2. Review findings

### Duplication / repo merge issues
1. **No identical files between frontend and backend** (MD5 comparison, excluding node_modules/vendor/dist). The only byte-identical files are Laravel's 4 placeholder `.gitignore`s inside `backend/storage` — normal, keep them.
2. **Two nested `.git` folders** — must be combined into one repo (see §4).
3. **Two CI workflows** in `frontend/.github/` and `backend/.github/`. GitHub only reads `.github/workflows` at the **repo root** — nested ones silently never run. → merge into one root workflow with path filters.
4. **Two `DEPLOYMENT.md`** with overlapping content → merge into `docs/DEPLOYMENT.md`.
5. **`frontend/docker-compose.*.yml`** point to `../portfolio-backend` (the old side-by-side layout) → move to root, point to `./backend`.
6. **Unused Laravel front-end scaffolding in backend** duplicates the frontend's tooling: `backend/package.json` (vite, tailwind, axios, concurrently), `resources/js`, `resources/css`, `welcome.blade.php`. The API never serves HTML. → remove; make `GET /` return JSON; update `composer setup`/`dev` scripts that call npm.
7. **Unused PHP dependency** `doctrine/dbal` (no usage in app/database/config; Laravel 12 doesn't need it) → remove. `laravel/sail` is unused too (own Docker setup) → optional removal.
8. Leftovers that are git-ignored and harmless but can be deleted locally: `backend/database/database.sqlite`, `backend/storage/logs/laravel.log` (500 KB), compiled views, `frontend/dist/`, empty `frontend/public/icons` and `frontend/public/socmed`.
9. `.editorconfig`, `.gitattributes`, `.dockerignore` differ per folder — fine; add a small root `.editorconfig`/`.gitattributes`/`.gitignore`.

### Secrets check
- `backend/.env` holds real Supabase credentials — **git-ignored and never committed** (history scanned). Keep it that way.
- Frontend history only ever contained `VITE_API_URL=http://127.0.0.1:8000/api` — safe.

### Security findings (fix before go-live)
| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | **High** | Supabase exposes the `public` schema through its auto REST API (PostgREST). If RLS is off, tables like `users` (password hashes), `personal_access_tokens`, `messages` (visitor emails + IPs) are readable with the project's anon key. | Enable RLS on every table (no policies). Laravel connects as `postgres`, which bypasses RLS, so the app is unaffected. Or disable the Data API in Supabase settings. Verify in Supabase → Advisors → Security. |
| S2 | **High** | No `trustProxies` configured. Behind Render's proxy every request has the proxy's IP → rate limits (`login 5/min`, `contact 5/hour`) become **global** (one spammer blocks everyone) and stored message IPs are wrong. | `$middleware->trustProxies(at: '*')` in `bootstrap/app.php`. |
| S3 | Medium | Dev and prod share **one** Supabase database (documented design). Local experiments write to the live site. | Recommend a second free Supabase project for dev (or local Postgres via Docker). Decision pending — see §6. |
| S4 | Medium | No security headers on the SPA. Admin token lives in `sessionStorage` (good: not a cookie, cleared on tab close) so XSS is the main threat. No `v-html` found (good). | Add CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` in `frontend/vercel.json`. |
| S5 | Medium | Render free tier has no persistent disk → `MEDIA_DRIVER=local` uploads vanish on every deploy/restart. | Use `MEDIA_DRIVER=cloudinary` in production (driver already built). |
| S6 | Low | `VisitorController` doesn't validate `visitor_id` and runs a DELETE on every hit. | Validate (`required|string|max:64`), move cleanup to a scheduled/rare path. |
| S7 | Low | `APP_DEBUG=true` locally — must be `false` on Render (already in `.env.production.example`). | Checklist item. |
| S8 | Low | CORS allows only `FRONTEND_URLS` — must be set to the exact Vercel domain(s). Preview deploys will be blocked (acceptable). | Checklist item. |

Good things already in place: login throttling, contact honeypot, Sanctum token expiry (24h), SVG uploads blocked, admin creation via `php artisan admin:create` with 12-char minimum, multi-stage Dockerfiles, `/up` health check, `$PORT` binding for Render.

## 3. Target architecture

```
                GitHub: Fable07/portfolio (one monorepo)
                  ├── frontend/  ──► Vercel   (Root Directory = frontend)
                  └── backend/   ──► Render   (Docker, Root Directory = backend)
Browser ──► https://<name>.vercel.app ──fetch──► https://<name>.onrender.com/api
                                                        │
                                   Supabase Postgres ◄──┤ (session pooler, TLS)
                                   Cloudinary media  ◄──┘ (uploads from admin)
```

- **Vercel (frontend)** — free, static SPA; `VITE_API_URL=https://<api>.onrender.com/api` set in Vercel env (build-time).
- **Render (backend)** — Docker web service from `backend/Dockerfile`. Free tier sleeps after ~15 min idle (≈30–60 s cold start). The SPA already has skeleton/loading states; consider a paid instance ($7/mo) later if cold starts hurt.
- **Supabase** — stays as the database. Free tier pauses after 7 days without activity; the live site's traffic prevents that.
- **Cloudinary** — needed only for images/videos uploaded through the admin panel. Static files (`profile.jpg`, `resume.pdf`, skill icons) stay in the frontend and ship via Vercel's CDN.

## 4. Monorepo layout (target)

```
portfolio/
├── .github/workflows/ci.yml     # one workflow: frontend job + backend job, path-filtered
├── .gitignore .editorconfig .gitattributes
├── README.md                    # overview, quick start, links to docs
├── CLAUDE.md                    # session bootstrap for Claude
├── docker-compose.dev.yml       # moved from frontend/, paths → ./backend, ./frontend
├── docker-compose.prod.yml
├── docs/  PLAN.md  CHECKPOINT.md  DEPLOYMENT.md  QA.md
├── frontend/                    # unchanged internally, minus .git and .github
└── backend/                     # minus .git, .github, Laravel Vite scaffolding
```

**Git strategy (recommended): keep both histories.** Reuse the existing GitHub repo `Fable07/portfolio`:
1. In the frontend repo, move all files into `frontend/` (`git mv`) on a branch.
2. In a copy of the backend repo, rewrite history into `backend/` (`git filter-repo --to-subdirectory-filter backend`, or `git subtree add`).
3. Merge the backend into the frontend repo with `--allow-unrelated-histories`.
4. Add root files, push to `dev`, PR → `main`.
Result: one repo, full history of both, existing Vercel link kept (just set Root Directory = `frontend`).
Alternative: fresh `git init` at root (loses history — simpler, not recommended).

## 5. Roadmap

| Phase | Goal | Lead | Status |
|---|---|---|---|
| 0 | Review both folders, confirm DB, write plan + checkpoint | Opus | ✅ done |
| 1 | Monorepo merge: combine git histories, root CI, move compose files, remove duplicates (§2 items 3–7), root README | Sonnet (DevOps) → Opus review | ✅ done |
| 2 | Security hardening: S1 (Supabase RLS), S2 (trustProxies), S4 (headers), S6 | Opus designs, Sonnet implements | ⏳ S2/S4/S6 done; S1 pending owner |
| 3 | QA baseline + CI green in the monorepo (frontend: lint/format/vitest/build; backend: phpunit) | Sonnet (QA) | ✅ baseline + green |
| 4 | Deploy backend to Render (Docker), Cloudinary on, env vars, `admin:create` | Sonnet (DevOps) | next |
| 5 | Deploy frontend to Vercel, CORS wiring, smoke test | Sonnet (DevOps) + QA | next |
| 6 | Docs: DEPLOYMENT.md merged, QA report, checkpoint | Haiku | ✅ done |
| 7 | Feature ideas (optional, after go-live) — see §7 | Opus proposes, Sonnet builds | backlog |

## 6. Owner decisions (2026-09-28)
1. **Git history** — ✅ keep both histories (done: 36 commits, full frontend + backend history preserved)
2. **Dev database** — ✅ keep one shared Supabase DB for dev+prod (accepted risk; dev and prod read/write same tables)
3. **Media** — ✅ yes, Cloudinary account will be created; `MEDIA_DRIVER=cloudinary` for Render (backend/render.yaml ready)
4. **Domain** — ✅ free `*.vercel.app` + `*.onrender.com` for now (custom domain deferred)
5. **Render plan** — ✅ free tier (cold starts ~30–60 s acceptable; SPA has skeleton/loading states; upgrade to $7/mo later if needed)
6. **Repo visibility** — not decided yet; the repo keeps its current GitHub setting (secrets are safe either way: `.env` is git-ignored)

## 7. Feature suggestions (backlog, after go-live)
- SEO: per-page meta via `@unhead/vue` (already a dependency), `sitemap.xml`, Open Graph images for project pages.
- Email notification on new contact message (Resend/Brevo free tier) — currently inbox-only.
- Uptime monitor (UptimeRobot) on `/up` — also doubles as a warm-up ping if you accept that tradeoff.
- Lighthouse CI budget in the workflow.
- Privacy-friendly analytics (Vercel Analytics / Plausible) instead of the custom visitor counter.

## 8. Agent roles (how work is split)
| Role | Model | Responsibilities |
|---|---|---|
| Project manager, architect, network & security | **Opus** | Planning, decisions, security design, reviewing Sonnet's work, proposing features, updating PLAN.md |
| Full-stack dev + DevOps | **Sonnet** | Implementing features, repo merge, CI, Docker/Render/Vercel config, security fixes |
| QA | **Sonnet** | Automated tests across frontend / backend / API, reports pass/fail |
| Docs | **Haiku** | README, DEPLOYMENT, QA reports, CHECKPOINT updates |

## 9. Environment strategy (owner decision, 2026-09-28)
- **Production** = `main` → one Render service (`portfolio-api`) + Vercel production. Only `main` deploys.
- **Development** = `dev` → local only (`npm run dev` in frontend, `php artisan serve` in backend). Vercel preview builds of `dev` are optional, for layout checks only (API calls are blocked by CORS unless the preview origin is added to `FRONTEND_URLS`).
- No staging API: dev and prod share one Supabase DB, so a second Render service would not isolate data. Revisit (second Render service on `dev` + second Supabase project) only if the project grows beyond a personal portfolio.
- **Auto-migrate (owner decision, 2026-09-29):** `RUN_MIGRATIONS=true` on Render — every deploy runs pending migrations before the API starts (a failing migration fails the deploy and the previous version keeps serving). Accepted risk: no CI gate right now and the DB is shared, so keep migrations additive and review them before pushing to main.
- Release routine: test locally → work on `dev` → `git push origin dev` → GitHub PR `dev` → `main` (Create a merge commit, owner merges manually) → sync: `git pull origin main` on dev + `git push origin dev`. Do not use `git push origin dev:main` any more (main gets merge commits that dev lacks until synced).
